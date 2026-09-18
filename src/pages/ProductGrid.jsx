import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductGrid({ products = [] }) {
  const { addToCart } = useStore();

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="overflow-hidden rounded-[26px] border border-[#eadbc7] bg-white shadow-lg shadow-[#5b1f2d]/5">
          <div className="relative">
            <img src={product.image} alt={product.name} className="h-72 w-full object-cover" />
            <span className={`absolute left-3 top-3 status-badge ${product.inStock ? 'status-instock' : 'status-outstock'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c6d6c]">{product.category}</div>
                <h3 className="mt-1 text-lg font-semibold text-[#38131d]">{product.name}</h3>
              </div>
              <div className="text-right text-lg font-bold text-[#5b1f2d]">₹{product.price.toLocaleString('en-IN')}</div>
            </div>

            <div className="text-sm text-[#584a4a]">
              <div>Product ID: {product.id}</div>
              <div className="mt-1">Sizes: {product.sizes.join(', ')}</div>
            </div>

            <div className="flex gap-2">
              <Link to={`/product/${product.id}`} className="store-button secondary flex-1">
                View Details
              </Link>
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => addToCart(product, product.sizes[0])}
                className="flex items-center justify-center rounded-full bg-[#5b1f2d] p-3 text-white disabled:cursor-not-allowed disabled:bg-[#d8c1bf]"
              >
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
