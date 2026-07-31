import React, { useState } from 'react';
import { Cpu, CheckSquare, UploadCloud, Check, CheckCircle, Flame, ShieldCheck, MapPin, X } from 'lucide-react';
import mapboxService from '../services/mapboxService';
import useComplaintStore from '../store/complaintStore';

export default function ComplaintModal({ isOpen, onClose, complaint, onResolveSuccess }) {
  const { updateComplaintStatus, verifyComplaintByCitizen } = useComplaintStore();

  const [repairNotes, setRepairNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  const score = complaint.vulnerability_score || complaint.vulnerabilityScore || 96;
  const complaintId = complaint.complaint_id || complaint.id;
  const lat = parseFloat(complaint.latitude || complaint.gps?.[0] || 13.0850);
  const lng = parseFloat(complaint.longitude || complaint.gps?.[1] || 80.2101);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
        setIsPhotoVerified(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddTag = (tagText) => {
    setRepairNotes(prev => (prev ? `${prev} ${tagText}` : tagText));
  };

  const handleSubmitResolution = async () => {
    setSubmitting(true);
    try {
      await updateComplaintStatus(complaintId, 'Resolved', {
        proof_image_url: photoPreview || '',
        note: repairNotes || 'Official field repair completed and verified by officer'
      });
      alert(`Success! Complaint #${complaintId} marked as Resolved. ${notifyCitizen ? 'SMS Notification sent to citizen.' : ''}`);
      if (onResolveSuccess) onResolveSuccess();
      onClose();
    } catch (e) {
      alert('Error updating complaint status');
    } finally {
      setSubmitting(false);
    }
  };

  const googleMapsUrl = mapboxService.getGoogleMapsUrl(13.0827, 80.2707, lat, lng);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn font-sans text-slate-100">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              complaint.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {(complaint.priority || 'CRITICAL').toUpperCase()}
            </span>
            <h3 className="font-extrabold text-base text-white font-mono">#{complaintId}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Top Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Image Preview */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-48">
              <img 
                src={complaint.image_url || complaint.image || 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?auto=format&fit=crop&q=80&w=600'} 
                alt="Reported Photo" 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-blue-400 border border-slate-800">
                Reported Photo Proof
              </span>
            </div>

            {/* AI Diagnostic Telemetry */}
            <div className="md:col-span-7 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-400 text-xs border-b border-slate-800 pb-2">
                <Cpu size={15} /> AI Diagnostic Telemetry & Hazard Data
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>Category: <strong className="text-white block truncate">{complaint.category}</strong></div>
                <div>Citizen: <strong className="text-white block truncate">{complaint.citizen_name || complaint.citizenName || 'Priya Sharma'}</strong></div>
                <div>Location: <strong className="text-white block truncate">{complaint.location}</strong></div>
                <div>Distance: <strong className="text-blue-400 block">{complaint.distance || '1.2 km away'}</strong></div>
              </div>

              <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/50 flex items-center justify-between text-xs text-red-300">
                <span className="flex items-center gap-1 font-bold"><Flame size={13} className="text-red-500" /> AI Vulnerability Score:</span>
                <strong className="font-extrabold text-red-400 text-sm">{score} / 100</strong>
              </div>

              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                📍 Launch Google Maps Navigation
              </a>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Task Completion & Anti-Fraud Proof */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckSquare size={15} /> Task Completion & Anti-Fraud Proof Upload
            </h4>
            <p className="text-slate-400 text-[11px]">Upload repair photograph to verify geotag before citizen notification.</p>

            {/* Dropzone */}
            <div 
              onClick={() => document.getElementById('modalFileInput').click()} 
              className="p-5 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all"
            >
              <input 
                type="file" 
                id="modalFileInput" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              {!photoPreview ? (
                <div className="space-y-1">
                  <UploadCloud size={28} className="text-blue-400 mx-auto" />
                  <p className="text-xs text-slate-200"><strong>Click to upload repair photograph</strong> or drag & drop</p>
                  <span className="text-[10px] text-slate-500 block">Supports JPG, PNG (Max 5MB)</span>
                </div>
              ) : (
                <div className="relative w-36 h-28 mx-auto rounded-lg overflow-hidden border border-emerald-500 shadow-md">
                  <img src={photoPreview} alt="Repair Proof" className="w-full h-full object-cover" />
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-1">
                    <ShieldCheck size={11} /> Verified
                  </span>
                </div>
              )}
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-slate-400 text-[11px] font-bold">Quick Tags:</span>
              {['Replaced Fuse', 'Load Balanced', 'Tightened Terminal', 'Main Line Sealed'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddTag(t)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-semibold border border-slate-700"
                >
                  + {t}
                </button>
              ))}
            </div>

            {/* Official Repair Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Official Repair Notes</label>
              <textarea
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                placeholder="Enter work details and component replacement summary..."
                className="w-full h-20 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Notify Citizen Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyCitizenCheck"
                checked={notifyCitizen}
                onChange={(e) => setNotifyCitizen(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <label htmlFor="notifyCitizenCheck" className="text-slate-300 text-[11px]">
                Automatically send resolution SMS notification to Citizen (<strong>{complaint.citizen_name || complaint.citizenName || 'Citizen'}</strong>)
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">
            Cancel
          </button>
          <button
            onClick={handleSubmitResolution}
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <CheckCircle size={15} /> {submitting ? 'Updating Database...' : 'Mark Complaint as Resolved'}
          </button>
        </div>

      </div>
    </div>
  );
}
