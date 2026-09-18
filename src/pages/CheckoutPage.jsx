import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const { cart, placeOrder, currentUser } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: currentUser?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'customer') {
      navigate('/customer-login', { replace: true });
    }
  }, [currentUser, navigate]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!currentUser || currentUser.role !== 'customer') {
      setError('Please log in as a customer before placing an order.');
      navigate('/customer-login', { replace: true });
      return;
    }

    const phoneDigits = form.phone.replace(/\D/g, '');
    const zipDigits = form.zip.replace(/\D/g, '');

    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setError('Please fill in all checkout fields before placing your order.');
      return;
    }

    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (zipDigits.length !== 6) {
      setError('Please enter a valid 6-digit PIN code.');
      return;
    }

    try {
      const order = placeOrder({
        ...form,
        phone: phoneDigits,
        zip: zipDigits,
      });
      navigate('/my-orders', { state: { successMessage: `Order ${order.id} placed successfully!` } });
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleWhatsAppOrder = () => {
    const summary = cart
      .map((item) => `${item.productName} (${item.size}) x${item.quantity}`)
      .join(', ');
    const message = `Hello Manu Stores, I would like to place an order. Customer: ${form.customerName || 'N/A'}; Phone: ${form.phone || 'N/A'}; Address: ${form.address || 'N/A'}, ${form.city || ''}, ${form.state || ''}, ${form.zip || ''}; Products: ${summary}; Total: ₹${total}.`;
    window.open(`https://wa.me/9989824277?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="grid gap-6 pb-10 lg:grid-cols-[0.9fr,1.1fr]">
      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <h1 className="section-title mb-5">Checkout</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Customer name</label>
            <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Phone number</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Full address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows="3" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#463535]">City</label>
              <input name="city" value={form.city} onChange={handleChange} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#463535]">State</label>
              <input name="state" value={form.state} onChange={handleChange} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">PIN code</label>
            <input name="zip" value={form.zip} onChange={handleChange} className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Order notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none" />
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button type="submit" className="store-button flex-1">Place Order</button>
            <button type="button" onClick={handleWhatsAppOrder} className="store-button secondary flex-1">WhatsApp Order</button>
          </div>
        </form>
      </div>

      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <h2 className="mb-5 text-2xl font-bold text-[#38131d]">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-[18px] bg-[#fffdfb] p-3">
              <img src={item.image} alt={item.productName} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-[#38131d]">{item.productName}</div>
                <div className="text-sm text-[#5d4c4d]">{item.size} × {item.quantity}</div>
              </div>
              <div className="font-semibold text-[#5b1f2d]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-[#eadbc7] pt-4 text-lg font-bold text-[#38131d]">
          Total: ₹{total.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}
