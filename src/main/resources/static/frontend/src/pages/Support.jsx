import React from 'react';
import { Mail, Phone, User, HelpCircle, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Support() {
  const { coordinators } = useNotifications();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8 text-slate-100 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2.5 font-heading">
          <HelpCircle className="w-6 h-6 text-sky-400" />
          <span>Support & Help Desk</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Get in touch with the symposium committee coordinators or read our FAQs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Span 2: Committee Contacts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Symposium Committee Coordinators</h2>
            
            {!coordinators ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-6 w-6 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : coordinators.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No coordinators configured yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coordinators.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-start space-x-3 hover:border-slate-800 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center font-bold text-sky-400 font-mono text-sm shadow-inner flex-shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-200 truncate">{c.name}</h3>
                      <p className="text-[9px] font-black text-sky-400/90 uppercase tracking-widest">{c.role}</p>
                      
                      <div className="pt-2 space-y-1 text-[10px] text-slate-400 font-medium">
                        <a href={`mailto:${c.email}`} className="flex items-center space-x-1.5 hover:text-sky-400 transition-colors">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="truncate">{c.email}</span>
                        </a>
                        <a href={`tel:${c.phone}`} className="flex items-center space-x-1.5 hover:text-sky-400 transition-colors">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.phone}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ */}
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-200">How do I access my event timetables or guidelines?</h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Go to "My Registrations" on the sidebar menu. For every approved registration, you will see download links for guidelines and timetable schedules.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-200">Where can I see my allotted laboratory / venue?</h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Once the administrators review and approve your registration payment status, laboratory and computer allotments will show up directly inside the "My Registrations" ledger.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-1.5">
                <h3 className="text-xs font-bold text-slate-200">My payment is completed but status shows pending. What should I do?</h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Payments are verified manually by college coordinators. It typically takes 12-24 hours. If it remains pending longer, reach out to the Student Coordinator listed above with your UTR code.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Support Notice */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Important Note</span>
            </h2>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Please preserve your payment transaction screenshots and UTR transaction numbers securely. In case of payment disputes or verification mismatches, the college accounts audit team will require visual evidence and transactional records.
            </p>
            <div className="pt-2">
              <span className="text-[8px] font-black uppercase text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded">
                Accounts Hotline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
