import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, AlertTriangle } from 'lucide-react';
import nrcmLogo from '../assets/nrcm_logo.png';
import campusBg from '../assets/campus.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (isAdminMode) {
        navigate('/admin/analytics');
      } else {
        navigate('/dashboard');
      }
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

      <div className="w-full max-w-md relative z-10">
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
            <p className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest mt-1">
              UGC Autonomous
            </p>
            <div className="h-[1px] w-full bg-slate-200/10 dark:bg-slate-800/50 my-4"></div>
            <h3 className="text-sm font-extrabold text-white dark:text-white font-heading uppercase tracking-wider">
              {isAdminMode ? 'Admin Console Entry' : 'Participant Login'}
            </h3>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 mb-6">
            <button
              type="button"
              onClick={() => { setIsAdminMode(false); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                !isAdminMode 
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Participant Portal
            </button>
            <button
              type="button"
              onClick={() => { setIsAdminMode(true); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isAdminMode 
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Console
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold text-[10px]">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 font-heading">
                Team Name / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter team name / email"
                  className="w-full plain-input rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 font-heading">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full plain-input rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl py-3.5 shadow-md active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Helper / Signup Links */}
          <div className="mt-6 pt-5 border-t border-slate-200/10 dark:border-slate-800/50 text-center">
            {!isAdminMode ? (
              <p className="text-xs text-slate-400 font-medium">
                New registration?{' '}
                <Link to="/signup" className="text-sky-400 hover:text-sky-300 font-extrabold transition-colors">
                  Create Participant Account
                </Link>
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 font-medium">
                Authorized entry console. Seed database logins are configured.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
