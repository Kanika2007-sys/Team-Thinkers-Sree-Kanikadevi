import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import { Building2, Plus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'Department Name',
    render: (val, row) => (
      <div className="flex items-center gap-2 font-bold text-slate-900">
        <span>{row.icon || '🏢'}</span>
        <span>{val}</span>
      </div>
    ),
  },
  {
    key: 'color',
    label: 'Accent Color',
    render: (val) =>
      val ? (
        <span className="flex items-center gap-2 font-mono text-xs text-slate-600">
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: val }} />
          {val}
        </span>
      ) : (
        '—'
      ),
  },
  { key: 'working_hours', label: 'Working Hours', render: (val) => <span className="text-slate-600 font-medium">{val || '08:00-18:00'}</span> },
  {
    key: 'escalation_time_minutes',
    label: 'Escalation Time',
    render: (val) => (val ? <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">{val} mins</span> : '120 mins'),
  },
];

export default function DepartmentsPage() {
  const { departments, fetchDepartments, createDepartment } = useOrgStore();
  const { user } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', icon: '🏢', color: '#3B82F6', description: '',
    working_hours: '08:00-18:00', escalation_time_minutes: '120',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter department name');
      return;
    }
    setSubmitting(true);
    try {
      await createDepartment({
        ...form,
        escalation_time_minutes: form.escalation_time_minutes ? parseInt(form.escalation_time_minutes) : 120,
      });
      alert(`Success! Department "${form.name}" has been created and added to database.`);
      setModalOpen(false);
      setForm({ name: '', icon: '🏢', color: '#3B82F6', description: '', working_hours: '08:00-18:00', escalation_time_minutes: '120' });
      fetchDepartments();
    } catch (err) {
      alert('Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Departments" subtitle="Manage organizational departments and escalation thresholds">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={departments} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Department">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 font-sans text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
            <input className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-blue-500 bg-white" value={form.name} onChange={updateField('name')} required placeholder="e.g. Sanitation & Solid Waste" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.color}
                onChange={updateField('color')}
                className="w-12 h-9 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <input className="flex-1 h-9 px-3 rounded-xl border border-slate-300 font-mono text-xs" value={form.color} onChange={updateField('color')} />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full h-20 p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 resize-none"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Brief department responsibilities..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Working Hours</label>
              <input className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold" value={form.working_hours} onChange={updateField('working_hours')} placeholder="08:00-18:00" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Escalation (min)</label>
              <input
                type="number"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-semibold"
                value={form.escalation_time_minutes}
                onChange={updateField('escalation_time_minutes')}
                placeholder="120"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
