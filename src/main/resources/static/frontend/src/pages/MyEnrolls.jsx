import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { 
  CheckCircle2, Ticket, FileDown, Calendar, MapPin, 
  BookOpen, Download, HelpCircle, Layers, ArrowRight, Award
} from 'lucide-react';

export default function MyEnrolls() {
  const { user } = useAuth();
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch registrations
  useEffect(() => {
    const fetchEnrolls = async () => {
      try {
        const res = await api.get('/api/registrations/my');
        setMyRegistrations(res.data);
      } catch (err) {
        console.error('Error fetching enrolls:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolls();
  }, []);

  const handleDownloadAdmitPass = async (regId, eventName) => {
    try {
      const response = await api.get(`/api/registrations/${regId}/certificate`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Admit_Pass_${eventName.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download Admit Pass.');
    }
  };

  const handleDownloadSymposiumCertificate = async (reg) => {
    if (!reg.certificateGenerated) {
      alert('Still need admin approval before certificate access.');
      return;
    }
    try {
      const response = await api.get(`/api/registrations/${reg.id}/certificate`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Certificate_${reg.event.name.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download certificate.');
    }
  };

  const handleDownloadGuidelines = async (track) => {
    try {
      const res = await api.get(`/api/registrations/report/guidelines?track=${track}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `guidelines_${track}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download guidelines PDF. Please contact admin.');
    }
  };

  const handleDownloadTimetable = (e, timetableData, eventName) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const byteString = atob(timetableData.split(',')[1]);
      const mimeString = timetableData.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Schedule_${eventName.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      alert("Failed to download timetable plan.");
    }
  };

  // 6 Domain Fields & Guidelines
  const guidelineFields = [
    {
      icon: "🌾",
      title: "Agriculture & Foodtech",
      trackKey: "agriculture",
      desc: "Cold storage automation, smart telemetry, crop yields, and soil nutrients analysis.",
      color: "from-orange-500/10 to-yellow-600/5 border-orange-500/10 text-orange-400"
    },
    {
      icon: "⚕️",
      title: "Healthcare & Medtech",
      trackKey: "healthcare",
      desc: "Wearable diagnostics, patient triage screeners, and biomedical telemetry standards.",
      color: "from-sky-500/10 to-teal-600/5 border-sky-500/10 text-sky-400"
    },
    {
      icon: "🏙️",
      title: "Smart Cities & Automation",
      trackKey: "smartcities",
      desc: "Intelligent signal control grids, smart garbage routing, and power grid analytics.",
      color: "from-indigo-500/10 to-purple-600/5 border-indigo-500/10 text-indigo-400"
    },
    {
      icon: "🛰️",
      title: "Robotics, IoT & Drones",
      trackKey: "robotics",
      desc: "Rescue telemetry, drone target surveying, autonomous path finding, and ROS frameworks.",
      color: "from-pink-500/10 to-rose-600/5 border-pink-500/10 text-pink-400"
    },
    {
      icon: "🔒",
      title: "Cybersecurity & Blockchain",
      trackKey: "cybersecurity",
      desc: "Deepfake verification, decentralized document ledger, and edge device firewalls.",
      color: "from-emerald-500/10 to-teal-600/5 border-emerald-500/10 text-emerald-400"
    },
    {
      icon: "🧠",
      title: "AI/ML & Smart Analytics",
      trackKey: "aiml",
      desc: "Sign language translation engines, industrial analytics, and semantic parsing nodes.",
      color: "from-amber-500/10 to-orange-600/5 border-amber-500/10 text-amber-400"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 pb-12">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
          <Layers className="w-6 h-6 text-sky-400" />
          <span>My Symposium Enrollments</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">Verify screening approvals, check allotted batches, view digital passes, and access guidelines.</p>
      </div>

      {/* Grid: 2 Cols (Left: Enrolls, Right: Guidelines) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-effect rounded-2xl border border-white/5 p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Enrolled Symposium Challenges</span>
              </h2>
              <span className="text-[10px] font-black bg-slate-950/80 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Squad: {user?.teamName || 'Individual'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading your enrollments...</div>
            ) : myRegistrations.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl space-y-3">
                <p className="text-xs text-slate-400 font-medium">You are not enrolled in any symposium challenges yet.</p>
                <a href="/events" className="inline-flex bg-sky-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-sky-400 transition-colors shadow-md">
                  Browse Challenges
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="py-3.5 px-2">Challenge Event</th>
                      <th className="py-3.5 px-2">Allotted Batch / Venue</th>
                      <th className="py-3.5 px-2 text-center">Status</th>
                      <th className="py-3.5 px-2 text-right">Symposium Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {myRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-200">
                          <div>{reg.event.name}</div>
                          {reg.event.timetablePdf && (
                            <button
                              onClick={(e) => handleDownloadTimetable(e, reg.event.timetablePdf, reg.event.name)}
                              className="text-[9px] text-sky-400 hover:text-sky-300 font-extrabold uppercase mt-1.5 flex items-center space-x-1 transition-colors cursor-pointer bg-transparent border-none outline-none p-0"
                            >
                              <span>📅 View Schedule (PDF)</span>
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-2 text-slate-400">
                          <div>{reg.event.venue}</div>
                          {reg.labAllotment && (
                            <div className="text-[10px] text-amber-400 font-extrabold mt-0.5 flex items-center">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                              {reg.labAllotment}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                            reg.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : reg.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          {reg.status === 'APPROVED' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setSelectedTicket(reg)}
                                className="bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 hover:text-sky-200 border border-sky-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>View Pass</span>
                              </button>
                              <button
                                onClick={() => handleDownloadAdmitPass(reg.id, reg.event.name)}
                                className="bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 hover:text-sky-200 border border-sky-500/20 p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                                title="Download Admit Pass PDF"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDownloadSymposiumCertificate(reg)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer ${
                                  reg.certificateGenerated
                                    ? 'bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-200 border border-yellow-500/20'
                                    : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-slate-800'
                                }`}
                                title="Download Symposium Certificate PDF"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Certificate</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic font-medium">Pending verification</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Guidelines Repository */}
        <div className="space-y-6">
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
                <BookOpen className="w-5 h-5 text-sky-400" />
                <span>Domain Guidelines Repository</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Download central guidelines, evaluation metrics, and timeline stages for each domain track.</p>
            </div>

            <div className="space-y-4">
              {guidelineFields.map((field, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border bg-gradient-to-br ${field.color} space-y-2 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{field.icon}</span>
                      <h3 className="text-xs font-bold text-slate-200">{field.title}</h3>
                    </div>
                    <button 
                      onClick={() => handleDownloadGuidelines(field.trackKey)}
                      className="p-1.5 bg-slate-950/60 hover:bg-sky-500 hover:text-slate-950 rounded-lg text-slate-400 border border-white/5 transition-all shadow-inner cursor-pointer"
                      title="Download Guidelines PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {field.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* digital ticket pass modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md relative glass-effect rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(14,165,233,0.1)]">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="ticket-container rounded-2xl p-5 mt-6 border border-white/10 relative overflow-hidden bg-[#0d1426]/80 shadow-2xl">
              <div className="ticket-notch-left"></div>
              <div className="ticket-notch-right"></div>
              
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <span className="text-[8px] font-extrabold tracking-widest text-orange-400 uppercase font-heading">NRCM SYMPOSIUM ADMIT PASS</span>
                  <h3 className="text-base font-black text-slate-100 mt-0.5 uppercase tracking-wide truncate max-w-[200px] font-heading">{selectedTicket.event.name}</h3>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                  {selectedTicket.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-heading">SQUAD NAME</p>
                  <p className="font-extrabold text-slate-200 mt-0.5 truncate">{selectedTicket.teamName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-heading">COLLEGE</p>
                  <p className="font-semibold text-slate-300 mt-0.5 truncate">{user?.college || 'Registrant Institution'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-heading">DATE & TIME</p>
                  <p className="font-semibold text-slate-300 mt-0.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(selectedTicket.event.date).toLocaleDateString()}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-heading">NODAL CENTER</p>
                  <p className="font-semibold text-slate-300 mt-0.5 flex items-center space-x-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{selectedTicket.event.venue}</span>
                  </p>
                </div>
                {selectedTicket.labAllotment && (
                  <div className="col-span-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 mt-1">
                    <p className="text-[8px] font-extrabold text-amber-500 uppercase tracking-widest font-heading">ALLOTTED LAB & BATCH</p>
                    <p className="font-black text-slate-200 mt-1 flex items-center text-xs">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                      {selectedTicket.labAllotment.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              <div className="ticket-perforation"></div>

              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-heading">REGISTRY ID</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">#NRCM-{selectedTicket.id}-{String(selectedTicket.event.id).padStart(3, '0')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-[2.5px] items-center h-8 bg-slate-950/60 p-1.5 rounded border border-white/5">
                    <div className="w-[1.5px] h-full bg-slate-400"></div>
                    <div className="w-[3px] h-full bg-slate-400"></div>
                    <div className="w-[1px] h-full bg-slate-400"></div>
                    <div className="w-[4px] h-full bg-slate-400"></div>
                    <div className="w-[1.5px] h-full bg-slate-400"></div>
                    <div className="w-[2px] h-full bg-slate-400"></div>
                    <div className="w-[3.5px] h-full bg-slate-400"></div>
                    <div className="w-[1px] h-full bg-slate-400"></div>
                    <div className="w-[3.5px] h-full bg-slate-400"></div>
                    <div className="w-[1.5px] h-full bg-slate-400"></div>
                  </div>
                  <span className="text-[7px] text-slate-500 font-mono mt-1 tracking-widest uppercase">NODAL HALL ENTRY</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => handleDownloadAdmitPass(selectedTicket.id, selectedTicket.event.name)}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 py-3 rounded-xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Admit Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Close Icon
const X = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
