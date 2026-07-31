import { create } from 'zustand';
import xanoService, { DEFAULT_DEPARTMENTS } from '../services/xanoService';

const useOrgStore = create((set, get) => ({
  organizations: [{ id: 'ORG-1', name: 'Chennai Municipal Corporation', city: 'Chennai', state: 'Tamil Nadu' }],
  departments: DEFAULT_DEPARTMENTS,
  services: [
    { id: 'SRV-101', name: 'Transformer & High Voltage Outage', department_id: 'DEPT-1' },
    { id: 'SRV-201', name: 'Main Water Line Burst & Leakage', department_id: 'DEPT-2' },
    { id: 'SRV-301', name: 'Dangerous Pothole & Road Hazard', department_id: 'DEPT-3' },
    { id: 'SRV-401', name: 'Garbage Accumulation Spill', department_id: 'DEPT-4' },
    { id: 'SRV-501', name: 'Stagnant Water Mosquito Risk', department_id: 'DEPT-5' }
  ],
  locations: [{ id: 'LOC-1', name: 'Zone 4 - East Anna Nagar', zone: 'Zone 4' }],
  users: [],
  roles: [{ id: 'ROLE-1', name: 'admin' }, { id: 'ROLE-2', name: 'officer' }, { id: 'ROLE-3', name: 'citizen' }],
  loading: false,

  fetchOrganizations: async () => {
    set({ loading: false });
  },

  fetchDepartments: async () => {
    set({ loading: true });
    try {
      const depts = await xanoService.getDepartments();
      set({ departments: depts, loading: false });
    } catch {
      set({ departments: DEFAULT_DEPARTMENTS, loading: false });
    }
  },

  createDepartment: async (deptData) => {
    const currentDepts = get().departments;
    const newDept = {
      id: `DEPT-${Date.now()}`,
      name: deptData.name,
      icon: deptData.icon || '🏢',
      color: deptData.color || '#3B82F6',
      zone: deptData.zone || 'Zone 4 - Central',
      working_hours: deptData.working_hours || '08:00-18:00',
      escalation_time_minutes: deptData.escalation_time_minutes || 120
    };
    const updated = [...currentDepts, newDept];
    set({ departments: updated });

    // Save to xanoService localStorage
    try {
      localStorage.setItem('civic_db_departments', JSON.stringify(updated));
      window.dispatchEvent(new Event('civic_db_update'));
    } catch (e) {}

    return newDept;
  },

  fetchServices: async () => {
    set({ loading: false });
  },

  fetchLocations: async () => {
    set({ loading: false });
  },

  fetchUsers: async () => {
    set({ loading: true });
    const u = await xanoService.getUsers();
    set({ users: u, loading: false });
  },

  fetchRoles: async () => {
    set({ loading: false });
  }
}));

export default useOrgStore;
