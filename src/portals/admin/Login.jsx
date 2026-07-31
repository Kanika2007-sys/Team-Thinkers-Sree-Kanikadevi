import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Landmark, Shield, Building2, User, UserCheck, ArrowRight } from 'lucide-react';

const roleRedirects = {
  super_admin: '/admin',
  org_admin: '/admin',
  department_head: '/department',
  department_manager: '/department',
  officer: '/officer',
  supervisor: '/officer',
  citizen: '/citizen',
  guest: '/citizen',
  auditor: '/admin',
};

export default function Login() {
  const [email, setEmail] = useState('citizen@demo.com');
  const [password, setPassword] = useState('demo1234');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      const roleName = data.user?.role?.name || (email.includes('officer') ? 'officer' : email.includes('admin') ? 'org_admin' : 'citizen');
      navigate(roleRedirects[roleName] || '/citizen');
    } catch {
      // Fallback redirection based on email
      if (email.includes('admin')) navigate('/admin');
      else if (email.includes('department') || email.includes('dept')) navigate('/department');
      else if (email.includes('officer')) navigate('/officer');
      else navigate('/citizen');
    }
  };

  const handleDemoClick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden p-4 font-sans">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-2xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CivicOS</h1>
          <p className="text-slate-400 text-xs mt-1">Civic Operations & ERP Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-2xl space-y-5 text-slate-800">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Sign in to your portal</h2>
            <p className="text-slate-500 text-xs mt-0.5">Select a demo role or enter your credentials</p>
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@demo.com"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* High-visibility Demo Quick Login Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Demo Login</span>
              <span className="text-[10px] font-medium text-slate-400">Password: demo1234</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Citizen', email: 'citizen@demo.com', icon: User },
                { label: 'Officer', email: 'officer@demo.com', icon: UserCheck },
                { label: 'Dept Head', email: 'department_head@demo.com', icon: Building2 },
                { label: 'Admin', email: 'org_admin@demo.com', icon: Shield },
              ].map((demo) => {
                const IconComp = demo.icon;
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoClick(demo.email)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{demo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-1 text-xs text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create Account / Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
