import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  User, Zap, MapPin, Navigation, Check, Eye, CheckCircle, Flame, Clock, 
  Sparkles, Send, ShieldAlert, Mic, AlertCircle, Camera, Activity, CheckCircle2, 
  Play, AlertTriangle, ShieldCheck, Sun, Moon, Siren, Power, Upload, Search, Download, ExternalLink, Sliders, Volume2, Bell
} from 'lucide-react';

import useAuthStore from '../../store/authStore';
import useComplaintStore from '../../store/complaintStore';
import AnimatedTimeline from '../../components/AnimatedTimeline';
import MapboxView from '../../components/MapboxView';
import ComplaintModal from '../../components/ComplaintModal';
import SosModal from '../../components/SosModal';
import geminiService from '../../services/geminiService';
import mapboxService from '../../services/mapboxService';

export default function OfficerDashboard() {
  const outletContext = useOutletContext();
  const activeView = outletContext?.activeView || 'dashboard';

  const { user, updateUserDepartment } = useAuthStore();
  const { complaints, updateComplaintStatus, toggleOfficerDutyState } = useComplaintStore();

  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  // Officer Duty State (On Duty vs Off Duty)
  const [isOnDuty, setIsOnDuty] = useState(user?.on_duty !== undefined ? user.on_duty : true);

  // Modals state
  const [detailsModalTicket, setDetailsModalTicket] = useState(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const officerName = user?.name || 'Officer Swahan';
  const officerId = user?.id ? `CIV-OFF-${user.id}` : 'CIV-OFF-9361';
  const officerDeptId = String(user?.department_id || user?.departmentId || 'DEPT-1');
  const officerDeptName = user?.department || user?.departmentName || 'Electricity Department';

  const deptIcon = officerDeptName.includes('Water') ? '💧' : officerDeptName.includes('Road') ? '🛣️' : officerDeptName.includes('Waste') ? '🗑️' : officerDeptName.includes('Health') ? '🏥' : '⚡';

  // Filter Complaints STRICTLY for officer's specific department
  const deptComplaints = complaints.filter(c => {
    const cDeptId = String(c.department_id || '');
    const cDeptName = (c.department_name || c.departmentName || '').toLowerCase();
    const myDeptName = officerDeptName.toLowerCase();

    if (cDeptId === officerDeptId) return true;
    if (cDeptName && myDeptName && (cDeptName.includes(myDeptName) || myDeptName.includes(cDeptName))) return true;
    if (officerDeptId === 'DEPT-2' && (cDeptId === '2' || cDeptName.includes('water'))) return true;
    if (officerDeptId === 'DEPT-1' && (cDeptId === '1' || cDeptName.includes('electric'))) return true;
    return false;
  });

  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${officerName}! I am Gemini Field AI. Real-time telemetry analyzed for ${officerDeptName}. On-duty dispatch system active.`,
      time: '10:44 AM'
    }
  ]);

  // Set default selected ticket
  useEffect(() => {
    if (deptComplaints.length > 0 && !selectedTicketId) {
      setSelectedTicketId(deptComplaints[0].complaint_id || deptComplaints[0].id);
    }
  }, [deptComplaints]);

  const activeTicket = deptComplaints.find(
    c => c.complaint_id === selectedTicketId || c.id === selectedTicketId
  ) || deptComplaints[0] || {
    complaint_id: 'CMP-2026-891',
    category: 'Transformer Overload Outage',
    location: '7th Main Road, Anna Nagar, Chennai',
    latitude: '13.0850',
    longitude: '80.2101',
    priority: 'critical',
    vulnerability_score: 96,
    status: 'Complaint Received',
    citizen_name: 'Priya Sharma',
    timeline: []
  };

  // Toggle Duty State
  const handleDutyToggle = async () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    await toggleOfficerDutyState(officerName, nextState);
    if (nextState) {
      alert(`Duty State: ${officerName} is now ON DUTY. Dispatches enabled.`);
    } else {
      alert(`Duty State: ${officerName} is now OFF DUTY.`);
    }
  };

  // Officer Actions
  const handleAccept = async (ticketId) => {
    await updateComplaintStatus(ticketId, 'Accepted', {
      officer_id: officerId,
      officer_name: officerName,
      note: `Dispatch accepted by ${officerName}`
    });
  };

  const handleStartTravel = async (ticketId) => {
    await updateComplaintStatus(ticketId, 'Officer Travelling', {
      officer_id: officerId,
      officer_name: officerName,
      note: 'Officer en route via Mapbox navigation'
    });
  };

  const handleReachOnSite = async (ticketId) => {
    await updateComplaintStatus(ticketId, 'On-site', {
      note: `Officer ${officerName} reached site`
    });
  };

  const handleStartRepair = async (ticketId) => {
    await updateComplaintStatus(ticketId, 'Repair in Progress', {
      note: 'Technical repair and maintenance underway'
    });
  };

  const handleResolveTicket = async (ticketId) => {
    if (!proofImage) {
      alert('Please attach repair proof image evidence before resolving!');
      return;
    }
    await updateComplaintStatus(ticketId, 'Resolved', {
      proof_image_url: proofImage,
      note: 'Issue repair complete and proof uploaded'
    });
    alert(`Success! Complaint #${ticketId} status updated to Resolved & notification sent to citizen.`);
  };

  const handleNavigateGoogleMaps = (complaintObj) => {
    const lat = parseFloat(complaintObj.latitude || complaintObj.gps?.[0] || 13.0850);
    const lng = parseFloat(complaintObj.longitude || complaintObj.gps?.[1] || 80.2101);
    const url = mapboxService.getGoogleMapsUrl(13.0827, 80.2707, lat, lng);
    window.open(url, '_blank');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAiSend = async () => {
    if (!aiQuery.trim()) return;
    const text = aiQuery;
    setChatMessages(prev => [...prev, { sender: 'user', text, time: 'Now' }]);
    setAiQuery('');

    const respText = await geminiService.getFieldAssistantResponse(text, activeTicket);
    setChatMessages(prev => [...prev, { sender: 'bot', text: respText, time: 'Now' }]);
  };

  const ticketLat = parseFloat(activeTicket.latitude || 13.0850);
  const ticketLng = parseFloat(activeTicket.longitude || 80.2101);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ── TOP HEADER WITH DUTY TOGGLE & SOS ── */}
      <header className={`sticky top-0 z-30 px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'bg-[#0b0f19]/95 border-slate-800 backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
            {deptIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{officerName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">{officerId}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Department:</span>
              <select
                value={officerDeptId}
                onChange={(e) => updateUserDepartment(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-blue-400 font-bold px-2 py-0.5 rounded text-xs focus:outline-none cursor-pointer"
              >
                <option value="DEPT-1">⚡ Electricity Department</option>
                <option value="DEPT-2">💧 Water Supply & Sewerage Board</option>
                <option value="DEPT-3">🛣️ Roads & Infrastructure</option>
                <option value="DEPT-4">🗑️ Solid Waste Management</option>
                <option value="DEPT-5">🏥 Public Health & Sanitation</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSosOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 animate-pulse"
          >
            <Siren size={15} /> EMERGENCY SOS
          </button>

          <button
            onClick={handleDutyToggle}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-md transition-all ${
              isOnDuty 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/40' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            <Power size={14} />
            <span>STATE: {isOnDuty ? '🟢 ON DUTY' : '🔴 OFF DUTY'}</span>
          </button>

          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* OFF DUTY BANNER */}
      {!isOnDuty && (
        <div className="p-4 bg-amber-500/20 border-b border-amber-500/40 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>Officer is currently OFF DUTY. Switch state to ON DUTY at the top header to receive live dispatches.</span>
        </div>
      )}

      {/* ── MAIN CONTENT AREA WITH SIDEBAR VIEW SWITCHING ── */}
      <main className="p-6 space-y-6">

        {/* 1. DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">

            {/* DISPATCHES FEED COLUMN */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {officerDeptName} Dispatches ({deptComplaints.length})
                </h3>
                <span className="text-xs font-mono text-emerald-400">
                  {isOnDuty ? '● Live Receiver Active' : '○ Standby'}
                </span>
              </div>

              {deptComplaints.length === 0 ? (
                <div className={`p-8 rounded-2xl border text-center text-xs text-slate-400 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                  No active dispatches for {officerDeptName}.
                </div>
              ) : (
                <div className="space-y-4">
                  {deptComplaints.map(c => {
                    const cid = c.complaint_id || c.id;
                    const isSelected = cid === (activeTicket.complaint_id || activeTicket.id);
                    const isResolved = c.status === 'Resolved' || c.status === 'Verified Resolved';
                    const score = c.vulnerability_score || c.vulnerabilityScore || 96;

                    return (
                      <div
                        key={cid}
                        onClick={() => setSelectedTicketId(cid)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                          isDark 
                            ? isSelected ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30' : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                            : isSelected ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                              {cid}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              ⚡ {c.department_name || officerDeptName}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            c.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {c.priority || 'CRITICAL'}
                          </span>
                        </div>

                        {/* AI Vulnerability Score Chip */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-950/40 border border-red-900/50 text-red-300">
                          <Flame size={13} className="text-red-500" />
                          <span>AI Vulnerability Score: <strong className="text-red-400 font-extrabold">{score}/100</strong></span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                          <div className="truncate"><User size={13} className="inline mr-1 text-slate-400" /> <strong>{c.citizen_name || c.citizenName || 'Priya Sharma'}</strong></div>
                          <div className="truncate"><Zap size={13} className="inline mr-1 text-amber-500" /> <span>{c.category}</span></div>
                          <div className="truncate"><MapPin size={13} className="inline mr-1 text-rose-500" /> <span>{c.location}</span></div>
                          <div className="truncate"><Navigation size={13} className="inline mr-1 text-blue-400" /> <span>{c.distance || '1.2 km away'}</span></div>
                        </div>

                        {/* Card Actions: Accept, Navigate, Details */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          {isResolved ? (
                            <button disabled className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1">
                              <CheckCircle size={14} /> Resolved
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAccept(cid); }}
                                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Check size={13} /> Accept
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); handleNavigateGoogleMaps(c); }}
                                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Navigation size={13} /> Navigate
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); setDetailsModalTicket(c); }}
                                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1"
                              >
                                <Eye size={13} /> Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* WORKFLOW CONTROLLER, MAPBOX & TIMELINE COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className={`p-6 rounded-2xl border space-y-5 shadow-xl ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Active Dispatch Target</span>
                    <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeTicket.complaint_id || activeTicket.id} - {activeTicket.category}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {activeTicket.status}
                  </span>
                </div>

                {/* Workflow Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button onClick={() => handleAccept(activeTicket.complaint_id || activeTicket.id)} className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1">
                    1. Accept
                  </button>
                  <button onClick={() => handleStartTravel(activeTicket.complaint_id || activeTicket.id)} className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1">
                    2. Travelling
                  </button>
                  <button onClick={() => handleReachOnSite(activeTicket.complaint_id || activeTicket.id)} className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1">
                    3. On-site
                  </button>
                  <button onClick={() => handleStartRepair(activeTicket.complaint_id || activeTicket.id)} className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1">
                    4. Repairing
                  </button>
                </div>

                {/* Proof Image Upload & Resolution */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Upload Repair Completion Proof Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                  {proofImage && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-emerald-500">
                      <img src={proofImage} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    onClick={() => handleResolveTicket(activeTicket.complaint_id || activeTicket.id)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Mark Issue Resolved & Notify Citizen
                  </button>
                </div>
              </div>

              {/* MAPBOX ROUTE & NAVIGATION */}
              <div className={`p-5 rounded-2xl border space-y-3 shadow-xl ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5"><Navigation size={14} className="text-blue-500" /> Mapbox Navigation Route</span>
                  <span className="text-slate-400 font-mono">Target GPS: {ticketLat.toFixed(4)}, {ticketLng.toFixed(4)}</span>
                </div>
                <MapboxView
                  mode="navigation"
                  origin={[13.0827, 80.2707]}
                  destination={[ticketLat, ticketLng]}
                  theme={theme}
                  height="220px"
                />
              </div>

              {/* ANIMATED TIMELINE */}
              <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <AnimatedTimeline
                  type="officer"
                  currentStatus={activeTicket.status}
                  timelineData={activeTicket.timeline || []}
                />
              </div>

              {/* GEMINI ASSISTANT */}
              <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                  <span className="font-extrabold text-xs flex items-center gap-1.5 text-purple-400">
                    <Sparkles size={14} /> Gemini Smart Field Assistant
                  </span>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-mono">AI Active</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`p-3 rounded-xl ${m.sender === 'bot' ? 'bg-slate-900 text-slate-200 border border-slate-800' : 'bg-blue-600 text-white ml-auto max-w-[80%]'}`}>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask Gemini AI for route or repair recommendations..."
                    className="flex-1 h-9 px-3 rounded-xl border border-slate-700 bg-slate-900 text-xs text-white focus:outline-none"
                  />
                  <button onClick={handleAiSend} className="h-9 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs">
                    <Send size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. ASSIGNED TASKS VIEW */}
        {activeView === 'tasks' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Assigned Complaints & Field Tasks Console</h2>
                <p className="text-xs text-slate-400">Manage, search, export reports, and transition task statuses</p>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`}>
                  <Search size={14} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search complaint ID, citizen..." 
                    value={taskSearch} 
                    onChange={(e) => setTaskSearch(e.target.value)} 
                    className="bg-transparent focus:outline-none text-xs w-48" 
                  />
                </div>
                <button 
                  onClick={() => alert('Exporting complaint field report CSV...')} 
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  <Download size={14} /> Export Report
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className={`border-b text-[11px] uppercase font-bold ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="py-3 px-3">Complaint ID</th>
                      <th className="py-3 px-3">Citizen</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {deptComplaints.filter(c => 
                      !taskSearch || 
                      (c.complaint_id || c.id || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
                      (c.citizen_name || c.citizenName || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
                      (c.location || '').toLowerCase().includes(taskSearch.toLowerCase())
                    ).map(c => {
                      const cid = c.complaint_id || c.id;
                      return (
                        <tr key={cid} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 font-mono font-bold text-blue-400">#{cid}</td>
                          <td className="py-3 px-3 font-medium text-white">{c.citizen_name || c.citizenName || 'Priya Sharma'}</td>
                          <td className="py-3 px-3 text-slate-300">{c.category}</td>
                          <td className="py-3 px-3 text-slate-400">{c.location}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${c.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-400">{c.status}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setDetailsModalTicket(c)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye size={13} /> View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. LIVE MAP VIEW */}
        {activeView === 'map' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Interactive Geospatial Field Map</h2>
              <p className="text-xs text-slate-400">Live complaint locations & active dispatch targets</p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <MapboxView
                mode="heatmap"
                complaints={deptComplaints}
                theme={theme}
                height="520px"
              />
            </div>
          </div>
        )}

        {/* 4. NAVIGATION VIEW */}
        {activeView === 'navigation' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Turn-by-Turn Navigation Console</h2>
              <p className="text-xs text-slate-400">Mapbox & Google Maps route optimization to active hazard dispatch</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Current Officer Position</label>
                  <input type="text" readOnly value="Chennai Central (13.0827° N, 80.2707° E)" className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 font-bold" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Dispatch Destination</label>
                  <input type="text" readOnly value={activeTicket.location} className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold" />
                </div>
              </div>

              <MapboxView
                mode="navigation"
                origin={[13.0827, 80.2707]}
                destination={[ticketLat, ticketLng]}
                theme={theme}
                height="280px"
              />

              <button 
                onClick={() => handleNavigateGoogleMaps(activeTicket)} 
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Navigation size={16} /> Launch Turn-by-Turn Navigation in Google Maps
              </button>
            </div>
          </div>
        )}

        {/* 5. ANALYTICS VIEW */}
        {activeView === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Field Resolution Analytics</h2>
              <p className="text-xs text-slate-400">Historical performance metrics and SLA compliance reports</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400">MONTHLY RESOLUTION RATE</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">94.8%</div>
                <div className="text-xs text-slate-400 mt-1">+3.2% vs previous month</div>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400">AVG REPAIR DURATION</div>
                <div className="text-3xl font-black text-blue-400 mt-2">24.5 mins</div>
                <div className="text-xs text-slate-400 mt-1">Target: &lt; 30 mins</div>
              </div>
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="text-xs font-bold text-slate-400">CITIZEN SATISFACTION</div>
                <div className="text-3xl font-black text-amber-400 mt-2">4.9 / 5.0</div>
                <div className="text-xs text-slate-400 mt-1">Based on verified reviews</div>
              </div>
            </div>
          </div>
        )}

        {/* 6. PERFORMANCE VIEW */}
        {activeView === 'performance' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Officer Performance Leaderboard</h2>
              <p className="text-xs text-slate-400">Chennai District field officer efficiency rankings</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              {[
                { rank: 1, name: `${officerName} (You)`, dept: officerDeptName, score: '98/100', tasks: 18, sla: '94%' },
                { rank: 2, name: 'Officer Rajesh V.', dept: 'Water Supply Board', score: '96/100', tasks: 16, sla: '92%' },
                { rank: 3, name: 'Officer Ananya S.', dept: 'Roads & Infrastructure', score: '94/100', tasks: 14, sla: '90%' }
              ].map(o => (
                <div key={o.rank} className={`p-4 rounded-xl border flex items-center justify-between ${o.rank === 1 ? 'bg-blue-600/10 border-blue-500/40 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      #{o.rank}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{o.name}</div>
                      <div className="text-[11px] text-slate-400">{o.dept}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span>Tasks: <strong>{o.tasks}</strong></span>
                    <span>SLA: <strong className="text-emerald-400">{o.sla}</strong></span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold">{o.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SETTINGS VIEW */}
        {activeView === 'settings' && (
          <div className="space-y-6 max-w-2xl animate-fadeIn">
            <div>
              <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Officer Dashboard Settings</h2>
              <p className="text-xs text-slate-400 font-medium">Configure audio cues, route optimization, and push alerts</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-5 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Sound Effects & Voice Feedback</div>
                  <div className="text-xs text-slate-400">Play audio cues when new emergency dispatch is received</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
              </div>
              <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                <div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Auto Route Optimization</div>
                  <div className="text-xs text-slate-400">Re-calculate route automatically based on live congestion</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>High Priority Push Alerts</div>
                  <div className="text-xs text-slate-400">Receive popups for critical grid outages</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700" />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* COMPLAINT DETAILS MODAL */}
      <ComplaintModal
        isOpen={!!detailsModalTicket}
        onClose={() => setDetailsModalTicket(null)}
        complaint={detailsModalTicket}
      />

      {/* SOS EMERGENCY MODAL */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
      />

    </div>
  );
}
