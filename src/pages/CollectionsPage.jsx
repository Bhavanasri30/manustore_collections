import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { CATEGORIES, SIZE_OPTIONS } from '../data';
import { useStore } from '../context/StoreContext';
import ProductGrid from './ProductGrid';

export default function CollectionsPage() {
  const { products } = useStore();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('5000');
  const [size, setSize] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSearch = params.get('search') || '';
    setSearch(nextSearch);
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || product.category === category;
      const matchesMin = Number(product.price) >= Number(minPrice || 0);
      const matchesMax = Number(product.price) <= Number(maxPrice || 999999);
      const matchesSize = size === 'All' || product.sizes.includes(size);
      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'In Stock' && product.inStock) ||
        (stockFilter === 'Out of Stock' && !product.inStock);

      return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesSize && matchesStock;
    });

    if (sortBy === 'low-to-high') {
      return [...result].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'high-to-low') {
      return [...result].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'newest') {
      return [...result].sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    }

    return result;
  }, [products, search, category, minPrice, maxPrice, size, stockFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('0');
    setMaxPrice('5000');
    setSize('All');
    setStockFilter('All');
    setSortBy('featured');
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="rounded-[28px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5">
        <div className="mb-6 flex items-center gap-3 text-[#5b1f2d]">
          <SlidersHorizontal />
          <h2 className="section-title mb-0">Collection filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#463535]">Search</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            >
              <option value="All">All</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Size</label>
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            >
              <option value="All">All</option>
              {SIZE_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Availability</label>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            >
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#463535]">Sort</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-xl border border-[#eadbc7] bg-[#fdf9f4] px-3 py-2.5 outline-none"
            >
              <option value="featured">Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-full border border-[#d7c2b4] bg-[#fffdfb] px-4 py-2 text-sm font-semibold text-[#5b1f2d]">
            <X size={14} /> Clear Filters
          </button>
        </div>
      </div>

      <div>
        <h2 className="section-title">Result ({filteredProducts.length})</h2>
        {filteredProducts.length ? <ProductGrid products={filteredProducts} /> : <div className="rounded-[24px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-8 text-center text-[#694d51]">No products match your current filters.</div>}
      </div>
    </div>
  );
}
