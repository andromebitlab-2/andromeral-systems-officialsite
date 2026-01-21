
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const HomePage: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState('Diseño. Inteligencia. Imaginación.');
  const [heroSubtitle, setHeroSubtitle] = useState('Bienvenido a Andromeral Systems. Exploramos las fronteras donde la inteligencia artificial se encuentra con la creatividad humana.');
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
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
         {bannerUrl ? (
            <img src={bannerUrl} alt="Background" className="w-full h-full object-cover" />
         ) : (
            <div 
                className="w-full h-full"
                style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}
            />
         )}
         {/* Subtle overlay */}
         <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 p-10 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black mb-8 text-slate-900 tracking-tighter leading-[0.9]">
            {heroTitle.split('. ').map((part, index, array) => (
                <span key={index} className="block">
                    {part}{index < array.length - 1 ? '.' : ''}
                </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            {heroSubtitle}
          </p>
          
          <div className="flex flex-wrap justify-center gap-5">
             <a href="#/helaia" className="px-10 py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                Explorar HelaIA
             </a>
             <a href="https://ci-andromeral-systems.vercel.app/" target="_blank" rel="noreferrer" className="px-10 py-4 rounded-full bg-white border border-slate-200 text-slate-900 font-semibold hover:border-slate-400 transition-all active:scale-95">
                Sistema Creativo
             </a>
          </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[rgb(144,158,212)]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[rgb(229,178,205)]/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HomePage;
