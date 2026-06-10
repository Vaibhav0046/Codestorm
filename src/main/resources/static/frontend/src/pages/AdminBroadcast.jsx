import React, { useState } from 'react';
import api from '../api';
import { Radio, Send, Sparkles } from 'lucide-react';

export default function AdminBroadcast() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/api/notifications/broadcast?message=${encodeURIComponent(message)}&type=${type}`);
      alert('Broadcast notification published successfully! Users notified in real-time.');
      setMessage('');
    } catch (err) {
      alert('Failed to publish system broadcast.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Radio className="w-6 h-6 text-sky-400 animate-pulse" />
            <span>WebSocket Live Broadcast Node</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Broadcast announcements and scheduling alerts instantly to all connected participant dashboards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-medium">
        {/* Broadcast Form Panel */}
        <div className="lg:col-span-2 glass-effect rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <h3 className="text-md font-bold text-slate-200 font-heading">Issue Global Symposium Bulletin</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">This instantly updates the live marquee navbar tickers and triggers glowing status popups for active users.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 font-heading">
                Announcement Message
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. CodeStorm Hackathon reporting starts in 10 minutes at the Seminar Hall!"
                rows="4"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2 font-heading">
                Notice Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['INFO', 'SUCCESS', 'ALERT'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setType(level)}
                    className={`py-2.5 rounded-xl border text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all duration-300 ${
                      type === level
                        ? level === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : level === 'ALERT'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                        : 'bg-slate-950/80 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level === 'SUCCESS' ? '🏆 Success' : level === 'ALERT' ? '⚠️ Alert' : '📢 Info'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-500 font-extrabold tracking-widest uppercase py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.15)]"
            >
              {submitting ? (
                <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish System Broadcast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Cockpit Instructions Widget */}
        <div className="glass-effect rounded-2xl p-6 border border-white/5 h-fit space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 font-heading">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <span>WebSocket Live Broadcast Node</span>
          </h3>
          
          <p className="text-slate-400 leading-relaxed">
            The platform is integrated with active text-based HTML5 WebSocket sessions. Any broadcast issued here instantly notifies all online participant and admin dashboards over safe duplex pipelines.
          </p>
          
          <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-[10px] text-slate-400 space-y-2.5 shadow-inner">
            <p className="flex items-center space-x-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <strong className="font-heading uppercase tracking-wider">Broadcast Rules:</strong>
            </p>
            <p>1. Keep bulletins brief, clear, and action-oriented.</p>
            <p>2. Choose the level carefully: Alert (⚠️) for delays/warnings, Success (🏆) for winners, Info (📢) for routine instructions.</p>
            <p>3. Do not spam notifications unnecessarily to avoid disrupting participants.</p>
          </div>
        </div>
      </div>
    </div>
  );
}