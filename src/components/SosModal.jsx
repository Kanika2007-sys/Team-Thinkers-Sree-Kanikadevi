import React from 'react';
import { Siren, PhoneCall, ShieldAlert, X, AlertTriangle, Radio } from 'lucide-react';

export default function SosModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fadeIn font-sans text-white">
      <div className="bg-[#0f172a] border-2 border-red-600 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900">
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto animate-pulse">
            <Siren size={36} />
          </div>
          <h3 className="font-black text-xl text-white tracking-tight">EMERGENCY SOS DISPATCH</h3>
          <p className="text-xs text-red-300">Live GPS beacon broadcasting emergency hazard alert to Central Control Room.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono font-bold text-red-400">
            <span className="flex items-center gap-1"><Radio size={13} className="animate-ping" /> GPS Beacon Live</span>
            <span>13.0827° N, 80.2707° E</span>
          </div>
          <p className="text-[11px] text-slate-400">Emergency signal dispatched to Zone 4 Command Unit & Police Dispatch.</p>
        </div>

        <div className="space-y-2">
          <a 
            href="tel:112" 
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
          >
            <PhoneCall size={16} /> Direct Call Central Control (112 / 100)
          </a>
          <button 
            onClick={() => {
              alert('Backup field unit request sent to nearest available officers!');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
          >
            Request Backup Field Team Dispatch
          </button>
        </div>

      </div>
    </div>
  );
}
