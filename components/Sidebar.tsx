
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { profile } = useAuth();

  const activeLinkClass = "bg-gradient-to-r from-[rgba(146,163,243,0.2)] to-[rgba(241,125,215,0.2)] text-gray-800 border-r-4 border-[rgb(146,163,243)]";
  const inactiveLinkClass = "hover:bg-gray-100 text-gray-500";
  const linkBaseClass = "flex items-center mt-4 py-2 px-6 transition-colors duration-200";

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[rgb(146,163,243)] to-[rgb(241,125,215)]">
          Andromeral Systems
        </h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <NavLink to="/" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span className="mx-4 font-medium">Home</span>
        </NavLink>
        <a 
            href="https://ci-andromeral-systems.vercel.app/#creative" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${linkBaseClass} ${inactiveLinkClass}`}
        >
            <span className="mx-4 font-medium">Creative Imagination</span>
        </a>
        <NavLink to="/helaia" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span className="mx-4 font-medium">HelaIA</span>
        </NavLink>
        <NavLink to="/otros" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
          <span className="mx-4 font-medium">Otros</span>
        </NavLink>
        {profile?.is_staff && (
           <NavLink to="/admin" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
             <span className="mx-4 font-medium">Admin Panel</span>
           </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
