import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, Navigation, ShieldCheck, AlertCircle, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── CITIZEN TIMELINE STAGES ───
export const CITIZEN_STAGES = [
  { id: 'submitted', title: 'Complaint Submitted', desc: 'Report logged & geotag captured' },
  { id: 'received', title: 'Complaint Received', desc: 'Received & AI categorized' },
  { id: 'department_assigned', title: 'Department Assigned', desc: 'Assigned to specialized department' },
  { id: 'officer_assigned', title: 'Officer Assigned', desc: 'On-duty officer dispatched' },
  { id: 'officer_travelling', title: 'Officer Travelling', desc: 'Officer en route to location' },
  { id: 'work_in_progress', title: 'Work in Progress', desc: 'On-site repair & maintenance' },
  { id: 'resolved', title: 'Resolved', desc: 'Issue resolved & verified' }
];

// ─── OFFICER TIMELINE STAGES ───
export const OFFICER_STAGES = [
  { id: 'received', title: 'Complaint Received', desc: 'Dispatch order received' },
  { id: 'accepted', title: 'Accepted', desc: 'Officer accepted assignment' },
  { id: 'travelling', title: 'Travelling', desc: 'En route via GPS navigation' },
  { id: 'on_site', title: 'On-site', desc: 'Reached issue location' },
  { id: 'repair_in_progress', title: 'Repair in Progress', desc: 'Active repair work underway' },
  { id: 'completed', title: 'Completed', desc: 'Work completed & proof uploaded' }
];

// Status Mapping Helper
function getCurrentStageIndex(stages, currentStatus) {
  if (!currentStatus) return 0;
  const normalized = currentStatus.toLowerCase().replace(/[^a-z0-9]/g, '');

  let index = 0;
  stages.forEach((s, idx) => {
    const stageNorm = s.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const titleNorm = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (
      normalized.includes(stageNorm) || 
      normalized.includes(titleNorm) ||
      (s.id === 'resolved' && (normalized.includes('resolved') || normalized.includes('verified'))) ||
      (s.id === 'completed' && (normalized.includes('completed') || normalized.includes('resolved'))) ||
      (s.id === 'work_in_progress' && (normalized.includes('progress') || normalized.includes('repairing'))) ||
      (s.id === 'officer_travelling' && normalized.includes('travelling')) ||
      (s.id === 'officer_assigned' && normalized.includes('assigned'))
    ) {
      index = idx;
    }
  });

  return index;
}

export default function AnimatedTimeline({ 
  type = 'citizen', // 'citizen' or 'officer'
  currentStatus = 'Submitted',
  timelineData = [],
  className = '' 
}) {
  const stages = type === 'citizen' ? CITIZEN_STAGES : OFFICER_STAGES;
  const currentIdx = getCurrentStageIndex(stages, currentStatus);
  const isCompleted = currentIdx === stages.length - 1;

  // Trigger celebration confetti on resolution completion
  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isCompleted]);

  const progressPercentage = Math.round(((currentIdx + 1) / stages.length) * 100);

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      
      {/* Top Header & Animated Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-blue-500" />
            {type === 'citizen' ? 'Citizen 7-Stage Live Pipeline' : 'Officer 6-Stage Workflow Pipeline'}
          </span>
          <span className="text-blue-600 font-mono">{progressPercentage}% Completed</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Vertical Animated Steps */}
      <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
        {stages.map((stage, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const historyEntry = timelineData.find(
            t => t.step === stage.id || t.title?.toLowerCase() === stage.title.toLowerCase()
          );

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative group"
            >
              {/* Pulsing Ring Indicator */}
              <div
                className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDone
                    ? isCurrent
                      ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20 text-white shadow-lg'
                      : 'bg-emerald-500 border-emerald-300 text-white shadow-sm'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  isCurrent ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  ) : (
                    <Check size={11} className="stroke-[3]" />
                  )
                ) : (
                  <span className="text-[9px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Stage Card */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-1 ring-blue-400/30'
                    : isDone
                    ? 'bg-slate-50/70 border-slate-200 text-slate-800'
                    : 'bg-slate-50/30 border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className={isCurrent ? 'text-blue-900 font-extrabold' : isDone ? 'text-slate-900' : 'text-slate-400'}>
                    {stage.title}
                  </span>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-600 text-white animate-pulse">
                      Live Status
                    </span>
                  )}

                  {historyEntry?.timestamp && (
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      {historyEntry.timestamp}
                    </span>
                  )}
                </div>

                <p className={`text-[11px] mt-1 ${isCurrent ? 'text-blue-800 font-medium' : 'text-slate-500'}`}>
                  {historyEntry?.note || stage.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Success Celebration Banner */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-1 text-center"
          >
            <div className="text-2xl font-bold">🎉 Issue Successfully Resolved!</div>
            <p className="text-xs text-emerald-100">
              The repair has been completed by the on-duty field officer and verified on the master database.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
