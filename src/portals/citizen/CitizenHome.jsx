import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useAuthStore from '../../store/authStore';
import useComplaintStore from '../../store/complaintStore';
import { DEFAULT_DEPARTMENTS } from '../../services/xanoService';
import { Building2, Settings, ArrowRight, ShieldCheck, FilePlus, Search, Trophy, Zap, Award, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CitizenHome() {
  const { user } = useAuthStore();
  const { karmaPoints, karmaRank, unlockedBadges, availableVouchers } = useComplaintStore();

  const citizenName = user?.name || 'Priya Sharma';

  return (
    <>
      <Topbar
        title="Citizen Services Portal"
        subtitle="Official Municipal ERP & Public Operations Platform"
      />
      <div className="p-6 space-y-6 font-sans">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-7 text-white shadow-xl animate-fadeIn">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official Citizen Operations Hub
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Welcome back, {citizenName}!
            </h2>
            <p className="text-blue-100 text-xs max-w-2xl leading-relaxed">
              Report civic issues directly to municipal departments. Capture geotagged photos and GPS coordinates, track live resolution timelines powered by Gemini AI auto-classification, and earn Citizen Karma Rewards.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <FilePlus size={16} /> Report New Issue
              </Link>
              <Link
                to="/citizen/track"
                className="inline-flex items-center gap-2 bg-blue-950/80 hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all border border-blue-700/60"
              >
                <Search size={16} /> Track My Issues & Timeline
              </Link>
            </div>
          </div>
        </div>

        {/* Citizen Karma & Badges Summary */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-2xl">
              ⚡
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Karma Balance</div>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                <Zap size={20} /> {karmaPoints} Pts
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl">
              🏆
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Community Rank</div>
              <div className="text-sm font-extrabold text-emerald-600">{karmaRank}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl">
              🎖️
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Unlocked Badges</div>
              <div className="text-xs font-bold text-purple-700">{unlockedBadges.length} Active Badges</div>
            </div>
          </div>
        </div>

        {/* Municipal Departments Grid */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Active Municipal Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFAULT_DEPARTMENTS.map((dept) => (
              <div key={dept.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{dept.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {dept.zone}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500">Official Municipal Department responding to citizen dispatch tickets.</p>
                <Link
                  to="/citizen/report"
                  className="block w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-center text-xs font-bold transition-all"
                >
                  File Complaint to {dept.name.split(' ')[0]}
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
