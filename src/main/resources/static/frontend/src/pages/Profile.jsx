import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, School, Phone, KeyRound, Save, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfileState } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    teamName: '',
    college: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        setFormData({
          email: res.data.email,
          teamName: res.data.teamName || '',
          college: res.data.college || '',
          phone: res.data.phone || '',
          password: '',
          confirmPassword: ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMsg('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (changePassword) {
      if (!formData.password || formData.password.trim() === '') {
        setErrorMsg('Password cannot be blank.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        teamName: formData.teamName,
        college: formData.college,
        phone: formData.phone,
      };

      if (changePassword) {
        payload.password = formData.password;
      }

      const res = await api.put('/api/users/profile', payload);
      
      // Update global context state (teamName, etc.) so sidebar and header update in real-time
      updateProfileState({
        teamName: res.data.teamName,
        college: res.data.college
      });

      setSuccessMsg('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setChangePassword(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 text-xs">Loading profile dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2 font-heading">
          <User className="w-6 h-6 text-sky-400" />
          <span>Profile & Account Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Modify your registration name, institute information, phone contact, or update password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info card */}
        <div className="glass-effect rounded-2xl border border-white/5 p-6 h-fit space-y-4 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl border border-slate-700/50">
            {formData.teamName ? formData.teamName.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 line-clamp-1">{formData.teamName || 'User Account'}</h3>
            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</p>
          </div>

          <div className="w-full border-t border-white/5 pt-4 text-xs text-slate-400 space-y-2 text-left">
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Account Email</span>
              <span className="text-slate-300 font-semibold">{formData.email}</span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Organization</span>
              <span className="text-slate-300 font-semibold truncate block">{formData.college || 'Not configured'}</span>
            </div>
          </div>
        </div>

        {/* Input form */}
        <div className="md:col-span-2 glass-effect rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-heading">
            <Save className="w-4 h-4 text-sky-400" />
            <span>Update Details</span>
          </h3>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 text-xs font-semibold flex items-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4.5 h-4.5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                  Account Email (Read Only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 opacity-60 cursor-not-allowed bg-slate-950/80 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                  Team / Participant Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="e.g. CodeStormers Alpha"
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                  College / Institution
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. NRCM Engineering College"
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                  Phone Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Block */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <div className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="accent-sky-500 cursor-pointer"
                />
                <label
                  htmlFor="changePassword"
                  className="text-[10px] font-bold uppercase text-slate-300 tracking-widest font-heading cursor-pointer"
                >
                  Enable Password Change
                </label>
              </div>

              {changePassword && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 animate-fade-in">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                      New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 font-heading">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-500 font-extrabold tracking-widest uppercase py-3 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.1)] hover:scale-[1.01] transition-all"
            >
              {submitting ? 'Updating Account...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
