import React, { useState, useEffect } from 'react';
import api from '../api';
import { Layers, Plus, Pencil, Trash2, X } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', type: 'TEAM',
    minTeamSize: 2, maxTeamSize: 4, date: '', venue: '', active: true,
    labsConfig: 'Lab 1, Lab 2, Lab 3', maxBatchSize: 5,
    timetablePdf: '', extraInfo: '', upiId: '', paymentQr: '',
    helpDeskDetails: '', domains: '', themes: ''
  });
  const [selectedQrFile, setSelectedQrFile] = useState(null);
  const [previousEventNames, setPreviousEventNames] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events/all');
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching admin events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousEventNames = async () => {
    try {
      const res = await api.get('/api/events/previous-registrations/names');
      setPreviousEventNames(res.data);
    } catch (err) {
      console.error('Error fetching previous event names:', err);
    }
  };

  useEffect(() => { 
    fetchEvents();
    fetchPreviousEventNames();
  }, []);

  const downloadPreviousReport = (eventName, type) => {
    const format = type === 'excel' ? 'excel' : 'pdf';
    const ext = type === 'excel' ? 'csv' : 'pdf';
    const mime = type === 'excel' ? 'text/csv' : 'application/pdf';
    
    api.get(`/api/events/previous-registrations/report/${format}?eventName=${encodeURIComponent(eventName)}`, { responseType: 'blob' }).then(res => {
      const blob = new Blob([res.data], { type: mime });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `previous_registrations_${eventName.replace(/\s+/g, '_')}_report.${ext}`;
      link.click();
    }).catch(() => alert('Failed to download previous registrations report.'));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTimetableFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed for the timetable.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50MB capacity limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, timetablePdf: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentQrFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed for the Payment QR.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds the 50MB capacity limit.');
      return;
    }
    setSelectedQrFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, paymentQr: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setFormData({ 
      name: '', description: '', type: 'TEAM', minTeamSize: 2, maxTeamSize: 4, date: '', venue: '', active: true,
      labsConfig: 'Lab 1, Lab 2, Lab 3', maxBatchSize: 5, timetablePdf: '', extraInfo: '', upiId: '', paymentQr: '',
      helpDeskDetails: '', domains: '', themes: ''
    });
    setSelectedQrFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (event) => {
    setEditMode(true);
    setSelectedId(event.id);
    setFormData({
      name: event.name, description: event.description, type: event.type,
      minTeamSize: event.minTeamSize, maxTeamSize: event.maxTeamSize,
      date: event.date, venue: event.venue, active: event.active,
      labsConfig: event.labsConfig || 'Lab 1, Lab 2, Lab 3',
      maxBatchSize: event.maxBatchSize || 5,
      timetablePdf: event.timetablePdf || '',
      extraInfo: event.extraInfo || '',
      upiId: event.upiId || '',
      paymentQr: event.paymentQr || '',
      helpDeskDetails: event.helpDeskDetails || '',
      domains: event.domains || '',
      themes: event.themes || ''
    });
    setSelectedQrFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedFormData = { ...formData };
      if (selectedQrFile) {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedQrFile);
        const uploadRes = await api.post('/api/upload', uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedFormData.paymentQr = uploadRes.data.url;
      }
      if (editMode) {
        await api.put(`/api/events/${selectedId}`, updatedFormData);
        alert('Event updated successfully!');
      } else {
        await api.post('/api/events', updatedFormData);
        alert('Event created successfully!');
      }
      setSelectedQrFile(null);
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit event details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event and all its registrations?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      alert('Event deleted successfully.');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <Layers className="w-6 h-6 text-sky-400" />
            <span>Event Management Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Configure symposium event categories, team size constraints, dates, and locations.</p>
        </div>
        <button onClick={handleOpenCreate}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-[10px] tracking-widest uppercase shadow-lg shadow-sky-500/10 flex items-center space-x-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading events database...</div>
      ) : (
        <div className="overflow-x-auto glass-effect rounded-2xl border border-white/5 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-6">Event Name</th>
                <th className="py-4 px-6 text-center">Type</th>
                <th className="py-4 px-6 text-center">Squad Rules</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Venue</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-200 font-heading">{event.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      event.type === 'TEAM' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>{event.type}</span>
                  </td>
                  <td className="py-4 px-6 text-center text-xs font-semibold">
                    {event.type === 'TEAM' ? `Min: ${event.minTeamSize} / Max: ${event.maxTeamSize}` : 'Single Member'}
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-medium">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-slate-400 font-medium">{event.venue}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      event.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${event.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span>{event.active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right flex items-center justify-end space-x-2.5">
                    {previousEventNames.includes(event.name) && (
                      <div className="flex space-x-1 items-center bg-slate-950/60 border border-white/5 px-2 py-1 rounded-lg mr-1.5">
                        <span className="text-[9px] text-slate-500 font-bold mr-1">HIST:</span>
                        <button
                          onClick={() => downloadPreviousReport(event.name, 'excel')}
                          className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"
                          title="Download Historical Excel/CSV"
                        >
                          CSV
                        </button>
                        <span className="text-slate-800 text-[9px] mx-0.5">|</span>
                        <button
                          onClick={() => downloadPreviousReport(event.name, 'pdf')}
                          className="text-[9px] font-black text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider cursor-pointer"
                          title="Download Historical PDF"
                        >
                          PDF
                        </button>
                      </div>
                    )}
                    <button onClick={() => handleOpenEdit(event)}
                      className="p-2 rounded-lg border border-white/5 bg-slate-950/60 text-slate-400 hover:text-sky-400 hover:border-sky-500/20 hover:bg-slate-950 transition-all cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)}
                      className="p-2 rounded-lg border border-white/5 bg-slate-950/60 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-slate-950 transition-all cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl glass-effect rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-950 border border-white/5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white font-heading">{editMode ? 'Modify Symposium Event' : 'Create New Event'}</h3>
              <p className="text-xs text-slate-400 mt-1">Specify parameters, rules, capacities, and target venues.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Title</label>
                  <input type="text" required name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. CodeStorm Hackathon"
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none">
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="TEAM">TEAM EVENT</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange}
                  placeholder="Describe symposium rules, logistics, coding frameworks, etc." rows="3"
                  className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none"></textarea>
              </div>

              {formData.type === 'TEAM' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 shadow-inner">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Min Squad Members</label>
                    <input type="number" required name="minTeamSize" value={formData.minTeamSize} onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Max Squad Members</label>
                    <input type="number" required name="maxTeamSize" value={formData.maxTeamSize} onChange={handleChange}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Date</label>
                  <input type="date" required name="date" value={formData.date} onChange={handleChange}
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none text-slate-300" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Venue / Location</label>
                  <input type="text" required name="venue" value={formData.venue} onChange={handleChange}
                    placeholder="e.g. Auditorium Hall 1"
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 shadow-inner">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Labs Names Config (Comma-separated)</label>
                  <input type="text" name="labsConfig" value={formData.labsConfig} onChange={handleChange}
                    placeholder="e.g. Lab A, Lab B"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Max Batches Size</label>
                  <input type="number" name="maxBatchSize" value={formData.maxBatchSize} onChange={handleChange}
                    className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Timetable PDF</label>
                  {formData.timetablePdf ? (
                    <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5 shadow-inner">
                      <span className="text-[10px] text-emerald-400 font-bold">✓ PDF Timetable Loaded</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, timetablePdf: '' }))}
                        className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold uppercase"
                      >
                        Delete PDF
                      </button>
                    </div>
                  ) : (
                    <input type="file" accept="application/pdf" onChange={handleTimetableFile}
                      className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none text-slate-300" />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Extra Details / Schedule Notes</label>
                  <textarea name="extraInfo" value={formData.extraInfo} onChange={handleChange} rows="1"
                    placeholder="e.g. Bring your own laptops and multi-plugs."
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Help Desk Details</label>
                  <input type="text" name="helpDeskDetails" value={formData.helpDeskDetails} onChange={handleChange}
                    placeholder="e.g. Coordinator: Dr. V. Srinivas (9988776655)"
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Domains (comma-separated)</label>
                  <input type="text" name="domains" value={formData.domains} onChange={handleChange}
                    placeholder="e.g. Web Dev, App Dev"
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event Themes (comma-separated)</label>
                  <input type="text" name="themes" value={formData.themes} onChange={handleChange}
                    placeholder="e.g. AI/ML, Cyber Security"
                    className="w-full glass-input rounded-xl px-4 py-2.5 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 shadow-inner">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Event UPI ID</label>
                  <input type="text" name="upiId" value={formData.upiId} onChange={handleChange}
                    placeholder="e.g. 7569059847@ybl"
                    className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">Payment QR Code Image</label>
                  {formData.paymentQr ? (
                    <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-white/5">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white p-0.5 rounded overflow-hidden flex items-center justify-center">
                          <img src={formData.paymentQr} alt="QR Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="text-[9px] text-emerald-400 font-bold">✓ QR Loaded</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentQr: '' }));
                          setSelectedQrFile(null);
                        }}
                        className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" onChange={handlePaymentQrFile}
                      className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-1 text-xs text-slate-400 focus:outline-none" />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-950/60 p-4 rounded-xl border border-white/5 shadow-inner">
                <input type="checkbox" name="active" id="active" checked={formData.active} onChange={handleChange}
                  className="accent-sky-500 cursor-pointer" />
                <label htmlFor="active" className="text-[10px] font-bold uppercase text-slate-300 tracking-widest font-heading cursor-pointer">Active & Enrolling Participants</label>
              </div>

              <button type="submit"
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold tracking-widest uppercase py-3.5 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all">
                {editMode ? 'Save Event Configuration' : 'Establish New Symposium Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Historical Archived Registrations (Deleted Events) */}
      {previousEventNames.length > 0 && (
        <div className="glass-effect rounded-2xl border border-white/5 p-6 space-y-4 shadow-xl mt-8">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <span>Historical Archived Registrations (Deleted/Archived Events)</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Historical registrations preserved from deleted events. These reports can be downloaded at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {previousEventNames.map((name) => (
              <div 
                key={name}
                className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between space-x-4 hover:border-slate-800/80 hover:bg-slate-950/60 transition-all"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-200 truncate max-w-[150px]" title={name}>{name}</h3>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">ARCHIVED</span>
                </div>
                <div className="flex space-x-1.5 items-center">
                  <button
                    onClick={() => downloadPreviousReport(name, 'excel')}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    title="Download Excel Report"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => downloadPreviousReport(name, 'pdf')}
                    className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    title="Download PDF Report"
                  >
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}