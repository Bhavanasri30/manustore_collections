import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function MyOrdersPage() {
  const { currentUser, orders, addReturnOrExchangeRequest, submitProductRating } = useStore();
  const location = useLocation();
  const [feedback, setFeedback] = useState('');

  const customerOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      (order) => order.customerEmail === currentUser.email || order.customerName === currentUser.name,
    );
  }, [currentUser, orders]);

  const successMessage = location.state?.successMessage;

  if (!currentUser) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-10 text-center">
        <h2 className="mb-3 text-3xl font-bold text-[#38131d]">Login to view your orders</h2>
        <Link to="/customer-login" className="store-button">Customer login</Link>
      </div>
    );
  }

  const handleReturnRequest = (orderId, type) => {
    addReturnOrExchangeRequest(orderId, currentUser.name, type);
    setFeedback(`${type} request saved for review.`);
  };

  return (
    <div className="space-y-6 pb-10">
      {successMessage && <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>}
      {feedback && <div className="rounded-2xl border border-[#eadbc7] bg-[#fffdfb] px-4 py-3 text-sm text-[#5b1f2d]">{feedback}</div>}

      <h1 className="section-title">My Orders</h1>

      {customerOrders.length ? (
        <div className="space-y-4">
          {customerOrders.map((order) => (
            <div key={order.id} className="rounded-[26px] border border-[#eadbc7] bg-white p-5 shadow-lg shadow-[#5b1f2d]/5">
              <div className="flex flex-col gap-4 border-b border-[#eadbc7] pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8a5d62]">Order ID</div>
                  <div className="mt-1 text-lg font-bold text-[#38131d]">{order.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8a5d62]">Current status</div>
                  <div className="mt-1 text-sm font-semibold text-[#5b1f2d]">{order.status}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-[#38131d]">Products</div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.productId}-${item.size}`} className="rounded-xl bg-[#fffdfb] p-3 text-sm text-[#5d4c4d]">
                        <div className="flex items-center justify-between gap-3">
                          <span>{item.productName} — {item.size} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                        {order.status === 'Delivered' && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5b1f2d]">Rate product</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  submitProductRating(order.id, item.productId, star);
                                  setFeedback(`Thanks for rating ${item.productName}.`);
                                }}
                                className={`rounded-full border px-2 py-1 text-xs font-semibold ${item.rating && star <= item.rating ? 'border-[#d6b36a] bg-[#f8efdf] text-[#5b1f2d]' : 'border-[#d7c2b4] bg-white text-[#5d4c4d]'}`}
                              >
                                {star}★
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#5d4c4d]">
                  <div><span className="font-semibold text-[#38131d]">Total cost:</span> ₹{order.totalCost.toLocaleString('en-IN')}</div>
                  <div><span className="font-semibold text-[#38131d]">Address:</span> {order.address}, {order.city}, {order.state} - {order.zip}</div>
                  <div><span className="font-semibold text-[#38131d]">Order date:</span> {new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/tracking/${order.id}`} className="store-button secondary">
                  Track order
                </Link>
                {order.status === 'Delivered' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReturnRequest(order.id, 'Return')}
                      className="rounded-full border border-[#d7c2b4] bg-[#fffdfb] px-4 py-2 text-sm font-semibold text-[#5b1f2d]"
                    >
                      Request Return
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReturnRequest(order.id, 'Exchange')}
                      className="rounded-full border border-[#d7c2b4] bg-[#fffdfb] px-4 py-2 text-sm font-semibold text-[#5b1f2d]"
                    >
                      Request Exchange
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[26px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-10 text-center text-[#694d51]">
          You have not placed any orders yet.
        </div>
      )}
    </div>
  );
}
