import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (user && avatarFile) {
        // FIX: Sanitize filename here as well for consistency, though this is initial upload
        const fileExt = avatarFile.name.split('.').pop();
        const cleanFileName = avatarFile.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${user.id}/${Date.now()}_${cleanFileName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) {
            setError('Could not upload avatar, but user was created.');
            console.error('Avatar upload error:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
             const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);
            if (updateError) {
                setError('Could not save avatar URL, but user was created and avatar uploaded.');
                console.error('Profile update error:', updateError);
            }
        }
    }
    
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Crear una cuenta
          </h2>
          <p className="text-slate-500 text-sm mt-2">Únete a Andromeral Systems hoy.</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSignup}>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre de usuario</label>
            <input type="text" placeholder="juanperez" required value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"/>
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo electrónico</label>
             <input type="email" placeholder="nombre@empresa.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"/>
          </div>

          <div className="relative">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
             <div className="relative">
                 <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none"/>
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600">
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.303 6.546A10.048 10.048 0 00.458 10c1.274 4.057 5.064 7 9.542 7 1.111 0 2.179-.253 3.164-.703z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    )}
                 </button>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Foto de perfil (Opcional)</label>
            <input type="file" onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"/>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors">
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-sm text-center text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;