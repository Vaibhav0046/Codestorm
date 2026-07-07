import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, User, ArrowLeft, Plus, Trash2, Zap } from 'lucide-react';

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [teamName, setTeamName] = useState(user?.teamName || '');
  const [participants, setParticipants] = useState([]);
  const [domain, setDomain] = useState('');
  
  // Payment Details State
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState('');
  const [screenshotName, setScreenshotName] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/api/events/${id}`);
        setEvent(res.data);
        const initialCount = res.data.minTeamSize || 1;
        const initialMembers = Array.from({ length: initialCount }, (_, i) => ({
          name: '',
          email: '',
          phone: '',
          tshirtSize: 'L',
          foodPreference: 'VEG',
          college: ''
        }));
        setParticipants(initialMembers);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event metadata.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);

  const handleMemberChange = (index, field, value) => {
    setParticipants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMember = () => {
    if (participants.length >= event.maxTeamSize) {
      alert(`Maximum team size for this event is ${event.maxTeamSize} members.`);
      return;
    }
    setParticipants(prev => [
      ...prev,
      { name: '', email: '', phone: '', tshirtSize: 'L', foodPreference: 'VEG', college: user?.college || '' }
    ]);
  };

  const removeMember = (index) => {
    if (participants.length <= event.minTeamSize) {
      alert(`Minimum team size for this event is ${event.minTeamSize} members.`);
      return;
    }
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, WebP).');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        alert('File is too large. Max 4MB.');
        return;
      }
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setScreenshotFile(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!screenshotFile) {
      setError('Payment screenshot/proof is required to register.');
      return;
    }

    if (!utrNumber || utrNumber.trim().length < 12) {
      setError('A valid UTR transaction reference number is required (min 12 digits).');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/registrations', {
        eventId: parseInt(id),
        teamName: event.maxTeamSize > 1 ? teamName : user?.teamName || 'Individual',
        participants: participants,
        paymentScreenshot: screenshotFile,
        utrNumber: utrNumber,
        domain: domain
      });
      alert('Registration submitted successfully! Pending administrator approval.');
      navigate('/registrations'); // Route modified to registrations
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500 text-xs">Loading registration console...</div>;

  if (error && !event) return (
    <div className="py-12 text-center max-w-md mx-auto space-y-4">
      <p className="text-red-400 text-xs font-semibold">{error}</p>
      <Link to="/events" className="text-sky-400 font-extrabold hover:underline text-xs uppercase tracking-wider">Back to Catalog</Link>
    </div>
  );

  const domainsList = event?.domains
    ? event.domains.split(',').map(d => d.trim()).filter(d => d.length > 0)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link to="/events" className="inline-flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Meta Column */}
        <div className="glass-effect rounded-2xl p-6 border border-white/5 h-fit space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-3">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              event.type === 'TEAM' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {event.type} WORKFLOW
            </span>
            <h2 className="text-xl font-black text-slate-100 font-heading leading-tight uppercase mt-2">{event.name}</h2>
            <p className="text-xs leading-relaxed text-slate-400">{event.description}</p>
          </div>
          
          <div className="space-y-4 border-t border-white/5 pt-5 text-xs text-slate-300">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-950 p-2 rounded-lg border border-white/5 text-slate-500">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-heading">Symposium Date</p>
                <p className="font-semibold text-slate-200 mt-0.5">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-slate-950 p-2 rounded-lg border border-white/5 text-slate-500">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-heading">Assigned Venue</p>
                <p className="font-semibold text-slate-200 mt-0.5 truncate max-w-[180px]">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-slate-950 p-2 rounded-lg border border-white/5 text-slate-500">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-heading">Team Size Limit</p>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {event.minTeamSize === event.maxTeamSize
                    ? `${event.minTeamSize} member`
                    : `${event.minTeamSize} to ${event.maxTeamSize} members`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Form Column */}
        <div className="lg:col-span-2 glass-effect rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
              <Zap className="w-5 h-5 text-sky-400" />
              <span>Enrollment Panel</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Provide individual or squad details below to lock your seats.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {event.maxTeamSize > 1 && (
              <div className="bg-slate-950/60 border border-white/5 p-4.5 rounded-xl space-y-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest font-heading">Squad / Team Name</label>
                <input
                  type="text" required value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. CodeStormers Alpha"
                  className="w-full glass-input focus:ring-1 focus:ring-sky-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-6">
              {participants.map((member, index) => (
                <div 
                  key={index} 
                  className={`p-5 md:p-6 rounded-xl relative overflow-hidden transition-all duration-300 ${
                    index === 0 
                      ? 'glass-card glow-border-sky shadow-[0_0_20px_rgba(14,165,233,0.03)]' 
                      : 'bg-slate-950/40 border border-white/5'
                  } space-y-4`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center space-x-2 font-heading">
                      <User className="w-4 h-4" />
                      <span>{index === 0 ? 'Squad Leader' : `Participant Member #${index + 1}`}</span>
                    </h4>
                    {participants.length > event.minTeamSize && index !== 0 && (
                      <button 
                        type="button" 
                        onClick={() => removeMember(index)}
                        className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe', disabled: false },
                      { label: 'Email Address', field: 'email', type: 'email', placeholder: 'john@college.edu', disabled: false },
                      { label: 'Phone Contact', field: 'phone', type: 'text', placeholder: '10-digit number' },
                      { label: 'College', field: 'college', type: 'text', placeholder: 'College Name' },
                    ].map(({ label, field, type, placeholder, disabled }) => (
                      <div key={field}>
                        <label className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 font-heading">{label}</label>
                        <input
                          type={type} 
                          required 
                          value={member[field]}
                          disabled={disabled}
                          onChange={(e) => handleMemberChange(index, field, e.target.value)}
                          placeholder={placeholder}
                          className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none ${
                            disabled ? 'opacity-50 cursor-not-allowed bg-slate-950/80' : ''
                          }`}
                        />
                      </div>
                    ))}
                    
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 font-heading">T-Shirt Size</label>
                      <select 
                        value={member.tshirtSize} 
                        onChange={(e) => handleMemberChange(index, 'tshirtSize', e.target.value)}
                        className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-semibold text-slate-200"
                      >
                        {['S','M','L','XL','XXL'].map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 font-heading">Food Preference</label>
                      <select 
                        value={member.foodPreference} 
                        onChange={(e) => handleMemberChange(index, 'foodPreference', e.target.value)}
                        className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-semibold text-slate-200"
                      >
                        <option value="VEG" className="bg-slate-950">Vegetarian (VEG)</option>
                        <option value="NON_VEG" className="bg-slate-950">Non-Vegetarian (NON-VEG)</option>
                      </select>
                    </div>

                    {index === 0 && domainsList.length > 0 && (
                      <div className="md:col-span-2 bg-sky-500/5 p-4 rounded-xl border border-sky-500/10 space-y-2 mt-2">
                        <label className="block text-[9px] font-black uppercase text-sky-400 tracking-widest font-heading">
                          🎯 Challenge Track Domain Selection
                        </label>
                        <select 
                          required
                          value={domain} 
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-extrabold text-sky-300 font-sans"
                        >
                          <option value="" className="bg-slate-950 text-slate-400">-- Choose Domain Track --</option>
                          {domainsList.map(d => (
                            <option key={d} value={d} className="bg-slate-950 text-slate-200">{d}</option>
                          ))}
                        </select>
                        <p className="text-[9px] text-slate-500 font-medium">Domain track can only be chosen by the Squad Leader and applies to the entire team.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* UPI Payment Verification Section */}
            <div className="p-5 md:p-6 rounded-2xl border border-white/10 bg-slate-950/50 shadow-inner space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-2 font-heading">
                  <span>💳 Secure UPI Registration Fee Payment</span>
                </h4>
                <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg tracking-wider uppercase">REGISTRATION MANDATORY</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR / UPI Card */}
                <div className="p-5 bg-gradient-to-br from-[#121b30] to-[#0c1222] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4 shadow-lg">
                  <div className="w-full text-left space-y-1">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">OFFICIAL UPI ID TARGET</span>
                    <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                      <span className="font-mono text-xs text-sky-400 font-extrabold select-all">{event.upiId || '7569059847@ybl'}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(event.upiId || '7569059847@ybl');
                          alert('UPI ID Copied to Clipboard!');
                        }}
                        className="text-[9px] bg-sky-500/15 border border-sky-500/20 hover:bg-sky-500 hover:text-slate-950 text-sky-400 px-2.5 py-1 rounded transition-all cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {/* Large Scannable QR Code */}
                  <div className="w-64 h-64 bg-white p-3 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-[1.02] relative z-10">
                    <img 
                      src={event.paymentQr || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('upi://pay?pa=' + (event.upiId || '7569059847@ybl') + '&pn=' + encodeURIComponent(event.name || 'NRCM Symposium') + '&cu=INR')}`} 
                      alt="Scan to Pay" 
                      className="w-full h-full object-contain animate-fade-in" 
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Scan the QR code above or direct pay the symposium entry fee to the UPI address. Keep track of your UTR Transaction Reference Number and capture a screenshot proof.
                  </p>
                </div>

                {/* Payment Form Fields */}
                <div className="space-y-4">
                  {/* UTR Input */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1 font-heading">UTR Transaction Reference Number (12 Digits)</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9A-Za-z]{12,18}"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 314567890123"
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 text-slate-200"
                    />
                  </div>

                  {/* Screenshot Selector */}
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1 font-heading">Upload Payment Screenshot / Receipt</label>
                    <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative ${
                      screenshotFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 bg-slate-950/40'
                    }`}>
                      <input
                        type="file"
                        id="receipt-screenshot-upload"
                        accept="image/*"
                        required
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                      {screenshotFile ? (
                        <div className="space-y-2">
                          <p className="text-[10px] text-slate-200 font-bold max-w-[200px] mx-auto truncate">{screenshotName}</p>
                          <button 
                            type="button" 
                            onClick={() => { setScreenshotFile(''); setScreenshotName(''); }}
                            className="text-[9px] text-red-400 hover:text-red-300 font-bold underline"
                          >
                            Clear Receipt
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="receipt-screenshot-upload" className="cursor-pointer space-y-1 block">
                          <span className="text-[10px] text-sky-400 font-bold hover:underline block">Choose Payment Receipt Screenshot</span>
                          <span className="text-[8px] text-slate-500 block">PNG, JPG, WebP up to 4MB</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              {event.maxTeamSize > 1 && participants.length < event.maxTeamSize && (
                <button 
                  type="button" 
                  onClick={addMember}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-inner"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Squad Member</span>
                </button>
              )}
              
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-500 font-extrabold tracking-widest uppercase text-xs rounded-xl py-3.5 transition-all flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.1)]"
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <span>Submit Symposium Entry</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}