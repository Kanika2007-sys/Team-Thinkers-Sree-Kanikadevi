import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { DEFAULT_DEPARTMENTS } from '../../services/xanoService';
import { Landmark, Building2, User, ArrowRight, UserCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { registerUser } = useAuthStore();

  const [role, setRole] = useState('citizen'); // 'citizen', 'officer', 'department_head'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('DEPT-1');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill out all required fields');
      return;
    }
    setSubmitting(true);

    try {
      // Save user profile & Firebase Auth
      const targetDeptId = role === 'citizen' ? null : (departmentId || 'DEPT-1');

      const newUser = await registerUser({
        name,
        email,
        password,
        departmentId: targetDeptId,
        role
      });

      if (role === 'citizen') {
        alert(`Success! Citizen account created for ${newUser.name}. Redirecting...`);
        navigate('/citizen');
      } else if (role === 'department_head') {
        alert(`Success! Department Head account created for ${newUser.name} (${newUser.department}). Redirecting...`);
        navigate('/department');
      } else {
        alert(`Success! Officer account created for ${newUser.name} (${newUser.department}). Redirecting...`);
        navigate('/officer');
      }
    } catch (err) {
      alert('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden p-4 font-sans text-slate-800">
      {/* Radial glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CivicOS Registration</h1>
          <p className="text-slate-400 text-xs mt-1">Firebase Managed Account Setup</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-2xl space-y-5">
          
          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Account Role</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {[
                { key: 'citizen', label: 'Citizen', icon: User },
                { key: 'officer', label: 'Officer', icon: UserCheck },
                { key: 'department_head', label: 'Dept Head', icon: Building2 }
              ].map(r => {
                const Icon = r.icon;
                const isSelected = role === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={12} /> {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'citizen' ? 'e.g. Priya Sharma' : 'e.g. Officer Kumar / Suresh Raina'}
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 2. Email ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">2. Email Address (Email ID) *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">3. Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 4. Department Dropdown */}
            {role !== 'citizen' && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-slate-700 mb-1">4. Assigned Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {DEFAULT_DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.name} ({d.zone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Registering with Firebase...' : 'Create Account & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-1 text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
