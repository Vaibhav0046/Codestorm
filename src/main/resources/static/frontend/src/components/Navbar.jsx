import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import nrcmLogo from '../assets/nrcm_logo.png';

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { tickerMessage } = useNotifications();

  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass-effect z-40 flex items-center justify-between px-6 border-b border-slate-800">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white md:hidden p-1.5 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200/50 p-0.5 rounded-xl font-black tracking-wider flex items-center shadow-lg w-10 h-10 overflow-hidden">
            <img src={nrcmLogo} alt="NRCM Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:inline premium-accent-gradient font-heading">
            CDC - <span className="text-slate-200">Career Development Centre</span>
          </span>
        </div>
      </div>

      {/* Live Notification Ticker */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block overflow-hidden relative glass-card py-1.5 px-4 rounded-full border border-sky-500/10">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r dark:from-[#0f172a] from-white/90 to-transparent z-10"></div>
        <div className="w-full overflow-hidden whitespace-nowrap">
          <p className="animate-marquee text-xs font-semibold text-sky-400 flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            <span>LIVE UPDATE: {tickerMessage}</span>
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l dark:from-[#0f172a] from-white/90 to-transparent z-10"></div>
      </div>

      {/* User Info / Logout */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-200">{user?.teamName || 'Developer Team'}</span>
          <span className="text-xs text-sky-400 font-medium uppercase tracking-wider">{user?.role?.replace('ROLE_', '')}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md border border-slate-700">
            <User className="w-4 h-4" />
          </div>
          
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 border border-slate-700 hover:border-sky-500/30 transition-all duration-300 cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/30 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
