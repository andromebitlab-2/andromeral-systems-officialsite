
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  const activeLinkClass = "bg-slate-900 text-white shadow-sm";
  const inactiveLinkClass = "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50";
  const linkBaseClass = "flex items-center mt-1 py-2 px-4 mx-3 rounded-lg transition-all duration-200 text-sm font-medium";

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100">
      <div className="flex items-center px-7 h-20">
        <NavLink to="/" className="text-xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
          Andromeral<span className="text-[rgb(144,158,212)]">.</span>
        </NavLink>
      </div>
      <nav className="flex-1 py-6">
        <NavLink to="/" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span>Inicio</span>
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
           <div className="mt-10">
             <div className="px-7 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
               Administración
             </div>
             <NavLink to="/admin" end className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
               <span>Panel de Control</span>
             </NavLink>
             <NavLink to="/admin/settings" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
               <span>Ajustes del Sitio</span>
             </NavLink>
           </div>
        )}
      </nav>
      
      <div className="p-7 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">© 2024 ANDROMERAL SYSTEMS</p>
      </div>
    </div>
  );
};

export default Sidebar;
