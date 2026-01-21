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
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">{category}</h1>
            {profile?.is_staff && (
                <Link to="/admin" className="px-4 py-2 text-white bg-gradient-to-r from-[rgb(146,163,243)] to-[rgb(241,125,215)] rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    + New Post
                </Link>
            )}
        </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[rgb(146,163,243)] focus:border-[rgb(146,163,243)]"
        />
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="col-span-full text-center text-gray-500">No posts found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
