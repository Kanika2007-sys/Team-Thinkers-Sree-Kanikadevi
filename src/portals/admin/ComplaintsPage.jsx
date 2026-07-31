import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import Avatar from '../../components/Avatar';
import useComplaintStore from '../../store/complaintStore';
import { DEFAULT_DEPARTMENTS } from '../../services/xanoService';
import { Kanban, List, SlidersHorizontal } from 'lucide-react';

export default function ComplaintsPage() {
  const { complaints = [], users = [], fetchComplaints, assignDepartmentAndOfficer } = useComplaintStore();
  const [viewMode, setViewMode] = useState('kanban');

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [assignDeptId, setAssignDeptId] = useState('DEPT-1');
  const [assignOfficerId, setAssignOfficerId] = useState('');

  useEffect(() => {
    fetchComplaints();
    const handleUpdate = () => fetchComplaints();
    window.addEventListener('civic_db_update', handleUpdate);
    return () => window.removeEventListener('civic_db_update', handleUpdate);
  }, []);

  const filteredComplaints = (complaints || []).filter((c) => {
    if (selectedDept && String(c.department_id) !== String(selectedDept)) return false;
    if (selectedStatus && c.status !== selectedStatus) return false;
    if (selectedPriority && c.priority !== selectedPriority) return false;
    return true;
  });

  const officersList = (users || []).filter(u => u.role === 'officer');

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const cid = selectedComplaint.complaint_id || selectedComplaint.id;
    const deptObj = DEFAULT_DEPARTMENTS.find(d => String(d.id) === String(assignDeptId)) || DEFAULT_DEPARTMENTS[0];
    const offObj = officersList.find(o => o.user_id === assignOfficerId || o.name === assignOfficerId);

    await assignDepartmentAndOfficer(
      cid,
      assignDeptId,
      deptObj.name,
      offObj?.user_id || '',
      offObj?.name || ''
    );

    alert(`Successfully assigned complaint #${cid} to ${deptObj.name} ${offObj ? `(Officer: ${offObj.name})` : ''}`);
    setSelectedComplaint(null);
  };

  const columns = [
    { key: 'complaint_id', label: 'ID', render: (val, row) => <span className="font-mono font-bold text-blue-600">#{val || row.id}</span> },
    { key: 'category', label: 'Service / Category', render: (val) => <span className="font-semibold text-slate-900">{val}</span> },
    { key: 'department_name', label: 'Department', render: (val) => <span className="text-slate-600">{val}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <PriorityBadge priority={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'citizen_name',
      label: 'Citizen',
      render: (val) => (
        <div className="flex items-center gap-2">
          <Avatar name={val || 'Citizen'} size="xs" />
          <span className="text-slate-700 font-medium">{val}</span>
        </div>
      ),
    },
    {
      key: 'officer_name',
      label: 'Assigned Officer',
      render: (val) =>
        val ? (
          <div className="flex items-center gap-2">
            <Avatar name={val} size="xs" />
            <span className="text-slate-800 font-medium">{val}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
    { key: 'created_at', label: 'Created At', render: (val) => new Date(val || Date.now()).toLocaleDateString() },
  ];

  return (
    <>
      <Topbar title="Global Complaints Register" subtitle="Organization-wide complaint management, stage tracking & department assignment" />

      <div className="p-6 space-y-6 font-sans">
        {/* Controls & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Filters</span>
            </div>

            {/* Department Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {DEFAULT_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Accepted">Accepted</option>
              <option value="Officer Assigned">Officer Assigned</option>
              <option value="Officer Travelling">Officer Travelling</option>
              <option value="Work in Progress">Work in Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Verified Resolved">Verified Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* View Switcher: Kanban vs List */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>

        {/* Board or Table view */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            complaints={filteredComplaints}
            onSelectComplaint={(c) => {
              setSelectedComplaint(c);
              setAssignDeptId(c.department_id || 'DEPT-1');
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredComplaints}
            onRowClick={(row) => {
              setSelectedComplaint(row);
              setAssignDeptId(row.department_id || 'DEPT-1');
            }}
          />
        )}
      </div>

      {/* Detail & Re-Assign Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Complaint #${selectedComplaint?.complaint_id || selectedComplaint?.id} Record & Assignment`}
      >
        {selectedComplaint && (
          <div className="space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedComplaint.category}</h3>
                <p className="text-xs text-slate-500">Department: {selectedComplaint.department_name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Avatar name={selectedComplaint.citizen_name || 'Citizen'} size="sm" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Citizen</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.citizen_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar name={selectedComplaint.officer_name || 'Unassigned'} size="sm" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Officer</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.officer_name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {/* Department & Officer Assignment Form */}
            <form onSubmit={handleReassign} className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Assign / Re-Route Department & Officer</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={assignDeptId}
                    onChange={(e) => setAssignDeptId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border text-xs bg-white font-semibold"
                  >
                    {DEFAULT_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Officer</label>
                  <select
                    value={assignOfficerId}
                    onChange={(e) => setAssignOfficerId(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border text-xs bg-white font-semibold"
                  >
                    <option value="">-- Auto-Assign On-Duty --</option>
                    {officersList.map(o => (
                      <option key={o.user_id} value={o.user_id}>{o.name} ({o.department_name || 'Officer'})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Confirm Department & Officer Assignment
              </button>
            </form>

            {/* Audit Timeline */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Audit Timeline</h4>
              <div className="relative pl-4 space-y-4 border-l-2 border-slate-200">
                {selectedComplaint.timeline?.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 capitalize">{h.title}</span>
                      <span className="text-[10px] text-slate-400">{h.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{h.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
