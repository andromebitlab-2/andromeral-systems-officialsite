import React from 'react';
import type { PostBlock } from '../types';
import { BlockType } from '../types';

interface PostRendererProps {
  blocks: PostBlock[];
}

const PostRenderer: React.FC<PostRendererProps> = ({ blocks }) => {
  return (
    <div className="prose lg:prose-xl max-w-none space-y-6">
      {blocks.sort((a,b) => a.order - b.order).map((block, index) => {
        switch (block.type) {
          case BlockType.TEXT:
            return <p key={index} className="text-gray-700 whitespace-pre-wrap">{block.content.text}</p>;
          case BlockType.CODE:
            return (
              <pre key={index} className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                <code>{block.content.code}</code>
              </pre>
            );
          case BlockType.IMAGE:
            return (
              <figure key={index} className="my-6">
                <img src={block.content.url} alt={block.content.alt || 'Post image'} className="w-full rounded-lg shadow-md" />
                {block.content.alt && <figcaption className="text-center text-sm text-gray-500 mt-2">{block.content.alt}</figcaption>}
              </figure>
            );
          case BlockType.CHANGELOG:
            return (
              <div key={index} className="border-l-4 border-[rgb(146,163,243)] p-4 my-6 bg-blue-50 rounded-r-lg">
                <h3 className="font-bold text-lg text-[rgb(146,163,243)]">Version {block.content.version}</h3>
                <ul className="list-disc list-inside mt-2">
                  {block.content.changes?.map((change, i) => (
                    <li key={i} className="text-gray-700">{change}</li>
                  ))}
                </ul>
              </div>
            );
          case BlockType.HEADER:
            const level = block.content.level || 2;
            // FIX: Use React.ElementType for type assertion to avoid issues with JSX namespace.
            const Tag = `h${level}` as React.ElementType;
            return <Tag key={index} className="font-bold text-gray-800 border-b pb-2 mt-8">{block.content.text}</Tag>;
          case BlockType.QUOTE:
            return (
                <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-6">
                    <p className="mb-2">"{block.content.text}"</p>
                    {block.content.author && <footer className="text-right text-sm not-italic text-gray-500">— {block.content.author}</footer>}
                </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default PostRenderer;