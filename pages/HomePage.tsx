import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const HomePage: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState('Design. Intelligence. Imagination.');
  const [heroSubtitle, setHeroSubtitle] = useState('Welcome to Andromeral Systems. We explore the frontiers where artificial intelligence meets human creativity.');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
        if (data) {
            if (data.hero_title) setHeroTitle(data.hero_title);
            if (data.hero_subtitle) setHeroSubtitle(data.hero_subtitle);
            if (data.home_banner_url) setBannerUrl(data.home_banner_url);
        }
    };
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full relative overflow-hidden rounded-3xl">
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
         {bannerUrl ? (
            <img src={bannerUrl} alt="Background" className="w-full h-full object-cover" />
         ) : (
            <div 
                className="w-full h-full"
                style={{
                    background: 'linear-gradient(135deg, rgb(229,178,205) 0%, rgb(186,168,209) 50%, rgb(144,158,212) 100%)'
                }}
            />
         )}
         {/* Overlay for text readability */}
         <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 p-8 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 tracking-tight leading-tight">
            {heroTitle.split('. ').map((part, index, array) => (
                <span key={index}>
                    {part}{index < array.length - 1 ? '. ' : ''}
                    {index === 1 && <br/>}
                </span>
            ))}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            {heroSubtitle}
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             <a href="#/helaia" className="px-8 py-3 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-lg">
                Explore HelaIA
             </a>
             <a href="https://ci-andromeral-systems.vercel.app/" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-900 font-medium hover:bg-white transition-colors shadow-sm">
                Creative System
             </a>
          </div>
      </div>
    </div>
  );
};

export default HomePage;