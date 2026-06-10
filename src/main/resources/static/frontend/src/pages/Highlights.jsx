import React, { useState, useEffect } from 'react';
import api from '../api';
import { Award, Folder, BookOpen, Image, Sparkles, Trophy, Calendar, Grid, X } from 'lucide-react';

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeTab, setActiveTab] = useState('THEMES'); // 'THEMES', 'WINNERS', 'IMAGES'
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await api.get('/api/highlights');
        setHighlights(res.data);
      } catch (err) {
        console.error('Error fetching highlights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, []);

  // Extract unique years
  const yearsList = React.useMemo(() => {
    const years = [...new Set(highlights.map(h => h.yearTitle))];
    // Sort years descending
    return years.sort((a, b) => b.localeCompare(a));
  }, [highlights]);

  // Set default selected year when loaded
  useEffect(() => {
    if (yearsList.length > 0 && !selectedYear) {
      setSelectedYear(yearsList[0]);
    }
  }, [yearsList, selectedYear]);

  // Filter current tab highlights
  const activeHighlights = React.useMemo(() => {
    if (!selectedYear) return [];
    return highlights.filter(h => h.yearTitle === selectedYear && h.folderType === activeTab);
  }, [highlights, selectedYear, activeTab]);

  const groupedHighlights = React.useMemo(() => {
    const grouped = {};
    activeHighlights.forEach(h => {
      const key = h.title ? h.title.trim() : 'General Highlight';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(h);
    });
    return Object.entries(grouped).map(([title, items]) => {
      const firstItem = items[0];
      return {
        title,
        description: firstItem.description,
        coverImage: firstItem.imageUrl,
        items
      };
    });
  }, [activeHighlights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs font-semibold">
        Loading historical hackathon archives...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
          <Trophy className="w-6 h-6 text-yellow-500 animate-float-slow" />
          <span>Past Symposium & Hackathon Highlights</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Explore previous years' technical themes, prototype winners, engineering models, and event archives.
        </p>
      </div>

      {yearsList.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl max-w-2xl mx-auto">
          <Folder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">No historical hackathon archives have been uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Year Folders Selection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-effect rounded-2xl border border-white/5 p-4 space-y-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                Select Highlights Year
              </h2>
              <div className="space-y-2">
                {yearsList.map((year, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedYear(year);
                      setActiveTab('THEMES');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                      selectedYear === year
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-md shadow-sky-500/5'
                        : 'bg-slate-900/10 text-slate-400 border-white/5 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Folder className={`w-4 h-4 ${selectedYear === year ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="uppercase">{year}</span>
                    </div>
                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Folders/Tabs Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Folder tab bar */}
            <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-white/5 space-x-1">
              {[
                { type: 'THEMES', label: '🌟 Symposium Themes', icon: BookOpen },
                { type: 'WINNERS', label: '🏆 Prize Winners & Models', icon: Award },
                { type: 'IMAGES', label: '📷 Moments Gallery', icon: Image }
              ].map((tab, idx) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(tab.type)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab.type
                        ? 'bg-slate-900 text-sky-400 border border-white/5 shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Folder Tab Panel Grid */}
            <div className="glass-effect rounded-2xl border border-white/5 p-6 min-h-[400px]">
              {groupedHighlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-2">
                  <Grid className="w-8 h-8 text-slate-700" />
                  <p className="text-xs font-semibold">No uploads in this sub-folder yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupedHighlights.map((group) => (
                    <div
                      key={group.title}
                      onClick={() => setSelectedGroup(group)}
                      className="physical-folder cursor-pointer group"
                    >
                      {/* Folder Tab */}
                      <div className="folder-tab">
                        {selectedYear || "Album"}
                      </div>
                      {/* Folder Paper (Photo Sheet) */}
                      <div className="folder-paper">
                        {group.coverImage ? (
                          <img
                            src={group.coverImage}
                            alt={group.title}
                            className="folder-photo"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-[155px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 rounded border border-slate-200 dark:border-slate-800">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                        <div className="folder-paper-caption font-bold">
                          📁 {group.items.length} Photos
                        </div>
                      </div>
                      {/* Folder Front Flap */}
                      <div className="folder-front">
                        <div>
                          <h3 className="text-sm font-black text-slate-100 group-hover:text-sky-400 transition-colors uppercase tracking-wide leading-snug font-heading flex items-center space-x-1.5 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span className="truncate">{group.title}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-3">
                            {group.description}
                          </p>
                        </div>
                        <div className="pt-2 text-[9px] text-sky-400 font-extrabold uppercase tracking-widest flex items-center space-x-1">
                          <span>Click to View Album</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Album Modal Viewer */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-4xl relative glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Highlights Album Folder</span>
                <h3 className="text-xl font-extrabold text-white font-heading mt-0.5">{selectedGroup.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photos Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {selectedGroup.items.map((img, idx) => (
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Image #{idx + 1}</span>
                    <a 
                      href={img.imageUrl}
                      download={`Album_${selectedGroup.title.replace(/\s+/g, '_')}_${idx + 1}.png`}
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
    </div>
  );
}
