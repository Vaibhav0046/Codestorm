import React, { useState } from 'react';
import { X, Phone, User, ShieldAlert, Award, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const { coordinators } = useNotifications();

  return (
    <>
      <footer className="h-14 glass-effect border-t border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500 z-30">
        <p>© {new Date().getFullYear()} CDC - Career Development Centre. All Rights Reserved.</p>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowModal(true)} 
            className="hover:text-sky-400 transition-colors cursor-pointer bg-transparent border-none outline-none p-0 flex items-center space-x-1"
          >
            <span>Support Desk</span>
          </button>
          <span>•</span>
          <button 
            onClick={() => setShowRulesModal(true)} 
            className="hover:text-sky-400 transition-colors cursor-pointer bg-transparent border-none outline-none p-0 flex items-center space-x-1"
          >
            <span>Symposium Rules</span>
          </button>
        </div>
      </footer>

      {/* Support Desk Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white flex items-center space-x-2 font-heading mb-5 pb-2 border-b border-white/5">
              <ShieldAlert className="w-5 h-5 text-sky-400 animate-pulse" />
              <span>NRCM Help & Support Desk</span>
            </h3>

            <div className="space-y-4">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                For any issues regarding registrations, lab assignments, UPI payment validation, or timetable plans, please contact coordinators:
              </p>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {coordinators && coordinators.length > 0 ? (
                  coordinators.map((c) => (
                    <div key={c.id} className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-200 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-sky-400 mr-1" />
                          {c.name}
                        </span>
                        <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wider">{c.role}</span>
                      </div>
                      <p className="text-slate-400 font-semibold flex items-center mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500 mr-1" />
                        <span>{c.phone}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 text-center py-2">No coordinators available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symposium Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl relative text-slate-200 max-h-[90vh] overflow-y-auto pr-2">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white flex items-center space-x-2 font-heading mb-5 pb-2 border-b border-white/5">
              <Award className="w-5 h-5 text-yellow-500 animate-float-slow" />
              <span>NRCM Symposium & Hackathon Rules</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">1. Gate Eligibility & ID Verification</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                      All registered participants must produce their official college ID cards alongside their generated Admit Pass at the gate to gain entry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-white/5 pt-3">
                  <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">2. Real-time Live Presentation Timings</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                      PPT Presentation is strictly limited to 7 minutes + 3 minutes Q&A. The Ignite talk runs on a mandatory 5-minute auto-advance timer.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-white/5 pt-3">
                  <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">3. Live Project Expo & Concurrency</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                      Software/Hardware prototypes must be actively demonstrated live on the assigned lab bench. Plagiarized or pre-built commercial kits yield instant ban.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-white/5 pt-3">
                  <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">4. Payment Audit & Transaction Integrity</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-medium">
                      Providing a false or recycled 12-digit UTR reference number or altered screenshot results in an immediate ban from all future CDC events.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Decisions made by the NRCM Campus Technical Committee and Judges Board are final, absolute, and non-negotiable. Roster allotments are automatically governed based on seats.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
