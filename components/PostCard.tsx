import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const author = post.profiles;
  const authorInitial = author?.username ? author.username.charAt(0).toUpperCase() : '?';

  return (
    <Link to={`/posts/${post.id}`} className="block group h-full">
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col h-full hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden bg-slate-100">
          <img 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
            src={post.banner_image_url} 
            alt={post.title} 
            loading="lazy"
          />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-3">
             <span className="text-xs font-bold tracking-wider uppercase text-[rgb(144,158,212)]">
                {post.category}
             </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-[rgb(229,178,205)] transition-colors">
            {post.title}
          </h2>
          
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center">
                {author?.avatar_url ? (
                <img src={author.avatar_url} alt={author.username || 'author'} className="w-6 h-6 rounded-full mr-2 object-cover" />
                ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold text-slate-500">{authorInitial}</span>
                </div>
                )}
                <span className="text-xs font-medium text-slate-500">{author?.username || 'Unknown'}</span>
            </div>
            <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;