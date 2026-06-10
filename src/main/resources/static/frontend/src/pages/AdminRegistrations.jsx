import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Download, Check, X, Search, Filter, ShieldAlert, ChevronDown, ChevronUp, FileDown, Layers, Shirt, UtensilsCrossed } from 'lucide-react';

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTshirt, setSelectedTshirt] = useState('ALL');
  const [selectedFood, setSelectedFood] = useState('ALL');
  const [sortBy, setSortBy] = useState('DATE_DESC');
  const [expandedRegId, setExpandedRegId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Lightroom zoom receipt
  const [zoomedReceipt, setZoomedReceipt] = useState(null);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/api/registrations');
      setRegistrations(res.data);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchRegistrations(), fetchEvents()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/registrations/${id}/status?status=${status}`);
      alert(`Registration ${status.toLowerCase()} successfully!`);
      fetchRegistrations();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleToggleCertificate = async (id, approved) => {
    try {
      await api.put(`/api/registrations/${id}/approve-certificate?approved=${approved}`);
      alert(`Certificate approval status updated successfully!`);
      fetchRegistrations();
    } catch (err) {
      alert('Failed to update certificate approval.');
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    const visibleIds = filtered.map(r => r.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleBulkCertify = async (approved) => {
    if (selectedIds.length === 0) {
      alert('Please select at least one squad.');
      return;
    }
    if (!window.confirm(`Bulk ${approved ? 'approve' : 'revoke'} certificates for ${selectedIds.length} squad(s)?`)) return;
    try {
      await api.put(`/api/registrations/approve-certificates?ids=${selectedIds.join(',')}&approved=${approved}`);
      alert('Bulk certificate approval completed successfully!');
      setSelectedIds([]);
      fetchRegistrations();
    } catch (err) {
      alert('Bulk certification failed.');
    }
  };

  const toggleExpand = (id) => setExpandedRegId(prev => prev === id ? null : id);

  const downloadReport = (type) => {
    const format = type === 'excel' ? 'excel' : 'pdf';
    const ext = type === 'excel' ? 'csv' : 'pdf';
    const mime = type === 'excel' ? 'text/csv' : 'application/pdf';
    const orderedIds = filtered.map(r => r.id).join(',');
    
    api.get(`/api/registrations/report/${format}?ids=${orderedIds}`, { responseType: 'blob' }).then(res => {
      const blob = new Blob([res.data], { type: mime });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `registrations_report_${new Date().toISOString().substring(0,10)}.${ext}`;
      link.click();
    }).catch(() => alert('Failed to download report.'));
  };

  const downloadSingleCertificate = (id, teamName) => {
    api.get(`/api/registrations/${id}/certificate`, { responseType: 'blob' }).then(res => {
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Certificate_${teamName.replace(/\s+/g, '_')}.pdf`;
      link.click();
    }).catch(() => alert('Failed to generate certificate.'));
  };

  const downloadTeamRoster = (reg) => {
    let csvContent = "\uFEFFName,Email,Phone,College,T-Shirt Size,Food Preference\n";
    reg.participants.forEach(p => {
      csvContent += `"${p.name}","${p.email}","${p.phone}","${p.college}","${p.tshirtSize}","${p.foodPreference}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `roster_${reg.teamName.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const filtered = registrations
    .filter(r => {
      const matchesSearch = r.teamName.toLowerCase().includes(search.toLowerCase()) ||
                            r.user.email.toLowerCase().includes(search.toLowerCase());
      const matchesEvent = selectedEvent === 'ALL' || r.event.id === parseInt(selectedEvent);
      const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      
      const matchesTshirt = selectedTshirt === 'ALL' || r.participants.some(p => p.tshirtSize === selectedTshirt);
      const matchesFood = selectedFood === 'ALL' || r.participants.some(p => p.foodPreference === selectedFood);
      
      return matchesSearch && matchesEvent && matchesStatus && matchesTshirt && matchesFood;
    })
    .sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.registrationDate) - new Date(b.registrationDate);
      }
      if (sortBy === 'COLLEGE_ASC') {
        const colA = a.participants[0]?.college || a.user.college || '';
        const colB = b.participants[0]?.college || b.user.college || '';
        return colA.localeCompare(colB);
      }
      if (sortBy === 'TEAM_SIZE_DESC') {
        return b.participants.length - a.participants.length;
      }
      if (sortBy === 'TEAM_SIZE_ASC') {
        return a.participants.length - b.participants.length;
      }
      if (sortBy === 'LAB_ALLOTMENT_ASC') {
        const labA = a.labAllotment || '';
        const labB = b.labAllotment || '';
        return labA.localeCompare(labB);
      }
      if (sortBy === 'LAB_ALLOTMENT_DESC') {
        const labA = a.labAllotment || '';
        const labB = b.labAllotment || '';
        return labB.localeCompare(labA);
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
            <FileText className="w-6 h-6 text-sky-400" />
            <span>Registrations Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Review pending student enrollments, manage approvals, and export conference rosters.</p>
        </div>
        
        <div className="flex space-x-3 items-center">
          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 animate-fade-in mr-2">
              <button onClick={() => handleBulkCertify(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-[10px] tracking-widest uppercase transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-yellow-500/10">
                <Check className="w-4 h-4" />
                <span>Bulk Approve Certs ({selectedIds.length})</span>
              </button>
              <button onClick={() => handleBulkCertify(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center space-x-1.5 cursor-pointer shadow-inner">
                <X className="w-4 h-4" />
                <span>Bulk Revoke ({selectedIds.length})</span>
              </button>
            </div>
          )}

          <button onClick={() => downloadReport('excel')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase transition-all flex items-center space-x-2 cursor-pointer shadow-inner">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button onClick={() => downloadReport('pdf')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/5 px-4 py-2.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase transition-all flex items-center space-x-2 cursor-pointer shadow-inner">
            <FileDown className="w-4 h-4 text-sky-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card rounded-2xl border border-white/5 p-4 md:p-5 flex flex-col gap-4 shadow-md">
        {/* Row 1: Search & Event */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="relative flex-1 w-full text-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Team Name or Registrant Email..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 focus:outline-none" />
          </div>
          
          <div className="relative w-full md:w-64 text-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Filter className="w-4 h-4" />
            </div>
            <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 focus:outline-none text-slate-300">
              <option value="ALL">All Symposium Events</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Sub-Column and Sort Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full border-t border-white/5 pt-3.5">
          {/* Status Filter */}
          <div className="relative text-xs">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2.5 focus:outline-none text-slate-300">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* T-Shirt Filter */}
          <div className="relative text-xs flex items-center">
            <Shirt className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
            <select value={selectedTshirt} onChange={(e) => setSelectedTshirt(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-2 py-2.5 focus:outline-none text-slate-300">
              <option value="ALL">All T-Shirts</option>
              <option value="S">S Sizes</option>
              <option value="M">M Sizes</option>
              <option value="L">L Sizes</option>
              <option value="XL">XL Sizes</option>
              <option value="XXL">XXL Sizes</option>
            </select>
          </div>

          {/* Food Filter */}
          <div className="relative text-xs flex items-center">
            <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-2 py-2.5 focus:outline-none text-slate-300">
              <option value="ALL">All Food</option>
              <option value="VEG">VEG Only</option>
              <option value="NON_VEG">NON-VEG Only</option>
            </select>
          </div>

          {/* Sorting Option */}
          <div className="relative col-span-2 text-xs flex items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-2 hidden lg:inline">Sort By:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2.5 focus:outline-none text-sky-400 font-bold border-sky-500/20">
              <option value="DATE_DESC">Date Registered (Newest)</option>
              <option value="DATE_ASC">Date Registered (Oldest)</option>
              <option value="COLLEGE_ASC">College Name (A-Z)</option>
              <option value="TEAM_SIZE_DESC">Squad Size (Max-Min)</option>
              <option value="TEAM_SIZE_ASC">Squad Size (Min-Max)</option>
              <option value="LAB_ALLOTMENT_ASC">Lab Allotment (A-Z)</option>
              <option value="LAB_ALLOTMENT_DESC">Lab Allotment (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading registrations ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-xl">
          <p className="text-slate-400 text-xs">No symposium registrations match the current filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto glass-effect rounded-2xl border border-white/5 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="py-4 px-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={filtered.length > 0 && filtered.every(r => selectedIds.includes(r.id))} 
                    onChange={handleSelectAll} 
                    className="accent-sky-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4 w-8 text-center">Expand</th>
                <th className="py-4 px-6">Event & Allotment</th>
                <th className="py-4 px-6">Team / Squad</th>
                <th className="py-4 px-6">Registrant</th>
                <th className="py-4 px-6 text-center">Members</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Certify</th>
                <th className="py-4 px-6 text-center">Roster</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filtered.map((reg) => (
                <React.Fragment key={reg.id}>
                  <tr className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(reg.id)} 
                        onChange={() => handleSelectRow(reg.id)} 
                        className="accent-sky-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => toggleExpand(reg.id)} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1">
                        {expandedRegId === reg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200 font-heading">
                      <div>{reg.event.name}</div>
                      {reg.labAllotment && (
                        <div className="text-[10px] text-amber-400 font-extrabold flex items-center mt-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                          {reg.labAllotment}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">{reg.teamName}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">{reg.user.email}</td>
                    <td className="py-4 px-6 text-center text-slate-400 font-extrabold">{reg.participants.length}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        reg.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>{reg.status}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleToggleCertificate(reg.id, !reg.certificateGenerated)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center justify-center ${
                          reg.certificateGenerated
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/35 hover:bg-yellow-500 hover:text-slate-950'
                            : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                        title={reg.certificateGenerated ? "Revoke certificate approval" : "Approve for certification"}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => downloadTeamRoster(reg)}
                        className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/35 text-sky-400 border border-sky-500/25 transition-all cursor-pointer inline-flex items-center justify-center shadow-inner"
                        title="Download Participants Roster (CSV)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                      {reg.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleUpdateStatus(reg.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/35 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 hover:border-transparent transition-all cursor-pointer"
                            title="Approve registration">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleUpdateStatus(reg.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/35 hover:bg-red-500 hover:text-slate-950 text-red-400 hover:border-transparent transition-all cursor-pointer"
                            title="Reject registration">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {reg.status === 'APPROVED' && (
                        <button onClick={() => downloadSingleCertificate(reg.id, reg.teamName)}
                          className="bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center space-x-1 cursor-pointer transition-all">
                          <Download className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </button>
                      )}
                    </td>
                  </tr>
                  {/* Expanded Participant List */}
                  {expandedRegId === reg.id && (
                    <tr className="bg-slate-950/40">
                      <td colSpan="10" className="py-4 px-8 border-l-2 border-sky-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left Columns (Span 2): Members Details */}
                          <div className="lg:col-span-2 space-y-3">
                            <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-heading">Squad Member Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {reg.participants.map((p, idx) => (
                                <div key={p.id} className="p-4 bg-slate-950/90 border border-white/5 rounded-xl space-y-2 text-xs hover:border-white/10 transition-colors shadow-lg">
                                  <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                                    <span className="font-extrabold text-slate-200 font-heading">#{idx + 1} {p.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                      p.foodPreference === 'VEG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'
                                    }`}>{p.foodPreference}</span>
                                  </div>
                                  <div className="space-y-1 text-slate-400 font-medium mt-2">
                                    <p>Email: <span className="text-slate-300 font-mono text-[11px]">{p.email}</span></p>
                                    <p>Phone: <span className="text-slate-300">{p.phone}</span></p>
                                  </div>
                                  <div className="flex justify-between text-slate-500 text-[9px] uppercase font-bold pt-2 border-t border-white/5">
                                    <span>T-Shirt: {p.tshirtSize}</span>
                                    <span className="truncate max-w-[130px]" title={p.college}>{p.college}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right Column: Payment Details */}
                          <div className="p-4 bg-slate-950/90 border border-white/5 rounded-xl space-y-3 shadow-lg flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-heading">Symposium Payment Verification</h4>
                              <p className="text-[10px] text-slate-400 font-semibold">UTR Transaction Ref:</p>
                              <p className="font-mono text-xs font-black text-slate-200 bg-slate-900 px-2.5 py-1.5 rounded border border-white/5 tracking-wider truncate" title={reg.utrNumber || 'N/A'}>
                                {reg.utrNumber || 'NOT PROVIDED'}
                              </p>
                            </div>
                            
                            {reg.paymentScreenshot ? (
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment Receipt Proof:</p>
                                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10 relative bg-black group cursor-zoom-in"
                                     onClick={() => setZoomedReceipt(reg.paymentScreenshot)}>
                                  <img src={reg.paymentScreenshot} alt="Payment Receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <span className="text-[9px] font-black tracking-widest text-white uppercase bg-slate-950/80 border border-white/10 px-2.5 py-1 rounded-lg">🔍 Zoom Proof</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 border border-dashed border-white/5 rounded-lg text-center text-[10px] text-slate-500 italic">
                                No payment screenshot uploaded.
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lightroom zoomed receipt modal */}
      {zoomedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-2xl w-full glass-effect rounded-3xl p-4 border border-white/10 shadow-2xl flex flex-col items-center">
            <button onClick={() => setZoomedReceipt(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 cursor-pointer z-10">
              <X className="w-4 h-4" />
            </button>
            <div className="w-full rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              <img src={zoomedReceipt} alt="Zoomed Receipt" className="max-w-full max-h-[70vh] object-contain" />
            </div>
            <div className="mt-4 flex space-x-3 w-full text-xs">
              <a href={zoomedReceipt} download="Payment_Receipt_Screenshot.png"
                 className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 py-2.5 rounded-xl text-[10px] font-extrabold tracking-widest uppercase flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-sky-500/10">
                <Download className="w-4 h-4" />
                <span>Save Receipt Copy</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}