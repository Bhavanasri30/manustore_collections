import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_ORDERS,
  DEFAULT_OWNERS,
  DEFAULT_PRODUCTS,
  DEFAULT_RETURNS,
  STORAGE_KEYS,
} from '../data';

const StoreContext = createContext();

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
  const [cart, setCart] = useState(() => readFromStorage(STORAGE_KEYS.cart, []));
  const [orders, setOrders] = useState(() => readFromStorage(STORAGE_KEYS.orders, DEFAULT_ORDERS));
  const [returnsData, setReturnsData] = useState(() =>
    readFromStorage(STORAGE_KEYS.returns, DEFAULT_RETURNS),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
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

  useEffect(() => {
    if (!currentUser) return;

    const isValidUser =
      (currentUser.role === 'owner' &&
        owners.some((owner) => owner.email.toLowerCase() === normalizeEmail(currentUser.email))) ||
      (currentUser.role === 'customer' &&
        customers.some((customer) => customer.email.toLowerCase() === normalizeEmail(currentUser.email)));

    if (!isValidUser) {
      setCurrentUser(null);
    }
  }, [owners, customers, currentUser]);

  const registerOwner = ({ name, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const exists = owners.some((owner) => owner.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error('An owner account with this email already exists.');
    }

    const newOwner = {
      id: Date.now(),
      name,
      email: normalizedEmail,
      password,
      role: 'owner',
    };

    setOwners((prev) => [...prev, newOwner]);
    setCurrentUser(newOwner);
    setError('');
    return newOwner;
  };

  const loginOwner = ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const owner = owners.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail && candidate.password === password,
    );

    if (!owner) {
      throw new Error('Invalid owner email or password.');
    }

    setCurrentUser({ ...owner, role: 'owner' });
    setError('');
    return owner;
  };

  const registerCustomer = ({ name, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const exists = customers.some((customer) => customer.email.toLowerCase() === normalizedEmail);

    if (exists) {
      throw new Error('A customer account with this email already exists.');
    }

    const newCustomer = {
      id: Date.now(),
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
    };

    setCustomers((prev) => [...prev, newCustomer]);
    setCurrentUser(newCustomer);
    setError('');
    return newCustomer;
  };

  const loginCustomer = ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const customer = customers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail && candidate.password === password,
    );

    if (!customer) {
      throw new Error('Invalid customer email or password.');
    }

    setCurrentUser({ ...customer, role: 'customer' });
    setError('');
    return customer;
  };

  const resetPassword = ({ role, email, newPassword }) => {
    const normalizedEmail = normalizeEmail(email);
    const safePassword = newPassword.trim();

    if (!normalizedEmail) {
      throw new Error('Please enter your email address.');
    }

    if (!safePassword || safePassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (role === 'owner') {
      const owner = owners.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
      if (!owner) {
        throw new Error('No owner account found with that email.');
      }

      setOwners((prev) =>
        prev.map((candidate) =>
          candidate.email.toLowerCase() === normalizedEmail
            ? { ...candidate, password: safePassword }
            : candidate,
        ),
      );

      if (currentUser?.role === 'owner' && currentUser.email.toLowerCase() === normalizedEmail) {
        setCurrentUser((prev) => (prev ? { ...prev, password: safePassword } : prev));
      }

      setError('');
      return { ...owner, password: safePassword };
    }

    const customer = customers.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
    if (!customer) {
      throw new Error('No customer account found with that email.');
    }

    setCustomers((prev) =>
      prev.map((candidate) =>
        candidate.email.toLowerCase() === normalizedEmail
          ? { ...candidate, password: safePassword }
          : candidate,
      ),
    );

    if (currentUser?.role === 'customer' && currentUser.email.toLowerCase() === normalizedEmail) {
      setCurrentUser((prev) => (prev ? { ...prev, password: safePassword } : prev));
    }

    setError('');
    return { ...customer, password: safePassword };
  };

  const logout = () => setCurrentUser(null);

  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: productData.id || `MS-${Date.now()}`,
      createdAt: productData.createdAt || new Date().toISOString(),
      price: Number(productData.price),
      stock: Number(productData.stock),
      sizes: Array.isArray(productData.sizes) ? productData.sizes : [productData.sizes],
      colours: Array.isArray(productData.colours) ? productData.colours : [productData.colours],
      inStock: Number(productData.stock) > 0,
      newArrival: Boolean(productData.newArrival),
    };

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productId, productData) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...productData,
              price: Number(productData.price ?? product.price),
              stock: Number(productData.stock ?? product.stock),
              sizes: productData.sizes ?? product.sizes,
              colours: productData.colours ?? product.colours,
              inStock: Number(productData.stock ?? product.stock) > 0,
            }
          : product,
      ),
    );
  };

  const deleteProduct = (productId) => {
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
