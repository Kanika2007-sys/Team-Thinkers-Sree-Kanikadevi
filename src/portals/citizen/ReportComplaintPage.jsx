import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import useComplaintStore from '../../store/complaintStore';
import { DEFAULT_DEPARTMENTS } from '../../services/xanoService';
import geminiService from '../../services/geminiService';
import MapboxView from '../../components/MapboxView';
import { Send, MapPin, Sparkles, Zap, Camera, CheckCircle2 } from 'lucide-react';

export default function ReportComplaintPage() {
  const { user } = useAuthStore();
  const { addComplaint } = useComplaintStore();
  const navigate = useNavigate();

  const [selectedDept, setSelectedDept] = useState('DEPT-1');
  const [priority, setPriority] = useState('high');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [gpsLocation, setGpsLocation] = useState({ lat: '13.0850', lng: '80.2101' });
  const [locationName, setLocationName] = useState('7th Main Road, Anna Nagar, Chennai');
  const [submitting, setSubmitting] = useState(false);
  const [aiDetectedBadge, setAiDetectedBadge] = useState(null);

  // Gemini AI Auto-Classification on typing
  const handleDescriptionChange = async (e) => {
    const text = e.target.value;
    setDescription(text);

    if (text.length > 8) {
      const aiResult = await geminiService.categorizeAndScoreComplaint(text);
      setSelectedDept(aiResult.department_id);
      setPriority(aiResult.priority);
      setAiDetectedBadge(`🤖 Gemini AI: Auto-Assigned to ${aiResult.department_name} (${aiResult.vulnerability_score}/100 Risk Score)`);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter problem description');
      return;
    }
    setSubmitting(true);

    try {
      const deptObj = DEFAULT_DEPARTMENTS.find(d => String(d.id) === String(selectedDept)) || DEFAULT_DEPARTMENTS[0];

      const createdTicket = await addComplaint({
        citizen_id: user?.id ? `USR-CIT-${user.id}` : 'USR-CIT-101',
        citizen_name: user?.name || 'Priya Sharma',
        citizen_phone: user?.phone || '+91 98765 43210',
        department_id: selectedDept,
        department_name: deptObj.name,
        location: locationName,
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
        priority,
        category: deptObj.name + ' Issue',
        description,
        image_url: photoBase64
      });

      alert(`Success! Complaint #${createdTicket.complaint_id} submitted & saved to Xano database! You earned +20 Karma Points!`);
      navigate('/citizen/track');
    } catch (err) {
      alert('Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Report Civic Issue" subtitle="Gemini AI Auto-Classification & Mapbox GPS Location Capture" />

      <div className="p-6 max-w-3xl mx-auto font-sans">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-lg text-slate-800">
          
          {/* Gemini AI Auto-Detection Banner */}
          {aiDetectedBadge && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{aiDetectedBadge}</span>
              <span className="ml-auto text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-mono uppercase">96% CONFIDENCE</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. DEPARTMENT *</label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
              >
                {DEFAULT_DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.name} ({d.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">2. URGENCY LEVEL *</label>
              <select
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low (Standard SLA)</option>
                <option value="medium">Medium (Regular SLA)</option>
                <option value="high">High (Urgent Hazard)</option>
                <option value="critical">Critical (Immediate Outage)</option>
              </select>
            </div>
          </div>

          {/* Location Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">3. LOCATION ADDRESS *</label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
              placeholder="e.g. 7th Main Road, Anna Nagar, Chennai"
              required
            />
          </div>

          {/* MAPBOX INTERACTIVE GPS PICKER */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>4. MAPBOX GPS COORDINATES PICKER *</span>
              <span className="font-mono text-blue-600 text-[11px]">Lat: {gpsLocation.lat}, Lng: {gpsLocation.lng}</span>
            </label>
            <MapboxView
              mode="picker"
              origin={[parseFloat(gpsLocation.lat), parseFloat(gpsLocation.lng)]}
              onLocationSelect={(coords) => setGpsLocation(coords)}
              theme="light"
              height="220px"
            />
          </div>

          {/* Problem Description with Gemini Listener */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">5. PROBLEM DESCRIPTION * (Gemini AI Listens Live)</label>
            <textarea
              className="w-full h-28 p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe issue (e.g. 'Transformer sparking on 7th Main Road near school' or 'Main water pipe line burst')..."
              value={description}
              onChange={handleDescriptionChange}
              required
            />
          </div>

          {/* Upload Image Evidence */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">6. UPLOAD IMAGE EVIDENCE</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {photoBase64 && (
              <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={photoBase64} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Zap size={14} /> Earn +20 Civic Karma Points on submission
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={() => navigate('/citizen')}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting to Xano...' : 'Submit & Store in Xano'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
