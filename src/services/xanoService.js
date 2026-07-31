import axios from 'axios';

/**
 * Unified Database API Service (Xano / Database Persistence Engine)
 * Reads and writes from/to the persistent shared storage for:
 * - Users
 * - Complaints
 * - Departments
 * - Notifications
 * - Analytics
 * - Tracking history
 */

const STORAGE_KEYS = {
  USERS: 'civic_db_users',
  COMPLAINTS: 'civic_db_complaints',
  DEPARTMENTS: 'civic_db_departments',
  NOTIFICATIONS: 'civic_db_notifications',
  ANALYTICS: 'civic_db_analytics',
  TRACKING: 'civic_db_tracking',
};

// Default Initial Departments
export const DEFAULT_DEPARTMENTS = [
  { id: 'DEPT-1', name: 'Electricity Department', icon: '⚡', zone: 'Zone 4 - East' },
  { id: 'DEPT-2', name: 'Water Supply & Sewerage Board', icon: '💧', zone: 'Zone 4 - Central' },
  { id: 'DEPT-3', name: 'Roads & Infrastructure', icon: '🛣️', zone: 'Zone 4 - North' },
  { id: 'DEPT-4', name: 'Solid Waste Management', icon: '🗑️', zone: 'Zone 4 - South' },
  { id: 'DEPT-5', name: 'Public Health & Sanitation', icon: '🏥', zone: 'Zone 4 - West' }
];

// Helper to seed initial DB if empty
const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom window event so all open tabs / components update live
    window.dispatchEvent(new Event('civic_db_update'));
  } catch (e) {
    console.error('Storage error', e);
  }
};

// Default Initial Users (Admins, Officers across depts, Citizens)
const INITIAL_USERS = [
  {
    user_id: 'USR-ADM-001',
    name: 'Chief Admin',
    email: 'admin@civicone.gov.in',
    role: 'admin',
    department_id: '',
    phone: '+91 99999 00000',
    on_duty: true
  },
  {
    user_id: 'CIV-ELE-8942',
    name: 'Officer Kumar',
    email: 'kumar@civicone.gov.in',
    role: 'officer',
    department_id: 'DEPT-1',
    department_name: 'Electricity Department',
    phone: '+91 98765 11111',
    rating: 4.9,
    completedTasks: 18,
    on_duty: true
  },
  {
    user_id: 'CIV-WAT-7712',
    name: 'Officer Rajesh V.',
    email: 'rajesh@civicone.gov.in',
    role: 'officer',
    department_id: 'DEPT-2',
    department_name: 'Water Supply & Sewerage Board',
    phone: '+91 98765 33333',
    rating: 4.8,
    completedTasks: 16,
    on_duty: true
  },
  {
    user_id: 'CIV-ROA-5521',
    name: 'Officer Ananya S.',
    email: 'ananya@civicone.gov.in',
    role: 'officer',
    department_id: 'DEPT-3',
    department_name: 'Roads & Infrastructure',
    phone: '+91 98765 44444',
    rating: 4.9,
    completedTasks: 15,
    on_duty: true
  }
];

// Initial Standard Complaints
const INITIAL_COMPLAINTS = [
  {
    complaint_id: 'CMP-2026-891',
    citizen_id: 'USR-CIT-101',
    citizen_name: 'Priya Sharma',
    citizen_phone: '+91 98765 43210',
    department_id: 'DEPT-1',
    department_name: 'Electricity Department',
    officer_id: 'CIV-ELE-8942',
    officer_name: 'Officer Kumar',
    priority: 'critical',
    vulnerability_score: 96,
    status: 'Officer Travelling',
    latitude: '13.0850',
    longitude: '80.2101',
    location: '7th Main Road, Anna Nagar, Chennai',
    category: 'Transformer Overload Outage',
    description: 'Transformer sparking with loud buzz on 7th Main Road near school. Over 400 households affected.',
    image_url: 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&q=80&w=600',
    proof_image_url: '',
    timeline: [
      { step: 'submitted', title: 'Complaint Submitted', timestamp: '10:42 AM', note: 'Citizen logged issue via mobile app' },
      { step: 'received', title: 'Complaint Received', timestamp: '10:43 AM', note: 'AI System categorized & assigned priority' },
      { step: 'department_assigned', title: 'Department Assigned', timestamp: '10:43 AM', note: 'Routed to Electricity Department' },
      { step: 'officer_assigned', title: 'Officer Assigned', timestamp: '10:44 AM', note: 'Officer Kumar assigned to dispatch' },
      { step: 'officer_travelling', title: 'Officer Travelling', timestamp: '10:45 AM', note: 'Officer en route (28 km/h)' }
    ],
    created_at: new Date().toISOString()
  },
  {
    complaint_id: 'CMP-2026-892',
    citizen_id: 'USR-CIT-102',
    citizen_name: 'Rajesh Kumar',
    citizen_phone: '+91 98123 76543',
    department_id: 'DEPT-2',
    department_name: 'Water Supply & Sewerage Board',
    officer_id: 'CIV-WAT-7712',
    officer_name: 'Officer Rajesh V.',
    priority: 'high',
    vulnerability_score: 89,
    status: 'Complaint Received',
    latitude: '13.0418',
    longitude: '80.2341',
    location: 'GN Chetty Road, T. Nagar, Chennai',
    category: 'Main Water Line Burst',
    description: 'Water gushing out from broken underground main line, flooding pedestrian walk.',
    image_url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&q=80&w=600',
    proof_image_url: '',
    timeline: [
      { step: 'submitted', title: 'Complaint Submitted', timestamp: '10:45 AM', note: 'Citizen logged issue' },
      { step: 'received', title: 'Complaint Received', timestamp: '10:46 AM', note: 'Verified by central dispatch' }
    ],
    created_at: new Date().toISOString()
  }
];

export const xanoService = {
  // USERS TABLE API
  async getUsers() {
    return getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  async createUser(userData) {
    const users = await this.getUsers();
    const newUser = {
      user_id: userData.user_id || `USR-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'citizen',
      department_id: userData.department_id || '',
      department_name: userData.department_name || '',
      phone: userData.phone || '',
      on_duty: userData.on_duty !== undefined ? userData.on_duty : true,
      rating: 4.8,
      completedTasks: 0,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async updateUserDutyState(userId, onDuty) {
    const users = await this.getUsers();
    const updated = users.map(u => (u.user_id === userId || u.email === userId || u.name === userId) ? { ...u, on_duty: onDuty } : u);
    setStored(STORAGE_KEYS.USERS, updated);
    return updated;
  },

  // COMPLAINTS TABLE API
  async getComplaints(filters = {}) {
    let complaints = getStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    if (filters.department_id) {
      complaints = complaints.filter(c => String(c.department_id) === String(filters.department_id));
    }
    if (filters.status) {
      complaints = complaints.filter(c => c.status === filters.status);
    }
    if (filters.priority) {
      complaints = complaints.filter(c => c.priority === filters.priority);
    }
    if (filters.citizen_id) {
      complaints = complaints.filter(c => c.citizen_id === filters.citizen_id);
    }
    return complaints;
  },

  async getOnDutyOfficerComplaints(departmentId) {
    const users = await this.getUsers();
    const deptOfficers = users.filter(u => u.role === 'officer' && String(u.department_id) === String(departmentId));
    const onDutyOfficerIds = deptOfficers.filter(u => u.on_duty).map(u => u.user_id);
    
    const complaints = await this.getComplaints();
    return complaints.filter(c => 
      String(c.department_id) === String(departmentId) && 
      (!c.officer_id || onDutyOfficerIds.includes(c.officer_id))
    );
  },

  async createComplaint(complaintData) {
    const complaints = getStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    const complaintId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaint = {
      complaint_id: complaintId,
      citizen_id: complaintData.citizen_id || 'USR-CIT-101',
      citizen_name: complaintData.citizen_name || 'Verified Citizen',
      citizen_phone: complaintData.citizen_phone || '+91 98765 00000',
      department_id: String(complaintData.department_id || 'DEPT-1'),
      department_name: complaintData.department_name || 'Electricity Department',
      officer_id: complaintData.officer_id || '',
      officer_name: complaintData.officer_name || 'Unassigned',
      priority: complaintData.priority || 'high',
      vulnerability_score: complaintData.vulnerability_score || 85,
      status: 'Submitted',
      latitude: String(complaintData.latitude || '13.0850'),
      longitude: String(complaintData.longitude || '80.2101'),
      location: complaintData.location || 'Chennai Central',
      category: complaintData.category || 'General Civic Hazard',
      description: complaintData.description || '',
      image_url: complaintData.image_url || '',
      proof_image_url: '',
      timeline: [
        {
          step: 'submitted',
          title: 'Complaint Submitted',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'Geotag photo & location captured by citizen'
        },
        {
          step: 'received',
          title: 'Complaint Received',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: 'AI Categorized & Department assigned'
        }
      ],
      created_at: new Date().toISOString()
    };

    complaints.unshift(newComplaint);
    setStored(STORAGE_KEYS.COMPLAINTS, complaints);

    // Generate Notification for Admin & Department Officers
    await this.createNotification({
      user_id: 'ALL_OFFICERS',
      department_id: newComplaint.department_id,
      title: `New Dispatch: ${newComplaint.complaint_id}`,
      message: `${newComplaint.category} reported at ${newComplaint.location}`
    });

    return newComplaint;
  },

  async updateComplaintStatus(complaintId, newStatus, extraData = {}) {
    const complaints = getStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    const updated = complaints.map(c => {
      if (c.complaint_id === complaintId || c.id === complaintId) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const stepKey = newStatus.toLowerCase().replace(/\s+/g, '_');
        
        const newTimelineStep = {
          step: stepKey,
          title: newStatus,
          timestamp: nowTime,
          note: extraData.note || `Status updated to ${newStatus}`
        };

        const existingTimeline = c.timeline || [];
        const hasStep = existingTimeline.some(t => t.title === newStatus);

        return {
          ...c,
          status: newStatus,
          officer_id: extraData.officer_id || c.officer_id,
          officer_name: extraData.officer_name || c.officer_name,
          proof_image_url: extraData.proof_image_url || c.proof_image_url,
          timeline: hasStep ? existingTimeline : [...existingTimeline, newTimelineStep]
        };
      }
      return c;
    });

    setStored(STORAGE_KEYS.COMPLAINTS, updated);

    // Log Tracking History
    await this.addTrackingHistory({
      complaint_id: complaintId,
      status: newStatus,
      note: extraData.note || `Workflow transitioned to ${newStatus}`,
      updated_by: extraData.officer_name || 'System'
    });

    return updated.find(c => c.complaint_id === complaintId || c.id === complaintId);
  },

  async assignDepartmentAndOfficer(complaintId, departmentId, departmentName, officerId = '', officerName = '') {
    const complaints = getStored(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    const updated = complaints.map(c => {
      if (c.complaint_id === complaintId || c.id === complaintId) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timeline = c.timeline || [];
        timeline.push({
          step: 'department_assigned',
          title: 'Department Assigned',
          timestamp: nowTime,
          note: `Assigned to ${departmentName} ${officerName ? `(Officer: ${officerName})` : ''}`
        });

        return {
          ...c,
          department_id: String(departmentId),
          department_name: departmentName,
          officer_id: officerId || c.officer_id,
          officer_name: officerName || c.officer_name,
          status: officerId ? 'Officer Assigned' : 'Department Assigned',
          timeline
        };
      }
      return c;
    });
    setStored(STORAGE_KEYS.COMPLAINTS, updated);
  },

  // DEPARTMENTS TABLE API
  async getDepartments() {
    return getStored(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
  },

  // NOTIFICATIONS TABLE API
  async getNotifications(userId) {
    const notifications = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications.filter(n => n.user_id === userId || n.user_id === 'ALL_OFFICERS');
  },

  async createNotification(data) {
    const notifications = getStored(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif = {
      notification_id: `NTF-${Date.now()}`,
      user_id: data.user_id || 'ALL_OFFICERS',
      department_id: data.department_id || '',
      title: data.title,
      message: data.message,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  },

  // TRACKING HISTORY TABLE API
  async addTrackingHistory(entry) {
    const history = getStored(STORAGE_KEYS.TRACKING, []);
    history.push({
      history_id: `TRK-${Date.now()}`,
      complaint_id: entry.complaint_id,
      status: entry.status,
      note: entry.note,
      updated_by: entry.updated_by,
      timestamp: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.TRACKING, history);
  },

  // ANALYTICS TABLE API
  async getAnalytics() {
    const complaints = await this.getComplaints();
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Verified Resolved' || c.status === 'Issue Resolved' || c.status === 'Completed').length;
    return {
      analytics_id: 'ANL-001',
      total_complaints: total,
      resolved_complaints: resolved,
      avg_response_time_mins: 14.2,
      sla_compliance: '94.8%'
    };
  }
};

export default xanoService;
