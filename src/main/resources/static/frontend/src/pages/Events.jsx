import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Calendar, MapPin, Users, User, ArrowRight, Layers } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/api/events');
        setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    if (selectedCategory === 'INDIVIDUAL') return event.type === 'INDIVIDUAL';
    if (selectedCategory === 'TEAM') return event.type === 'TEAM';
    return true;
  });

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>Collegiate Technical Symposium Events</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Enroll in paper presentations, lightning talks, tech expos, and 24h hackathons.</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex space-x-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/5 w-fit shadow-inner">
          {['ALL', 'INDIVIDUAL', 'TEAM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(14,165,233,0.2)] font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Catalog' : cat === 'INDIVIDUAL' ? 'Individual' : 'Team/Squad'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading technical events catalog...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-xl">
          <p className="text-slate-400 text-xs">No active events are available matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="glass-effect rounded-2xl p-6 border border-white/5 interactive-card flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top border ambient glow highlight */}
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    event.type === 'TEAM'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {event.type} EVENT
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center space-x-1">
                    {event.type === 'TEAM' ? (
                      <>
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Team Size: {event.minTeamSize}-{event.maxTeamSize}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Single Entry</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition-colors font-heading tracking-wide">
                  {event.name}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400 line-clamp-3">{event.description}</p>

                <div className="pt-3.5 border-t border-white/5 grid grid-cols-2 gap-3 text-xs text-slate-400 font-medium">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="truncate" title={event.venue}>{event.venue}</span>
                  </div>
                </div>

                {event.extraInfo && (
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mt-3 text-[10px] text-slate-300 font-medium italic">
                    💡 Note: {event.extraInfo}
                  </div>
                )}
              </div>

              <div className="pt-6">
                {event.timetablePdf && (
                  <button
                    onClick={(e) => handleDownloadTimetable(e, event.timetablePdf, event.name)}
                    className="w-full mb-2.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-500/20 py-2.5 px-4 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer shadow-inner"
                  >
                    <span>📅 Download Planning (PDF)</span>
                  </button>
                )}

                <Link
                  to={`/events/register/${event.id}`}
                  className="w-full bg-slate-950/80 hover:bg-sky-500 hover:text-slate-950 text-sky-400 border border-sky-500/20 hover:border-transparent py-2.5 px-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 group/btn cursor-pointer shadow-inner"
                >
                  <span>Enroll & Register</span>
                  <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}