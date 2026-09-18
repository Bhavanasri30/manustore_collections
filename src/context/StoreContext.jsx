import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import {
  DEFAULT_ORDERS,
  DEFAULT_OWNERS,
  DEFAULT_PRODUCTS,
  DEFAULT_RETURNS,
  STORAGE_KEYS,
} from '../data';

const StoreContext = createContext();
const API_BASE = 'http://127.0.0.1:8000/api';

const normalizeEmail = (value = '') => value.trim().toLowerCase();

const readFromStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value);
  } catch (error) {
    console.error(`Could not read ${key}`, error);
    return fallback;
  }
};

const writeToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key}`, error);
  }
};

export function StoreProvider({ children }) {
  const [owners, setOwners] = useState(() => readFromStorage(STORAGE_KEYS.owner, DEFAULT_OWNERS));
  const [customers, setCustomers] = useState(() =>
    readFromStorage(STORAGE_KEYS.customers, []),
  );
  const [currentUser, setCurrentUser] = useState(() =>
    readFromStorage(STORAGE_KEYS.currentUser, null),
  );
  const [products, setProducts] = useState(() =>
    readFromStorage(STORAGE_KEYS.products, DEFAULT_PRODUCTS),
  );
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(() => readFromStorage(STORAGE_KEYS.cart, []));
  const [orders, setOrders] = useState(() => readFromStorage(STORAGE_KEYS.orders, DEFAULT_ORDERS));
  const [returnsData, setReturnsData] = useState(() =>
    readFromStorage(STORAGE_KEYS.returns, DEFAULT_RETURNS),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        return;
      }

      const role = localStorage.getItem(`manustore_role_${firebaseUser.uid}`) || 'customer';
      setCurrentUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'ManuStore User',
        email: firebaseUser.email,
        role,
      });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProductsFromBackend = async () => {
      try {
        setLoading(true);
        setError('');

        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE}/products`),
          fetch(`${API_BASE}/categories`),
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Unable to load products from the backend.');
        }

        const backendProducts = await productsResponse.json();
        const backendCategories = await categoriesResponse.json();
        setCategories(backendCategories);
        const categoryNames = Object.fromEntries(
          backendCategories.map((category) => [category.id, category.name]),
        );

        const normalizedProducts = backendProducts.map((product) => ({
          id: product.id,
          createdAt: product.created_at || new Date().toISOString(),
          name: product.name,
          category: categoryNames[product.category_id] || 'Uncategorized',
          price: Number(product.price),
          description: product.description || '',
          fabric: 'Not specified',
          colours: product.colors
            ? product.colors.split(',').map((colour) => colour.trim()).filter(Boolean)
            : [],
          sizes: product.sizes
            ? product.sizes.split(',').map((size) => size.trim()).filter(Boolean)
            : ['Free Size'],
          stock: Number(product.stock_quantity),
          inStock: product.is_available && Number(product.stock_quantity) > 0,
          newArrival: false,
          image:
            product.image_url ||
            DEFAULT_PRODUCTS[0]?.image ||
            'https://placehold.co/600x800?text=ManuStore',
        }));

        if (!cancelled) {
          setProducts(normalizedProducts);
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(apiError.message);
          setProducts(DEFAULT_PRODUCTS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProductsFromBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.owner, owners);
  }, [owners]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.customers, customers);
  }, [customers]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.currentUser, currentUser);
  }, [currentUser]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.cart, cart);
  }, [cart]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.orders, orders);
  }, [orders]);

  useEffect(() => {
    writeToStorage(STORAGE_KEYS.returns, returnsData);
  }, [returnsData]);

  const registerFirebaseUser = async ({ name, email, password, role }) => {
    setError('');
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password,
    );
    await updateProfile(credential.user, { displayName: name.trim() });
    localStorage.setItem(`manustore_role_${credential.user.uid}`, role);

    const user = {
      id: credential.user.uid,
      name: name.trim(),
      email: credential.user.email,
      role,
    };
    setCurrentUser(user);
    return user;
  };

  const loginFirebaseUser = async ({ email, password, role }) => {
    setError('');
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password,
    );
    const storedRole = localStorage.getItem(`manustore_role_${credential.user.uid}`);
    if (storedRole && storedRole !== role) {
      await signOut(auth);
      throw new Error(`This account is registered as a ${storedRole}.`);
    }
    localStorage.setItem(`manustore_role_${credential.user.uid}`, role);

    const user = {
      id: credential.user.uid,
      name: credential.user.displayName || 'ManuStore User',
      email: credential.user.email,
      role,
    };
    setCurrentUser(user);
    return user;
  };

  const registerOwner = (data) => registerFirebaseUser({ ...data, role: 'owner' });
  const loginOwner = (data) => loginFirebaseUser({ ...data, role: 'owner' });
  const registerCustomer = (data) => registerFirebaseUser({ ...data, role: 'customer' });
  const loginCustomer = (data) => loginFirebaseUser({ ...data, role: 'customer' });

  const resetPassword = async ({ email }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error('Please enter your email address.');
    await sendPasswordResetEmail(auth, normalizedEmail);
    setError('');
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const ensureCategoryId = async (name) => {
    const category = categories.find(
      (item) => item.name.toLowerCase() === String(name).toLowerCase(),
    );
    if (category) return category.id;

    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: `${name} products` }),
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Could not create category.');
    const newCategory = await response.json();
    setCategories((prev) => [...prev, newCategory]);
    return newCategory.id;
  };

  const toApiProduct = async (productData) => ({
    name: productData.name,
    description: productData.description || '',
    price: Number(productData.price),
    stock_quantity: Number(productData.stock),
    sizes: (productData.sizes || []).join(', '),
    colors: (productData.colours || []).join(', '),
    image_url: productData.image || null,
    is_available: Boolean(productData.inStock) && Number(productData.stock) > 0,
    category_id: await ensureCategoryId(productData.category),
  });

  const fromApiProduct = (product) => {
    const category = categories.find((item) => item.id === product.category_id);
    return {
      id: product.id,
      createdAt: new Date().toISOString(),
      name: product.name,
      category: category?.name || 'Uncategorized',
      price: Number(product.price),
      description: product.description || '',
      fabric: '',
      colours: product.colors?.split(',').map((item) => item.trim()).filter(Boolean) || [],
      sizes: product.sizes?.split(',').map((item) => item.trim()).filter(Boolean) || [],
      stock: Number(product.stock_quantity),
      image: product.image_url || 'https://placehold.co/600x800?text=ManuStore',
      newArrival: false,
      inStock: product.is_available && Number(product.stock_quantity) > 0,
    };
  };

  const addProduct = async (productData) => {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await toApiProduct(productData)),
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Could not add product.');
    const newProduct = fromApiProduct(await response.json());
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (productId, productData) => {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await toApiProduct(productData)),
    });
    if (!response.ok) throw new Error((await response.json()).detail || 'Could not update product.');
    const updatedProduct = fromApiProduct(await response.json());
    setProducts((prev) => prev.map((item) => (item.id === productId ? updatedProduct : item)));
    return updatedProduct;
  };

  const deleteProduct = async (productId) => {
    const response = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).detail || 'Could not delete product.');
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const addToCart = (product, size, quantity = 1) => {
    const chosenSize = size || product.sizes?.[0] || 'Free Size';
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === product.id && item.size === chosenSize,
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id && item.size === chosenSize
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: `${product.id}-${chosenSize}`,
          productId: product.id,
          productName: product.name,
          image: product.image,
          size: chosenSize,
          quantity,
          price: product.price,
        },
      ];
    });
  };

  const updateCartQuantity = (itemId, change) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (itemId) => setCart((prev) => prev.filter((item) => item.id !== itemId));

  const clearCart = () => setCart([]);

  const placeOrder = (checkoutData) => {
    if (!currentUser || currentUser.role !== 'customer') {
      throw new Error('Please log in as a customer to place an order.');
    }

    if (!cart.length) {
      throw new Error('Your cart is empty.');
    }

    const totalCost = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `MST-${Date.now().toString().slice(-6)}`;

    const newOrder = {
      id: orderId,
      customerName: checkoutData.customerName,
      customerEmail: currentUser.email,
      phone: checkoutData.phone,
      address: checkoutData.address,
      city: checkoutData.city,
      state: checkoutData.state,
      zip: checkoutData.zip,
      notes: checkoutData.notes || '',
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      totalCost,
      status: 'Order Placed',
      orderDate: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setProducts((prev) =>
      prev.map((product) => {
        const cartQuantity = cart
          .filter((item) => item.productId === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (!cartQuantity) return product;

        const nextStock = Math.max(0, product.stock - cartQuantity);
        return {
          ...product,
          stock: nextStock,
          inStock: nextStock > 0,
        };
      }),
    );

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
  };

  const submitProductRating = (orderId, productId, rating) => {
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 1));

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map((item) =>
                item.productId === productId ? { ...item, rating: safeRating } : item,
              ),
            }
          : order,
      ),
    );

    return safeRating;
  };

  const addReturnOrExchangeRequest = (orderId, customerName, type) => {
    const existing = returnsData.find(
      (item) => item.orderId === orderId && item.type === type && item.status === 'Pending',
    );

    if (existing) {
      return existing;
    }

    const newRequest = {
      id: `RET-${Date.now()}`,
      orderId,
      customerName,
      type,
      requestedAt: new Date().toISOString(),
      status: 'Pending',
    };

    setReturnsData((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const updateReturnStatus = (requestId, status) => {
    setReturnsData((prev) =>
      prev.map((item) => (item.id === requestId ? { ...item, status } : item)),
    );
  };

  const value = useMemo(
    () => ({
      owners,
      customers,
      currentUser,
      products,
      cart,
      orders,
      returnsData,
      loading,
      error,
      setError,
      registerOwner,
      loginOwner,
      registerCustomer,
      loginCustomer,
      resetPassword,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      submitProductRating,
      addReturnOrExchangeRequest,
      updateReturnStatus,
    }),
    [owners, customers, currentUser, products, cart, orders, returnsData, loading, error],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
