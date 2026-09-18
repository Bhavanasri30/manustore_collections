import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const TRACKING_FLOW = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { orders } = useStore();
  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-10 text-center text-[#694d51]">
        Order not found.
      </div>
    );
  }

  const currentIndex = TRACKING_FLOW.indexOf(order.status);

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <div className="mb-5 text-xs uppercase tracking-[0.18em] text-[#8a5d62]">Tracking</div>
        <h1 className="text-3xl font-bold text-[#38131d]">{order.id}</h1>
      </div>

      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <div className="grid gap-4 md:grid-cols-5">
          {TRACKING_FLOW.map((step, index) => {
            const active = index <= currentIndex;
            return (
              <div key={step} className="flex flex-col items-center text-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${active ? 'border-[#5b1f2d] bg-[#5b1f2d] text-white' : 'border-[#d6c4b9] bg-[#f9f4ef] text-[#765d5f]'}`}>
                  {index + 1}
                </div>
                <div className={`mt-3 text-sm font-semibold ${active ? 'text-[#38131d]' : 'text-[#7c6867]'}`}>
                  {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-lg font-semibold text-[#38131d]">Delivery details</div>
            <div className="space-y-2 text-sm text-[#5d4c4d]">
              <div>Customer: {order.customerName}</div>
              <div>Phone: {order.phone}</div>
              <div>Address: {order.address}, {order.city}, {order.state} - {order.zip}</div>
              <div>Order date: {new Date(order.orderDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div>
            <div className="mb-3 text-lg font-semibold text-[#38131d]">Products</div>
            <div className="space-y-2 text-sm text-[#5d4c4d]">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.productId}`}>
                  {item.productName} — {item.size} × {item.quantity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link to="/my-orders" className="store-button secondary">Back to orders</Link>
    </div>
  );
}
