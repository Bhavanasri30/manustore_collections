import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/new-arrivals', label: 'New Arrivals' },
  { to: '/collections', label: 'Collections' },
  { to: '/contact', label: 'Contact' },
];

export default function Layout({ children }) {
  const { cart, currentUser, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      navigate('/collections');
      return;
    }
    navigate(`/collections?search=${encodeURIComponent(trimmed)}`);
    setShowSearch(false);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 border-b border-[#e8d9c7] bg-[rgba(253,250,246,0.96)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b1f2d] text-lg font-bold text-[#f5e9d6]">
              M
            </div>
            <div>
              <div className="text-xl font-bold tracking-[0.12em] text-[#5b1f2d]">manu_stores25</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'text-[#5b1f2d]' : 'text-[#644c4d] hover:text-[#5b1f2d]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {currentUser?.role === 'customer' && (
              <NavLink to="/my-orders" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-[#5b1f2d]' : 'text-[#644c4d]'}`}>
                My Orders
              </NavLink>
            )}
            {currentUser?.role === 'owner' && (
              <Link to="/owner-dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#f5ebd8] px-3 py-2 text-sm font-semibold text-[#5b1f2d]">
                <LayoutDashboard size={15} /> Owner Dashboard
              </Link>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-[#d7c2b4] bg-white px-3 py-2">
                <Search size={16} className="text-[#5b1f2d]" />
                <input
                  aria-label="Search products"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                  className="w-40 border-0 bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowSearch(false)} className="text-[#5b1f2d]" aria-label="Close search">
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button type="button" onClick={() => setShowSearch(true)} className="rounded-full border border-[#d7c2b4] bg-white p-2 text-[#5b1f2d]" aria-label="Open product search">
                <Search size={17} />
              </button>
            )}

            {currentUser?.role !== 'owner' && (
              <Link to="/cart" className="relative rounded-full border border-[#d7c2b4] bg-white p-2 text-[#5b1f2d]" aria-label="Cart">
                <ShoppingBag size={17} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d6b36a] px-1 text-[10px] font-bold text-[#5b1f2d]">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#5b1f2d] px-3 py-2 text-xs font-semibold text-white">{currentUser.name}</span>
                <button type="button" onClick={logout} className="rounded-full border border-[#d7c2b4] bg-white px-3 py-2 text-xs font-semibold text-[#5b1f2d]">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/customer-login" className="flex items-center gap-2 rounded-full bg-[#5b1f2d] px-4 py-2 text-sm font-semibold text-white">
                <User size={15} /> Login
              </Link>
            )}
          </div>

          <button type="button" className="rounded-full border border-[#d7c2b4] bg-white p-2 text-[#5b1f2d] md:hidden" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#eadbc7] bg-[#fffdfb] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={closeMenu} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#f8edf1] text-[#5b1f2d]' : 'text-[#5d504d]'}`}>
                  {item.label}
                </NavLink>
              ))}
              {currentUser?.role === 'customer' && (
                <NavLink to="/my-orders" onClick={closeMenu} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#f8edf1] text-[#5b1f2d]' : 'text-[#5d504d]'}`}>
                  My Orders
                </NavLink>
              )}
              {currentUser?.role === 'owner' && (
                <Link to="/owner-dashboard" onClick={closeMenu} className="inline-flex items-center gap-2 rounded-lg bg-[#f5ebd8] px-3 py-2 text-sm font-semibold text-[#5b1f2d]">
                  <LayoutDashboard size={15} /> Owner Dashboard
                </Link>
              )}

              {currentUser?.role !== 'owner' && (
                <Link to="/cart" onClick={closeMenu} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#5b1f2d]">
                  <ShoppingBag size={16} /> Cart ({cartCount})
                </Link>
              )}

              {currentUser ? (
                <button type="button" onClick={() => { logout(); closeMenu(); }} className="rounded-lg border border-[#d7c2b4] bg-white px-3 py-2 text-left text-sm font-semibold text-[#5b1f2d]">
                  Logout
                </button>
              ) : (
                <Link to="/customer-login" onClick={closeMenu} className="rounded-lg bg-[#5b1f2d] px-3 py-2 text-center text-sm font-semibold text-white">
                  Login
                </Link>
              )}

              {showSearch && (
                <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-[#d7c2b4] bg-white px-3 py-2">
                  <Search size={16} className="text-[#5b1f2d]" />
                  <input
                    aria-label="Search products"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products"
                    className="w-full border-0 bg-transparent text-sm outline-none"
                  />
                </form>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
    </div>
  );
}
