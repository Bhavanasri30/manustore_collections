import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!cart.length) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-12 text-center shadow-lg shadow-[#5b1f2d]/5">
        <h2 className="mb-3 text-3xl font-bold text-[#38131d]">Your cart is empty</h2>
        <p className="mb-6 text-[#5d4c4d]">Add products to your cart to continue shopping.</p>
        <Link to="/collections" className="store-button">
          Browse collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="section-title">Your cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-[24px] border border-[#eadbc7] bg-white p-4 shadow-lg shadow-[#5b1f2d]/5 sm:flex-row">
              <img src={item.image} alt={item.productName} className="h-32 w-full rounded-[18px] object-cover sm:w-32" />
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-[#8a5d62]">{item.productName}</div>
                    <div className="mt-1 text-sm text-[#5d4c4d]">Size: {item.size}</div>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="text-[#5b1f2d]">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center rounded-full border border-[#d9c7b9] bg-[#fffdfb]">
                    <button type="button" onClick={() => updateCartQuantity(item.id, -1)} className="p-2 text-[#5b1f2d]">
                      <Minus size={14} />
                    </button>
                    <span className="min-w-8 text-center font-semibold text-[#38131d]">{item.quantity}</span>
                    <button type="button" onClick={() => updateCartQuantity(item.id, 1)} className="p-2 text-[#5b1f2d]">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-lg font-bold text-[#5b1f2d]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-[26px] border border-[#eadbc7] bg-white p-5 shadow-lg shadow-[#5b1f2d]/5">
          <h2 className="mb-4 text-2xl font-bold text-[#38131d]">Summary</h2>
          <div className="space-y-3 text-[#5d4c4d]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#eadbc7] pt-3 text-lg font-bold text-[#38131d]">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button type="button" onClick={() => navigate('/checkout')} className="store-button mt-6 w-full">
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
