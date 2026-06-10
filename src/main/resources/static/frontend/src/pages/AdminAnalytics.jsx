import React, { useState, useEffect } from 'react';
import api from '../api';
import { BarChart3, Users, Layers, ShieldCheck, Flame, UtensilsCrossed, Shirt } from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-xs">Loading symposium command intelligence...</div>;
  }

  const { totalRegistrations, totalEvents, vegCount, nonVegCount, pendingApprovals, tshirtSizeCounts, eventRegistrationCounts } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            <span>Symposium Command Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Real-time stats, event registration metrics, and team logistics tracking.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-5 border border-white/5 flex items-center space-x-4 hover:border-sky-500/10 transition-all duration-300 shadow-md">
          <div className="bg-sky-500/10 text-sky-400 p-3.5 rounded-xl border border-sky-500/10 shadow-lg shadow-sky-500/5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-heading">Total Registrations</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{totalRegistrations}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/5 flex items-center space-x-4 hover:border-indigo-500/10 transition-all duration-300 shadow-md">
          <div className="bg-indigo-500/10 text-indigo-400 p-3.5 rounded-xl border border-indigo-500/10 shadow-lg shadow-indigo-500/5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-heading">Symposium Events</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{totalEvents}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/5 flex items-center space-x-4 hover:border-amber-500/10 transition-all duration-300 shadow-md">
          <div className="bg-amber-500/10 text-amber-400 p-3.5 rounded-xl border border-amber-500/10 shadow-lg shadow-amber-500/5">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-heading">Pending Approval</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{pendingApprovals}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/5 flex items-center space-x-4 hover:border-emerald-500/10 transition-all duration-300 shadow-md">
          <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-heading">Total Delegates</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{vegCount + nonVegCount}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Event Registrations popularities */}
        <div className="lg:col-span-2 glass-effect rounded-2xl border border-white/5 p-6 space-y-6 shadow-lg">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase font-heading">Registration Popularity per Event</h3>

          <div className="space-y-5">
            {Object.entries(eventRegistrationCounts).map(([name, count]) => {
              const percentage = totalRegistrations > 0 ? (count / totalRegistrations) * 100 : 0;
              return (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest">
                    <span className="text-slate-300">{name}</span>
                    <span className="text-sky-400">{count} enrollments ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full cylinder-progress-track h-3.5">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full cylinder-progress-bar"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Demographics (T-shirt & Food counts) */}
        <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-6 shadow-lg">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase font-heading">Symposium Logistics</h3>

          {/* Food Count */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[10px] font-extrabold uppercase text-slate-400 tracking-widest font-heading">
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              <span>Food Demand Count</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-xl text-center shadow-inner">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-heading">Vegetarian (VEG)</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{vegCount}</p>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-xl text-center shadow-inner">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-heading">Non-Veg (NON-VEG)</p>
                <p className="text-xl font-black text-amber-500 mt-1">{nonVegCount}</p>
              </div>
            </div>
          </div>

          {/* T-Shirt Count */}
          <div className="space-y-4 border-t border-white/5 pt-5">
            <div className="flex items-center space-x-2 text-[10px] font-extrabold uppercase text-slate-400 tracking-widest font-heading">
              <Shirt className="w-4 h-4 text-sky-400" />
              <span>T-Shirt Size Breakdown</span>
            </div>

            <div className="space-y-3">
              {Object.entries(tshirtSizeCounts).map(([size, count]) => {
                const totalSizes = Object.values(tshirtSizeCounts).reduce((a, b) => a + b, 0);
                const pct = totalSizes > 0 ? (count / totalSizes) * 100 : 0;
                return (
                  <div key={size} className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-400 bg-slate-950/90 border border-white/5 w-8 py-1 rounded-lg text-center font-heading">{size}</span>
                    <div className="flex-1 mx-3 h-2.5 cylinder-progress-track">
                      <div 
                        className="bg-gradient-to-r from-sky-400 to-sky-500 h-full cylinder-progress-bar"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-300 w-12 text-right">{count} units</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
