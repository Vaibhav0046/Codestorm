import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  FileText, 
  Radio, 
  Layers,
  Image,
  Settings,
  Trophy,
  Users
} from 'lucide-react';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const linkClass = ({ isActive }) => 
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border ${
      isActive 
        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-inner' 
        : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
    }`;

  return (
    <aside 
      className={`sidebar-container fixed top-16 bottom-0 left-0 z-30 flex flex-col bg-[#0b0f19]/90 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ${
        isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'
      } md:flex`}
    >
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <p className={`text-slate-500 text-xs font-bold uppercase tracking-wider px-3 mb-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          {isAdmin ? 'ADMIN CONTROL' : 'PARTICIPANT'}
        </p>

        {isAdmin ? (
          <>
            <NavLink to="/admin/analytics" className={linkClass}>
              <BarChart3 className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Analytics Dashboard</span>
            </NavLink>
            
            <NavLink to="/admin/events" className={linkClass}>
              <Layers className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Event CRUD</span>
            </NavLink>
            
            <NavLink to="/admin/registrations" className={linkClass}>
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Registrations</span>
            </NavLink>

            <NavLink to="/admin/broadcast" className={linkClass}>
              <Radio className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>WS Broadcast</span>
            </NavLink>

            <NavLink to="/admin/highlights" className={linkClass}>
              <Trophy className="w-5 h-5 flex-shrink-0 text-yellow-500" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Highlights Manager</span>
            </NavLink>

            <NavLink to="/admin/guests" className={linkClass}>
              <Users className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Guests Manager</span>
            </NavLink>

            <NavLink to="/profile" className={linkClass}>
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Profile Settings</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>My Dashboard</span>
            </NavLink>

            <NavLink to="/events" className={linkClass}>
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Browse Events</span>
            </NavLink>

            <NavLink to="/registrations" className={linkClass}>
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>My Enrolls</span>
            </NavLink>



            <NavLink to="/highlights" className={linkClass}>
              <Trophy className="w-5 h-5 flex-shrink-0 text-yellow-500" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>🏆 Past Highlights</span>
            </NavLink>

            <NavLink to="/profile" className={linkClass}>
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Profile Settings</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-slate-800 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
