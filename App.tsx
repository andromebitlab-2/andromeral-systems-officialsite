
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import PostPage from './pages/PostPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex h-screen bg-white">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-6 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/creative-imagination" element={<FeedPage key="creative-imagination" category="Creative Imagination" />} />
                  <Route path="/helaia" element={<FeedPage key="helaia" category="HelaIA" />} />
                  <Route path="/otros" element={<FeedPage key="otros" category="Otros" />} />
                  <Route path="/posts/:id" element={<PostPage />} />
                  <Route
                    path="/admin/:postId?"
                    element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    return profile?.is_staff ? <>{children}</> : <Navigate to="/login" />;
};


export default App;
