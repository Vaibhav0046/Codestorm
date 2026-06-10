import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Image, Folder, ChevronRight, Sparkles, Trophy, Calendar } from 'lucide-react';

export default function Gallery() {
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Group highlights by album (Year + SubType + Title)
  const groupedAlbums = React.useMemo(() => {
    const grp = {};
    highlights.forEach(h => {
      const key = `${h.yearTitle}-${h.folderType}-${h.title}`.trim().toUpperCase();
      if (!grp[key]) {
        grp[key] = [];
      }
      grp[key].push(h);
    });
    return Object.entries(grp).map(([key, items]) => {
      const first = items[0];
      return {
        key,
        yearTitle: first.yearTitle,
        folderType: first.folderType,
        title: first.title,
        description: first.description,
        coverImage: first.imageUrl,
        items
      };
    });
  }, [highlights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs font-semibold">
        Loading historical highlights archives...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
          <Trophy className="w-6 h-6 text-yellow-500 animate-float-slow" />
          <span>Symposium Historical Archives & Highlights</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Explore highlights of past years, engineering model prototypes, and win squads (Click to view full theme archives).
        </p>
      </div>

      {/* Grouped Highlights Cover Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedAlbums.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-2xl">
            <Folder className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">No highlights albums have been shared by developers yet.</p>
          </div>
        ) : (
          groupedAlbums.map((album) => (
            <div
              key={album.key}
              onClick={() => navigate('/highlights')}
              className="glass-effect rounded-2xl border border-white/5 overflow-hidden group cursor-pointer hover:border-sky-500/20 hover:shadow-[0_0_30px_rgba(14,165,233,0.05)] transition-all duration-300 flex flex-col justify-between"
            >
              {/* Cover Photo */}
              <div className="aspect-[16/10] relative overflow-hidden bg-slate-950">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600">
                    <Image className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <div className="absolute top-4 right-4 flex space-x-1.5">
                  <span className="bg-slate-950/80 border border-white/10 text-sky-400 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider">
                    {album.yearTitle}
                  </span>
                  <span className="bg-indigo-500/80 border border-indigo-500/10 text-slate-100 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider">
                    {album.folderType}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-sky-400 transition-colors uppercase tracking-wide font-heading">
                    {album.title}
                  </h3>
                  {album.description && (
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </div>
                <div className="pt-2 text-[9px] text-sky-400 font-extrabold uppercase tracking-widest flex items-center space-x-1">
                  <span>View Full Album</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
