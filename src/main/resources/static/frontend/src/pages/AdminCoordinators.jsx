import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';

export default function AdminCoordinators() {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Student Lead Coordinator'
  });

  const fetchCoordinators = async () => {
    try {
      const res = await api.get('/api/coordinators');
      setCoordinators(res.data);
    } catch (err) {
      console.error('Error loading coordinators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Student Lead Coordinator'
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: c.role
    });
    setCurrentId(c.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/api/coordinators/${currentId}`, formData);
      } else {
        await api.post('/api/coordinators', formData);
      }
      setShowModal(false);
      fetchCoordinators();
    } catch (err) {
      alert('Failed to save coordinator details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coordinator?')) return;
    try {
      await api.delete(`/api/coordinators/${id}`);
      fetchCoordinators();
    } catch (err) {
      alert('Failed to delete coordinator.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2.5 font-heading">
            <Users className="w-6 h-6 text-sky-400" />
            <span>Coordinators Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure and manage symposium help desk committee contacts visible to participants.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold tracking-wider uppercase text-xs transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)] flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coordinator</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : coordinators.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-white/5 p-8">
          <p className="text-slate-400 text-xs">No coordinators configured yet.</p>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/65 text-slate-400 font-extrabold uppercase tracking-widest border-b border-white/5">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone No.</th>
                  <th className="py-4 px-6 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coordinators.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/20 transition-colors border-b border-white/5">
                    <td className="py-4 px-6 font-bold text-slate-200">{c.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400">{c.role}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">{c.email}</td>
                    <td className="py-4 px-6 text-slate-400 font-semibold">{c.phone}</td>
                    <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 rounded-lg border border-white/5 bg-slate-950/60 text-slate-400 hover:text-sky-400 hover:border-sky-500/20 hover:bg-slate-950 transition-all cursor-pointer"
                        title="Edit Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg border border-white/5 bg-slate-950/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-slate-950 transition-all cursor-pointer"
                        title="Delete Coordinator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-xs text-slate-300">
          <div className="w-full max-w-lg glass-effect rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950 border border-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white font-heading uppercase">
                {editMode ? 'Modify Coordinator Details' : 'Add Committee Coordinator'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Configure support contact parameters visible to participants.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Coordinator Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. K. Srinivasa Rao"
                  className="w-full plain-input rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Committee Role</label>
                <input
                  type="text"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Symposium Convener"
                  className="w-full plain-input rounded-xl px-4 py-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="srinivas.k@college.edu"
                    className="w-full plain-input rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full plain-input rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold tracking-widest uppercase py-3.5 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all"
              >
                {editMode ? 'Save Details' : 'Add Coordinator'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
