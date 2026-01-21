
import React from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link to={`/posts/${post.id}`} className="block group">
        <div className="overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <img className="object-cover w-full h-48" src={post.banner_image_url} alt={post.title} />
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-[rgb(146,163,243)] transition-colors duration-300">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600">By {post.profiles?.username || 'Unknown Author'}</p>
                <div className="flex flex-wrap gap-2 mt-4">
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
