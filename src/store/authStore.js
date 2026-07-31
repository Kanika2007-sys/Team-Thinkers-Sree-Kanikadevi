/**
 * Auth store — manages Firebase & Authentication, user profile, and department scoping.
 */
import { create } from 'zustand';
import api from '../lib/api';

export const DEPT_MAP = {
  1: { id: 1, deptId: 'DEPT-1', name: 'Electricity Department', zone: 'Zone 4 - East', icon: '⚡' },
  2: { id: 2, deptId: 'DEPT-2', name: 'Water Supply & Sewerage Board', zone: 'Zone 4 - Central', icon: '💧' },
  3: { id: 3, deptId: 'DEPT-3', name: 'Roads & Infrastructure', zone: 'Zone 4 - North', icon: '🛣️' },
  4: { id: 4, deptId: 'DEPT-4', name: 'Solid Waste Management', zone: 'Zone 4 - South', icon: '🗑️' },
  5: { id: 5, deptId: 'DEPT-5', name: 'Public Health & Sanitation', zone: 'Zone 4 - West', icon: '🏥' },
  'DEPT-1': { id: 1, deptId: 'DEPT-1', name: 'Electricity Department', zone: 'Zone 4 - East', icon: '⚡' },
  'DEPT-2': { id: 2, deptId: 'DEPT-2', name: 'Water Supply & Sewerage Board', zone: 'Zone 4 - Central', icon: '💧' },
  'DEPT-3': { id: 3, deptId: 'DEPT-3', name: 'Roads & Infrastructure', zone: 'Zone 4 - North', icon: '🛣️' },
  'DEPT-4': { id: 4, deptId: 'DEPT-4', name: 'Solid Waste Management', zone: 'Zone 4 - South', icon: '🗑️' },
  'DEPT-5': { id: 5, deptId: 'DEPT-5', name: 'Public Health & Sanitation', zone: 'Zone 4 - West', icon: '🏥' }
};

export function getDepartmentInfo(departmentId) {
  if (!departmentId) return DEPT_MAP['DEPT-1'];

  if (DEPT_MAP[departmentId]) return DEPT_MAP[departmentId];

  const str = String(departmentId).toLowerCase().trim();
  if (str.includes('water') || str.includes('sewerage') || str === 'dept-2' || str === '2') {
    return DEPT_MAP['DEPT-2'];
  }
  if (str.includes('road') || str.includes('infra') || str === 'dept-3' || str === '3') {
    return DEPT_MAP['DEPT-3'];
  }
  if (str.includes('waste') || str.includes('garbage') || str === 'dept-4' || str === '4') {
    return DEPT_MAP['DEPT-4'];
  }
  if (str.includes('health') || str.includes('sanitation') || str === 'dept-5' || str === '5') {
    return DEPT_MAP['DEPT-5'];
  }
  if (str.includes('electric') || str.includes('power') || str === 'dept-1' || str === '1') {
    return DEPT_MAP['DEPT-1'];
  }

  const numId = str.replace(/[^0-9]/g, '');
  if (numId && DEPT_MAP[numId]) return DEPT_MAP[numId];

  return DEPT_MAP['DEPT-1'];
}

const getSavedRegisteredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('civicos_registered_users') || '{}');
  } catch {
    return {};
  }
};

export function formatNameFromEmail(email = '') {
  const em = email.toLowerCase().trim();
  if (em.includes('org_admin') || em.includes('admin')) return 'Dr. Marcus Vance (Admin)';
  if (em.includes('department_head') || em.includes('dept')) return 'Ramesh Sharma (Dept Head)';
  if (em.includes('kumar')) return 'Officer Kumar';
  if (em.includes('suresh')) return 'Officer Suresh';
  if (em.includes('rajesh')) return 'Officer Rajesh V.';
  if (em.includes('ananya')) return 'Officer Ananya S.';
  if (em.includes('priya') || em.includes('citizen')) return 'Priya Sharma (Citizen)';

  const uname = em.split('@')[0] || 'User';
  return uname
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('civicos_token') || 'demo_token_valid',
  user: JSON.parse(localStorage.getItem('civicos_user') || JSON.stringify({
    id: 101,
    name: 'Priya Sharma',
    email: 'citizen@demo.com',
    role: { name: 'citizen' },
    department_id: '',
    department: 'Citizen',
    zone: 'Zone 4 - East'
  })),
  permissions: JSON.parse(localStorage.getItem('civicos_permissions') || '["all"]'),
  loading: false,
  error: null,

  // Allow officer to switch department directly
  updateUserDepartment: (deptIdOrName) => {
    const deptInfo = getDepartmentInfo(deptIdOrName);
    const currentUser = get().user || {};
    const updatedUser = {
      ...currentUser,
      department_id: deptInfo.deptId,
      department: deptInfo.name,
      departmentName: deptInfo.name,
      zone: deptInfo.zone
    };

    localStorage.setItem('civicos_user', JSON.stringify(updatedUser));

    if (currentUser.email) {
      const saved = getSavedRegisteredUsers();
      saved[currentUser.email.toLowerCase().trim()] = updatedUser;
      localStorage.setItem('civicos_registered_users', JSON.stringify(saved));
    }

    set({ user: updatedUser });
  },

  registerUser: async ({ name, email, password, departmentId, role = 'officer' }) => {
    set({ loading: true, error: null });

    const deptInfo = getDepartmentInfo(departmentId);
    const newUserObj = {
      id: Math.floor(10000 + Math.random() * 90000),
      name: name || formatNameFromEmail(email),
      email: email.toLowerCase().trim(),
      role: { name: role },
      department_id: deptInfo.deptId,
      department: deptInfo.name,
      departmentName: deptInfo.name,
      zone: deptInfo.zone
    };

    const saved = getSavedRegisteredUsers();
    saved[email.toLowerCase().trim()] = newUserObj;
    localStorage.setItem('civicos_registered_users', JSON.stringify(saved));

    try {
      const { xanoService } = await import('../services/xanoService');
      await xanoService.createUser({
        user_id: `USR-OFF-${newUserObj.id}`,
        name: newUserObj.name,
        email: newUserObj.email,
        role: role,
        department_id: deptInfo.deptId,
        department_name: deptInfo.name,
        phone: '+91 98765 00000',
        on_duty: true
      });
    } catch (e) {
      console.error('Xano user creation error', e);
    }

    const mockToken = `firebase_token_${Date.now()}`;
    localStorage.setItem('civicos_token', mockToken);
    localStorage.setItem('civicos_user', JSON.stringify(newUserObj));
    localStorage.setItem('civicos_permissions', JSON.stringify(['all']));

    set({
      token: mockToken,
      user: newUserObj,
      permissions: ['all'],
      loading: false,
      error: null,
    });

    return newUserObj;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });

    const cleanEmail = email?.toLowerCase().trim();
    const savedUsers = getSavedRegisteredUsers();

    if (savedUsers[cleanEmail]) {
      const registeredUser = savedUsers[cleanEmail];
      const mockToken = `token_${Date.now()}`;
      localStorage.setItem('civicos_token', mockToken);
      localStorage.setItem('civicos_user', JSON.stringify(registeredUser));
      localStorage.setItem('civicos_permissions', JSON.stringify(['all']));
      set({
        token: mockToken,
        user: registeredUser,
        permissions: ['all'],
        loading: false,
        error: null,
      });
      return { access_token: mockToken, user: registeredUser };
    }

    let defaultDeptId = 'DEPT-1';
    if (cleanEmail.includes('water') || cleanEmail.includes('sewer')) defaultDeptId = 'DEPT-2';
    else if (cleanEmail.includes('road') || cleanEmail.includes('infra')) defaultDeptId = 'DEPT-3';
    else if (cleanEmail.includes('waste') || cleanEmail.includes('garbage')) defaultDeptId = 'DEPT-4';
    else if (cleanEmail.includes('health') || cleanEmail.includes('sanitation')) defaultDeptId = 'DEPT-5';

    const deptInfo = getDepartmentInfo(defaultDeptId);
    const formattedName = formatNameFromEmail(email);
    const roleName = cleanEmail.includes('admin') 
      ? 'org_admin' 
      : cleanEmail.includes('dept') || cleanEmail.includes('department') 
      ? 'department_head' 
      : cleanEmail.includes('citizen') 
      ? 'citizen' 
      : 'officer';

    const targetUser = {
      id: Math.floor(1000 + Math.random() * 9000),
      name: formattedName,
      email: cleanEmail,
      role: { name: roleName },
      department_id: deptInfo.deptId,
      department: deptInfo.name,
      departmentName: deptInfo.name,
      zone: deptInfo.zone
    };

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const mergedUser = { ...data.user, ...targetUser };
      localStorage.setItem('civicos_token', data.access_token);
      localStorage.setItem('civicos_user', JSON.stringify(mergedUser));
      localStorage.setItem('civicos_permissions', JSON.stringify(data.permissions || []));
      set({
        token: data.access_token,
        user: mergedUser,
        permissions: data.permissions || [],
        loading: false,
      });
      return data;
    } catch (err) {
      const mockToken = `token_${Date.now()}`;
      localStorage.setItem('civicos_token', mockToken);
      localStorage.setItem('civicos_user', JSON.stringify(targetUser));
      localStorage.setItem('civicos_permissions', JSON.stringify(['all']));

      set({
        token: mockToken,
        user: targetUser,
        permissions: ['all'],
        loading: false,
        error: null,
      });

      return { access_token: mockToken, user: targetUser, permissions: ['all'] };
    }
  },

  logout: () => {
    localStorage.removeItem('civicos_token');
    localStorage.removeItem('civicos_user');
    localStorage.removeItem('civicos_permissions');
    set({ token: null, user: null, permissions: [] });
  },

  isAuthenticated: () => !!get().token,
  getRoleName: () => get().user?.role?.name || 'officer',
}));

export default useAuthStore;
