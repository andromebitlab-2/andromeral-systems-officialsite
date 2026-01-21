
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { PostWithBlocks } from '../types';
import PostRenderer from '../components/PostRenderer';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';


const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();


  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          post_blocks (*),
          tags (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
      } else {
        setPost(data as any);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) return <Spinner />;
  if (!post) return <div className="text-center text-red-500">Post not found.</div>;
  
  const author = post.profiles;
  const authorInitial = author?.username ? author.username.charAt(0).toUpperCase() : '?';

  return (
    <article className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl">
      <img src={post.banner_image_url} alt={post.title} className="w-full h-96 object-cover rounded-t-lg mb-8" />
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 text-sm">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt={author.username || 'author'} className="w-10 h-10 rounded-full mr-4 object-cover" />
          ) : (
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="font-semibold text-gray-500 text-lg">{authorInitial}</span>
            </div>
          )}
          <div>
            <span>By {author?.username || 'Unknown'}</span>
            <div className="flex items-center">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
            {post.tags?.map(tag => (
                <span key={tag.id} className="px-2 py-1 text-xs font-semibold text-white rounded" style={{ backgroundColor: tag.color || '#6B7280' }}>
                    {tag.name}
                </span>
            ))}
        </div>
        {profile?.is_staff && (
            <Link to={`/admin/${post.id}`} className="mt-4 inline-block text-sm text-[rgb(144,158,212)] hover:underline">
                Edit Post
            </Link>
        )}
      </header>
      <PostRenderer blocks={post.post_blocks} />
    </article>
  );
};

export default PostPage;