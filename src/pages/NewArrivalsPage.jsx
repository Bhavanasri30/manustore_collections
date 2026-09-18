import { useStore } from '../context/StoreContext';
import ProductGrid from './ProductGrid';

export default function NewArrivalsPage() {
  const { products } = useStore();
  const arrivals = products.filter((product) => product.newArrival);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-[linear-gradient(135deg,#fdf7f1,#f5ebdc)] p-8 text-[#38131d] shadow-lg shadow-[#5b1f2d]/5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a5d62]">Fresh drop</p>
        <h1 className="mt-2 text-4xl font-bold">New Arrivals</h1>
      </div>

      {arrivals.length ? <ProductGrid products={arrivals} /> : <div className="rounded-[24px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-8 text-center text-[#694d51]">No new arrivals at the moment.</div>}
    </div>
  );
}
