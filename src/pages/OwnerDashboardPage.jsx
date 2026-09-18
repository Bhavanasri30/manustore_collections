import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BarChart3, PackageCheck, PackageX, Plus, Pencil, TrendingUp, Boxes, Wallet, ArrowLeftRight } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CATEGORIES, ORDER_STATUS_OPTIONS, SIZE_OPTIONS } from '../data';
import { useStore } from '../context/StoreContext';

const initialForm = {
  id: '',
  name: '',
  category: 'Sarees',
  price: '',
  description: '',
  fabric: '',
  colours: '',
  sizes: ['S'],
  stock: '',
  image: '',
  newArrival: false,
  inStock: true,
};

export default function OwnerDashboardPage() {
  const { currentUser, products, orders, returnsData, addProduct, updateProduct, deleteProduct, updateOrderStatus, updateReturnStatus } = useStore();
  const [productForm, setProductForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser || currentUser.role !== 'owner') {
    return <Navigate to="/owner-login" replace />;
  }

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.totalCost, 0);
    const inStock = products.filter((product) => product.inStock).length;
    const outOfStock = products.filter((product) => !product.inStock).length;
    const newOrders = orders.filter((order) => order.status === 'Order Placed').length;
    const deliveredOrders = orders.filter((order) => order.status === 'Delivered').length;
    const returnsCount = returnsData.length;

    return {
      totalProducts: products.length,
      inStock,
      outOfStock,
      newOrders,
      deliveredOrders,
      returnsCount,
      totalSales,
    };
  }, [products, orders, returnsData]);

  const salesData = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const date = new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[date] = (map[date] || 0) + order.totalCost;
    });

    return Object.entries(map).map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  const todayOrders = useMemo(
    () =>
      orders.filter((order) => {
        const orderDate = new Date(order.orderDate).getTime();
        return orderDate >= startOfToday && orderDate < endOfToday;
      }),
    [orders, startOfToday, endOfToday],
  );

  const todayProductsEntered = useMemo(
    () =>
      products.filter((product) => {
        if (!product.createdAt) return false;
        const createdAt = new Date(product.createdAt).getTime();
        return createdAt >= startOfToday && createdAt < endOfToday;
      }).length,
    [products, startOfToday, endOfToday],
  );

  const itemsSoldToday = useMemo(
    () =>
      todayOrders.reduce(
        (sum, order) => sum + order.items.reduce((itemTotal, item) => itemTotal + Number(item.quantity || 0), 0),
        0,
      ),
    [todayOrders],
  );

  const todayRevenue = useMemo(
    () => todayOrders.reduce((sum, order) => sum + Number(order.totalCost || 0), 0),
    [todayOrders],
  );

  const orderStatusSummary = useMemo(
    () =>
      ORDER_STATUS_OPTIONS.map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length,
      })),
    [orders],
  );

  const handleInput = (event) => {
    const { name, value, type, checked } = event.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSizeToggle = (size) => {
    setProductForm((prev) => {
      const isSelected = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: isSelected ? prev.sizes.filter((item) => item !== size) : [...prev.sizes, size],
      };
    });
  };

  const handleProductImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setProductForm((prev) => ({ ...prev, image: fileReader.result }));
    };
    fileReader.readAsDataURL(file);
  };

  const saveProduct = (event) => {
    event.preventDefault();
    const payload = {
      id: productForm.id || `MS-${Date.now()}`,
      createdAt: productForm.id ? undefined : new Date().toISOString(),
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      description: productForm.description,
      fabric: productForm.fabric,
      colours: productForm.colours.split(',').map((item) => item.trim()).filter(Boolean),
      sizes: productForm.sizes,
      stock: Number(productForm.stock),
      image: productForm.image || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      newArrival: productForm.newArrival,
      inStock: productForm.inStock && Number(productForm.stock) > 0,
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

    setProductForm(initialForm);
    setEditingId(null);
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      fabric: product.fabric,
      colours: product.colours.join(', '),
      sizes: product.sizes,
      stock: product.stock,
      image: product.image,
      newArrival: product.newArrival,
      inStock: product.inStock,
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'returns', label: 'Returns & Exchanges' },
  ];

  const statsCards = [
    { label: 'Total products', value: stats.totalProducts, icon: Boxes },
    { label: 'In-stock products', value: stats.inStock, icon: PackageCheck },
    { label: 'Out-of-stock products', value: stats.outOfStock, icon: PackageX },
    { label: 'New orders', value: stats.newOrders, icon: TrendingUp },
    { label: 'Delivered orders', value: stats.deliveredOrders, icon: PackageCheck },
    { label: 'Returns & exchanges', value: stats.returnsCount, icon: ArrowLeftRight },
    { label: 'Total sales', value: `₹${stats.totalSales.toLocaleString('en-IN')}`, icon: Wallet },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <div className="mb-5 flex items-center gap-3 text-[#5b1f2d]">
          <BarChart3 />
          <h1 className="section-title mb-0">Owner Dashboard</h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-[#5b1f2d] text-white' : 'border border-[#d7c2b4] bg-[#fffdfb] text-[#5b1f2d]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statsCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f7ebd7] text-[#5b1f2d]">
                    <Icon size={18} />
                  </div>
                  <div className="text-2xl font-bold text-[#38131d]">{value}</div>
                  <div className="text-sm text-[#624f4d]">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                <div className="mb-2 text-sm text-[#624f4d]">Items entered today</div>
                <div className="text-3xl font-bold text-[#38131d]">{todayProductsEntered}</div>
              </div>
              <div className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                <div className="mb-2 text-sm text-[#624f4d]">Items sold today</div>
                <div className="text-3xl font-bold text-[#38131d]">{itemsSoldToday}</div>
              </div>
              <div className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                <div className="mb-2 text-sm text-[#624f4d]">Orders today</div>
                <div className="text-3xl font-bold text-[#38131d]">{todayOrders.length}</div>
              </div>
              <div className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                <div className="mb-2 text-sm text-[#624f4d]">Today revenue</div>
                <div className="text-3xl font-bold text-[#38131d]">₹{todayRevenue.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr,0.6fr]">
              <div className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
                <div className="mb-4 flex items-center gap-3 text-[#5b1f2d]">
                  <BarChart3 />
                  <h2 className="section-title mb-0">Sales graph</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#5b1f2d" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5b1f2d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f0e3d7" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Area type="monotone" dataKey="sales" stroke="#5b1f2d" fill="url(#salesFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
                <div className="mb-4 flex items-center gap-3 text-[#5b1f2d]">
                  <PackageCheck />
                  <h2 className="section-title mb-0">Order status</h2>
                </div>
                <div className="space-y-3">
                  {orderStatusSummary.map(({ status, count }) => (
                    <div key={status} className="flex items-center justify-between rounded-xl bg-[#fffdfb] px-3 py-2">
                      <span className="text-sm font-medium text-[#463535]">{status}</span>
                      <span className="rounded-full bg-[#f7ebd7] px-2 py-1 text-xs font-bold text-[#5b1f2d]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <form onSubmit={saveProduct} className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
              <div className="mb-5 flex items-center gap-3 text-[#5b1f2d]">
                {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                <h2 className="section-title mb-0">{editingId ? 'Edit product' : 'Add product'}</h2>
              </div>

              <div className="space-y-4">
                <input name="name" value={productForm.name} onChange={handleInput} placeholder="Product name" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <select name="category" value={productForm.category} onChange={handleInput} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none">
                  {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <input name="price" type="number" value={productForm.price} onChange={handleInput} placeholder="Price" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <textarea name="description" value={productForm.description} onChange={handleInput} rows="3" placeholder="Description" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <input name="fabric" value={productForm.fabric} onChange={handleInput} placeholder="Fabric" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <input name="colours" value={productForm.colours} onChange={handleInput} placeholder="Colours (comma separated)" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <div>
                  <div className="mb-2 text-sm font-medium text-[#463535]">Sizes</div>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((size) => (
                      <button type="button" key={size} onClick={() => handleSizeToggle(size)} className={`rounded-full border px-3 py-1.5 text-sm ${productForm.sizes.includes(size) ? 'border-[#5b1f2d] bg-[#5b1f2d] text-white' : 'border-[#d8c3b5] bg-[#fffdfb] text-[#463535]'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <input name="stock" type="number" value={productForm.stock} onChange={handleInput} placeholder="Stock quantity" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                <label className="flex items-center gap-3 text-sm font-medium text-[#463535]">
                  <input type="checkbox" name="newArrival" checked={productForm.newArrival} onChange={handleInput} />
                  Mark as new arrival
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-[#463535]">
                  <input type="checkbox" name="inStock" checked={productForm.inStock} onChange={handleInput} />
                  Mark as in stock
                </label>
                <input type="file" accept="image/*" onChange={handleProductImage} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
                {productForm.image && <img src={productForm.image} alt="Preview" className="h-36 w-full rounded-xl object-cover" />}
                <button type="submit" className="store-button w-full">{editingId ? 'Save changes' : 'Add product'}</button>
              </div>
            </form>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#38131d]">Products</h2>
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-[24px] border border-[#eadbc7] bg-[#fffdfb] p-4 sm:flex-row">
                  <img src={product.image} alt={product.name} className="h-28 w-full rounded-xl object-cover sm:w-28" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-[#38131d]">{product.name}</div>
                        <div className="text-sm text-[#69595a]">{product.category} • {product.stock} in stock</div>
                      </div>
                      <div className="text-right text-sm font-semibold text-[#5b1f2d]">₹{product.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(product)} className="rounded-full border border-[#d7c2b4] bg-white px-3 py-1.5 text-sm font-semibold text-[#5b1f2d]">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteProduct(product.id)} className="rounded-full border border-[#d7c2b4] bg-white px-3 py-1.5 text-sm font-semibold text-[#5b1f2d]">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
            <h2 className="section-title">Owner Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-[22px] border border-[#eadbc7] bg-[#fffdfb] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-[#8a5d62]">Order ID</div>
                      <div className="font-bold text-[#38131d]">{order.id}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-[#8a5d62]">Customer</div>
                      <div className="font-semibold text-[#38131d]">{order.customerName}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-[#8a5d62]">Phone</div>
                      <div className="font-semibold text-[#38131d]">{order.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-[#8a5d62]">Total</div>
                      <div className="font-semibold text-[#38131d]">₹{order.totalCost.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-semibold text-[#38131d]">Products</div>
                      <div className="text-sm text-[#5d4c4d]">{order.items.map((item) => `${item.productName} (${item.size}) x${item.quantity}`).join(', ')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#38131d]">Address</div>
                      <div className="text-sm text-[#5d4c4d]">{order.address}, {order.city}, {order.state} - {order.zip}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-[#5d4c4d]">Order date: {new Date(order.orderDate).toLocaleDateString()}</div>
                    <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)} className="rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2 text-sm outline-none">
                      {ORDER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
            <h2 className="section-title">Returns & exchange requests</h2>
            <div className="space-y-3">
              {returnsData.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[18px] bg-[#fffdfb] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-[#38131d]">{item.type} request</div>
                    <div className="text-sm text-[#5d4c4d]">Order: {item.orderId} • Customer: {item.customerName}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={item.status} onChange={(event) => updateReturnStatus(item.id, event.target.value)} className="rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2 text-sm outline-none">
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
