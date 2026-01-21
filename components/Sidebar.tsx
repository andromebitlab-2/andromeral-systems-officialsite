import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  // Minimalist styling: Pill shape, subtle background for active, no heavy borders.
  const activeLinkClass = "bg-slate-900 text-white shadow-md";
  const inactiveLinkClass = "text-slate-500 hover:bg-slate-100 hover:text-slate-900";
  const linkBaseClass = "flex items-center mt-2 py-2.5 px-4 mx-3 rounded-lg transition-all duration-200 text-sm font-medium";

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
      <div className="flex items-center px-6 h-20">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Andromeral<span className="text-[rgb(144,158,212)]">.</span>
        </h1>
      </div>
      <nav className="flex-1 py-4">
        <NavLink to="/" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span>Home</span>
        </NavLink>
        <a 
            href="https://ci-andromeral-systems.vercel.app/#creative" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${linkBaseClass} ${inactiveLinkClass}`}
        >
            <span>Creative Imagination</span>
        </a>
        <NavLink to="/helaia" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span>HelaIA</span>
        </NavLink>
        <NavLink to="/otros" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span>Otros</span>
        </NavLink>
        
        {profile?.is_staff && (
           <div className="mt-8">
             <div className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
               Admin
             </div>
             <NavLink to="/admin" end className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
               <span>Dashboard</span>
             </NavLink>
             <NavLink to="/admin/settings" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
               <span>Site Settings</span>
             </NavLink>
           </div>
        )}
      </nav>
      
      <div className="p-6 border-t border-slate-100">
        <p className="text-xs text-slate-400">© 2024 Andromeral</p>
      </div>
    </div>
  );
};

export default Sidebar;