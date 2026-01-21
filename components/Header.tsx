
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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
                <span className="text-gray-600">Welcome, {profile.username}</span>
                <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-[rgb(241,125,215)] rounded-md hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
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
