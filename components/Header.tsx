import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserAvatar: React.FC<{ profile: { username: string | null, avatar_url?: string | null } }> = ({ profile }) => {
    const initial = profile.username ? profile.username.charAt(0).toUpperCase() : '?';
    
    if (profile.avatar_url) {
        return <img className="h-10 w-10 rounded-full object-cover" src={profile.avatar_url} alt={profile.username || 'User Avatar'} />;
    }

    return (
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[rgb(146,163,243)] to-[rgb(241,125,215)] flex items-center justify-center">
            <span className="text-white font-bold text-xl">{initial}</span>
        </div>
    );
};


const Header: React.FC = () => {
  const { profile, logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-100">
      <div className="flex items-center">
        {/* Mobile sidebar toggle can be added here */}
      </div>
      <div className="flex items-center">
        {profile ? (
            <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-3 group">
                    <span className="text-gray-600 group-hover:text-[rgb(146,163,243)] transition-colors">{profile.username}</span>
                    <UserAvatar profile={profile} />
                </Link>
                <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none"
                >
                    Logout
                </button>
            </div>
        ) : (
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-[rgb(146,163,243)] rounded-md hover:bg-opacity-90">
                Login
            </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
