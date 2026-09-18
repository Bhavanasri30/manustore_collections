import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductGrid from './ProductGrid';

const highlights = [
  { icon: ShoppingBag, title: 'Curated edits', text: 'Handpicked styles for weddings, celebrations, and everyday elegance.' },
  { icon: Sparkles, title: 'New arrivals', text: 'Fresh silhouettes and festive favourites refreshed every week.' },
  { icon: ShieldCheck, title: 'Quality promise', text: 'Premium fabrics and trusted craftsmanship in every collection.' },
];

export default function HomePage() {
  const { products } = useStore();
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-10 pb-10">
      <section className="overflow-hidden rounded-[32px] border border-[#e7d9cf] bg-[linear-gradient(135deg,#5b1f2d,#7a2e42_38%,#f5ebdc_38%,#f7f1ea)] p-6 text-[#fdf7f1] shadow-xl md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6e7c6]">
              Curated luxury essentials
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-6xl">
              Heritage styles for a modern wardrobe.
            </h1>
            <p className="mt-4 max-w-lg text-base text-[#f0e4d7] md:text-lg">
              Discover elegant sarees, festive kurtas, signature dresses, and statement silhouettes crafted to move with your day.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/collections" className="store-button">
                Shop collection
              </Link>
              <Link to="/new-arrivals" className="store-button secondary">
                New arrivals
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/20 bg-[rgba(255,255,255,0.08)] p-3 backdrop-blur-sm">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
              alt="Fashion collection"
              className="h-[420px] w-full rounded-[22px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-surface rounded-[26px] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6ebd8] text-[#5b1f2d]">
              <Icon size={20} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[#38131d]">{title}</h3>
            <p className="text-[#5d4c4d]">{text}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="section-title">Featured styles</h2>
          <Link to="/collections" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5b1f2d]">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
