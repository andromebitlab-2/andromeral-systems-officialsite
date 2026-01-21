
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const SiteSettingsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
            if (data) {
                setHeroTitle(data.hero_title);
                setHeroSubtitle(data.hero_subtitle);
                setBannerUrl(data.home_banner_url);
            } else if (error && error.code !== 'PGRST116') {
                 console.error('Error fetching settings:', error);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !profile) return;
        const file = e.target.files[0];
        const fileName = `site-banner-${Date.now()}`;
        setSaving(true);
        // Using 'post-banners' for simplicity, ideally separate bucket
        const { error } = await supabase.storage.from('post-banners').upload(fileName, file);
        if (error) {
            alert('Error uploading banner image.');
            console.error(error);
        } else {
            const { data } = supabase.storage.from('post-banners').getPublicUrl(fileName);
            setBannerUrl(data.publicUrl);
        }
        setSaving(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase.from('site_settings').upsert({
            id: 1,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            home_banner_url: bannerUrl
        });

        if (error) {
            alert('Failed to save settings.');
            console.error(error);
        } else {
            alert('Settings saved successfully!');
        }
        setSaving(false);
    };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Site Configuration</h1>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Banner Image</label>
                    <div className="mb-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 aspect-video relative flex items-center justify-center">
                        {bannerUrl ? (
                            <img src={bannerUrl} alt="Main Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[rgb(229,178,205)] to-[rgb(144,158,212)] flex items-center justify-center">
                                <span className="text-white font-medium">Default Gradient</span>
                            </div>
                        )}
                    </div>
                    <input type="file" onChange={handleBannerUpload} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"/>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hero Title</label>
                    <input type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[rgb(144,158,212)] focus:border-transparent outline-none"/>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hero Subtitle</label>
                    <textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={3} className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-[rgb(144,158,212)] focus:border-transparent outline-none"/>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={saving} 
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SiteSettingsPage;
