import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const author = post.profiles;
  const authorInitial = author?.username ? author.username.charAt(0).toUpperCase() : '?';

  return (
    <Link to={`/posts/${post.id}`} className="block group">
      <div className="overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
        <img className="object-cover w-full h-48" src={post.banner_image_url} alt={post.title} />
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 group-hover:text-[rgb(146,163,243)] transition-colors duration-300">{post.title}</h2>
          <div className="flex items-center mt-4 text-sm text-gray-600">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.username || 'author'} className="w-8 h-8 rounded-full mr-3 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="font-semibold text-gray-500">{authorInitial}</span>
              </div>
            )}
            <span>By {author?.username || 'Unknown Author'}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {post.tags?.map(tag => (
              <span key={tag.id} className="px-2 py-1 text-xs font-semibold text-white rounded" style={{ backgroundColor: tag.color || '#6B7280' }}>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
