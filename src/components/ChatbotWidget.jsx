import { useMemo, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const quickReplies = [
  'What is the price of Saffron Silk Saree?',
  'Show me new arrivals',
  'How do I track my order?',
  'How do I return a product?',
];

export default function ChatbotWidget() {
  const { products } = useStore();
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi! I can help with product details, stock, orders, and return questions.',
    },
  ]);
  const [input, setInput] = useState('');

  const productIndex = useMemo(
    () =>
      products.map((product) => ({
        name: product.name.toLowerCase(),
        category: product.category.toLowerCase(),
        product,
      })),
    [products],
  );

  const findProduct = (query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return null;

    const directMatch = productIndex.find(({ name }) => name.includes(normalized));
    if (directMatch) return directMatch.product;

    const categoryMatch = productIndex.find(({ category }) => category.includes(normalized));
    return categoryMatch ? categoryMatch.product : null;
  };

  const answerQuestion = (prompt) => {
    const normalized = prompt.toLowerCase().trim();

    if (!normalized) {
      return 'Please ask a question about products, stock, categories, or orders.';
    }

    if (['hi', 'hello', 'hey', 'good morning', 'good evening'].some((word) => normalized.includes(word))) {
      return 'Hello! I can help you with product details, pricing, stock, order updates, and returns.';
    }

    if (normalized.includes('thank you') || normalized.includes('thanks')) {
      return 'You’re welcome! I’m happy to help with your shopping questions.';
    }

    if (normalized.includes('what can you do') || normalized.includes('help me')) {
      return 'I can help with product prices, new arrivals, stock status, size availability, order tracking, returns, and recommendations.';
    }

    if (normalized.includes('how to order') || normalized.includes('order')) {
      return 'Browse the catalog, choose a size, add to cart, and proceed to checkout. You can then complete the form and place your order.';
    }

    if (normalized.includes('track') || normalized.includes('tracking')) {
      return 'Go to My Orders and open the order you want to track. The status will update through Order Placed → Confirmed → Packed → Shipped → Delivered.';
    }

    if (normalized.includes('return') || normalized.includes('exchange')) {
      return 'Once your order is delivered, you can request a return or exchange from My Orders. The request is saved and sent to the store owner for review.';
    }

    if (normalized.includes('shipping') || normalized.includes('delivery')) {
      return 'We usually process orders quickly and update the shipping status in My Orders once the item is on the way.';
    }

    if (normalized.includes('new arrival') || normalized.includes('new arrivals')) {
      const arrivals = products.filter((product) => product.newArrival).map((p) => p.name);
      return arrivals.length ? `New arrivals include: ${arrivals.join(', ')}.` : 'There are no new arrivals right now.';
    }

    if (normalized.includes('recommend') || normalized.includes('best') || normalized.includes('popular')) {
      const featured = products.filter((product) => product.newArrival || product.inStock).slice(0, 3);
      if (!featured.length) {
        return 'I recommend checking the latest arrivals and best-selling festive picks in our collection.';
      }
      return `My top picks right now are ${featured.map((product) => product.name).join(', ')}.`;
    }

    if (normalized.includes('category') || normalized.includes('categories')) {
      return `Available categories: ${['Sarees', 'Half Sarees', 'Kurtas', 'Anarkalis', 'Frocks'].join(', ')}.`;
    }

    if (normalized.includes('saree') || normalized.includes('half saree') || normalized.includes('kurta') || normalized.includes('anarkali') || normalized.includes('frock')) {
      const product = findProduct(normalized);
      if (product) {
        return `${product.name} is a ${product.category} product. It is priced at ₹${product.price.toLocaleString('en-IN')} and currently ${product.inStock ? 'in stock' : 'out of stock'} with ${product.stock} items available.`;
      }
    }

    if (normalized.includes('stock') || normalized.includes('available')) {
      const product = findProduct(normalized.replace(/stock|available|size|price|category/g, '').trim());
      if (product) {
        return `${product.name} has ${product.stock} items in stock. ${product.inStock ? 'Available now.' : 'Currently out of stock.'}`;
      }
      return 'I don’t have verified information about that yet. Please contact the store to confirm.';
    }

    if (normalized.includes('size') || normalized.includes('sizes')) {
      const product = findProduct(normalized.replace(/size|sizes|available/g, '').trim());
      if (product) {
        return `${product.name} is available in sizes: ${product.sizes.join(', ')}.`;
      }
      return 'I don’t have verified information about that yet. Please contact the store to confirm.';
    }

    if (normalized.includes('price') || normalized.includes('cost') || normalized.includes('how much')) {
      const product = findProduct(normalized.replace(/price|cost|how much is|what is the price of|how much does|get me the price of/g, '').trim());
      if (product) {
        return `${product.name} is priced at ₹${product.price.toLocaleString('en-IN')}.`;
      }
      return 'I can help with pricing for specific products. Try asking for a product name like “Saffron Silk Saree”.';
    }

    const product = findProduct(normalized);
    if (product) {
      return `${product.name} is a ${product.category} product. It is priced at ₹${product.price.toLocaleString('en-IN')} and currently ${product.inStock ? 'in stock' : 'out of stock'} with ${product.stock} items available.`;
    }

    const categoryMatch = products.find((product) => normalized.includes(product.category.toLowerCase()));
    if (categoryMatch) {
      const categoryProducts = products.filter((product) => product.category === categoryMatch.category);
      return `${categoryMatch.category} includes ${categoryProducts.map((product) => product.name).join(', ')}.`;
    }

    return 'I can help with style recommendations, prices, stock, sizes, returns, and order questions. Try asking about a specific product or category.';
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { from: 'user', text: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: answerQuestion(trimmed) }]);
      setIsTyping(false);
    }, 220);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open ? (
        <div className="w-[320px] overflow-hidden rounded-[26px] border border-[#eadbc7] bg-[#fffdfb] shadow-2xl">
          <div className="flex items-center justify-between bg-[#5b1f2d] px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <MessageCircle size={18} />
              Store Assistant
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex max-h-[320px] flex-col gap-3 bg-[#f7f1ea] p-3">
            {messages.map((msg, index) => (
              <div key={`${msg.from}-${index}`} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.from === 'user' ? 'ml-auto bg-[#5b1f2d] text-white' : 'bg-white text-[#4a2b30]'}`}>
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div className="max-w-[85%] rounded-2xl bg-white px-3 py-2 text-sm text-[#5b1f2d]">
                Typing...
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => setInput(reply)}
                  className="rounded-full border border-[#d9c7b9] bg-white px-2 py-1 text-[11px] text-[#5b1f2d]"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 border-t border-[#eadbc7] bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
              placeholder="Ask about products..."
              className="flex-1 rounded-full border border-[#d9c7b9] bg-[#f9f4ef] px-3 py-2 text-sm outline-none"
            />
            <button type="button" onClick={sendMessage} className="rounded-full bg-[#5b1f2d] p-2 text-white">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5b1f2d] text-white shadow-lg shadow-[#5b1f2d]/25"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
