/**
 * Civic Authority Portal - Core Logic (SPA)
 */

// 1. Data Mocking & Global State
const AppState = {
  theme: localStorage.getItem('civic_theme') || 'light',
  currentRoute: 'dashboard',
  insights: [
    { type: 'warning', text: 'Water complaints increased 18% in the last 24hrs', icon: 'droplet' },
    { type: 'danger', text: 'Road issues concentrated in Ward 18', icon: 'map-pin' },
    { type: 'info', text: '7 duplicate complaints detected across 3 wards', icon: 'copy' },
    { type: 'warning', text: 'Officer S. Kumar is overloaded (12 pending)', icon: 'badge' },
    { type: 'danger', text: 'High flood risk predicted in Zone North', icon: 'cloud-rain' },
    { type: 'success', text: '2 fake reports automatically flagged and hidden', icon: 'shield-check' }
  ],
  liveFeed: [
    { time: '10:15 AM', text: 'Citizen verified resolution for #392', icon: 'check-circle' },
    { time: '10:11 AM', text: 'Officer accepted assignment for #412', icon: 'user-check' },
    { time: '10:07 AM', text: 'Emergency reported: Power line down on 4th Ave', icon: 'zap' },
    { time: '10:03 AM', text: 'Road complaint escalated to High Priority', icon: 'arrow-up-right' },
    { time: '10:01 AM', text: 'Complaint #412 Assigned to Dept: Roads', icon: 'briefcase' }
  ],
  complaints: [
    { id: 'CMP-4102', citizen: 'Rajesh K.', phone: '+91 9876543210', dept: 'Water', category: 'Pipe Leak', ward: '18', priority: 'High', status: 'Pending', labels: ['VIP Area', 'Water Incident'], date: '2026-07-30', trust: 92, coords: '12.9716, 77.5946' },
    { id: 'CMP-4101', citizen: 'Aarti M.', phone: '+91 8765432109', dept: 'Roads', category: 'Pothole', ward: '12', priority: 'Medium', status: 'Assigned', labels: ['Requires Inspection'], date: '2026-07-29', trust: 88, coords: '12.9611, 77.5872' },
    { id: 'CMP-4100', citizen: 'Anil D.', phone: '+91 7654321098', dept: 'Emergency', category: 'Flood Risk', ward: '18', priority: 'Critical', status: 'Escalated', labels: ['Emergency', 'AI Flagged'], date: '2026-07-29', trust: 95, coords: '12.9783, 77.5891' },
    { id: 'CMP-4099', citizen: 'System AI', phone: 'N/A', dept: 'Sanitation', category: 'Garbage Dump', ward: '04', priority: 'Low', status: 'Resolved', labels: ['Auto-Detected'], date: '2026-07-28', trust: 100, coords: '12.9345, 77.6101' },
    { id: 'CMP-4098', citizen: 'Vijay P.', phone: '+91 6543210987', dept: 'Electricity', category: 'Streetlight', ward: '18', priority: 'Medium', status: 'Pending', labels: ['Duplicate'], date: '2026-07-28', trust: 45, coords: '12.9719, 77.5950' },
    { id: 'CMP-4097', citizen: 'Sneha R.', phone: '+91 5432109876', dept: 'Roads', category: 'Traffic Signal', ward: '02', priority: 'Critical', status: 'InProgress', labels: ['VIP Area'], date: '2026-07-27', trust: 78, coords: '12.9810, 77.5900' }
  ],
  officers: [
    { name: 'S. Kumar', dept: 'Water', pending: 12, completed: 42, rating: 4.8, availability: 'Overloaded', route: 'Ward 18 -> Zone C' },
    { name: 'P. Sharma', dept: 'Roads', pending: 3, completed: 89, rating: 4.9, availability: 'Available', route: 'Patrol: Zone A' },
    { name: 'R. Singh', dept: 'Emergency', pending: 1, completed: 156, rating: 5.0, availability: 'On Route', route: 'Emergency Dispatch' },
    { name: 'M. Patel', dept: 'Sanitation', pending: 5, completed: 34, rating: 4.2, availability: 'Available', route: 'Ward 4 -> Dump Yard' }
  ],
  departments: []
};

// 1b. Extended state for new features (kept separate so the original AppState above is untouched)
const ComplaintFilterState = {
  dept: 'All', priority: 'All', status: 'All', search: '', sort: 'newest'
};

const SelectedComplaints = new Set();

// Rich per-complaint detail data, keyed by complaint id. Falls back to sensible
// defaults for any complaint id not explicitly listed here.
const ComplaintDetails = {
  'CMP-4102': {
    previousReports: 4, verified: true, street: '14th Cross, Anna Nagar', nearby: 3,
    ai: { confidence: 96, detectedObject: 'Water Pipe / Leakage', detectedCategory: 'Water - Pipe Leak', severity: 78, fraud: 3, duplicate: 8, suggestedDept: 'Water & Supply', suggestedOfficer: 'S. Kumar', eta: '3.5h' },
    evidence: { images: 3, video: true, voice: false },
    history: [
      { stage: 'Complaint Created', time: '2026-07-30 08:12', by: 'Citizen App' },
      { stage: 'AI Analysis Completed', time: '2026-07-30 08:13', by: 'Nexus AI' },
      { stage: 'Assigned to Water Dept', time: '2026-07-30 08:20', by: 'System' },
      { stage: 'Accepted by Officer', time: '2026-07-30 09:02', by: 'S. Kumar' }
    ]
  },
  'CMP-4101': {
    previousReports: 1, verified: true, street: 'MG Road, Ward 12', nearby: 1,
    ai: { confidence: 91, detectedObject: 'Road Surface Damage', detectedCategory: 'Roads - Pothole', severity: 52, fraud: 2, duplicate: 4, suggestedDept: 'Roads & Infra', suggestedOfficer: 'P. Sharma', eta: '1.2d' },
    evidence: { images: 2, video: false, voice: false },
    history: [
      { stage: 'Complaint Created', time: '2026-07-29 11:40', by: 'Citizen App' },
      { stage: 'AI Analysis Completed', time: '2026-07-29 11:41', by: 'Nexus AI' },
      { stage: 'Assigned to Roads Dept', time: '2026-07-29 12:05', by: 'System' }
    ]
  },
  'CMP-4100': {
    previousReports: 0, verified: true, street: 'Lakeside Ward 18', nearby: 6,
    ai: { confidence: 98, detectedObject: 'Rising Water Level', detectedCategory: 'Emergency - Flood Risk', severity: 94, fraud: 1, duplicate: 12, suggestedDept: 'Emergency', suggestedOfficer: 'R. Singh', eta: '25m' },
    evidence: { images: 5, video: true, voice: true },
    history: [
      { stage: 'Complaint Created', time: '2026-07-29 06:02', by: 'Citizen App' },
      { stage: 'AI Analysis Completed', time: '2026-07-29 06:03', by: 'Nexus AI' },
      { stage: 'Auto-Escalated (High Severity)', time: '2026-07-29 06:04', by: 'Nexus AI' },
      { stage: 'Emergency Dispatch Assigned', time: '2026-07-29 06:10', by: 'R. Singh' }
    ]
  },
  'CMP-4099': {
    previousReports: 0, verified: true, street: 'Dump Yard Rd, Ward 04', nearby: 0,
    ai: { confidence: 99, detectedObject: 'Garbage Pile', detectedCategory: 'Sanitation - Garbage Dump', severity: 34, fraud: 0, duplicate: 0, suggestedDept: 'Sanitation', suggestedOfficer: 'M. Patel', eta: '4h' },
    evidence: { images: 1, video: false, voice: false },
    history: [
      { stage: 'Complaint Created (Auto-Detected)', time: '2026-07-28 07:00', by: 'Nexus AI' },
      { stage: 'Assigned to Sanitation Dept', time: '2026-07-28 07:05', by: 'System' },
      { stage: 'Completed', time: '2026-07-28 15:20', by: 'M. Patel' },
      { stage: 'Citizen Verified', time: '2026-07-28 18:44', by: 'System' }
    ]
  },
  'CMP-4098': {
    previousReports: 5, verified: false, street: '4th Ave, Ward 18', nearby: 2,
    ai: { confidence: 74, detectedObject: 'Streetlight Pole (Duplicate Match)', detectedCategory: 'Electricity - Streetlight', severity: 28, fraud: 12, duplicate: 82, suggestedDept: 'Electricity', suggestedOfficer: 'Unassigned', eta: '2d' },
    evidence: { images: 1, video: false, voice: false },
    history: [
      { stage: 'Complaint Created', time: '2026-07-28 09:15', by: 'Citizen App' },
      { stage: 'AI Analysis Completed', time: '2026-07-28 09:16', by: 'Nexus AI' },
      { stage: 'Flagged as Duplicate', time: '2026-07-28 09:16', by: 'Nexus AI' }
    ]
  },
  'CMP-4097': {
    previousReports: 2, verified: true, street: 'Main Highway Ex 4, Ward 02', nearby: 4,
    ai: { confidence: 93, detectedObject: 'Traffic Signal Malfunction', detectedCategory: 'Roads - Traffic Signal', severity: 71, fraud: 2, duplicate: 6, suggestedDept: 'Roads & Infra', suggestedOfficer: 'P. Sharma', eta: '45m' },
    evidence: { images: 2, video: true, voice: false },
    history: [
      { stage: 'Complaint Created', time: '2026-07-27 16:20', by: 'Citizen App' },
      { stage: 'AI Analysis Completed', time: '2026-07-27 16:21', by: 'Nexus AI' },
      { stage: 'Escalated (VIP Area)', time: '2026-07-27 16:30', by: 'System' },
      { stage: 'In Progress', time: '2026-07-27 17:10', by: 'P. Sharma' }
    ]
  }
};

function getComplaintDetail(c) {
  return ComplaintDetails[c.id] || {
    previousReports: 0, verified: c.trust >= 70, street: `Ward ${c.ward} Main Road`, nearby: 0,
    ai: { confidence: c.trust, detectedObject: c.category, detectedCategory: `${c.dept} - ${c.category}`, severity: c.priority === 'Critical' ? 90 : c.priority === 'High' ? 65 : c.priority === 'Medium' ? 40 : 15, fraud: 100 - c.trust, duplicate: 5, suggestedDept: c.dept, suggestedOfficer: 'Unassigned', eta: '—' },
    evidence: { images: 1, video: false, voice: false },
    history: [{ stage: 'Complaint Created', time: c.date, by: 'Citizen App' }]
  };
}

// Notification Center state
const NotificationTypes = ['Power Shutdown', 'Water Shutdown', 'Weather Alert', 'Emergency', 'General Notice'];
AppState.notificationsSent = [
  { id: 'NTF-1042', title: 'Scheduled Water Shutdown - Ward 18', type: 'Water Shutdown', area: 'Ward 18', priority: 'High', recipients: 'Ward Residents', sentAt: '2026-07-29 07:00', reach: 8420 },
  { id: 'NTF-1041', title: 'Heavy Rain Advisory', type: 'Weather Alert', area: 'All Zones', priority: 'Medium', recipients: 'All Citizens', sentAt: '2026-07-28 18:30', reach: 124500 },
  { id: 'NTF-1040', title: 'Power Restoration Complete - Sector 9', type: 'Power Shutdown', area: 'Sector 9', priority: 'Low', recipients: 'Ward Residents', sentAt: '2026-07-27 21:15', reach: 3120 }
];

// Audit Log generation (mock, deterministic-ish)
function generateAuditLogs() {
  const actions = [
    { action: 'Admin Logged In', icon: 'log-in', sev: 'info' },
    { action: 'Complaint Assigned', icon: 'user-check', sev: 'info' },
    { action: 'Complaint Deleted', icon: 'trash-2', sev: 'danger' },
    { action: 'Officer Changed', icon: 'user-cog', sev: 'warning' },
    { action: 'Status Updated', icon: 'refresh-cw', sev: 'info' },
    { action: 'Notification Sent', icon: 'send', sev: 'info' },
    { action: 'Emergency Closed', icon: 'shield-check', sev: 'success' }
  ];
  const actors = ['Admin User', 'S. Kumar', 'P. Sharma', 'R. Singh', 'M. Patel', 'System AI'];
  const targets = ['CMP-4102', 'CMP-4101', 'CMP-4100', 'CMP-4099', 'CMP-4098', 'CMP-4097', 'NTF-1042', 'Ward 18'];
  const logs = [];
  let hour = 11, minute = 58;
  for (let i = 0; i < 32; i++) {
    const a = actions[i % actions.length];
    minute -= 7;
    if (minute < 0) { minute += 60; hour -= 1; }
    if (hour < 0) hour = 23;
    logs.push({
      id: `LOG-${9000 - i}`,
      action: a.action, icon: a.icon, sev: a.sev,
      actor: actors[i % actors.length],
      target: targets[i % targets.length],
      time: `2026-07-${30 - Math.floor(i / 10)} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      ip: `10.0.${i % 8}.${(i * 7) % 255}`
    });
  }
  return logs;
}
const AuditLogState = { all: generateAuditLogs(), search: '', action: 'All' };

// Chart.js instances tracker so re-navigating to Analytics doesn't throw "canvas in use" errors
const ChartInstances = {};

// 2. Navigation & Router
const Router = {
  routes: {
    'dashboard': renderDashboard,
    'ai-command': renderAICommand,
    'emergency': renderEmergency,
    'city-map': renderCityMap,
    'complaints': renderComplaints,
    'officers': renderOfficers,
    'departments': renderDepartments,
    'citizens': renderCitizens,
    'notifications': renderNotifications,
    'analytics': renderAnalytics,
    'reports': renderReports,
    'audit': renderAudit,
    'monitor': renderMonitor,
    'settings': renderSettings
  },

  navigate(route) {
    if (!this.routes[route]) return;
    AppState.currentRoute = route;

    // Update Sidebar UI
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.nav-item[data-route="${route}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      document.getElementById('page-title').innerText = activeItem.innerText.trim();
    }

    // Render View
    const container = document.getElementById('view-container');
    container.innerHTML = `<div class="fade-in">${this.routes[route]()}</div>`;

    // Re-init lucide icons for newly injected HTML
    if (window.lucide) lucide.createIcons();

    // Post-render hooks for views that need canvas charts or extra wiring
    if (route === 'analytics' && typeof initAnalyticsCharts === 'function') initAnalyticsCharts();
  }
};

// 3. UI Interactions & Event Listeners
function setupEvents() {
  // Navigation Clicks
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      Router.navigate(el.dataset.route);
    });
  });

  // Dark Mode Toggle
  const themeToggle = document.getElementById('theme-toggle');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    if (window.lucide) lucide.createIcons();
    localStorage.setItem('civic_theme', theme);
  };

  applyTheme(AppState.theme);

  themeToggle.addEventListener('click', () => {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    applyTheme(AppState.theme);
  });

  // Floating Action Button Toggle
  const fabToggle = document.getElementById('fab-toggle');
  const quickActions = document.getElementById('quick-actions');
  fabToggle.addEventListener('click', () => {
    quickActions.classList.toggle('open');
  });

  // New: keyboard shortcuts — Ctrl/Cmd+K focuses global search, Escape closes any drawer/modal
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.topbar .search-container input');
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') closeAllOverlays();
  });
}

// 3b. Shared UI helpers: Toasts, Drawer, Modal (new; additive, doesn't touch existing UI)
function showToast(message, type = 'info', icon = null) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const iconMap = { success: 'check-circle', danger: 'alert-triangle', info: 'info', warning: 'alert-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i data-lucide="${icon || iconMap[type] || 'info'}" style="width:18px;height:18px;color:var(--${type === 'info' ? 'brand' : type});flex:none;"></i><span>${message}</span>`;
  stack.appendChild(el);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 250);
  }, 3200);
}

function closeAllOverlays() {
  const backdrop = document.getElementById('overlay-backdrop');
  const drawer = document.getElementById('drawer-panel');
  const modal = document.getElementById('modal-box');
  if (backdrop) backdrop.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
  if (modal) modal.classList.remove('open');
}

function openDrawer(html) {
  const backdrop = document.getElementById('overlay-backdrop');
  const drawer = document.getElementById('drawer-panel');
  drawer.innerHTML = html;
  backdrop.classList.add('open');
  drawer.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function openModal(html) {
  const backdrop = document.getElementById('overlay-backdrop');
  const modal = document.getElementById('modal-box');
  modal.innerHTML = html;
  backdrop.classList.add('open');
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function switchTab(groupId, tabName, btnEl) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  group.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btnEl.classList.add('active');
  const pane = group.querySelector(`.tab-pane[data-tab="${tabName}"]`);
  if (pane) pane.classList.add('active');
}

// 4. View Renderers
function renderDashboard() {
  return `
    <div class="grid-cols-4" style="margin-bottom: 32px;">
      <div class="glass-card">
        <div class="flex-between" style="margin-bottom:16px;">
          <h4 style="color:var(--text-muted); font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Total Complaints</h4>
          <div class="icon-btn" style="width:32px;height:32px;color:var(--info);background:var(--info-bg);border:none;"><i data-lucide="file-text" style="width:16px;height:16px;"></i></div>
        </div>
        <h2 style="font-size:36px; margin-bottom:8px;">1,248</h2>
        <div class="flex-gap" style="font-size:12px;">
          <span class="badge success" style="padding:2px 6px;">+12%</span> <span class="text-muted">vs last month</span>
        </div>
      </div>
      
      <div class="glass-card">
        <div class="flex-between" style="margin-bottom:16px;">
          <h4 style="color:var(--text-muted); font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Resolved Today</h4>
          <div class="icon-btn" style="width:32px;height:32px;color:var(--success);background:var(--success-bg);border:none;"><i data-lucide="check-circle" style="width:16px;height:16px;"></i></div>
        </div>
        <h2 style="font-size:36px; margin-bottom:8px;">142</h2>
        <div class="flex-gap" style="font-size:12px;">
          <span style="color:var(--text-main); font-weight:600;">94%</span> <span class="text-muted">SLA Compliance</span>
        </div>
      </div>

      <div class="glass-card">
        <div class="flex-between" style="margin-bottom:16px;">
          <h4 style="color:var(--text-muted); font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Critical Needs</h4>
          <div class="icon-btn" style="width:32px;height:32px;color:var(--danger);background:var(--danger-bg);border:none;"><i data-lucide="alert-triangle" style="width:16px;height:16px;"></i></div>
        </div>
        <h2 style="font-size:36px; margin-bottom:8px;">8</h2>
        <div class="flex-gap" style="font-size:12px;">
          <span class="badge danger" style="padding:2px 6px;">Action Required</span>
        </div>
      </div>

      <div class="glass-card">
        <div class="flex-between" style="margin-bottom:16px;">
          <h4 style="color:var(--text-muted); font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Resolution Time</h4>
          <div class="icon-btn" style="width:32px;height:32px;color:var(--warning);background:var(--warning-bg);border:none;"><i data-lucide="clock" style="width:16px;height:16px;"></i></div>
        </div>
        <h2 style="font-size:36px; margin-bottom:8px;">4.2h</h2>
        <div class="flex-gap" style="font-size:12px;">
          <span class="badge success" style="padding:2px 6px;">-1.1h</span> <span class="text-muted">Down from 5.3h</span>
        </div>
      </div>
    </div>

    <!-- AI and Activity Grid -->
    <div class="grid-cols-2">
      
      <!-- AI Insights Card -->
      <div class="glass-card" style="padding:0;">
        <div style="padding: 24px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size: 18px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="sparkles" style="color:var(--brand);"></i> AI Insights
            </h3>
            <p style="font-size: 13px; color:var(--text-muted); margin-top:4px;">Machine learning detections from the last 24 hours.</p>
          </div>
          <span class="badge info">Real-time</span>
        </div>
        <div style="padding: 12px 24px;">
          ${AppState.insights.map(insight => `
            <div style="display:flex; align-items:center; gap:16px; padding: 12px 0; border-bottom: 1px solid var(--border);">
              <div class="icon-btn" style="width:36px; height:36px; border:none; background:var(--${insight.type}-bg); color:var(--${insight.type}); flex:none;">
                <i data-lucide="${insight.icon}" style="width:18px;height:18px;"></i>
              </div>
              <p style="font-size: 14px; font-weight: 500; line-height: 1.4;">${insight.text}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Live Activity Feed -->
      <div class="glass-card" style="padding:0;">
        <div style="padding: 24px; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size: 18px; display:flex; align-items:center; gap:8px;">
              <i data-lucide="radio" style="color:var(--danger);"></i> Live Activity
            </h3>
            <p style="font-size: 13px; color:var(--text-muted); margin-top:4px;">Real-time feed of civic operations.</p>
          </div>
          <div style="display:flex; gap:6px; align-items:center;">
            <span style="display:block; width:8px; height:8px; border-radius:50%; background:var(--danger); box-shadow:0 0 10px rgba(239, 68, 68, 0.8);"></span>
            <span style="font-size:12px; font-weight:600; color:var(--text-muted);">LIVE</span>
          </div>
        </div>
        <div style="padding: 24px; position:relative; overflow:hidden;">
          <div style="position:absolute; left:33px; top:24px; bottom:24px; width:2px; background:var(--border);"></div>
          ${AppState.liveFeed.map(feed => `
            <div style="display:flex; align-items:flex-start; gap:16px; padding-bottom: 24px; position:relative; z-index:2;">
              <div style="font-size: 12px; font-family:var(--font-mono); font-weight:600; color:var(--text-faint); width: 60px; text-align:right; flex:none; padding-top:4px;">${feed.time}</div>
              <div style="width:10px; height:10px; border-radius:50%; background:var(--brand); border: 2px solid var(--bg-card); flex:none; margin-top: 6px; margin-left: -5px; box-shadow:0 0 0 4px var(--bg-page);"></div>
              <div>
                <p style="font-size: 14px; font-weight: 500;">${feed.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Executive Summary (extended) -->
    <div class="grid-cols-4" style="margin-top:24px;">
      <div class="glass-card" style="padding:18px;">
        <div class="flex-between" style="margin-bottom:10px;">
          <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Active Emergencies</h4>
          <i data-lucide="siren" style="width:16px;height:16px;color:var(--danger);"></i>
        </div>
        <h2 style="font-size:26px;">4</h2>
        <span style="font-size:11px; color:var(--text-faint);">2 dispatched · 2 monitoring</span>
      </div>
      <div class="glass-card" style="padding:18px;">
        <div class="flex-between" style="margin-bottom:10px;">
          <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">AI Alerts Today</h4>
          <i data-lucide="sparkles" style="width:16px;height:16px;color:var(--brand);"></i>
        </div>
        <h2 style="font-size:26px;">${AppState.insights.length}</h2>
        <span style="font-size:11px; color:var(--text-faint);">Duplicate, fraud & risk flags</span>
      </div>
      <div class="glass-card" style="padding:18px;">
        <div class="flex-between" style="margin-bottom:10px;">
          <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">SLA Compliance</h4>
          <i data-lucide="badge-check" style="width:16px;height:16px;color:var(--success);"></i>
        </div>
        <h2 style="font-size:26px;">94%</h2>
        <div style="height:5px; background:var(--bg-page); border-radius:3px; overflow:hidden; margin-top:6px;"><div style="height:100%; width:94%; background:var(--success);"></div></div>
      </div>
      <div class="glass-card" style="padding:18px;">
        <div class="flex-between" style="margin-bottom:10px;">
          <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Citizen Satisfaction</h4>
          <i data-lucide="smile" style="width:16px;height:16px;color:var(--warning);"></i>
        </div>
        <h2 style="font-size:26px;">4.6<span style="font-size:14px; color:var(--text-faint);">/5</span></h2>
        <div style="display:flex; gap:2px; margin-top:6px;">
          ${[1,2,3,4,5].map(i => `<i data-lucide="star" style="width:12px;height:12px;color:${i <= 4 ? 'var(--warning)' : 'var(--border)'}; fill:${i <= 4 ? 'var(--warning)' : 'none'};"></i>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// 6. View Renderers (Expanded)
function getStatusBadge(status) {
  const map = { 'Pending': 'warning', 'Assigned': 'info', 'Escalated': 'danger', 'Resolved': 'success', 'InProgress': 'info' };
  return `<span class="badge ${map[status] || 'info'}"><span class="dot"></span>${status}</span>`;
}

function getPriorityColor(pri) {
  const map = { 'Critical': 'var(--danger)', 'High': 'var(--warning)', 'Medium': 'var(--info)', 'Low': 'var(--text-muted)' };
  return map[pri] || 'var(--text-muted)';
}

// Returns AppState.complaints filtered/sorted per ComplaintFilterState
function getFilteredComplaints() {
  const f = ComplaintFilterState;
  let list = AppState.complaints.filter(c => {
    if (f.dept !== 'All' && c.dept !== f.dept) return false;
    if (f.priority !== 'All' && c.priority !== f.priority) return false;
    if (f.status !== 'All' && c.status !== f.status) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const hay = `${c.id} ${c.citizen} ${c.category} ${c.ward}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const priorityRank = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
  if (f.sort === 'newest') list = list.slice().sort((a, b) => b.date.localeCompare(a.date));
  else if (f.sort === 'oldest') list = list.slice().sort((a, b) => a.date.localeCompare(b.date));
  else if (f.sort === 'priority') list = list.slice().sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
  else if (f.sort === 'trust') list = list.slice().sort((a, b) => a.trust - b.trust);
  return list;
}

function renderComplaintRows(list) {
  if (list.length === 0) {
    return `<tr><td colspan="8" style="text-align:center; padding:48px; color:var(--text-faint);">No complaints match these filters.</td></tr>`;
  }
  return list.map(c => `
    <tr class="fade-in" style="cursor:pointer;" onclick="viewComplaint('${c.id}')">
      <td><input type="checkbox" class="complaint-check" data-id="${c.id}" style="width:16px;height:16px; accent-color:var(--brand);" ${SelectedComplaints.has(c.id) ? 'checked' : ''} onclick="event.stopPropagation(); toggleComplaintSelect('${c.id}', this.checked)"></td>
      <td>
        <strong style="color:var(--brand); display:block;">${c.id}</strong>
        <span style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${c.date}</span>
      </td>
      <td>
        <span style="font-weight:600; display:block;">${c.citizen}</span>
        <span style="font-size:11px; color:${c.trust < 50 ? 'var(--danger)' : 'var(--success)'};">Trust: ${c.trust}/100</span>
      </td>
      <td>
        <span style="font-weight:500; display:block;">${c.category} - ${c.dept}</span>
        <span style="font-size:11px; color:var(--text-muted);"><i data-lucide="map-pin" style="width:10px;height:10px;"></i> Ward ${c.ward}</span>
      </td>
      <td>
        <span style="font-size:12px; font-weight:700; color:${getPriorityColor(c.priority)}">${c.priority}</span>
      </td>
      <td>
        <div style="display:flex; gap:4px; flex-wrap:wrap; max-width:200px;">
          ${c.labels.map(l => `<span class="badge" style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-muted); font-size:9px;">${l}</span>`).join('')}
          ${c.labels.length === 0 ? '<span class="text-muted" style="font-size:11px;">--</span>' : ''}
        </div>
      </td>
      <td>${getStatusBadge(c.status)}</td>
      <td style="text-align:right;">
        <button class="icon-btn" style="width:30px;height:30px;" onclick="event.stopPropagation(); viewComplaint('${c.id}')"><i data-lucide="more-horizontal" style="width:16px;"></i></button>
      </td>
    </tr>
  `).join('');
}

function refreshComplaintsTable() {
  const tbody = document.getElementById('complaints-tbody');
  const countBadge = document.getElementById('complaints-count-badge');
  if (!tbody) return;
  const list = getFilteredComplaints();
  tbody.innerHTML = renderComplaintRows(list);
  if (countBadge) countBadge.innerText = `${list.length} of ${AppState.complaints.length}`;
  refreshBulkBar();
  if (window.lucide) lucide.createIcons();
}

function updateComplaintFilter(key, value) {
  ComplaintFilterState[key] = value;
  refreshComplaintsTable();
}

function toggleComplaintSelect(id, checked) {
  if (checked) SelectedComplaints.add(id); else SelectedComplaints.delete(id);
  refreshBulkBar();
}

function toggleSelectAllComplaints(checked) {
  const visible = getFilteredComplaints();
  visible.forEach(c => { if (checked) SelectedComplaints.add(c.id); else SelectedComplaints.delete(c.id); });
  refreshComplaintsTable();
}

function refreshBulkBar() {
  const bar = document.getElementById('bulk-actions-bar');
  if (!bar) return;
  const n = SelectedComplaints.size;
  bar.style.opacity = n > 0 ? '1' : '0.5';
  bar.style.pointerEvents = n > 0 ? 'auto' : 'none';
  ['assign', 'resolve', 'escalate', 'delete'].forEach(action => {
    const btn = document.getElementById(`bulk-${action}-btn`);
    if (btn) btn.innerText = `${action.charAt(0).toUpperCase() + action.slice(1)} (${n})`;
  });
}

function bulkAction(action) {
  const ids = Array.from(SelectedComplaints);
  if (ids.length === 0) return;
  if (action === 'resolve') {
    AppState.complaints.forEach(c => { if (ids.includes(c.id)) c.status = 'Resolved'; });
    showToast(`${ids.length} complaint(s) marked Resolved.`, 'success');
  } else if (action === 'escalate') {
    AppState.complaints.forEach(c => { if (ids.includes(c.id)) { c.status = 'Escalated'; c.priority = 'Critical'; } });
    showToast(`${ids.length} complaint(s) escalated to Critical.`, 'danger');
  } else if (action === 'assign') {
    AppState.complaints.forEach(c => { if (ids.includes(c.id)) c.status = 'Assigned'; });
    showToast(`${ids.length} complaint(s) assigned to department queue.`, 'info');
  } else if (action === 'delete') {
    AppState.complaints = AppState.complaints.filter(c => !ids.includes(c.id));
    showToast(`${ids.length} complaint(s) deleted.`, 'danger');
  } else if (action === 'merge') {
    showToast(`${ids.length} complaint(s) merged into a single parent case (simulated).`, 'info');
  }
  SelectedComplaints.clear();
  refreshComplaintsTable();
}

function exportComplaintsCSV() {
  const list = getFilteredComplaints();
  const headers = ['ID', 'Date', 'Citizen', 'Phone', 'Department', 'Category', 'Ward', 'Priority', 'Status', 'Trust', 'Labels'];
  const rows = list.map(c => [c.id, c.date, c.citizen, c.phone, c.dept, c.category, c.ward, c.priority, c.status, c.trust, c.labels.join('|')]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `complaints-export-${Date.now()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${list.length} complaints to CSV.`, 'success', 'download');
}

function setComplaintStatus(id, status, escalatePriority) {
  const c = AppState.complaints.find(x => x.id === id);
  if (!c) return;
  c.status = status;
  if (escalatePriority) c.priority = 'Critical';
  showToast(`${id} status updated to ${status}.`, status === 'Escalated' ? 'danger' : 'success');
  closeAllOverlays();
  const tbody = document.getElementById('complaints-tbody');
  if (tbody) refreshComplaintsTable();
}

function viewComplaint(id) {
  const c = AppState.complaints.find(x => x.id === id);
  if (!c) return;
  const d = getComplaintDetail(c);
  openDrawer(`
    <div class="drawer-head">
      <div>
        <div style="display:flex; align-items:center; gap:8px;">
          <h3 style="font-size:18px; margin:0;">${c.id}</h3>
          ${getStatusBadge(c.status)}
        </div>
        <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">${c.category} · ${c.dept} · Ward ${c.ward}</p>
      </div>
      <button class="drawer-close" onclick="closeAllOverlays()"><i data-lucide="x" style="width:16px;"></i></button>
    </div>
    <div class="drawer-body">
      <div class="tab-row" id="complaint-tabs">
        <button class="tab-btn active" onclick="switchTab('complaint-tabs','overview',this)">Overview</button>
        <button class="tab-btn" onclick="switchTab('complaint-tabs','ai',this)">AI Analysis</button>
        <button class="tab-btn" onclick="switchTab('complaint-tabs','evidence',this)">Evidence</button>
        <button class="tab-btn" onclick="switchTab('complaint-tabs','history',this)">History</button>
        <button class="tab-btn" onclick="switchTab('complaint-tabs','notes',this)">Notes</button>
      </div>

      <div class="tab-pane active" data-tab="overview">
        <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Citizen Information</h4>
        <div class="glass-card" style="padding:16px; margin-bottom:20px;">
          <div class="flex-between" style="margin-bottom:10px;"><span>Name</span><strong>${c.citizen}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Phone</span><strong>${c.phone}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Previous Reports</span><strong>${d.previousReports}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Verified</span>${d.verified ? '<span class="badge success">Verified</span>' : '<span class="badge warning">Unverified</span>'}</div>
          <div class="flex-between"><span>Trust Score</span><strong style="color:${c.trust < 50 ? 'var(--danger)' : 'var(--success)'};">${c.trust}/100</strong></div>
        </div>

        <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Location</h4>
        <div class="glass-card" style="padding:16px; margin-bottom:20px;">
          <div class="flex-between" style="margin-bottom:10px;"><span>Street</span><strong>${d.street}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Ward</span><strong>${c.ward}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Coordinates</span><strong class="mono" style="font-size:12px;">${c.coords}</strong></div>
          <div class="flex-between"><span>Nearby Complaints</span><strong>${d.nearby}</strong></div>
        </div>

        <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Labels</h4>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${c.labels.map(l => `<span class="badge" style="background:var(--bg-page); border:1px solid var(--border); color:var(--text-muted);">${l}</span>`).join('') || '<span class="text-muted" style="font-size:12px;">No labels</span>'}
        </div>
      </div>

      <div class="tab-pane" data-tab="ai">
        <div class="grid-cols-2" style="margin-bottom:16px;">
          <div class="glass-card" style="padding:14px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Confidence</div><div style="font-size:22px; font-weight:700;">${d.ai.confidence}%</div></div>
          <div class="glass-card" style="padding:14px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Severity Score</div><div style="font-size:22px; font-weight:700; color:var(--danger);">${d.ai.severity}</div></div>
          <div class="glass-card" style="padding:14px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Fraud Score</div><div style="font-size:22px; font-weight:700; color:var(--warning);">${d.ai.fraud}%</div></div>
          <div class="glass-card" style="padding:14px;"><div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Duplicate Score</div><div style="font-size:22px; font-weight:700; color:var(--info);">${d.ai.duplicate}%</div></div>
        </div>
        <div class="glass-card" style="padding:16px;">
          <div class="flex-between" style="margin-bottom:10px;"><span>Detected Object</span><strong>${d.ai.detectedObject}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Detected Category</span><strong>${d.ai.detectedCategory}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Suggested Department</span><strong>${d.ai.suggestedDept}</strong></div>
          <div class="flex-between" style="margin-bottom:10px;"><span>Suggested Officer</span><strong>${d.ai.suggestedOfficer}</strong></div>
          <div class="flex-between"><span>Estimated Resolution</span><strong>${d.ai.eta}</strong></div>
        </div>
      </div>

      <div class="tab-pane" data-tab="evidence">
        <div class="grid-cols-3">
          <div class="glass-card" style="padding:16px; text-align:center;"><i data-lucide="image" style="color:var(--brand);"></i><div style="font-size:20px; font-weight:700; margin-top:6px;">${d.evidence.images}</div><div style="font-size:11px; color:var(--text-muted);">Images</div></div>
          <div class="glass-card" style="padding:16px; text-align:center;"><i data-lucide="video" style="color:${d.evidence.video ? 'var(--brand)' : 'var(--text-faint)'};"></i><div style="font-size:20px; font-weight:700; margin-top:6px;">${d.evidence.video ? 1 : 0}</div><div style="font-size:11px; color:var(--text-muted);">Video</div></div>
          <div class="glass-card" style="padding:16px; text-align:center;"><i data-lucide="mic" style="color:${d.evidence.voice ? 'var(--brand)' : 'var(--text-faint)'};"></i><div style="font-size:20px; font-weight:700; margin-top:6px;">${d.evidence.voice ? 1 : 0}</div><div style="font-size:11px; color:var(--text-muted);">Voice Note</div></div>
        </div>
        <p style="font-size:12px; color:var(--text-faint); margin-top:16px;">Attachment previews require the field media service; this is a frontend-only mock.</p>
      </div>

      <div class="tab-pane" data-tab="history">
        <div style="position:relative; padding-left:20px;">
          <div style="position:absolute; left:5px; top:4px; bottom:4px; width:2px; background:var(--border);"></div>
          ${d.history.map(h => `
            <div style="position:relative; margin-bottom:18px;">
              <div style="position:absolute; left:-20px; top:4px; width:10px; height:10px; border-radius:50%; background:var(--brand); border:2px solid var(--bg-card); box-shadow:0 0 0 3px var(--bg-page);"></div>
              <strong style="font-size:13px; display:block;">${h.stage}</strong>
              <span style="font-size:11px; color:var(--text-faint);">${h.time} · ${h.by}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="tab-pane" data-tab="notes">
        <div class="form-group"><label>Officer Notes</label><textarea class="form-control" placeholder="Add an officer note...">${c.status === 'Resolved' ? 'Issue verified and closed on site.' : ''}</textarea></div>
        <div class="form-group"><label>Admin Notes</label><textarea class="form-control" placeholder="Add an admin note..."></textarea></div>
        <div class="form-group"><label>Inspection Notes</label><textarea class="form-control" placeholder="Add an inspection note..."></textarea></div>
        <button class="btn btn-primary" onclick="showToast('Notes saved.', 'success')"><i data-lucide="save"></i> Save Notes</button>
      </div>

      <div class="flex-gap" style="margin-top:24px; border-top:1px solid var(--border); padding-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="setComplaintStatus('${c.id}', 'Assigned')"><i data-lucide="user-check"></i> Assign</button>
        <button class="btn btn-outline" style="flex:1;" onclick="setComplaintStatus('${c.id}', 'Resolved')"><i data-lucide="check-circle"></i> Resolve</button>
        <button class="btn btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="setComplaintStatus('${c.id}', 'Escalated', true)"><i data-lucide="arrow-up-right"></i> Escalate</button>
      </div>
    </div>
  `);
}

function renderComplaints() {
  const depts = Array.from(new Set(AppState.complaints.map(c => c.dept)));
  const wards = Array.from(new Set(AppState.complaints.map(c => c.ward))).sort();

  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <h2 style="font-size:22px; margin:0;">Complaints Ledger</h2>
        <span class="badge info" style="font-size:12px;" id="complaints-count-badge">${AppState.complaints.length} of ${AppState.complaints.length}</span>
      </div>
      <div class="flex-gap">
        <button class="btn btn-outline" style="font-size:12px; padding: 6px 12px;" onclick="exportComplaintsCSV()"><i data-lucide="download"></i> Export CSV</button>
        <button class="btn btn-primary" style="font-size:12px; padding: 6px 12px;" onclick="showToast('New complaint form requires the citizen intake service — use the mobile app for live submissions.', 'info')"><i data-lucide="plus"></i> New Complaint</button>
      </div>
    </div>

    <!-- Filters & Bulk Ops -->
    <div class="glass-card" style="padding: 16px 24px; margin-bottom: 24px;">
      <div class="flex-between" style="flex-wrap:wrap; gap:12px;">
        <div class="flex-gap" id="bulk-actions-bar" style="opacity:0.5; pointer-events:none; flex-wrap:wrap;">
          <strong style="font-size:12px; text-transform:uppercase;">Bulk Actions:</strong>
          <button id="bulk-assign-btn" class="btn btn-outline" style="font-size:11px; padding:4px 8px;" onclick="bulkAction('assign')">Assign (0)</button>
          <button id="bulk-resolve-btn" class="btn btn-outline" style="font-size:11px; padding:4px 8px;" onclick="bulkAction('resolve')">Resolve (0)</button>
          <button id="bulk-escalate-btn" class="btn btn-outline" style="font-size:11px; padding:4px 8px; color:var(--danger); border-color:var(--danger);" onclick="bulkAction('escalate')">Escalate (0)</button>
          <button id="bulk-delete-btn" class="btn btn-outline" style="font-size:11px; padding:4px 8px; color:var(--danger); border-color:var(--danger);" onclick="bulkAction('delete')">Delete (0)</button>
          <button class="btn btn-outline" style="font-size:11px; padding:4px 8px;" onclick="bulkAction('merge')"><i data-lucide="merge" style="width:12px;"></i> Merge</button>
        </div>
        <div class="flex-gap" style="flex-wrap:wrap;">
          <div class="search-container" style="width:180px;">
            <i data-lucide="search"></i>
            <input type="text" placeholder="Search ID, citizen..." style="height:34px; font-size:12px;" oninput="updateComplaintFilter('search', this.value)">
          </div>
          <select class="btn btn-outline" style="font-size:12px; padding:6px 12px;" onchange="updateComplaintFilter('dept', this.value)">
            <option value="All">All Departments</option>
            ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
          <select class="btn btn-outline" style="font-size:12px; padding:6px 12px;" onchange="updateComplaintFilter('priority', this.value)">
            <option value="All">All Priorities</option>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select class="btn btn-outline" style="font-size:12px; padding:6px 12px;" onchange="updateComplaintFilter('status', this.value)">
            <option value="All">All Statuses</option>
            <option>Pending</option><option>Assigned</option><option>InProgress</option><option>Escalated</option><option>Resolved</option>
          </select>
          <select class="btn btn-outline" style="font-size:12px; padding:6px 12px;" onchange="updateComplaintFilter('sort', this.value)">
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priority">Sort: Priority</option>
            <option value="trust">Sort: Lowest Trust</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width:40px;"><input type="checkbox" style="width:16px;height:16px; accent-color:var(--brand);" onclick="toggleSelectAllComplaints(this.checked)"></th>
              <th>ID & Date</th>
              <th>Citizen / Source</th>
              <th>Category & Ward</th>
              <th>Priority</th>
              <th>Labels</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="complaints-tbody">
            ${renderComplaintRows(getFilteredComplaints())}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCityMap() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
      <h2 style="font-size:22px;">Live City Map</h2>
      <div class="flex-gap">
        <div class="glass-card" style="padding:6px; display:flex; gap:4px; border-radius:30px;">
          <button class="btn btn-primary" style="padding:4px 12px; border-radius:20px; font-size:11px;">Heatmap</button>
          <button class="btn btn-outline" style="padding:4px 12px; border-radius:20px; font-size:11px; border:none;">Clusters</button>
        </div>
      </div>
    </div>
    
    <!-- Simulated Map Container -->
    <div class="glass-card" style="height: calc(100vh - 220px); padding:0; position:relative; background:#0B1221; overflow:hidden;">
      <!-- Grid pattern overlay to simulate a tech map -->
      <div style="position:absolute; inset:0; background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px; opacity:0.3;"></div>
      
      <!-- Fake Map Elements -->
      <div style="position:absolute; top:30%; left:40%; padding:15px; background:rgba(37,99,235,0.2); border:1px solid rgba(37,99,235,0.5); border-radius:50%; width:180px; height:180px; transform:translate(-50%, -50%); animation: pulse 3s infinite;">
         <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:12px; font-weight:bold; white-space:nowrap; text-align:center;">
            <i data-lucide="activity" style="color:var(--brand);margin-bottom:4px;"></i><br/>Ward 18 Cluster<br/><span style="font-size:9px; color:rgba(255,255,255,0.6)">42 Complaints</span>
         </div>
      </div>

      <div style="position:absolute; top:60%; left:65%; padding:15px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.5); border-radius:50%; width:120px; height:120px; transform:translate(-50%, -50%); animation: pulse 2s infinite;">
         <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:12px; font-weight:bold; white-space:nowrap; text-align:center;">
            <i data-lucide="siren" style="color:var(--danger);margin-bottom:4px;"></i><br/>High Risk<br/><span style="font-size:9px; color:rgba(255,255,255,0.6)">Flood Warning</span>
         </div>
      </div>
      
      <!-- Floating Layer Controls -->
      <div style="position:absolute; right:20px; top:20px; width:220px; background:rgba(11,18,33,0.8); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-md); padding:16px;">
        <h4 style="color:white; font-size:13px; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">Map Layers</h4>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <label style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.8); font-size:12px;">
            <input type="checkbox" checked style="accent-color:var(--brand);"> All Complaints
          </label>
          <label style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.8); font-size:12px;">
            <input type="checkbox" checked style="accent-color:var(--brand);"> Emergency Alerts
          </label>
          <label style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.8); font-size:12px;">
            <input type="checkbox" style="accent-color:var(--brand);"> Officer Locations
          </label>
          <label style="display:flex; align-items:center; gap:8px; color:rgba(255,255,255,0.8); font-size:12px;">
            <input type="checkbox" checked style="accent-color:var(--brand);"> Flood Risk Zones
          </label>
        </div>
      </div>
    </div>
    <style>@keyframes pulse { 0% { box-shadow:0 0 0 0 rgba(37,99,235,0.4); } 70% { box-shadow:0 0 0 20px rgba(37,99,235,0); } 100% { box-shadow:0 0 0 0 rgba(37,99,235,0); } }</style>
  `;
}

function renderAICommand() {
  return `
    <div style="margin-bottom: 24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="cpu" style="color:var(--brand)"></i> Nexus AI Command Center
      </h2>
      <p class="text-muted" style="margin-top:4px;">Advanced prediction and automated coordination layer.</p>
    </div>

    <div class="grid-cols-4" style="margin-bottom: 32px;">
      <div class="glass-card fade-in" style="animation-delay: 0.1s;">
        <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase;">Duplicate Detection</h4>
        <h2 style="font-size:28px; margin:8px 0;">99.4% <span style="font-size:12px; font-weight:normal; color:var(--success);">Accuracy</span></h2>
        <p style="font-size:12px; color:var(--text-faint);">14 duplicates prevented today.</p>
      </div>
      <div class="glass-card fade-in" style="animation-delay: 0.2s;">
        <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase;">Fraud Reports Filtered</h4>
        <h2 style="font-size:28px; margin:8px 0; color:var(--danger)">2.1% <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">of total</span></h2>
        <p style="font-size:12px; color:var(--text-faint);">3 known spammers blocked automatically.</p>
      </div>
      <div class="glass-card fade-in" style="animation-delay: 0.3s;">
        <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase;">Auto-Escalations</h4>
        <h2 style="font-size:28px; margin:8px 0; color:var(--warning)">17 <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">cases routed</span></h2>
        <p style="font-size:12px; color:var(--text-faint);">AI detected high-severity text patterns.</p>
      </div>
      <div class="glass-card fade-in" style="animation-delay: 0.4s;">
        <h4 style="color:var(--text-muted); font-size:12px; text-transform:uppercase;">Est. Time Saved</h4>
        <h2 style="font-size:28px; margin:8px 0; color:var(--success)">14.5<span style="font-size:14px;">h</span></h2>
        <p style="font-size:12px; color:var(--text-faint);">Time saved by auto-dispatching officers.</p>
      </div>
    </div>

    <div class="grid-cols-2">
      <div class="glass-card">
        <h3 style="font-size: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom:12px;">Tomorrow's Forecast</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <div class="flex-between" style="font-size:13px; font-weight:600; margin-bottom:6px;">
              <span>Garbage Overflow Risk <span class="badge warning">High</span></span> <span>85% prob.</span>
            </div>
            <div style="height:6px; background:var(--bg-page); border-radius:4px; overflow:hidden;"><div style="height:100%; width:85%; background:var(--warning);"></div></div>
            <p style="font-size:11px; color:var(--text-faint); margin-top:4px;">Festive season in Ward 4 causes a spike.</p>
          </div>
          <div>
            <div class="flex-between" style="font-size:13px; font-weight:600; margin-bottom:6px;">
              <span>Power Outage Risk (Zone C) <span class="badge info">Low</span></span> <span>12% prob.</span>
            </div>
            <div style="height:6px; background:var(--bg-page); border-radius:4px; overflow:hidden;"><div style="height:100%; width:12%; background:var(--info);"></div></div>
          </div>
          <div>
            <div class="flex-between" style="font-size:13px; font-weight:600; margin-bottom:6px;">
              <span>Water Shortage Complaints <span class="badge danger">Critical</span></span> <span>96% prob.</span>
            </div>
            <div style="height:6px; background:var(--bg-page); border-radius:4px; overflow:hidden;"><div style="height:100%; width:96%; background:var(--danger);"></div></div>
            <p style="font-size:11px; color:var(--text-faint); margin-top:4px;">Main pipeline maintenance scheduled.</p>
          </div>
        </div>
      </div>

      <div class="glass-card">
        <h3 style="font-size: 16px; margin-bottom: 16px;">Smart Suggestions</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="padding:16px; border:1px solid var(--success-bg); background:var(--bg-page); border-radius:var(--radius-md); display:flex; gap:12px; align-items:flex-start;">
            <i data-lucide="badge" style="color:var(--success); width:24px; height:24px; flex:none;"></i>
            <div>
              <strong style="font-size:13px; display:block;">Re-route Officer M. Patel</strong>
              <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">M. Patel is currently near a new Pothole complaint in Ward 4. Assigning him now saves 45 mins.</p>
              <button class="btn btn-outline" style="font-size:11px; padding:4px 12px; margin-top:8px;" onclick="showToast('M. Patel auto-assigned to the nearby complaint.', 'success')">Auto-Assign</button>
            </div>
          </div>
          <div style="padding:16px; border:1px solid var(--warning-bg); background:var(--bg-page); border-radius:var(--radius-md); display:flex; gap:12px; align-items:flex-start;">
            <i data-lucide="alert-circle" style="color:var(--warning); width:24px; height:24px; flex:none;"></i>
            <div>
              <strong style="font-size:13px; display:block;">Merge 7 Streetlight Complaints</strong>
              <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Detected a cluster matching "Streetlight out" in Ward 18. Consolidate into one parent issue?</p>
              <button class="btn btn-primary" style="font-size:11px; padding:4px 12px; margin-top:8px;" onclick="showToast('7 streetlight complaints merged into one parent case.', 'info')">Merge Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getOfficerInitials(name) { return name.split(' ').map(n => n[0]).join('').substring(0, 2); }
function getOfficerBadge(status) {
  if (status === 'Available') return '<span class="badge success">Available</span>';
  if (status === 'Overloaded') return '<span class="badge danger">Overloaded</span>';
  return '<span class="badge info">On Route</span>';
}
// Deterministic officer ID (stable across re-renders, unlike a random number)
function getOfficerId(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 9000;
  return `OFC-${1000 + Math.abs(hash)}`;
}

function viewOfficer(name) {
  const o = AppState.officers.find(x => x.name === name);
  if (!o) return;
  openModal(`
    <div class="modal-head">
      <div class="flex-gap">
        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, var(--brand), #60A5FA); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">${getOfficerInitials(o.name)}</div>
        <div>
          <h3 style="font-size:16px; margin:0;">${o.name}</h3>
          <span style="font-size:11px; color:var(--text-faint);">ID: ${getOfficerId(o.name)} · ${o.dept}</span>
        </div>
      </div>
      <button class="drawer-close" onclick="closeAllOverlays()"><i data-lucide="x" style="width:16px;"></i></button>
    </div>
    <div class="modal-body">
      <div class="grid-cols-3" style="margin-bottom:20px;">
        <div class="glass-card" style="padding:14px; text-align:center;"><div style="font-size:20px; font-weight:700;">${o.pending}</div><div style="font-size:11px; color:var(--text-muted);">Pending</div></div>
        <div class="glass-card" style="padding:14px; text-align:center;"><div style="font-size:20px; font-weight:700; color:var(--success);">${o.completed}</div><div style="font-size:11px; color:var(--text-muted);">Completed</div></div>
        <div class="glass-card" style="padding:14px; text-align:center;"><div style="font-size:20px; font-weight:700; color:var(--warning);">${o.rating}<i data-lucide="star" style="width:12px; margin-left:2px;"></i></div><div style="font-size:11px; color:var(--text-muted);">Rating</div></div>
      </div>
      <div class="glass-card" style="padding:16px; margin-bottom:16px;">
        <div class="flex-between" style="margin-bottom:10px;"><span>Availability</span>${getOfficerBadge(o.availability)}</div>
        <div class="flex-between" style="margin-bottom:10px;"><span>Current Route / Area</span><strong>${o.route}</strong></div>
        <div class="flex-between" style="margin-bottom:10px;"><span>Experience</span><strong>${3 + (o.completed % 7)} years</strong></div>
        <div class="flex-between"><span>Contact</span><strong class="mono" style="font-size:12px;">+91 90${getOfficerId(o.name).replace('OFC-', '')}00</strong></div>
      </div>
      <h4 style="font-size:13px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px;">Recent Timeline</h4>
      <div style="position:relative; padding-left:20px;">
        <div style="position:absolute; left:5px; top:4px; bottom:4px; width:2px; background:var(--border);"></div>
        ${['Accepted new assignment', 'Completed inspection', 'Marked case resolved'].map((t, i) => `
          <div style="position:relative; margin-bottom:14px;">
            <div style="position:absolute; left:-20px; top:4px; width:10px; height:10px; border-radius:50%; background:var(--brand); border:2px solid var(--bg-card); box-shadow:0 0 0 3px var(--bg-page);"></div>
            <strong style="font-size:13px; display:block;">${t}</strong>
            <span style="font-size:11px; color:var(--text-faint);">${2 + i}h ago</span>
          </div>
        `).join('')}
      </div>
      <div class="flex-gap" style="margin-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="showToast('Reassignment request sent to ${o.name}.', 'success')"><i data-lucide="navigation"></i> Reassign</button>
        <button class="btn btn-outline" style="flex:1;" onclick="showToast('Message sent to ${o.name}.', 'info')"><i data-lucide="message-square"></i> Message</button>
      </div>
    </div>
  `);
}

function renderOfficers() {
  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <h2 style="font-size:22px; margin:0;">Officer Roster</h2>
        <span class="badge info" style="font-size:12px;">24 Active Shift</span>
      </div>
      <button class="btn btn-primary" style="font-size:12px; padding: 6px 12px;" onclick="showToast('Add Officer form requires the HR onboarding service (simulated).', 'info')"><i data-lucide="user-plus"></i> Add Officer</button>
    </div>

    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Department</th>
              <th>Current Workload</th>
              <th>Performance</th>
              <th>Status</th>
              <th>Action / Route</th>
            </tr>
          </thead>
          <tbody>
            ${AppState.officers.map(o => `
              <tr class="fade-in" style="cursor:pointer;" onclick="viewOfficer('${o.name}')">
                <td>
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, var(--brand), #60A5FA); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px;">
                      ${getOfficerInitials(o.name)}
                    </div>
                    <div>
                      <strong style="display:block;">${o.name}</strong>
                      <span style="font-size:11px; color:var(--text-faint);">ID: ${getOfficerId(o.name)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-weight:500;">${o.dept}</span>
                </td>
                <td>
                  <div style="font-size:13px;"><strong style="color:var(--text-main);">${o.pending} Pending</strong> / ${o.completed} Done</div>
                  <div style="height:4px; width:100px; background:var(--bg-page); border-radius:2px; margin-top:4px; overflow:hidden;">
                    <div style="height:100%; width:${Math.min((o.pending / 15) * 100, 100)}%; background:${o.pending > 10 ? 'var(--danger)' : 'var(--brand)'};"></div>
                  </div>
                </td>
                <td>
                  <div style="display:flex; align-items:center; gap:4px; font-weight:600; color:${o.rating > 4.5 ? 'var(--success)' : 'var(--warning)'};">
                    <i data-lucide="star" style="width:14px;height:14px; fill:currentColor;"></i> ${o.rating}
                  </div>
                </td>
                <td>${getOfficerBadge(o.availability)}</td>
                <td>
                  <span style="font-size:12px; color:var(--text-muted); display:inline-flex; align-items:center; gap:6px;">
                    <i data-lucide="navigation" style="width:12px;"></i> ${o.route}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderEmergency() {
  const emergencies = [
    { type: 'Fire', location: 'Industrial Area Zone B', severity: 95, eta: '4m', status: 'Units Dispatched' },
    { type: 'Flood', location: 'Lakeside Ward 2', severity: 82, eta: '12m', status: 'Monitoring' },
    { type: 'Accident', location: 'Main Highway Ex 4', severity: 60, eta: '2m', status: 'On Scene' },
    { type: 'Gas Leak', location: 'Sector 9 Res', severity: 75, eta: '7m', status: 'Evacuating' }
  ];

  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="siren" style="color:var(--danger)"></i> Emergency Operations
      </h2>
      <button class="btn btn-primary" style="background:var(--danger); box-shadow:0 0 15px rgba(239, 68, 68, 0.4);" onclick="Router.navigate('notifications')"><i data-lucide="megaphone"></i> Broadcast Alert</button>
    </div>

    <div class="grid-cols-2">
      ${emergencies.map(e => `
        <div class="glass-card fade-in" style="border-left: 4px solid var(--danger); padding:20px;">
          <div class="flex-between">
            <h3 style="font-size:18px; margin:0; display:flex; align-items:center; gap:8px;">
              ${e.type} <span class="badge danger" style="padding:2px 6px; font-size:10px;">LIVE</span>
            </h3>
            <button class="btn btn-outline" style="padding:4px 8px; font-size:11px;" onclick="Router.navigate('city-map')"><i data-lucide="map"></i> View Map</button>
          </div>
          <p style="font-size:13px; color:var(--text-faint); margin:4px 0 16px;">${e.location}</p>
          
          <div class="grid-cols-3" style="margin-bottom:16px;">
            <div>
              <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Severity</span>
              <div style="font-size:20px; font-weight:700; color:var(--danger);">${e.severity}/100</div>
            </div>
            <div>
              <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">First Resp. ETA</span>
              <div style="font-size:20px; font-weight:700;">${e.eta}</div>
            </div>
            <div>
              <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Status</span>
              <div style="font-size:14px; font-weight:600; margin-top:4px;">${e.status}</div>
            </div>
          </div>
          
          <div style="height:6px; background:var(--bg-page); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${e.severity}%; background:var(--danger);"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDepartments() {
  const depts = [
    { name: 'Sanitation', open: 142, resolved: 890, avgTime: '2.4d', officers: 45, icon: 'trash-2', color: 'success' },
    { name: 'Roads & Infra', open: 345, resolved: 1205, avgTime: '14d', officers: 120, icon: 'cone', color: 'warning' },
    { name: 'Water & Supply', open: 89, resolved: 412, avgTime: '1.2d', officers: 32, icon: 'droplet', color: 'info' },
    { name: 'Electricity', open: 23, resolved: 156, avgTime: '8h', officers: 28, icon: 'zap', color: 'brand' }
  ];

  return `
    <h2 style="font-size:22px; margin-bottom:24px;">Department Overview</h2>
    <div class="grid-cols-2">
      ${depts.map(d => `
        <div class="glass-card fade-in">
          <div style="display:flex; gap:16px; align-items:center; border-bottom:1px solid var(--border); padding-bottom:16px; margin-bottom:16px;">
             <div class="icon-btn" style="width:48px; height:48px; background:var(--${d.color}-bg); color:var(--${d.color}); border:none; border-radius:12px;">
                <i data-lucide="${d.icon}" style="width:24px; height:24px;"></i>
             </div>
             <div>
               <h3 style="font-size:18px; margin:0;">${d.name}</h3>
               <span style="font-size:12px; color:var(--text-muted);">${d.officers} Available Officers</span>
             </div>
          </div>
          <div class="grid-cols-3">
             <div style="text-align:center;">
               <div style="font-size:24px; font-weight:bold;">${d.open}</div>
               <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Open Cases</div>
             </div>
             <div style="text-align:center; border-left:1px solid var(--border); border-right:1px solid var(--border);">
               <div style="font-size:24px; font-weight:bold; color:var(--success);">${d.resolved}</div>
               <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Resolved</div>
             </div>
             <div style="text-align:center;">
               <div style="font-size:24px; font-weight:bold;">${d.avgTime}</div>
               <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Avg Resolution</div>
             </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCitizens() {
  const citizens = [
    { name: 'Aarti M.', verified: true, complaints: 14, rating: 4.8, trust: 92, blocked: false },
    { name: 'Vijay P.', verified: false, complaints: 89, rating: 2.1, trust: 14, blocked: true },
    { name: 'Rajesh K.', verified: true, complaints: 3, rating: 4.9, trust: 98, blocked: false }
  ];

  return `
    <h2 style="font-size:22px; margin-bottom:24px;">Citizen Index</h2>
    
    <div class="grid-cols-4" style="margin-bottom:32px;">
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Total Verified Users</div>
        <div style="font-size:28px; font-weight:bold; margin-top:4px;">124.5k</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Active This Month</div>
        <div style="font-size:28px; font-weight:bold; color:var(--info); margin-top:4px;">18.2k</div>
      </div>
      <div class="glass-card" style="padding:16px;">
        <div style="font-size:12px; color:var(--text-muted); text-transform:uppercase;">Blocked Spammers</div>
        <div style="font-size:28px; font-weight:bold; color:var(--danger); margin-top:4px;">842</div>
      </div>
    </div>

    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Citizen Profile</th>
              <th>Status</th>
              <th>Complaints Filed</th>
              <th>Trust Score</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${citizens.map(c => `
              <tr class="fade-in">
                <td>
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:var(--border); display:flex; align-items:center; justify-content:center;">
                      <i data-lucide="user" style="width:16px; color:var(--text-muted);"></i>
                    </div>
                    <strong>${c.name}</strong>
                  </div>
                </td>
                <td>
                  ${c.blocked ? '<span class="badge danger">Blocked</span>' : (c.verified ? '<span class="badge success"><i data-lucide="check-circle" style="width:10px;"></i> Verified</span>' : '<span class="badge warning">Unverified</span>')}
                </td>
                <td><strong style="color:var(--text-main);">${c.complaints}</strong> lifetime records</td>
                <td>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:600; color:${c.trust > 80 ? 'var(--success)' : 'var(--danger)'};">${c.trust}/100</span>
                    <div style="height:4px; width:60px; background:var(--bg-page); border-radius:2px; overflow:hidden;">
                      <div style="height:100%; width:${c.trust}%; background:${c.trust > 80 ? 'var(--success)' : 'var(--danger)'};"></div>
                    </div>
                  </div>
                </td>
                <td style="text-align:right;">
                  <button class="btn btn-outline" style="font-size:11px; padding:4px 8px;">View Profile</button>
                  ${!c.blocked ? `<button class="btn btn-outline" style="font-size:11px; padding:4px 8px; color:var(--danger); border-color:var(--danger);">Block</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderNotificationHistoryRows() {
  return AppState.notificationsSent.map(n => `
    <tr class="fade-in">
      <td><strong style="color:var(--brand);">${n.id}</strong></td>
      <td>${n.title}</td>
      <td><span class="badge info" style="font-size:9px;">${n.type}</span></td>
      <td>${n.area}</td>
      <td><span style="font-size:12px; font-weight:700; color:${getPriorityColor(n.priority)}">${n.priority}</span></td>
      <td>${n.recipients}</td>
      <td><strong>${n.reach.toLocaleString()}</strong></td>
      <td style="font-size:11px; color:var(--text-faint);">${n.sentAt}</td>
    </tr>
  `).join('');
}

function sendNotification() {
  const title = document.getElementById('ntf-title').value.trim();
  const desc = document.getElementById('ntf-desc').value.trim();
  const area = document.getElementById('ntf-area').value;
  const dept = document.getElementById('ntf-dept').value;
  const priority = document.getElementById('ntf-priority').value;
  const type = document.getElementById('ntf-type').value;
  const recipients = document.getElementById('ntf-recipients').value;

  if (!title) { showToast('Please enter a notification title.', 'danger'); return; }

  const reachMap = { 'All Citizens': 124500, 'Ward Residents': 6000 + Math.floor(Math.random() * 4000), 'Department Staff': 40 + Math.floor(Math.random() * 60), 'Officers': AppState.officers.length };
  const entry = {
    id: `NTF-${1043 + AppState.notificationsSent.length}`,
    title, type, area, priority, recipients,
    sentAt: '2026-07-30 ' + new Date().toTimeString().slice(0, 5),
    reach: reachMap[recipients] || 1000
  };
  AppState.notificationsSent.unshift(entry);

  const list = document.getElementById('notification-history-body');
  if (list) list.innerHTML = renderNotificationHistoryRows();
  if (window.lucide) lucide.createIcons();

  ['ntf-title', 'ntf-desc'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  showToast(`Notification "${title}" sent to ${entry.reach.toLocaleString()} recipients.`, 'success', 'send');
}

function renderNotifications() {
  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;"><i data-lucide="bell-ring" style="color:var(--brand)"></i> Notification Center</h2>
      <span class="badge info" style="font-size:12px;">${AppState.notificationsSent.length} sent this week</span>
    </div>

    <div class="grid-cols-2" style="align-items:flex-start;">
      <div class="glass-card">
        <h3 style="font-size:16px; margin-bottom:16px;">Notification Builder</h3>
        <div class="form-group">
          <label>Title</label>
          <input id="ntf-title" class="form-control" type="text" placeholder="e.g. Scheduled Water Shutdown - Ward 12">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="ntf-desc" class="form-control" placeholder="Details citizens should know..."></textarea>
        </div>
        <div class="grid-cols-2">
          <div class="form-group">
            <label>Type</label>
            <select id="ntf-type" class="form-control">
              ${NotificationTypes.map(t => `<option>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select id="ntf-priority" class="form-control">
              <option>Low</option><option selected>Medium</option><option>High</option><option>Critical</option>
            </select>
          </div>
        </div>
        <div class="grid-cols-2">
          <div class="form-group">
            <label>Area / Ward</label>
            <select id="ntf-area" class="form-control">
              <option>All Zones</option><option>Ward 2</option><option>Ward 4</option><option>Ward 12</option><option>Ward 18</option><option>Sector 9</option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select id="ntf-dept" class="form-control">
              <option>General</option><option>Water</option><option>Roads</option><option>Electricity</option><option>Sanitation</option><option>Emergency</option>
            </select>
          </div>
        </div>
        <div class="grid-cols-2">
          <div class="form-group">
            <label>Recipients</label>
            <select id="ntf-recipients" class="form-control">
              <option>All Citizens</option><option>Ward Residents</option><option>Department Staff</option><option>Officers</option>
            </select>
          </div>
          <div class="form-group">
            <label>Schedule</label>
            <input class="form-control" type="datetime-local">
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:8px;" onclick="sendNotification()"><i data-lucide="send"></i> Send Notification</button>
      </div>

      <div class="glass-card">
        <h3 style="font-size:16px; margin-bottom:16px;">Broadcast Types</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${[
            { t: 'Power Shutdown', icon: 'zap', color: 'warning' },
            { t: 'Water Shutdown', icon: 'droplet', color: 'info' },
            { t: 'Weather Alert', icon: 'cloud-rain', color: 'brand' },
            { t: 'Emergency', icon: 'siren', color: 'danger' },
            { t: 'General Notice', icon: 'megaphone', color: 'success' }
          ].map(item => `
            <div class="flex-gap" style="padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-page);">
              <div class="icon-btn" style="width:32px;height:32px; border:none; background:var(--${item.color}-bg); color:var(--${item.color});"><i data-lucide="${item.icon}" style="width:16px;"></i></div>
              <strong style="font-size:13px;">${item.t}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <h3 style="font-size:16px; margin: 28px 0 16px;">Sent History</h3>
    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div class="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Title</th><th>Type</th><th>Area</th><th>Priority</th><th>Recipients</th><th>Reach</th><th>Sent At</th></tr>
          </thead>
          <tbody id="notification-history-body">${renderNotificationHistoryRows()}</tbody>
        </table>
      </div>
    </div>
  `;
}

const ReportTypes = [
  { id: 'daily', name: 'Daily Report', icon: 'calendar' },
  { id: 'weekly', name: 'Weekly Report', icon: 'calendar-days' },
  { id: 'monthly', name: 'Monthly Report', icon: 'calendar-range' },
  { id: 'department', name: 'Department Report', icon: 'building-2' },
  { id: 'ward', name: 'Ward Report', icon: 'map-pin' },
  { id: 'emergency', name: 'Emergency Report', icon: 'siren' },
  { id: 'officer', name: 'Officer Report', icon: 'badge' }
];
const ReportState = { selected: 'daily' };

function selectReportType(id, el) {
  ReportState.selected = id;
  document.querySelectorAll('.report-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function generateReport(format) {
  const type = ReportTypes.find(r => r.id === ReportState.selected);
  if (format === 'csv') {
    const rows = AppState.complaints.map(c => [c.id, c.date, c.dept, c.category, c.ward, c.priority, c.status]);
    const csv = [['ID', 'Date', 'Department', 'Category', 'Ward', 'Priority', 'Status'], ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type.id}-report-${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast(`${type.name} exported as CSV.`, 'success', 'download');
  } else {
    showToast(`${type.name} export to ${format.toUpperCase()} queued (requires backend rendering service — simulated here).`, 'info', 'file-bar-chart-2');
  }
}

function renderReports() {
  return `
    <div class="flex-between" style="margin-bottom:24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;"><i data-lucide="file-bar-chart-2" style="color:var(--brand)"></i> Reporting Engine</h2>
    </div>

    <div class="glass-card" style="margin-bottom:24px;">
      <h3 style="font-size:15px; margin-bottom:16px;">1. Choose Report Type</h3>
      <div class="grid-cols-4" style="gap:12px;">
        ${ReportTypes.map((r, i) => `
          <div class="report-card ${i === 0 ? 'selected' : ''}" onclick="selectReportType('${r.id}', this)">
            <i data-lucide="${r.icon}" style="color:var(--brand);"></i>
            <div style="font-size:12px; font-weight:600; margin-top:8px;">${r.name}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="glass-card" style="margin-bottom:24px;">
      <h3 style="font-size:15px; margin-bottom:16px;">2. Date Range</h3>
      <div class="grid-cols-2">
        <div class="form-group"><label>Start Date</label><input type="date" class="form-control" value="2026-07-01"></div>
        <div class="form-group"><label>End Date</label><input type="date" class="form-control" value="2026-07-30"></div>
      </div>
    </div>

    <div class="glass-card">
      <h3 style="font-size:15px; margin-bottom:16px;">3. Export</h3>
      <div class="flex-gap">
        <button class="btn btn-primary" onclick="generateReport('csv')"><i data-lucide="file-spreadsheet"></i> Export CSV</button>
        <button class="btn btn-outline" onclick="generateReport('pdf')"><i data-lucide="file-text"></i> Export PDF</button>
        <button class="btn btn-outline" onclick="generateReport('excel')"><i data-lucide="table"></i> Export Excel</button>
      </div>
      <p style="font-size:12px; color:var(--text-faint); margin-top:14px;">CSV exports use real data from this session. PDF/Excel rendering requires a backend service and is simulated here.</p>
    </div>
  `;
}

function filterAuditLogs(key, value) {
  AuditLogState[key] = value;
  refreshAuditTable();
}

function refreshAuditTable() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  let list = AuditLogState.all.filter(l => {
    if (AuditLogState.action !== 'All' && l.action !== AuditLogState.action) return false;
    if (AuditLogState.search) {
      const q = AuditLogState.search.toLowerCase();
      if (!`${l.actor} ${l.action} ${l.target} ${l.ip}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  tbody.innerHTML = list.map(l => `
    <tr class="fade-in">
      <td style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${l.time}</td>
      <td>
        <span style="display:flex; align-items:center; gap:8px;">
          <i data-lucide="${l.icon}" style="width:14px;height:14px; color:var(--${l.sev});"></i> ${l.action}
        </span>
      </td>
      <td>${l.actor}</td>
      <td><span class="mono" style="font-size:12px;">${l.target}</span></td>
      <td style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${l.ip}</td>
    </tr>
  `).join('') || `<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-faint);">No matching log entries.</td></tr>`;
  if (window.lucide) lucide.createIcons();
}

function renderAudit() {
  const actions = Array.from(new Set(AuditLogState.all.map(l => l.action)));
  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;"><i data-lucide="clipboard-list" style="color:var(--brand)"></i> Audit Logs</h2>
      <span class="badge info" style="font-size:12px;">${AuditLogState.all.length} entries</span>
    </div>

    <div class="glass-card" style="padding:16px 24px; margin-bottom:24px;">
      <div class="flex-gap" style="flex-wrap:wrap;">
        <div class="search-container" style="width:260px;">
          <i data-lucide="search"></i>
          <input type="text" placeholder="Search actor, target, IP..." style="height:36px; font-size:12px;" oninput="filterAuditLogs('search', this.value)">
        </div>
        <select class="btn btn-outline" style="font-size:12px; padding:6px 12px;" onchange="filterAuditLogs('action', this.value)">
          <option value="All">All Actions</option>
          ${actions.map(a => `<option>${a}</option>`).join('')}
        </select>
      </div>
    </div>

    <div class="glass-card" style="padding:0; overflow:hidden;">
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>Action</th><th>Actor</th><th>Target</th><th>IP Address</th></tr>
          </thead>
          <tbody id="audit-tbody">${(() => { const tmp = refreshAuditTableInit(); return tmp; })()}</tbody>
        </table>
      </div>
    </div>
  `;
}

// Initial (unfiltered) render helper for the audit table body on first paint
function refreshAuditTableInit() {
  return AuditLogState.all.map(l => `
    <tr class="fade-in">
      <td style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${l.time}</td>
      <td>
        <span style="display:flex; align-items:center; gap:8px;">
          <i data-lucide="${l.icon}" style="width:14px;height:14px; color:var(--${l.sev});"></i> ${l.action}
        </span>
      </td>
      <td>${l.actor}</td>
      <td><span class="mono" style="font-size:12px;">${l.target}</span></td>
      <td style="font-size:11px; color:var(--text-faint); font-family:var(--font-mono);">${l.ip}</td>
    </tr>
  `).join('');
}

function renderMonitor() {
  const services = [
    { name: 'Database (PostgreSQL)', status: 'Online', latency: '4ms', cpu: '12%', ram: '4.2GB', storage: '45%' },
    { name: 'FastAPI Main Server', status: 'Online', latency: '8ms', cpu: '5%', ram: '1.2GB', storage: '-' },
    { name: 'AI Nexus Model Engine', status: 'Online', latency: '12ms', cpu: '85%', ram: '14.2GB', storage: '-' },
    { name: 'High-Speed Storage Blob', status: 'Online', latency: '2ms', cpu: '1%', ram: '-', storage: '82%' },
    { name: 'Real-time WebSockets', status: 'Online', latency: '1ms', cpu: '2%', ram: '4.5GB', storage: '-' },
    { name: 'Map Tile Provider', status: 'Offline', latency: 'Timeout', cpu: '-', ram: '-', storage: '-' },
    { name: 'OAuth 2.0 Auth Server', status: 'Online', latency: '3ms', cpu: '4%', ram: '800MB', storage: '-' }
  ];

  return `
    <div class="flex-between" style="margin-bottom: 24px;">
      <h2 style="font-size:22px; display:flex; align-items:center; gap:8px;">
        <i data-lucide="activity" style="color:var(--success)"></i> System Health Monitor
      </h2>
      <button class="btn btn-outline" style="font-size:12px; padding: 6px 12px;"><i data-lucide="refresh-cw"></i> Refresh Diagnostics</button>
    </div>

    <div class="grid-cols-2">
      ${services.map(s => `
        <div class="glass-card fade-in" style="padding:20px; border-left:4px solid ${s.status === 'Online' ? 'var(--success)' : 'var(--danger)'}">
          <div class="flex-between" style="margin-bottom:16px;">
            <strong style="font-size:15px; display:flex; align-items:center; gap:6px;">
              <span style="width:8px; height:8px; border-radius:50%; background:${s.status === 'Online' ? 'var(--success)' : 'var(--danger)'}; box-shadow:0 0 8px ${s.status === 'Online' ? 'var(--success)' : 'var(--danger)'}"></span>
              ${s.name}
            </strong>
             <span class="badge ${s.status === 'Online' ? 'info' : 'danger'}">${s.latency}</span>
          </div>
          
          <div class="grid-cols-3">
             <div style="background:var(--bg-page); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
               <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:2px;">CPU</div>
               <div style="font-size:16px; font-weight:700; color:${parseInt(s.cpu) > 80 ? 'var(--danger)' : 'var(--text-main)'};">${s.cpu}</div>
             </div>
             <div style="background:var(--bg-page); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
               <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:2px;">RAM</div>
               <div style="font-size:16px; font-weight:700;">${s.ram}</div>
             </div>
             <div style="background:var(--bg-page); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
               <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:2px;">Storage</div>
               <div style="font-size:16px; font-weight:700; color:${parseInt(s.storage) > 80 ? 'var(--warning)' : 'var(--text-main)'};">${s.storage}</div>
             </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAnalytics() {
  return `
    <h2 style="font-size:22px; margin-bottom:24px;">Advanced Analytics</h2>
    
    <div class="grid-cols-2" style="margin-bottom:24px;">
      <div class="glass-card" style="height:300px; display:flex; flex-direction:column;">
        <h4 style="margin-bottom:20px;">Complaints Processed (Last 7 Days)</h4>
        <div style="flex:1; display:flex; align-items:flex-end; gap:16px; padding-bottom:10px; border-bottom:2px solid var(--border);">
          ${[45, 67, 23, 89, 120, 44, 79].map(val => `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
               <div style="width:100%; height:${val}px; background:linear-gradient(to top, var(--brand), #60A5FA); border-radius:4px 4px 0 0;"></div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:12px; color:var(--text-faint); font-size:10px; text-transform:uppercase;">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      <div class="glass-card" style="height:300px; display:flex; flex-direction:column;">
        <h4 style="margin-bottom:20px;">AI Precision vs Manual Audit</h4>
        <div style="flex:1; display:flex; align-items:flex-end; gap:16px; padding-bottom:10px; border-bottom:2px solid var(--border);">
          ${[92, 94, 89, 95, 97, 99, 98].map(val => `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
               <div style="width:100%; height:${val}px; background:linear-gradient(to top, var(--success), #34D399); border-radius:4px 4px 0 0;"></div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:12px; color:var(--text-faint); font-size:10px; text-transform:uppercase;">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
        </div>
      </div>
    </div>

    <!-- Extended chart suite (Chart.js powered) -->
    <div class="grid-cols-2" style="margin-bottom:24px;">
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Complaints Per Ward</h4>
        <div class="chart-wrap"><canvas id="chart-ward"></canvas></div>
      </div>
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Complaints Per Category</h4>
        <div class="chart-wrap"><canvas id="chart-category"></canvas></div>
      </div>
    </div>

    <div class="grid-cols-2" style="margin-bottom:24px;">
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Department Performance (Resolved vs Open)</h4>
        <div class="chart-wrap"><canvas id="chart-dept-perf"></canvas></div>
      </div>
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Officer Performance (Rating)</h4>
        <div class="chart-wrap"><canvas id="chart-officer-perf"></canvas></div>
      </div>
    </div>

    <div class="grid-cols-2">
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Citizen Participation (Monthly Active Reporters)</h4>
        <div class="chart-wrap"><canvas id="chart-participation"></canvas></div>
      </div>
      <div class="glass-card">
        <h4 style="margin-bottom:16px;">Monthly Complaint Trend</h4>
        <div class="chart-wrap"><canvas id="chart-monthly-trend"></canvas></div>
      </div>
    </div>
  `;
}

// Builds/rebuilds the Chart.js canvases on the Analytics page.
// Destroys previous instances first so re-navigating to this route never errors.
function initAnalyticsCharts() {
  if (typeof Chart === 'undefined') return;

  Object.keys(ChartInstances).forEach(key => { ChartInstances[key].destroy(); delete ChartInstances[key]; });

  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#E2E8F0';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748B';
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#2563EB';
  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Inter', sans-serif";

  // Complaints per ward (derived from live AppState.complaints)
  const wardCounts = {};
  AppState.complaints.forEach(c => { wardCounts[c.ward] = (wardCounts[c.ward] || 0) + 1; });
  const wardLabels = Object.keys(wardCounts).sort();
  ChartInstances.ward = new Chart(document.getElementById('chart-ward'), {
    type: 'bar',
    data: { labels: wardLabels.map(w => `Ward ${w}`), datasets: [{ label: 'Complaints', data: wardLabels.map(w => wardCounts[w]), backgroundColor: brand, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor }, beginAtZero: true, ticks: { precision: 0 } } } }
  });

  // Complaints per category
  const catCounts = {};
  AppState.complaints.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
  ChartInstances.category = new Chart(document.getElementById('chart-category'), {
    type: 'doughnut',
    data: { labels: Object.keys(catCounts), datasets: [{ data: Object.values(catCounts), backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } }
  });

  // Department performance
  ChartInstances.deptPerf = new Chart(document.getElementById('chart-dept-perf'), {
    type: 'bar',
    data: {
      labels: ['Sanitation', 'Roads & Infra', 'Water & Supply', 'Electricity'],
      datasets: [
        { label: 'Resolved', data: [890, 1205, 412, 156], backgroundColor: '#10B981', borderRadius: 6 },
        { label: 'Open', data: [142, 345, 89, 23], backgroundColor: '#EF4444', borderRadius: 6 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor }, beginAtZero: true } } }
  });

  // Officer performance
  ChartInstances.officerPerf = new Chart(document.getElementById('chart-officer-perf'), {
    type: 'bar',
    data: { labels: AppState.officers.map(o => o.name), datasets: [{ label: 'Rating', data: AppState.officers.map(o => o.rating), backgroundColor: '#F59E0B', borderRadius: 6 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, min: 0, max: 5 }, y: { grid: { display: false } } } }
  });

  // Citizen participation (mock monthly)
  ChartInstances.participation = new Chart(document.getElementById('chart-participation'), {
    type: 'line',
    data: { labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], datasets: [{ label: 'Active Reporters', data: [9.1, 10.4, 11.8, 13.2, 15.6, 18.2], borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)', fill: true, tension: 0.35 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor } } } }
  });

  // Monthly complaint trend
  ChartInstances.monthlyTrend = new Chart(document.getElementById('chart-monthly-trend'), {
    type: 'line',
    data: { labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], datasets: [{ label: 'Complaints', data: [820, 910, 875, 1040, 1120, 1248], borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.35 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor } } } }
  });
}

function renderSettings() {
  return `
    <h2 style="font-size:22px; margin-bottom:24px;">Platform Configuration</h2>
    
    <div class="grid-cols-2">
      <div class="glass-card">
        <h3 style="font-size:16px; margin-bottom:16px;"><i data-lucide="shield" style="width:18px; margin-right:8px; color:var(--brand);"></i> Role Management</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Configure access controls for field officers and admins.</p>
        
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="flex-between" style="padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-page);">
            <strong>Ward Officers (Level 1)</strong>
            <button class="badge" style="border:none; cursor:pointer;" onclick="alert('Configuration Editor Locked by SuperAdmin')">Edit Privileges</button>
          </div>
          <div class="flex-between" style="padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-page);">
            <strong>Department Heads (Level 2)</strong>
            <button class="badge" style="border:none; cursor:pointer;" onclick="alert('Configuration Editor Locked by SuperAdmin')">Edit Privileges</button>
          </div>
          <div class="flex-between" style="padding:12px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--bg-page);">
            <strong>System Analysts (Level 3)</strong>
            <button class="badge" style="border:none; cursor:pointer;" onclick="alert('Configuration Editor Locked by SuperAdmin')">Edit Privileges</button>
          </div>
        </div>
      </div>
      
      <div class="glass-card">
        <h3 style="font-size:16px; margin-bottom:16px;"><i data-lucide="cpu" style="width:18px; margin-right:8px; color:var(--danger);"></i> AI Hyperparameters</h3>
        <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">Adjust Nexus Core confidence thresholds globally.</p>
        
        <div style="display:flex; flex-direction:column; gap:20px;">
           <div>
             <div class="flex-between" style="font-size:12px; margin-bottom:8px;">
               <strong style="color:var(--text-main);">Duplicate Detection Confidence</strong>
               <span style="color:var(--brand); font-family:var(--font-mono);">95%</span>
             </div>
             <input type="range" min="50" max="100" value="95" style="width:100%; accent-color:var(--brand);">
           </div>
           <div>
             <div class="flex-between" style="font-size:12px; margin-bottom:8px;">
               <strong style="color:var(--text-main);">Auto-Escalation Threshold</strong>
               <span style="color:var(--danger); font-family:var(--font-mono);">85%</span>
             </div>
             <input type="range" min="50" max="100" value="85" style="width:100%; accent-color:var(--danger);">
           </div>
        </div>
      </div>
    </div>
  `;
}

// 5. App Initialization
function init() {
  setupEvents();
  Router.navigate(AppState.currentRoute);
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
