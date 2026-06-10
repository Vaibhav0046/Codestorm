import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Users, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Send } from 'lucide-react';
import api from '../api';
import campusBg from '../assets/campus.png';
import nrcmLogo from '../assets/nrcm_logo.png';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    teamName: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Password complexity checks
  const isMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = isMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError('');
    setSuccessMsg('');
    setSendingOtp(true);

    try {
      const res = await api.post(`/api/auth/send-otp?email=${encodeURIComponent(formData.email)}`);
      setOtpSent(true);
      if (res.data && res.data.otp) {
        setFormData(prev => ({ ...prev, otp: res.data.otp }));
        setSuccessMsg(`OTP Code auto-filled: ${res.data.otp}`);
      } else {
        setSuccessMsg("Verification code sent! Please check your inbox or server logs.");
      }
      setCooldown(60); // 60s cooldown
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isPasswordValid) {
      setError("Please meet all password requirements before registering.");
      return;
    }

    if (!formData.otp) {
      setError("Verification code is required.");
      return;
    }

    setLoading(true);
    const res = await signup(formData);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${campusBg})` }}
    >
      <div className="absolute inset-0 login-bg-overlay pointer-events-none z-0"></div>

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Plain Box Card */}
        <div className="plain-login-card rounded-3xl p-8 relative overflow-hidden">
          {/* Brand Header Inside the Card */}
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-1 rounded-xl mb-3 w-16 h-16 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
              <img src={nrcmLogo} alt="NRCM Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-[15px] font-black text-center text-slate-100 dark:text-slate-100 font-heading tracking-wide leading-tight uppercase">
              Narsimha Reddy Engineering College
            </h2>
            <p className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest mt-1">
              CDC - CodeStorm 2026
            </p>
            <div className="h-[1px] w-full bg-slate-200/10 dark:bg-slate-800/50 my-4"></div>
            <h3 className="text-sm font-extrabold text-white dark:text-white font-heading uppercase tracking-wider">
              Register Your Team
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-[10px]">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-[10px]">{successMsg}</span>
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 font-heading">
                Team Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="e.g. Innovators"
                  className="w-full plain-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 font-heading">
                Leader Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@college.com"
                  className="w-full plain-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* OTP Verification Field */}
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 font-heading">
                OTP Verification Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Send className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required={otpSent}
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="6-digit code"
                    className="w-full plain-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || cooldown > 0}
                  className="px-4 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-bold transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
                >
                  {sendingOtp ? "Sending..." : cooldown > 0 ? `Resend (${cooldown}s)` : "Get OTP"}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 font-heading">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full plain-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none"
                />
              </div>

              {/* Password strength/indicators */}
              <div className="mt-3 bg-slate-50 dark:bg-white/2 rounded-xl p-3 border border-slate-200 dark:border-white/5 space-y-1.5">
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-400" /> Strength Checklist
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className={`flex items-center gap-1 ${isMinLength ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Min 8 chars
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${hasLowercase ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1 Number
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl py-3.5 shadow-md active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>Register Team</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/10 dark:border-slate-800/50 text-center text-xs">
            <p className="text-slate-400 font-medium">
              Already registered?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-extrabold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
