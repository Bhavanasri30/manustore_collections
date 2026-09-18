import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function OwnerAuthPage() {
  const navigate = useNavigate();
  const { registerOwner, loginOwner, resetPassword, setError, error } = useStore();
  const [mode, setMode] = useState('login');
  const [resetMode, setResetMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '' });
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) {
          throw new Error('Please enter your store name to create an owner account.');
        }
        await registerOwner({
          name: form.name.trim(),
          email: form.email,
          password: form.password,
        });
      } else {
        await loginOwner({ email: form.email, password: form.password });
      }
      navigate('/owner-dashboard');
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!resetForm.email.trim()) {
        throw new Error('Please enter the email linked to your account.');
      }
      await resetPassword({
        role: 'owner',
        email: resetForm.email,
      });
      setSuccess('Password reset link sent. Please check your email.');
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] borderborder-[#eadbc7] bg-white shadow-[0_20px_50px_rgba(91,31,45,0.12)] lg:grid-cols-[1fr,1.15fr]">
        <div className="relative hidden bg-[radial-gradient(circle_at_top,_#f8ebd8,_#f4e4d2_35%,_#edd6bb_100%)] p-8 text-[#38131d] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent)]" />
          <div className="relative z-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#5b1f2d] text-xl font-bold text-[#f7ebd7]">
              M
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7f5a5e]">
              Owner access
            </p>
            <h2 className="max-w-xs text-3xl font-bold leading-tight">
              Manage your store, stock, and orders from one elegant dashboard.
            </h2>
          </div>

          <div className="relative z-10 space-y-4 rounded-[26px] border border-white/40 bg-white/35 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm font-mediumtext-[#5b1f2d]">
              <span>Business portal</span>
              <span>Live overview</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-[#5b1f2d]">
              <div className="rounded-2xl bg-white/60 p-3">
                <div className="text-lg font-bold">24/7</div>
                <div>control</div>
              </div>
              <div className="rounded-2xl bg-white/60 p-3">
                <div className="text-lg font-bold">100%</div>
                <div>secure</div>
              </div>
              <div className="rounded-2xl bg-white/60 p-3">
                <div className="text-lg font-bold">Fast</div>
                <div>updates</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {!resetMode ? (
            <>
              <div className="mb-6 flex gap-2 rounded-full bg-[#f7f1ea] p-1.5">
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-[#5b1f2d] text-white shadow-md' : 'text-[#5b1f2d]'}`}>
                  Login
                </button>
                <button type="button" onClick={() => { setMode('signup'); setError(''); }} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${mode === 'signup' ? 'bg-[#5b1f2d] text-white shadow-md' : 'text-[#5b1f2d]'}`}>
                  Sign up
                </button>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5d62]">
                  Owner access
                </p>
                <h1 className="text-3xl font-bold text-[#38131d]">
                  {mode === 'login' ? 'Welcome back' : 'Open your store'}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#463535]">Store name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-[#eadbc7] bg-[#fffdfb] px-3.5 py-3 text-sm text-[#38131d] outline-none transition focus:border-[#5b1f2d] focus:ring-2 focus:ring-[#eadbc7]" placeholder="Your store name" />
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#463535]">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-[#eadbc7] bg-[#fffdfb] px-3.5 py-3 text-sm text-[#38131d] outline-none transition focus:border-[#5b1f2d] focus:ring-2 focus:ring-[#eadbc7]" placeholder="owner@example.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#463535]">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-2xl border border-[#eadbc7] bg-[#fffdfb] px-3.5 py-3 text-sm text-[#38131d] outline-none transition focus:border-[#5b1f2d] focus:ring-2 focus:ring-[#eadbc7]" placeholder="Minimum 6 characters" />
                </div>

                {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

                <button type="submit" className="store-button w-full !rounded-2xl!py-3.5 text-base font-semibold">
                  {mode === 'login' ? 'Login to dashboard' : 'Create owner account'}
                </button>
              </form>

              {mode === 'login' && (
                <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                  <button type="button" onClick={() => { setResetMode(true); setError(''); }} className="font-semibold text-[#5b1f2d] transition hover:text-[#3b1b1f]">
                    Forgot password?
                  </button>
                  <span className="text-[#7a6664]">Store insights</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a5d62]">
                  Security
                </p>
                <h1 className="text-3xl font-bold text-[#38131d]">Reset password</h1>
              </div>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#463535]">Email</label>
                  <input type="email" name="email" value={resetForm.email} onChange={handleResetChange} className="w-full rounded-2xl border border-[#eadbc7] bg-[#fffdfb] px-3.5 py-3 text-sm text-[#38131d] outline-none transition focus:border-[#5b1f2d] focus:ring-2 focus:ring-[#eadbc7]" placeholder="owner@example.com" />
                </div>
                {success && <div className="rounded-2xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">{success}</div>}
                {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

                <button type="submit" className="store-button w-full !rounded-2xl!py-3.5 text-base font-semibold">
                  Send reset link
                </button>
                <button type="button" onClick={() => { setResetMode(false); setError(''); }} className="w-full rounded-2xl border border-[#d7c2b4] bg-white px-3 py-3 text-sm font-semibold text-[#5b1f2d] transition hover:border-[#5b1f2d] hover:bg-[#fffaf6]">
                  Back to login
                </button>
              </form>
            </>
          )}

          <div className="mt-6 border-t border-[#f0e3d7] pt-4 text-center text-smtext-[#5d4c4d]">
            <Link to="/customer-login" className="font-semibold text-[#5b1f2d] transition hover:text-[#3b1b1f]">
              Customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
