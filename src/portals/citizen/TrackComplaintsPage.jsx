import { useState } from 'react';
import Topbar from '../../components/Topbar';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useComplaintStore from '../../store/complaintStore';
import AnimatedTimeline from '../../components/AnimatedTimeline';
import { 
  Building2, MapPin, Clock, ArrowRight, ClipboardList, CheckCircle2, 
  Award, Trophy, Gift, Zap, Check, AlertCircle, Navigation, ShieldCheck
} from 'lucide-react';

export default function TrackComplaintsPage() {
  const { 
    complaints, 
    verifyComplaintByCitizen, 
    karmaPoints, 
    karmaRank, 
    unlockedBadges, 
    availableVouchers 
  } = useComplaintStore();

  const [redeemedVoucher, setRedeemedVoucher] = useState(null);

  const handleVerify = async (ticketId, isSatisfied) => {
    await verifyComplaintByCitizen(ticketId, isSatisfied);
    if (isSatisfied) {
      alert('Thank you for verifying! Issue status updated to "Verified Resolved" for Admin & Officer. You earned +50 Civic Karma Points!');
    } else {
      alert('Issue re-dispatched to Officer.');
    }
  };

  return (
    <>
      <Topbar title="Track My Complaints & Karma Rewards" subtitle="Live 7-stage Framer Motion animated timeline connected to shared Xano DB" />

      <div className="p-6 space-y-6 font-sans">
        
        {/* CIVIC CITIZEN KARMA POINTS & COMMUNITY LEADERBOARD WIDGET */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xl shadow-md">
                🏆
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Civic Citizen Karma Rewards & Leaderboard</h3>
                <p className="text-xs text-blue-200">Earn Karma points for genuine hazard reports & verified resolutions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-2 rounded-xl border border-blue-700/50">
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-300">Your Karma Balance</div>
                <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
                  <Zap size={18} className="text-amber-400" /> {karmaPoints} pts
                </div>
              </div>
              <div className="pl-3 border-l border-slate-700">
                <div className="text-[10px] uppercase font-bold text-blue-300">Community Rank</div>
                <div className="text-xs font-extrabold text-emerald-400">{karmaRank}</div>
              </div>
            </div>
          </div>

          {/* Badges & Utility Tax Vouchers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <Award size={14} /> Unlocked Badges
              </div>
              <div className="flex flex-wrap gap-2">
                {unlockedBadges.map((b, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-700/60 text-xs font-semibold text-blue-200 shadow-xs">
                    {b.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <Gift size={14} /> Redeem Municipal Rebate Vouchers
              </div>
              <div className="flex flex-wrap gap-2">
                {availableVouchers.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (karmaPoints >= v.pointsCost) {
                        setRedeemedVoucher(v);
                      } else {
                        alert(`Need ${v.pointsCost} Karma points to redeem! (Current: ${karmaPoints})`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>{v.title}</span>
                    <span className="text-[10px] bg-emerald-950/60 px-1.5 py-0.2 rounded-md font-mono">{v.pointsCost} pts</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COMPLAINTS LIST WITH ANIMATED FRAMER MOTION 7-STAGE TIMELINE */}
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Active Citizen Complaints & Framer Motion Animated Timeline
          </h3>

          {complaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
              <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">No complaints logged yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {complaints.map((c) => {
                const id = c.complaint_id || c.id;
                const isPendingVerification = c.status === 'Pending Citizen Verification' || c.status === 'Resolved';
                const isVerifiedResolved = c.status === 'Verified Resolved';

                return (
                  <div
                    key={id}
                    className={`bg-white border rounded-2xl p-6 shadow-md space-y-6 transition-all ${
                      isPendingVerification ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.category}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isVerifiedResolved 
                            ? 'bg-emerald-600 text-white' 
                            : isPendingVerification ? 'bg-amber-500 text-white animate-pulse' : 'bg-blue-600 text-white'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:42 AM'}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div><strong>Department:</strong> {c.department_name || c.departmentName}</div>
                      <div><strong>Location:</strong> {c.location}</div>
                      <div><strong>Assigned Officer:</strong> <strong className="text-blue-600">{c.officer_name || c.assignedOfficerName || 'Assigned'}</strong></div>
                    </div>

                    {/* CITIZEN VERIFICATION PROMPT */}
                    {isPendingVerification && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/50 space-y-3">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <AlertCircle size={16} className="text-amber-600 shrink-0" />
                          <span>Officer marked repair completed! Confirm if issue is resolved to your satisfaction:</span>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleVerify(id, true)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Check size={14} /> YES, VERIFIED RESOLVED (+50 Karma Pts)
                          </button>
                          <button
                            onClick={() => handleVerify(id, false)}
                            className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs border border-rose-300"
                          >
                            NO, STILL BROKEN
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ANIMATED FRAMER MOTION 7-STAGE TIMELINE */}
                    <div className="pt-2">
                      <AnimatedTimeline
                        type="citizen"
                        currentStatus={c.status}
                        timelineData={c.timeline || []}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Voucher Redemption Modal */}
      {redeemedVoucher && (
        <Modal isOpen={!!redeemedVoucher} onClose={() => setRedeemedVoucher(null)} title="Rebate Voucher Code">
          <div className="space-y-4 text-center text-slate-800">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold text-2xl">
              🎟️
            </div>
            <h3 className="font-extrabold text-base text-slate-900">{redeemedVoucher.title}</h3>
            <p className="text-xs text-slate-500">Present this voucher code at municipal utility bill counter or online portal:</p>
            <div className="p-3 bg-slate-900 text-amber-400 font-mono font-black text-lg rounded-xl border border-slate-800 tracking-wider">
              {redeemedVoucher.code}
            </div>
            <Button onClick={() => setRedeemedVoucher(null)} className="w-full">
              Done
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
