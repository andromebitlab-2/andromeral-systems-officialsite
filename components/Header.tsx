import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserAvatar: React.FC<{ profile: { username: string | null, avatar_url?: string | null } }> = ({ profile }) => {
    const initial = profile.username ? profile.username.charAt(0).toUpperCase() : '?';
    
    if (profile.avatar_url) {
        return <img className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm" src={profile.avatar_url} alt={profile.username || 'User Avatar'} />;
    }

    return (
        <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center ring-2 ring-white shadow-sm">
            <span className="text-white font-medium text-sm">{initial}</span>
        </div>
    );
};


const Header: React.FC = () => {
  const { profile, logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center">
        {/* Breadcrumbs or page title could go here */}
      </div>
      <div className="flex items-center">
        {profile ? (
            <div className="flex items-center gap-6">
                <Link to="/profile" className="flex items-center gap-3 group">
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{profile.username}</span>
                    <UserAvatar profile={profile} />
                </Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors focus:outline-none"
                >
                    Cerrar sesión
                </button>
            </div>
        ) : (
            <Link to="/login" className="px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
                Iniciar sesión
            </Link>
        )}
      </div>
    </header>
  );
};

export default Header;