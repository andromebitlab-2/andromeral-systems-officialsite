import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


interface FeedPageProps {
  category: string;
}

const FeedPage: React.FC<FeedPageProps> = ({ category }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select(`
            *,
            profiles (*),
            tags (*)
        `)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data as any);
      }
      setLoading(false);
    };

    const searchDebounce = setTimeout(() => {
        fetchPosts();
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [category, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{category}</h1>
                <p className="text-slate-500 mt-2 text-sm">Explora el contenido más reciente en {category}.</p>
            </div>
            {profile?.is_staff && (
                <Link to="/admin" className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    + Nuevo Post
                </Link>
            )}
        </div>
      <div className="mb-10">
        <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            <input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
            />
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full py-20 text-center">
                <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                </div>
                <p className="text-slate-500 font-medium">No se encontraron posts.</p>
                <p className="text-slate-400 text-sm">Intenta ajustar tus términos de búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;