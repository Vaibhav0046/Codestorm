import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api';
import { 
  LayoutDashboard, Award, AlertCircle, Sparkles, CheckCircle2, 
  FileDown, Ticket, X, Calendar, MapPin, ChevronLeft, ChevronRight, 
  Flag, School, Users, Lightbulb, GraduationCap, ArrowRight, BookOpen,
  Download, User
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, tickerMessage } = useNotifications();
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Slider State
  const [activeSlide, setActiveSlide] = useState(0);

  // Group highlights into albums/folders
  const albums = React.useMemo(() => {
    const grouped = {};
    highlights.forEach(h => {
      const folderKey = `${h.yearTitle} - ${h.folderType} - ${h.title}`.trim();
      if (!grouped[folderKey]) {
        grouped[folderKey] = [];
      }
      grouped[folderKey].push(h);
    });
    
    return Object.entries(grouped).map(([title, items]) => {
      const coverImage = items[0]?.imageUrl || '';
      return {
        title,
        coverImage,
        images: items
      };
    });
  }, [highlights]);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch registrations
        const regRes = await api.get('/api/registrations/my');
        setMyRegistrations(regRes.data);
        
        // Fetch public active highlights (replacing old gallery images)
        const highlightsRes = await api.get('/api/highlights');
        setHighlights(highlightsRes.data);

        // Fetch active guests
        const guestRes = await api.get('/api/guests');
        setGuests(guestRes.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Automatic Slider Interval
  useEffect(() => {
    if (albums.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % albums.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [albums]);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % albums.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + albums.length) % albums.length);
  };

  const handleDownloadCertificate = async (regId, eventName) => {
    try {
      const response = await api.get(`/api/registrations/${regId}/certificate`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Certificate_${eventName.replace(/\s+/g, '_')}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download certificate. Please contact admin.');
    }
  };

  const handleDownloadGuidelines = async (trackTitle) => {
    try {
      let track = "general";
      const lower = trackTitle.toLowerCase();
      if (lower.includes("agriculture")) track = "agriculture";
      else if (lower.includes("healthcare")) track = "healthcare";
      else if (lower.includes("cities") || lower.includes("automation")) track = "smartcities";
      else if (lower.includes("robotics") || lower.includes("iot") || lower.includes("drones")) track = "robotics";
      else if (lower.includes("security") || lower.includes("blockchain")) track = "cybersecurity";
      else if (lower.includes("ai") || lower.includes("ml") || lower.includes("analytics")) track = "aiml";

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

  // 6 Core Hackathon Themes
  const nrcmThemes = [
    {
      icon: "🌾",
      title: "Agriculture & Foodtech",
      color: "from-orange-500/20 to-yellow-600/10 border-orange-500/20 text-orange-400",
      desc: "Post-harvest technologies, cold supply chains, crop disease detection, and rural economy enhancement."
    },
    {
      icon: "⚕️",
      title: "Healthcare & Medtech",
      color: "from-sky-500/20 to-teal-600/10 border-sky-500/20 text-sky-400",
      desc: "Portable diagnostic devices, AI-based patient screening, and hospital waste management systems."
    },
    {
      icon: "🏙️",
      title: "Smart Cities & Automation",
      color: "from-indigo-500/20 to-purple-600/10 border-indigo-500/20 text-indigo-400",
      desc: "Intelligent traffic management, robotic sewage cleaners, and smart electricity grid telemetry."
    },
    {
      icon: "🛰️",
      title: "Robotics, IoT & Drones",
      color: "from-pink-500/20 to-rose-600/10 border-pink-500/20 text-pink-400",
      desc: "Disaster management drones, autonomous target surveys, and edge-computing smart telemetry."
    },
    {
      icon: "🔒",
      title: "Cybersecurity & Blockchain",
      color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/20 text-emerald-400",
      desc: "Self-sovereign digital locker services, deepfake detection, and tamper-proof academic verification."
    },
    {
      icon: "🧠",
      title: "AI/ML & Smart Analytics",
      color: "from-amber-500/20 to-orange-600/10 border-amber-500/20 text-amber-400",
      desc: "Real-time sign language translation, large data visualization, and predictive maintenance algorithms."
    }
  ];

  // Timeline Progress
  const timelineStages = [
    {
      step: "01",
      title: "Idea Registration",
      status: "COMPLETED",
      desc: "Form squads of 2-4 and select target theme problems."
    },
    {
      step: "02",
      title: "Internal Screening",
      status: "COMPLETED",
      desc: "Submit short abstract PPTs for college jury assessment."
    },
    {
      step: "03",
      title: "Finalist Nominations",
      status: "ACTIVE",
      desc: "Shortlisted final teams selected for the National Portal."
    },
    {
      step: "04",
      title: "Grand 36H Finale",
      status: "UPCOMING",
      desc: "Non-stop code development and live evaluation rounds."
    }
  ];

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* 1. Guest Dignitaries horizontal slider */}
      {guests && guests.length > 0 && (
        <div className="bg-[#090d16]/95 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 font-heading tracking-wide">
              <Users className="w-4 h-4 text-sky-400" />
              <span>GUESTS OF HONOR & DIGNITARIES</span>
            </h2>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 border border-white/5 rounded uppercase tracking-wider">
              Symposium VIPs
            </span>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent justify-center sm:justify-start">
            {guests.map((g) => (
              <div 
                key={g.id} 
                className="flex-shrink-0 w-44 bg-slate-900/40 border border-white/5 hover:border-sky-500/20 rounded-2xl p-4 flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.03]"
              >
                <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-950 border-2 border-sky-500/30 flex-shrink-0 flex items-center justify-center mb-3 shadow-inner">
                  {g.photo ? (
                    <img src={g.photo} alt={g.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-500" />
                  )}
                </div>
                <div className="w-full">
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide leading-tight" title={g.name}>
                    {g.name}
                  </h3>
                  <span className="text-[8px] font-bold text-sky-400 uppercase tracking-widest block mt-1.5 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 w-fit mx-auto">
                    VIP Dignitary
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative w-full overflow-hidden bg-gradient-to-r from-orange-500/5 via-slate-100/5 to-emerald-500/5 border border-white/5 py-2 px-4 rounded-xl shadow-inner">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r dark:from-[#0b0f19] from-slate-50/90 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l dark:from-[#0b0f19] from-slate-50/90 to-transparent z-10"></div>
        <div className="w-full overflow-hidden whitespace-nowrap">
          <div className="animate-marquee text-xs font-semibold text-slate-300 flex items-center space-x-8">
            <span className="text-orange-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-ping"></span>
              🏆 GRAND FINALE: 36-hour hackathon dates announced. Check event schedules.
            </span>
            <span className="text-slate-200">
              📢 NOTICE: {tickerMessage || "All team leaders must upload final idea presentation documents before the internal review."}
            </span>
            <span className="text-emerald-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              ⚡ SYSTEM: Real-time broadcast connection active. Live results will stream directly.
            </span>
          </div>
        </div>
      </div>

      {/* 3. High-Fi Image Slider / Carousel */}
      {albums.length > 0 && (albums[activeSlide] || albums[0]) ? (
        <div className="relative aspect-[21/9] md:aspect-[24/8] w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(249,115,22,0.06)] group cursor-pointer"
             onClick={() => navigate('/highlights')}>
          {/* Active Image */}
          <img 
            src={(albums[activeSlide] || albums[0]).coverImage} 
            alt={(albums[activeSlide] || albums[0]).title}
            className="w-full h-full object-cover animate-fade-in transition-all duration-700 brightness-[0.7]"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Saffron, White, Green overlay bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/3 h-full bg-orange-500"></div>
            <div className="w-1/3 h-full bg-slate-100"></div>
            <div className="w-1/3 h-full bg-emerald-500"></div>
          </div>

          {/* Caption Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6 md:p-8 space-y-3">
            <div className="max-w-2xl space-y-2 text-left">
              <span className="inline-block bg-white text-slate-950 font-black px-2.5 py-1 rounded text-[8px] md:text-[9px] uppercase tracking-widest shadow-md">
                📁 Click Album to View ({(albums[activeSlide] || albums[0]).images?.length || 0} Photos)
              </span>
              <div>
                <h2 className="inline-block bg-white text-slate-950 text-xs sm:text-sm md:text-lg font-black px-4 py-2 rounded-xl leading-tight shadow-lg uppercase tracking-wide font-heading">
                  {(albums[activeSlide] || albums[0]).title}
                </h2>
              </div>
            </div>
          </div>

          {/* Next & Prev Arrows */}
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 text-slate-300 hover:bg-slate-950 border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
          >
            <ChevronRight className="w-4 h-4 md:w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute top-4 right-4 flex space-x-1.5 bg-slate-950/40 p-2 rounded-lg backdrop-blur-sm border border-white/5 z-20">
            {albums.map((_, i) => (
              <button 
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeSlide ? 'bg-orange-500 w-4' : 'bg-slate-500 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Fallback placeholder banner */
        <div className="glass-effect rounded-2xl p-8 border border-white/5 relative overflow-hidden flex items-center justify-between shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none"></div>
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
              <h2 className="text-xl font-bold tracking-tight text-white font-heading">NRCM Symposium Gallery</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium max-w-xl">
              Welcome to the Collegiate Symposium Dashboard. Form squads, register for target problem statements, and track evaluation rounds.
            </p>
          </div>
        </div>
      )}

      {/* 4. Interactive Statistics Counter Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-center space-y-1 text-center hover:border-orange-500/10 transition-all duration-300">
          <School className="w-5 h-5 mx-auto text-orange-400" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Participating Colleges</span>
          <span className="text-2xl font-black text-slate-100 font-heading">150+</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-center space-y-1 text-center hover:border-sky-500/10 transition-all duration-300">
          <Users className="w-5 h-5 mx-auto text-sky-400" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Total Registrants</span>
          <span className="text-2xl font-black text-slate-100 font-heading">25,000+</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-center space-y-1 text-center hover:border-emerald-500/10 transition-all duration-300">
          <Lightbulb className="w-5 h-5 mx-auto text-emerald-400" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Theme Categories</span>
          <span className="text-2xl font-black text-slate-100 font-heading">35+</span>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-center space-y-1 text-center hover:border-amber-500/10 transition-all duration-300">
          <GraduationCap className="w-5 h-5 mx-auto text-amber-400" />
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Idea Submissions</span>
          <span className="text-2xl font-black text-slate-100 font-heading">4,800+</span>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Span 2: Timeline & Registrations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 5. Timeline Chronology */}
          <div className="glass-effect rounded-2xl p-6 border border-white/5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>NRCM Competition Chronology & Evaluation Flow</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {timelineStages.map((stage, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col justify-between space-y-2 hover:border-slate-800/80 hover:bg-slate-950/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-600 font-mono tracking-widest">
                      {stage.step}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      stage.status === 'COMPLETED' 
                        ? 'bg-slate-800 text-slate-400 border border-white/5' 
                        : stage.status === 'ACTIVE' 
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                        : 'bg-slate-950 text-slate-600 border border-transparent'
                    }`}>
                      {stage.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{stage.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Active Registrations Table */}
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <span>My Active Event Registrations</span>
              </h2>
              <span className="text-[10px] font-black bg-slate-950 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg">
                Squad: {user?.teamName || 'N/A'}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading enrollments...</div>
            ) : myRegistrations.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl space-y-3">
                <p className="text-xs text-slate-400 font-medium">You are not registered for any hackathon events yet.</p>
                <a href="/events" className="inline-flex bg-sky-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-sky-400 transition-colors shadow-md shadow-sky-500/10">
                  Browse Hackathon Challenges
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="py-3.5 px-2">Event</th>
                      <th className="py-3.5 px-2">Team Squad</th>
                      <th className="py-3.5 px-2">Nodal Venue</th>
                      <th className="py-3.5 px-2 text-center">Status</th>
                      <th className="py-3.5 px-2 text-right">Pass Portal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {myRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-200">{reg.event.name}</td>
                        <td className="py-4 px-2 text-slate-400">{reg.teamName}</td>
                        <td className="py-4 px-2 text-slate-400">
                          <div>{reg.event.venue}</div>
                          {reg.labAllotment && (
                            <div className="text-[10px] text-amber-400 font-bold mt-0.5 flex items-center">
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
                                className="bg-sky-500/15 hover:bg-sky-500/30 text-sky-400 hover:text-sky-200 border border-sky-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center space-x-1 cursor-pointer"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>View Pass</span>
                              </button>
                              <button
                                onClick={() => handleDownloadCertificate(reg.id, reg.event.name)}
                                className="bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-400 hover:text-yellow-200 border border-yellow-500/20 p-1.5 rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                                title="Download PDF Ticket"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic font-medium">Pending Screening</span>
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

        {/* Right Column Span 1: Notice Board */}
        <div className="space-y-6">
          
          {/* 7. WebSocket Live Announcements Board */}
          <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span>NRCM Active Notice Board</span>
            </h2>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No recent updates received.</p>
              ) : (
                notifications
                  .filter(note => {
                    const isAdmin = user?.role === 'ROLE_ADMIN';
                    return isAdmin || !note.message || !note.message.startsWith('New registration:');
                  })
                  .map((note) => (
                    <div key={note.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-start space-x-3 transition-all hover:border-white/10 hover:bg-slate-950/60">
                    <span className="text-lg mt-0.5">
                      {note.type === 'SUCCESS' ? '🏆' : note.type === 'ALERT' ? '⚠️' : '📢'}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-slate-200 leading-normal">{note.message}</p>
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 9. Core Hackathon Tracks & Themes Section */}
      <div className="glass-effect rounded-2xl p-6 border border-white/5 shadow-xl space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>NRCM 2026 Core Challenge Tracks & Themes</span>
          </h2>
          <p className="text-[10px] text-slate-400">
            Target high-impact problem statements assigned by multiple Central Ministries & State Departments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {nrcmThemes.map((theme, idx) => (
            <div 
              key={idx}
              onClick={() => handleDownloadGuidelines(theme.title)}
              className={`p-5 rounded-2xl border bg-gradient-to-br ${theme.color} transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-4 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5`}
              title="Click to Download Guidelines PDF"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{theme.icon}</span>
                  <h3 className="text-sm font-extrabold text-slate-100 font-heading">{theme.title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {theme.desc}
                </p>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-sky-400 flex items-center space-x-1 mt-2">
                <span>Download Guidelines (PDF)</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Boarding Pass Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md relative glass-effect rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.15)]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ticket Pass Container */}
            <div className="ticket-container rounded-2xl p-5 mt-6 border border-white/10 relative overflow-hidden bg-[#0d1426]/80 shadow-2xl">
              <div className="ticket-notch-left"></div>
              <div className="ticket-notch-right"></div>
              
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <span className="text-[8px] font-extrabold tracking-widest text-orange-400 uppercase font-heading">NRCM SYMPOSIUM ADMIT PASS</span>
                  <h3 className="text-base font-black text-slate-100 mt-0.5 uppercase tracking-wide truncate max-w-[200px] font-heading">{selectedTicket.event.name}</h3>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase">
                  {selectedTicket.status}
                </div>
              </div>

              {/* Grid Information */}
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

              {/* Perforation Separation */}
              <div className="ticket-perforation"></div>

              {/* Bottom Portion: Barcode & Entry Details */}
              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-heading">REGISTRY ID</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">#NRCM-{selectedTicket.id}-{String(selectedTicket.event.id).padStart(3, '0')}</p>
                </div>
                <div className="flex flex-col items-center">
                  {/* Simulated High-Fi Barcode */}
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

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => handleDownloadCertificate(selectedTicket.id, selectedTicket.event.name)}
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 py-3 rounded-xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.15)]"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Admit Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 11. Album Modal Viewer */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-4xl relative glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Symposium Album Folder</span>
                <h3 className="text-xl font-extrabold text-white font-heading mt-0.5">{selectedAlbum.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photos Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {selectedAlbum.images.map((img, idx) => (
                <div key={img.id} className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/60 group shadow-lg hover:border-sky-500/30 transition-all flex flex-col justify-between">
                  <div className="aspect-video w-full overflow-hidden relative bg-slate-950">
                    <img 
                      src={img.imageUrl} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    {img.mainPreview && (
                      <span className="absolute top-3 left-3 bg-amber-500/90 text-slate-950 font-black px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase flex items-center shadow-md">
                        ⭐ COVER IMAGE
                      </span>
                    )}
                  </div>
                  <div className="p-3 border-t border-white/5 flex items-center justify-between bg-slate-900/40">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Image #{idx + 1}</span>
                    <a 
                      href={img.imageUrl}
                      download={`Album_${selectedAlbum.title.replace(/\s+/g, '_')}_${idx + 1}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border border-sky-500/20 hover:border-transparent transition-all text-[9px] font-extrabold uppercase flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}