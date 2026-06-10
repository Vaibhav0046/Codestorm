import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, Sparkles, Calendar, MapPin, Users, Trophy, ChevronRight, 
  ArrowRight, Clock, Shield, Laptop, Zap, Leaf, Heart, FileText, Image, Sun, Moon, X, Folder
} from 'lucide-react';
import api from '../api';
import nrcmLogo from '../assets/nrcm_logo.png';
import cdcLogo from '../assets/cdc_logo.png';

export default function Landing() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Theme states for Landing page
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const eventsRes = await api.get('/api/events');
        const highlightsRes = await api.get('/api/highlights');
        const guestsRes = await api.get('/api/guests');
        setEvents(eventsRes.data || []);
        setHighlights(highlightsRes.data || []);
        setGuests(guestsRes.data || []);
      } catch (err) {
        console.error("Error fetching landing data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const groupedHighlights = React.useMemo(() => {
    const grouped = {};
    highlights.forEach(h => {
      const key = h.yearTitle ? h.yearTitle.trim() : 'General Archive';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(h);
    });
    return Object.entries(grouped).map(([year, items]) => {
      const coverItem = items[0] || {};
      return {
        year,
        title: `${year} ARCHIVE`,
        description: `Explore all highlight album photos and snapshots captured during CodeStorm ${year}.`,
        coverImage: coverItem.imageUrl,
        folderType: coverItem.folderType || 'Archive',
        items
      };
    }).sort((a, b) => b.year.localeCompare(a.year));
  }, [highlights]);


  const themes = [
    {
      id: "smart-automation",
      title: "Smart Automation & AI",
      icon: CpuIcon,
      desc: "Build AI-driven solutions, automated workflows, and intelligent systems to optimize daily processes.",
      color: "from-sky-500/20 to-sky-600/5",
      borderColor: "border-sky-500/20",
      textColor: "text-sky-400"
    },
    {
      id: "healthcare-medtech",
      title: "Healthcare & MedTech",
      icon: HeartIcon,
      desc: "Leverage digital healthcare, diagnostic tools, patient tracking, and health automation algorithms.",
      color: "from-rose-500/20 to-rose-600/5",
      borderColor: "border-rose-500/20",
      textColor: "text-rose-400"
    },
    {
      id: "clean-green-energy",
      title: "Clean & Green Energy",
      icon: LeafIcon,
      desc: "Innovate sustainable solutions, resource waste management, renewable energy efficiency, and climate tech.",
      color: "from-emerald-500/20 to-emerald-600/5",
      borderColor: "border-emerald-500/20",
      textColor: "text-emerald-400"
    },
    {
      id: "cybersecurity-defence",
      title: "Cybersecurity & Defence",
      icon: ShieldIcon,
      desc: "Address modern threat intelligence, zero-trust frameworks, encrypted communications, and network security.",
      color: "from-indigo-500/20 to-indigo-600/5",
      borderColor: "border-indigo-500/20",
      textColor: "text-indigo-400"
    },
    {
      id: "fintech",
      title: "FinTech Innovation",
      icon: ZapIcon,
      desc: "Optimize secure payments, decentralized ledger protocols, micro-loans, and automated financial insights.",
      color: "from-amber-500/20 to-amber-600/5",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-400"
    },
    {
      id: "robotics-iot",
      title: "Robotics & IoT Ecosystems",
      icon: LaptopIcon,
      desc: "Connect physical sensors, smart home protocols, embedded devices, and automated machine hardware.",
      color: "from-purple-500/20 to-purple-600/5",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400"
    }
  ];

  function CpuIcon(props) { return <CpuIconComponent {...props} />; }
  function CpuIconComponent(props) { return <Laptop className={props.className} />; }
  function HeartIcon(props) { return <Heart className={props.className} />; }
  function LeafIcon(props) { return <Leaf className={props.className} />; }
  function ShieldIcon(props) { return <Shield className={props.className} />; }
  function ZapIcon(props) { return <Zap className={props.className} />; }
  function LaptopIcon(props) { return <Laptop className={props.className} />; }

  return (
    <div className="min-h-screen premium-gradient text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl shadow-lg">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5">
              <img src={nrcmLogo} alt="NRCM Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-wider premium-logo-text">CODESTORM 2026</span>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest leading-none mt-0.5">NRCM Core Challenge</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#themes" className="hover:text-white transition-colors">Themes</a>
          <a href="#events" className="hover:text-white transition-colors">Active Events</a>
          <a href="#highlights" className="hover:text-white transition-colors">Past Highlights</a>
          <a href="#schedule" className="hover:text-white transition-colors">Schedule</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-700 hover:border-sky-500/30 transition-all duration-300 cursor-pointer mr-1"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            Register Now
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section id="about" className="relative pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Decorative float shapes */}

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span className="premium-text-gradient-primary">Unleash Innovation at</span>
            <br />
            <span className="premium-accent-gradient">CODESTORM 2026</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Join the ultimate 36-hour National Level Hackathon where core tech meets real-world problem-solving. Develop, pitch, and build next-generation solutions for industries under the NRCM Core Challenge Tracks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Registration <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all font-bold text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              Portal Login
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
            {[
              { label: "Total Prizes", val: "₹5,00,000+" },
              { label: "Active Tracks", val: "6 Core Areas" },
              { label: "Hackathon Duration", val: "36 Non-Stop Hrs" },
              { label: "Host Institution", val: "NRCM Campus" }
            ].map((stat, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all text-center">
                <p className="text-3xl font-black premium-stat-value mb-1">{stat.val}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenge Tracks & Themes */}
        <section id="themes" className="py-20 bg-slate-950/40 border-y border-white/5 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">NRCM 2026 Core Challenge Tracks & Themes</h2>
              <p className="text-slate-400">
                Explore the problem areas defined for the hackathon. Teams can select problem statements from any of these core challenge tracks to design and develop their prototypes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <div 
                    key={theme.id} 
                    className={`glass-card rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group`}
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${theme.color} flex items-center justify-center border ${theme.borderColor} mb-6`}>
                        <Icon className={`w-6 h-6 ${theme.textColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{theme.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-6">{theme.desc}</p>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/signup')} 
                      className={`text-sm font-semibold ${theme.textColor} flex items-center gap-1.5 hover:underline cursor-pointer`}
                    >
                      Register with this Theme <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Active Events */}
        <section id="events" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Active & Live Events</h2>
            <p className="text-slate-400">
              Browse details of all scheduled events under CodeStorm 2026. Register or check guidelines to prepare your teams.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="font-bold text-slate-300">No events published yet</p>
              <p className="text-sm text-slate-500 mt-1">Please check back later as the organizers publish live events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((event) => (
                <div key={event.id} className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-wider">{event.type}</span>
                        <h3 className="text-2xl font-bold mt-2.5">{event.name}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-bold uppercase">{event.active ? "● LIVE" : "● ENDED"}</span>
                    </div>

                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">{event.description}</p>

                    <div className="space-y-3 mb-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span>Date: {event.date}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-sky-400" />
                        <span>Venue: {event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-sky-400" />
                        <span>Team Size: {event.minTeamSize} - {event.maxTeamSize} Members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => navigate(`/signup`)}
                      className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 font-bold text-sm text-white text-center cursor-pointer"
                    >
                      Register Event
                    </button>
                    {event.timetablePdf && (
                      <a 
                        href={event.timetablePdf}
                        download={`timetable-${event.id}.pdf`}
                        className="px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-sm font-bold text-slate-300 flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Timetable
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Guests Section */}
        <section className="py-20 bg-slate-950/20 border-t border-white/5 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Eminent Guests & Speakers</h2>
              <p className="text-slate-400">
                Meet the tech visionaries, corporate leaders, and academic stalwarts mentoring and evaluating projects at CodeStorm.
              </p>
            </div>

            {guests.length === 0 ? (
              <div className="text-center text-slate-500">Mentors list updating soon.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
                {guests.map((g) => (
                  <div key={g.id} className="glass-card rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-sky-500/20 mb-4 shadow-lg shadow-sky-500/5">
                      {g.photo ? (
                        <img src={g.photo} alt={g.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 font-bold">No Photo</div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-white">{g.name}</h3>
                    <p className="text-xs text-sky-400 font-bold uppercase tracking-wider mt-1">Speaker / Mentor</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Highlights Section */}
        <section id="highlights" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Past Highlights & Album Snaps</h2>
            <p className="text-slate-400">
              Take a walk down memory lane and discover the spirit of collaboration, coding, and celebration in our past albums.
            </p>
          </div>

          {groupedHighlights.length === 0 ? (
            <div className="text-center text-slate-500">Highlights album is updating. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {groupedHighlights.map((folder) => (
                <div 
                  key={folder.year} 
                  className="physical-folder group cursor-pointer"
                  onClick={() => setSelectedFolder(folder)}
                >
                  {/* Folder Tab */}
                  <div className="folder-tab">
                    {folder.year}
                  </div>
                  {/* Folder Paper (Photo Sheet) */}
                  <div className="folder-paper">
                    {folder.coverImage ? (
                      <img src={folder.coverImage} alt={folder.title} className="folder-photo" />
                    ) : (
                      <div className="w-full h-[155px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 rounded border border-slate-200 dark:border-slate-800">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <div className="folder-paper-caption font-bold">
                      📁 {folder.items.length} Photos
                    </div>
                  </div>
                  {/* Folder Front Flap */}
                  <div className="folder-front">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2 leading-tight">{folder.year} Highlights</h4>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{folder.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-sky-400 font-bold tracking-wider pt-2 border-t border-white/5">
                      <span>Click to View Album</span>
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">{folder.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Album Modal Viewer */}
          {selectedFolder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-4xl relative glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Highlights Album Folder</span>
                    <h3 className="text-xl font-extrabold text-white font-heading mt-0.5">{selectedFolder.year} Gallery</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolder(null);
                    }}
                    className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Photos Grid Container */}
                <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedFolder.items.map((img, idx) => (
                    <div key={img.id} className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/60 shadow-lg hover:border-sky-500/30 transition-all flex flex-col justify-between">
                      <div className="aspect-video w-full overflow-hidden relative bg-slate-950">
                        <img 
                          src={img.imageUrl} 
                          alt={`Photo ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>
                      <div className="p-3 border-t border-white/5 flex items-center justify-between bg-slate-900/40 text-xs font-semibold">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{img.title || `Snapshot #${idx + 1}`}</span>
                        <a 
                          href={img.imageUrl}
                          download={`Album_${selectedFolder.year}_${idx + 1}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 border border-sky-500/20 hover:border-transparent transition-all text-[9px] font-extrabold uppercase flex items-center space-x-1 cursor-pointer"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Timetable / Schedule */}
        <section id="schedule" className="py-20 bg-slate-950/40 border-t border-white/5 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Event Timetable & Timeline</h2>
              <p className="text-slate-400">Check the chronological timeline of operations below.</p>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-white/10">
              {[
                { time: "08:00 AM", title: "Registrations & Reporting", desc: "Arrival of teams at nodal center, verification of boarding passes." },
                { time: "09:30 AM", title: "Inaugural Ceremony", desc: "Keynote addresses from eminent guests, opening of problem statements." },
                { time: "11:00 AM", title: "Hackathon Coding Starts", desc: "Day 1 coding kicks off, mentors available for technical checkups." },
                { time: "04:00 PM", title: "Mentoring Session Round 1", desc: "Detailed review of architecture diagrams and database designs." },
                { time: "10:00 PM", title: "Midnight Coding & Snacks", desc: "Continued development, optional snack and fun breaks." },
                { time: "09:00 AM (Day 2)", title: "Mentoring Session Round 2", desc: "Evaluation of prototype progress and integration testing." },
                { time: "02:00 PM (Day 2)", title: "Final Code Submission", desc: "Submission of GitHub repositories, deployments, and slide decks." },
                { time: "03:30 PM (Day 2)", title: "Jury Evaluation & Pitching", desc: "Teams pitch working software prototypes to technical jury panels." },
                { time: "06:00 PM (Day 2)", title: "Valedictory & Prize Distribution", desc: "Declaration of track winners, distribution of physical certificates." }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-10 md:pl-0">
                  <div className="absolute left-1 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border-4 border-sky-400 z-10"></div>
                  
                  <div className={`w-full md:w-[45%] ${idx % 2 === 0 ? 'md:text-right' : 'md:order-last'}`}>
                    <span className="text-xs text-sky-400 font-bold tracking-wider">{item.time}</span>
                    <h4 className="font-bold text-lg text-white mt-1">{item.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                  </div>
                  <div className="hidden md:block w-[45%]"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 px-6 md:px-12 border-t border-white/5 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold text-base mb-4">CODESTORM 2026</h4>
            <p className="text-slate-400 leading-relaxed mb-4">
              A premium, high-fidelity platform for organizing and executing state-of-the-art hackathons, built with precision and modern design standards.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-4">Symphonym Rules & Guidelines</h4>
            <ul className="space-y-2 text-slate-400">
              <li>● All teams must strictly contain between the minimum and maximum members listed per event.</li>
              <li>● Submissions must consist of original, live prototype source code written during the event.</li>
              <li>● Use of open-source frameworks and libraries is allowed with proper citations.</li>
              <li>● Code repositories must remain public during final evaluations.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-4">Venue & Contact</h4>
            <p className="text-slate-400 leading-relaxed mb-2">
              NRCM Campus, Technical Block A, Labs 1-5.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Email: support@codestorm.org<br />
              Phone: +91 98765 43210
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 CodeStorm. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
