import { create } from 'zustand';
import xanoService, { DEFAULT_DEPARTMENTS } from '../services/xanoService';

export { DEFAULT_DEPARTMENTS };

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

const useComplaintStore = create((set, get) => ({
  departments: DEFAULT_DEPARTMENTS,
  complaints: [],
  users: [],
  loading: false,

  // Citizen Karma Balance
  karmaPoints: 250,
  karmaRank: "#3 Gold Citizen Guardian",
  unlockedBadges: [
    { title: "⚡ Grid Vigilant", desc: "Reported 3 electrical hazards" },
    { title: "💧 Water Hero", desc: "Verified water leakage fix" },
    { title: "✅ Resolution Champion", desc: "Verified 5 completed repairs" }
  ],
  availableVouchers: [
    { id: "VCH-101", title: "$15 Water Bill Rebate", pointsCost: 100, code: "REBATE-WATER-15" },
    { id: "VCH-102", title: "10% Property Tax Discount", pointsCost: 200, code: "TAX-DISC-10" },
    { id: "VCH-103", title: "Free Monthly Metro Pass", pointsCost: 150, code: "METRO-FREE-PASS" }
  ],

  // Load Complaints from Xano Shared Database
  fetchComplaints: async (filters = {}) => {
    set({ loading: true });
    try {
      const data = await xanoService.getComplaints(filters);
      const usersData = await xanoService.getUsers();
      set({ complaints: data, users: usersData, loading: false });
    } catch (e) {
      console.error('Fetch complaints error', e);
      set({ loading: false });
    }
  },

  // Toggle Officer Duty State (On Duty / Off Duty)
  toggleOfficerDutyState: async (userId, newDutyState) => {
    await xanoService.updateUserDutyState(userId, newDutyState);
    await get().fetchComplaints();
  },

  // Add New Citizen Complaint -> Xano DB
  addComplaint: async (complaintData) => {
    const created = await xanoService.createComplaint(complaintData);
    await get().fetchComplaints();
    set(state => ({ karmaPoints: state.karmaPoints + 20 }));
    return created;
  },

  // Officer Update Status -> Xano DB
  updateComplaintStatus: async (complaintId, newStatus, extra = {}) => {
    const updated = await xanoService.updateComplaintStatus(complaintId, newStatus, extra);
    await get().fetchComplaints();
    return updated;
  },

  // Admin Assign Department & Officer -> Xano DB
  assignDepartmentAndOfficer: async (complaintId, deptId, deptName, officerId = '', officerName = '') => {
    await xanoService.assignDepartmentAndOfficer(complaintId, deptId, deptName, officerId, officerName);
    await get().fetchComplaints();
  },

  // Citizen Resolution Verification -> Xano DB
  verifyComplaintByCitizen: async (complaintId, isSatisfied) => {
    const status = isSatisfied ? 'Verified Resolved' : 'Officer Re-Dispatched';
    await xanoService.updateComplaintStatus(complaintId, status, {
      note: isSatisfied ? 'Citizen verified resolution satisfied' : 'Citizen marked issue still broken'
    });
    await get().fetchComplaints();
    if (isSatisfied) {
      set(state => ({ karmaPoints: state.karmaPoints + 50 }));
    }
  }
}));

// Initialize sync listener for cross-portal window updates
if (typeof window !== 'undefined') {
  window.addEventListener('civic_db_update', () => {
    useComplaintStore.getState().fetchComplaints();
  });
  // Initial fetch
  useComplaintStore.getState().fetchComplaints();
}

export default useComplaintStore;
