import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ProfilePage: React.FC = () => {
    const { profile, refetchProfile, session } = useAuth();
    const [username, setUsername] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setAvatarPreview(profile.avatar_url || null);
        }
    }, [profile]);
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        let avatarUrlToUpdate = profile.avatar_url;

        if (avatarFile) {
            // FIX: Sanitize the filename to ensure it works with Supabase RLS policies.
            // Removing spaces and special characters keeps the path clean.
            const fileExt = avatarFile.name.split('.').pop();
            const cleanFileName = avatarFile.name.replace(/[^a-zA-Z0-9]/g, '_'); 
            const fileName = `${profile.id}/${Date.now()}_${cleanFileName}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, { upsert: true });
            
            if (uploadError) {
                console.error("Upload error details:", uploadError);
                setError(`Failed to upload new avatar: ${uploadError.message}`);
                setLoading(false);
                return;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrlToUpdate = data.publicUrl;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                username: username,
                avatar_url: avatarUrlToUpdate
            })
            .eq('id', profile.id);

        if (updateError) {
            setError('Error al actualizar el perfil. El nombre de usuario podría estar ocupado.');
        } else {
            setSuccess('¡Perfil actualizado con éxito!');
            await refetchProfile(); // Refresh profile data in the app
        }

        setLoading(false);
    };
    
    if (!profile) {
        return <Spinner />;
    }

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Configuración de la cuenta</h1>
                <p className="text-slate-500 mb-8 text-sm">Gestiona tu perfil público y detalles.</p>
                
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 ring-4 ring-slate-50">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-white text-3xl font-medium">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                <span className="text-xs font-medium">Cambiar</span>
                            </label>
                            <input id="avatar-upload" type="file" onChange={handleAvatarChange} accept="image/*" className="hidden"/>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900">Foto de perfil</h3>
                            <p className="text-xs text-slate-500 mt-1">Recomendado: JPG, PNG cuadrado. Máx 2MB.</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Correo electrónico</label>
                            <input type="email" id="email" value={session?.user?.email || ''} disabled className="block w-full px-4 py-3 bg-slate-50 border-transparent rounded-lg text-slate-500 text-sm focus:ring-0 cursor-not-allowed"/>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nombre de usuario</label>
                            <input 
                                type="text" 
                                id="username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                    {success && <div className="p-4 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{success}</div>}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {loading ? 'Guardando cambios...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;