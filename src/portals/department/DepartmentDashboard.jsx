import { useState, useEffect } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import useComplaintStore from '../../store/complaintStore';
import { Kanban, List, UserCheck, ShieldCheck, Activity, Star, CheckCircle, Clock } from 'lucide-react';

export default function DepartmentDashboard() {
  const { user } = useAuthStore();
  const { complaints = [], users = [], fetchComplaints, assignDepartmentAndOfficer } = useComplaintStore();

  const [activeTab, setActiveTab] = useState('queue');
  const [viewMode, setViewMode] = useState('kanban');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const currentDeptId = String(user?.department_id || 'DEPT-1');
  const currentDeptName = user?.department || user?.departmentName || 'Electricity Department';

  const deptComplaints = (complaints || []).filter(c => 
    String(c.department_id) === String(currentDeptId) || 
    c.department_name === currentDeptName ||
    currentDeptId === 'DEPT-1'
  );

  const deptOfficers = (users || []).filter(u => 
    u.role === 'officer' && 
    (String(u.department_id) === String(currentDeptId) || u.department_name === currentDeptName || currentDeptId === 'DEPT-1')
  );

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const cid = selectedComplaint.complaint_id || selectedComplaint.id;
    const offObj = deptOfficers.find(o => o.user_id === selectedOfficerId || o.name === selectedOfficerId);

    await assignDepartmentAndOfficer(
      cid,
      currentDeptId,
      currentDeptName,
      offObj?.user_id || selectedOfficerId,
      offObj?.name || 'Officer'
    );

    setAssignModalOpen(false);
    alert(`Assigned Complaint #${cid} to Officer ${offObj?.name || selectedOfficerId}`);
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedOfficerId(complaint.officer_id || '');
    setAssignModalOpen(true);
  };

  return (
    <>
      <Topbar
        title="Department Head Operations"
        subtitle={`Department Queue & Officer Management (${currentDeptName})`}
      />

      <div className="p-6 space-y-6 font-sans text-slate-800">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📋 Department Queue ({deptComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🛡️ Department Officers ({deptOfficers.length})
            </button>
          </div>

          {activeTab === 'queue' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
              >
                List
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: QUEUE VIEW */}
        {activeTab === 'queue' && (
          <div className="space-y-4 animate-fadeIn">
            {deptComplaints.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 font-bold">
                No active complaints in queue for {currentDeptName}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deptComplaints.map(c => {
                  const cid = c.complaint_id || c.id;
                  return (
                    <div key={cid} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-blue-600">#{cid}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                          {c.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.category}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{c.location} • Citizen: {c.citizen_name || c.citizenName}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500">Officer: <strong className="text-slate-800">{c.officer_name || c.assignedOfficerName || 'Unassigned'}</strong></span>
                        <Button onClick={() => openAssignModal(c)} variant="secondary" className="text-xs py-1.5">
                          Assign Officer
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OFFICERS & PERFORMANCE VIEW */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-lg space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Department Field Officers Leaderboard ({currentDeptName})
              </h3>
              <div className="space-y-3 text-xs">
                {deptOfficers.map((off) => (
                  <div key={off.user_id || off.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={off.name} size="sm" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{off.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{off.user_id || off.id} • Duty State: <strong className={off.on_duty ? 'text-emerald-600' : 'text-slate-400'}>{off.on_duty ? 'ON DUTY' : 'OFF DUTY'}</strong></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                        <span className="font-extrabold text-amber-500 text-sm flex items-center gap-0.5">
                          <Star size={12} fill="currentColor" /> {off.rating || 4.8}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Completed</span>
                        <span className="font-extrabold text-slate-900 text-sm">{off.completedTasks || 12}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${off.on_duty ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'}`}>
                          {off.on_duty ? 'Active Duty' : 'Off Duty'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModalOpen && selectedComplaint && (
        <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={`Assign Officer — #${selectedComplaint.complaint_id || selectedComplaint.id}`}>
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Department Officer</label>
              <select
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold bg-white"
                required
              >
                <option value="">-- Select Officer --</option>
                {deptOfficers.map(o => (
                  <option key={o.user_id || o.id} value={o.user_id || o.id}>
                    {o.name} ({o.on_duty ? '🟢 On Duty' : '🔴 Off Duty'})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full py-2.5">
              Confirm Assignment
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
