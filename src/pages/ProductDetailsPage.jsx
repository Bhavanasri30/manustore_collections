import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find((item) => item.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useMemo(() => {
    if (product && !selectedSize && product.sizes.length) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

  if (!product) {
    return (
      <div className="rounded-[30px] border border-dashed border-[#d7c2b4] bg-[#fffdfb] p-8 text-center text-[#694d51]">
        Product not found.
      </div>
    );
  }

  const whatsappLink = `https://wa.me/9989824277?text=${encodeURIComponent(`Hello! I am interested in ${product.name} (ID: ${product.id}). Please share details.`)}`;

  return (
    <div className="pb-10">
      <div className="grid gap-8 rounded-[30px] border border-[#eadbc7] bg-white p-6 shadow-lg shadow-[#5b1f2d]/5 lg:grid-cols-2 lg:p-8">
        <div>
          <img src={product.image} alt={product.name} className="h-[520px] w-full rounded-[24px] object-cover" />
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className={`status-badge ${product.inStock ? 'status-instock' : 'status-outstock'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            <span className="rounded-full bg-[#f5ead2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b1f2d]">
              {product.category}
            </span>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#7d6262]">Product ID: {product.id}</div>
            <h1 className="mt-2 text-3xl font-bold text-[#38131d] md:text-4xl">{product.name}</h1>
          </div>

          <div className="text-3xl font-bold text-[#5b1f2d]">₹{product.price.toLocaleString('en-IN')}</div>

          <p className="text-[#5d4c4d]">{product.description}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-[#38131d]">Fabric</div>
              <div className="rounded-xl border border-[#eadbc7] bg-[#fffdfb] px-3 py-2 text-[#503c3d]">{product.fabric}</div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-[#38131d]">Stock</div>
              <div className="rounded-xl border border-[#eadbc7] bg-[#fffdfb] px-3 py-2 text-[#503c3d]">{product.stock} available</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#38131d]">Available sizes</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium ${selectedSize === size ? 'border-[#5b1f2d] bg-[#5b1f2d] text-white' : 'border-[#ddc7b8] bg-[#fffdfb] text-[#463535]'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#38131d]">Colours</div>
            <div className="flex flex-wrap gap-2">
              {product.colours.map((colour) => (
                <span key={colour} className="rounded-full bg-[#f7f1ea] px-3 py-2 text-sm text-[#503c3d]">
                  {colour}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-[#d9c7b9] bg-[#fffdfb]">
              <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="p-3 text-[#5b1f2d]">
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center font-semibold text-[#38131d]">{quantity}</span>
              <button type="button" onClick={() => setQuantity((prev) => prev + 1)} className="p-3 text-[#5b1f2d]">
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => addToCart(product, selectedSize || product.sizes[0], quantity)}
              className="flex-1 rounded-full bg-[#5b1f2d] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d1b0af]"
            >
              <span className="inline-flex items-center gap-2"><ShoppingBag size={16} /> Add to Cart</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="store-button secondary flex-1">
              <span className="inline-flex items-center gap-2"><MessageCircle size={16} /> WhatsApp Enquiry</span>
            </a>
            <Link to="/collections" className="store-button ghost flex-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
