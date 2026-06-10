import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Trophy, Plus, Trash2, Folder, Image, BookOpen, 
  Upload, Sparkles, X, Grid, FileText, CheckCircle2, Eye
} from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    yearTitle: '',
    folderType: 'THEMES',
    title: '',
    description: '',
    active: true
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [dragActive, setDragActive] = useState(false);

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

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesList(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesList(e.target.files);
    }
  };

  const handleFilesList = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image. Only PNG, JPG, or WebP allowed.`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds the 50MB capacity limit.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setFileNames(prev => [...prev, ...validFiles.map(f => f.name)]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setFileNames(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.yearTitle || !formData.title) {
      alert('Please fill out Year Folder (e.g. 2025 HIGHLIGHTS) and Title.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one image file.');
      return;
    }

    try {
      setLoading(true);
      
      const payloads = [];
      // Upload all files sequentially to Firebase Storage first
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const storageRef = ref(storage, `highlights/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        payloads.push({
          ...formData,
          yearTitle: formData.yearTitle.trim().toUpperCase(),
          imageUrl: downloadUrl
        });
      }

      await api.post('/api/highlights/bulk', payloads);
      
      alert('All Highlight photos saved successfully!');
      
      // Reset State
      setFormData({
        yearTitle: '',
        folderType: 'THEMES',
        title: '',
        description: '',
        active: true
      });
      setSelectedFiles([]);
      setFileNames([]);
      setShowModal(false);
      fetchHighlights();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to save highlights.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm('Delete this photo from the album?')) return;
    try {
      await api.delete(`/api/highlights/${id}`);
      fetchHighlights();
    } catch (err) {
      alert('Failed to delete photo.');
    }
  };

  const handleDeleteAlbum = async (album) => {
    if (!window.confirm(`Delete the entire album "${album.title}" containing ${album.items.length} photo(s)?`)) return;
    try {
      setLoading(true);
      for (const item of album.items) {
        await api.delete(`/api/highlights/${item.id}`);
      }
      alert('Album deleted successfully.');
      fetchHighlights();
    } catch (err) {
      alert('Failed to delete album.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddPhotos = (album) => {
    setFormData({
      yearTitle: album.yearTitle,
      folderType: album.folderType,
      title: album.title,
      description: album.description,
      active: true
    });
    setSelectedFiles([]);
    setFileNames([]);
    setShowModal(true);
  };

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
        items
      };
    });
  }, [highlights]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      {/* Top Header Section */}
      <div className="border-b border-white/5 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Highlights Album Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Manage previous hackathon years, themes, win squads, and model prototypes (supports files up to 50MB).
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              yearTitle: '',
              folderType: 'THEMES',
              title: '',
              description: '',
              active: true
            });
            setSelectedFiles([]);
            setFileNames([]);
            setShowModal(true);
          }}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/10 flex items-center space-x-2 cursor-pointer animate-pulse-slow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Highlights Album</span>
        </button>
      </div>

      {/* Grouped Albums Ledger */}
      <div className="glass-effect rounded-2xl border border-white/5 p-6 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2 font-heading">
          <Folder className="w-4 h-4 text-sky-400" />
          <span>Active Highlights Folders</span>
        </h2>

        {loading && highlights.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading albums...</div>
        ) : groupedAlbums.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl">
            <Grid className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">No highlights albums uploaded yet. Click above to create one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAlbums.map((album) => (
              <div 
                key={album.key}
                className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all shadow-lg space-y-4"
              >
                {/* Album Metadata Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase bg-slate-900 border border-white/5 px-2.5 py-1 rounded text-sky-400 tracking-wider">
                        {album.yearTitle}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                        {album.folderType}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        📁 {album.items.length} Photos
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white uppercase tracking-wide font-heading pt-1">{album.title}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenAddPhotos(album)}
                      className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photos</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAlbum(album)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-200 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center space-x-1"
                      title="Delete Album"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Album</span>
                    </button>
                  </div>
                </div>

                {/* Album Description */}
                {album.description && (
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{album.description}</p>
                )}

                {/* Album Photos Strip List (Delete photos individually) */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Album Photo Strip (Hover to Delete)</span>
                  <div className="flex flex-wrap gap-4 py-2">
                    {album.items.map((img, idx) => (
                      <div 
                        key={img.id}
                        className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-white/10 relative group shadow-md"
                      >
                        <img src={img.imageUrl} alt={`Album Item ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(img.id)}
                            className="p-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white cursor-pointer transition-colors"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto pr-2">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedFiles([]);
                setFileNames([]);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-heading mb-6 border-b border-white/5 pb-2">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
              <span>Archive Highlights Card</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
              <div className="grid grid-cols-2 gap-4">
                {/* Year Folder */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Year Folder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025 HIGHLIGHTS"
                    value={formData.yearTitle}
                    onChange={(e) => setFormData({ ...formData, yearTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                  />
                </div>
                {/* Sub Folder Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Sub-Folder Category
                  </label>
                  <select
                    value={formData.folderType}
                    onChange={(e) => setFormData({ ...formData, folderType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                  >
                    <option value="THEMES">🌟 Event Themes</option>
                    <option value="WINNERS">🏆 Winners & Prototype Models</option>
                    <option value="IMAGES">📷 Moments Gallery</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Highlight Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Telemetry Agriculture Model"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Highlight Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe details, squads, model metrics, or themes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                />
              </div>

              {/* Drag-and-drop Image Uploader */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Attach Photo(s) (Supports Multiple Uploads, Max 50MB capacity)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('highlight-file').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-sky-500 bg-sky-500/5' 
                      : 'border-white/10 hover:border-sky-500/20 bg-slate-950/20'
                  }`}
                >
                  <input
                    id="highlight-file"
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">Drag & drop files here, or click to upload</p>
                    <p className="text-[10px] text-slate-500">Supports PNG, JPG, or WebP up to 50MB (Multi-select enabled)</p>
                  </div>
                </div>
              </div>

              {/* File Names List Preview */}
              {fileNames.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Selected Files ({fileNames.length})</span>
                  <div className="max-h-36 overflow-y-auto divide-y divide-white/5 space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 shadow-inner">
                    {fileNames.map((name, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] py-1">
                        <span className="text-slate-300 font-medium truncate max-w-[250px]">{name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="text-[9px] text-red-400 hover:text-red-300 font-extrabold uppercase font-heading cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setBase64Files([]);
                    setFileNames([]);
                  }}
                  className="flex-1 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:bg-slate-900 disabled:text-slate-500"
                >
                  {loading ? 'Saving Photos...' : `Save ${selectedFiles.length > 0 ? selectedFiles.length : ''} Highlight Cards`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
