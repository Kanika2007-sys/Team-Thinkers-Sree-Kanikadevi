import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Building2,
  Settings,
  Users,
  Shield,
  MapPin,
  Package,
  CheckCircle2,
  Home,
  FilePlus,
  Search,
  LogOut,
  Landmark,
  Navigation,
  Activity,
  ShieldCheck
} from 'lucide-react';

const groupedSidebarConfig = {
  admin: [
    {
      section: 'Operations',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Complaints', path: '/admin/complaints', icon: ClipboardList },
      ],
    },
    {
      section: 'Insights',
      items: [{ label: 'Analytics', path: '/admin/analytics', icon: BarChart3 }],
    },
    {
      section: 'Configuration',
      items: [
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Services', path: '/admin/services', icon: Settings },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Roles', path: '/admin/roles', icon: Shield },
        { label: 'Locations', path: '/admin/locations', icon: MapPin },
      ],
    },
  ],
  department: [
    {
      section: 'Operations',
      items: [
        { label: 'Dashboard', path: '/department', icon: LayoutDashboard },
        { label: 'Inventory', path: '/department/inventory', icon: Package },
      ],
    },
  ],
  citizen: [
    {
      section: 'Citizen Hub',
      items: [
        { label: 'Home', path: '/citizen', icon: Home },
        { label: 'Report Issue', path: '/citizen/report', icon: FilePlus },
        { label: 'Track Issues', path: '/citizen/track', icon: Search },
      ],
    },
  ],
};

const officerNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Assigned Tasks', icon: CheckCircle2, badge: 4, badgeColor: 'bg-orange-500 text-white font-bold' },
  { id: 'map', label: 'Live Map', icon: MapPin },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'performance', label: 'Performance', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ portal = 'admin', activeView = 'dashboard', setActiveView = () => {} }) {
  const { user, logout } = useAuthStore();
  const sections = groupedSidebarConfig[portal];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col z-40 shadow-xl text-slate-100 font-sans">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#0b0f19]">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/25">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-white tracking-tight leading-none">CivicOS</h1>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-1">{portal} Portal</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {portal === 'officer' ? (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Field Operations
            </div>
            {officerNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border-l-4 border-blue-400 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          sections?.map((sec, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                {sec.section}
              </div>
              <div className="space-y-1">
                {sec.items.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === `/${portal}`}
                      className={({ isActive }) =>
                        isActive
                          ? 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-md shadow-blue-500/25 border-l-4 border-blue-400 transition-all'
                          : 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 font-medium text-xs hover:bg-slate-800/60 hover:text-slate-200 transition-all'
                      }
                    >
                      <IconComponent className="w-4 h-4 shrink-0 text-blue-400" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Today's SLA Compliance Footer Card */}
      <div className="p-3 m-2 rounded-xl bg-[#0f172a] border border-slate-800/80 space-y-2 text-xs">
        <div className="text-[11px] font-bold text-slate-400">Today's SLA Compliance</div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: '94%' }}></div>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-extrabold text-white">94% Target Achieved</span>
          <span className="font-bold text-emerald-400">+4% vs Avg</span>
        </div>
      </div>

      {/* Sign Out Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0b0f19]">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/60 transition-all flex items-center justify-between border border-slate-800 bg-[#0f172a]"
        >
          <span>Sign out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
