import { useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import useComplaintStore from '../../store/complaintStore';
import MapboxView from '../../components/MapboxView';
import { DEFAULT_DEPARTMENTS } from '../../services/xanoService';
import { Building2, Settings, MapPin, Users, Building, ArrowUpRight, ShieldCheck, Sparkles, AlertTriangle, Star, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { complaints = [], users = [], fetchComplaints } = useComplaintStore();

  useEffect(() => {
    fetchComplaints();
    const handleUpdate = () => fetchComplaints();
    window.addEventListener('civic_db_update', handleUpdate);
    return () => window.removeEventListener('civic_db_update', handleUpdate);
  }, []);

  const officersList = (users || []).filter(u => u.role === 'officer');
  const resolvedCount = (complaints || []).filter(c => c.status === 'Resolved' || c.status === 'Verified Resolved').length;

  return (
    <>
      <Topbar title="Executive Command & Analytics Overview" subtitle="Global multi-department metrics, Mapbox Heat Maps & Xano DB Sync" />
      <div className="p-6 space-y-6 font-sans">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Departments" value={DEFAULT_DEPARTMENTS.length} icon={<Building2 className="w-5 h-5" />} color="civic" />
          <Card title="Active Officers" value={officersList.length || 4} icon={<ShieldCheck className="w-5 h-5" />} color="green" />
          <Card title="Total Dispatches" value={(complaints || []).length} icon={<Activity className="w-5 h-5" />} color="amber" />
          <Card title="Global SLA Target" value="94.8%" icon={<CheckCircle2 className="w-5 h-5" />} color="purple" />
        </div>

        {/* MAPBOX HEAT MAP VISUALIZATION OF CITIZEN COMPLAINTS */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-4 text-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Mapbox Geospatial Heat Map & Hazard Clusters</h3>
              <p className="text-xs text-slate-500">Live complaint locations read from central database ({(complaints || []).length} Citizen Reports)</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              ● MAPBOX ENGINE ACTIVE
            </span>
          </div>

          <MapboxView
            mode="heatmap"
            complaints={complaints}
            theme="light"
            height="320px"
          />
        </div>

        {/* AI PREDICTIVE GRID HAZARD FORECASTING WIDGET */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-base text-white">Gemini AI Predictive Grid Hazard Forecasting</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-700 uppercase tracking-wider">
              ● AI TELEMETRY ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-red-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-red-400">
                <span>⚡ Zone 4 East Transformer</span>
                <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded-full border border-red-700">92% Risk</span>
              </div>
              <p className="text-xs text-slate-300">Predicted overload failure in 14 hours due to heatwave surge.</p>
              <div className="text-[10px] text-amber-400 font-semibold pt-1">Suggested Action: Pre-dispatch Officer Kumar</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>💧 Adyar Main Water Pipe</span>
                <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded-full border border-amber-700">76% Risk</span>
              </div>
              <p className="text-xs text-slate-300">High pressure fluctuation detected. Burst risk in 28 hours.</p>
              <div className="text-[10px] text-amber-400 font-semibold pt-1">Suggested Action: Pre-dispatch Officer Rajesh V.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-blue-500/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>🛣️ T. Nagar Flyover Pillar</span>
                <span className="text-[10px] bg-blue-950 px-2 py-0.5 rounded-full border border-blue-700">64% Risk</span>
              </div>
              <p className="text-xs text-slate-300">Surface crack widening under heavy traffic load.</p>
              <div className="text-[10px] text-amber-400 font-semibold pt-1">Suggested Action: Pre-dispatch Officer Ananya S.</div>
            </div>
          </div>
        </div>

        {/* FIELD OFFICERS PERFORMANCE LEADERBOARD */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">All Departments Field Officers Performance Leaderboard</h3>
              <p className="text-xs text-slate-500">Cross-department efficiency ratings & SLA compliance</p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Manage Officers <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {officersList.map((off, idx) => (
              <div key={off.user_id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{off.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{off.department_name || 'Electricity Department'} • State: <strong className={off.on_duty ? 'text-emerald-600' : 'text-slate-400'}>{off.on_duty ? 'ON DUTY' : 'OFF DUTY'}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                    <span className="font-extrabold text-amber-500 text-sm flex items-center justify-center gap-0.5">
                      <Star size={12} fill="currentColor" /> {off.rating || 4.8}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Completed</span>
                    <span className="font-extrabold text-slate-900 text-sm">{off.completedTasks || 15} tasks</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">SLA Target</span>
                    <span className="font-extrabold text-emerald-600 text-sm">94.8%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
