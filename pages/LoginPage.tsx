import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Bienvenido de nuevo
          </h2>
          <p className="text-slate-500 text-sm mt-2">Por favor ingresa tus datos para iniciar sesión.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-sm text-center text-slate-500">
          ¿No tienes una cuenta?{' '}
          <Link to="/signup" className="font-semibold text-slate-900 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;