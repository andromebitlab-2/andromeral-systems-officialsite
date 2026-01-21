import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ProfilePage: React.FC = () => {
    const { profile, refetchProfile } = useAuth();
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
            const fileName = `${profile.id}/${Date.now()}-${avatarFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile, { upsert: true });
            
            if (uploadError) {
                setError('Failed to upload new avatar.');
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
            setError('Failed to update profile. Username might be taken.');
        } else {
            setSuccess('Profile updated successfully!');
            await refetchProfile(); // Refresh profile data in the app
        }

        setLoading(false);
    };
    
    if (!profile) {
        return <Spinner />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={profile.id} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"/>
                 </div>
                 <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[rgb(146,163,243)] focus:border-[rgb(146,163,243)]"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <div className="mt-2 flex items-center space-x-4">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 rounded-full object-cover" />
                        ) : (
                             <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-2xl text-gray-500">{username.charAt(0).toUpperCase()}</span>
                             </div>
                        )}
                        <input type="file" onChange={handleAvatarChange} accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[rgb(146,163,243)] hover:file:bg-violet-100"/>
                    </div>
                 </div>

                 {error && <p className="text-sm text-red-600">{error}</p>}
                 {success && <p className="text-sm text-green-600">{success}</p>}

                 <div>
                    <button type="submit" disabled={loading} className="w-full mt-4 py-3 text-white bg-gradient-to-r from-[rgb(146,163,243)] to-[rgb(241,125,215)] rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>
            </form>
        </div>
    );
};

export default ProfilePage;
