import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Users, Plus, Trash2, Folder, Image, Upload, 
  Sparkles, X, Grid, CheckCircle2 
} from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    priority: 1,
    active: true
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fetchGuests = async () => {
    try {
      const res = await api.get('/api/guests');
      setGuests(res.data);
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Selected file is not an image. Only PNG, JPG, or WebP allowed.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50MB capacity limit.');
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please fill out Guest Name.');
      return;
    }

    try {
      let photoUrl = '';
      if (selectedFile) {
        const storageRef = ref(storage, `guests/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        ...formData,
        photo: photoUrl
      };

      await api.post('/api/guests', payload);
      alert('Guest Dignitary details saved successfully!');
      
      // Reset State
      setFormData({
        name: '',
        photo: '',
        priority: 1,
        active: true
      });
      setSelectedFile(null);
      setFileName('');
      setShowModal(false);
      fetchGuests();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to save guest.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest card?')) return;

    try {
      await api.delete(`/api/guests/${id}`);
      alert('Guest record deleted.');
      fetchGuests();
    } catch (err) {
      alert('Failed to delete guest.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-100">
      {/* Top Header Section */}
      <div className="border-b border-white/5 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Users className="w-6 h-6 text-sky-400" />
            <span>Symposium Dignitaries & Guests Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Configure symposium dignitaries, guest list priorities, and horizontal slideshow cover photos.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/10 flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Guest Photo</span>
        </button>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-effect rounded-2xl border border-white/5 p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2 font-heading">
          <Folder className="w-4 h-4 text-sky-400" />
          <span>Active Dignitaries Ledger</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading guests...</div>
        ) : guests.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl">
            <Grid className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">No guest details uploaded yet. Click above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="py-3.5 px-2">Guest Photo</th>
                  <th className="py-3.5 px-2">Dignitary Name</th>
                  <th className="py-3.5 px-2 text-center">Priority Level</th>
                  <th className="py-3.5 px-2 text-center">Status</th>
                  <th className="py-3.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-950 border border-white/10">
                        {g.photo ? (
                          <img src={g.photo} alt={g.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600 font-bold uppercase">
                            No Pic
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2 font-black text-slate-100 uppercase">{g.name}</td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black">
                        Level {g.priority}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">ACTIVE</span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-200 border border-red-500/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-effect rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedFile(null);
                setFileName('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center space-x-2 font-heading mb-6 border-b border-white/5 pb-2">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
              <span>Add Guest Dignitary</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Guest Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar (VC NRCM)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority Weight (Lower = Appears first)
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border glass-input focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <option key={val} value={val}>Priority Level {val}</option>
                  ))}
                </select>
              </div>

              {/* Drag-and-drop Image Uploader */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Guest Photo (Max 50MB capacity)
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('guest-file').click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-sky-500 bg-sky-500/5' 
                      : 'border-white/10 hover:border-sky-500/20 bg-slate-950/20'
                  }`}
                >
                  <input
                    id="guest-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">Photo Loaded: {fileName}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFileName('');
                        }}
                        className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-bold">Drag and drop file here, or click to upload</p>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG, or WebP up to 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFile(null);
                    setFileName('');
                  }}
                  className="flex-1 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save Guest Dignitary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
