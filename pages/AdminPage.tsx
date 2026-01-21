
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { PostWithBlocks, PostBlock, Tag } from '../types';
import { BlockType } from '../types';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const AdminPage: React.FC = () => {
    const { postId } = useParams<{ postId?: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [category, setCategory] = useState('HelaIA');
    const [blocks, setBlocks] = useState<PostBlock[]>([]);
    
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [newTagName, setNewTagName] = useState('');

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const fetchAllTags = useCallback(async () => {
        const { data, error } = await supabase.from('tags').select('*');
        if (error) console.error("Error fetching tags", error);
        else setAllTags(data || []);
    }, []);

    const fetchPost = useCallback(async (id: string) => {
        const { data, error } = await supabase.from('posts').select('*, post_blocks(*)').eq('id', id).single();
        if (error) {
            console.error('Error fetching post for editing', error);
            navigate('/admin');
        } else if (data) {
            const postData = data as PostWithBlocks;
            setTitle(postData.title);
            setBannerUrl(postData.banner_image_url);
            setCategory(postData.category);
            setBlocks(postData.post_blocks.sort((a, b) => a.order - b.order));
            
            const { data: tagsData, error: tagsError } = await supabase.from('post_tags').select('tag_id').eq('post_id', id);
            if (tagsError) console.error("Error fetching post tags", tagsError);
            else setSelectedTags(new Set(tagsData.map(t => t.tag_id)));
        }
    }, [navigate]);

    useEffect(() => {
        setLoading(true);
        fetchAllTags();
        if (postId) {
            fetchPost(postId).finally(() => setLoading(false));
        } else {
            setTitle('');
            setBannerUrl('');
            setCategory('HelaIA');
            setBlocks([]);
            setSelectedTags(new Set());
            setLoading(false);
        }
    }, [postId, fetchPost, fetchAllTags]);

    const addBlock = (type: BlockType) => {
        const newBlock: PostBlock = {
            order: blocks.length, type,
            content: type === BlockType.CHANGELOG ? { changes: [''] } : type === BlockType.HEADER ? { level: 2 } : {}
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (index: number, content: PostBlock['content']) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = content;
        setBlocks(newBlocks);
    };
    
    const removeBlock = (index: number) => setBlocks(blocks.filter((_, i) => i !== index));

    const handleDragStart = (index: number) => setDraggedIndex(index);
    const handleDragEnter = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        const newBlocks = [...blocks];
        const [draggedItem] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(index, 0, draggedItem);
        setDraggedIndex(index);
        setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    };
    const handleDrop = () => setDraggedIndex(null);

    const handleTagSelection = (tagId: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tagId)) newSet.delete(tagId);
        else newSet.add(tagId);
        setSelectedTags(newSet);
    };

    const handleAddNewTag = async () => {
        const tagName = newTagName.trim();
        if (!tagName) return;
        const { data, error } = await supabase.from('tags').insert({ name: tagName }).select().single();
        if (error) {
            alert('Error creating tag. It might already exist.');
        } else if (data) {
            setAllTags([...allTags, data]);
            handleTagSelection(data.id);
            setNewTagName('');
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !profile) return;
        const file = e.target.files[0];
        const fileName = `${profile.id}/${Date.now()}-${file.name}`;
        setIsSubmitting(true);
        const { error } = await supabase.storage.from('post-banners').upload(fileName, file);
        setIsSubmitting(false);
        if (error) {
            alert('Error uploading banner image.');
            console.error(error);
        } else {
            const { data } = supabase.storage.from('post-banners').getPublicUrl(fileName);
            setBannerUrl(data.publicUrl);
        }
    };

    const handleSavePost = async () => {
        if (!profile || !title || !bannerUrl) return alert('Title and Banner are required.');
        setIsSubmitting(true);

        const postPayload = { title, banner_image_url: bannerUrl, category, author_id: profile.id };
        let upsertedPostId = postId;

        if (postId) {
            const { error } = await supabase.from('posts').update(postPayload).eq('id', postId);
            if (error) { console.error(error); alert('Failed to update post.'); setIsSubmitting(false); return; }
        } else {
            const { data, error } = await supabase.from('posts').insert(postPayload).select('id').single();
            if (error || !data) { console.error(error); alert('Failed to create post.'); setIsSubmitting(false); return; }
            upsertedPostId = data.id;
        }

        if(upsertedPostId) {
            // Manage tags
            await supabase.from('post_tags').delete().eq('post_id', upsertedPostId);
            const tagsToInsert = Array.from(selectedTags).map(tag_id => ({ post_id: upsertedPostId, tag_id }));
            if(tagsToInsert.length > 0) await supabase.from('post_tags').insert(tagsToInsert);

            // Manage blocks
            await supabase.from('post_blocks').delete().eq('post_id', upsertedPostId);
            const blocksToInsert = blocks.map((block, i) => ({ ...block, post_id: upsertedPostId, order: i }));
            if (blocksToInsert.length > 0) {
                const { error } = await supabase.from('post_blocks').insert(blocksToInsert);
                if (error) { console.error(error); alert('Failed to save content blocks.'); setIsSubmitting(false); return; }
            }
        }
        
        setIsSubmitting(false);
        alert(`Post ${postId ? 'updated' : 'created'}!`);
        navigate(`/posts/${upsertedPostId}`);
    };

    if (loading) return <Spinner />;

    const BlockEditor: React.FC<{block: PostBlock, index: number}> = ({ block, index }) => (
        <div className="p-4 border rounded relative bg-gray-50 cursor-grab" draggable onDragStart={() => handleDragStart(index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDrop} onDrop={handleDrop}>
            <button onClick={() => removeBlock(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold z-10">X</button>
            <h3 className="font-semibold capitalize mb-2 text-gray-500">{block.type}</h3>
            {block.type === BlockType.HEADER && <>
                <input type="text" placeholder="Header Text..." className="w-full p-2 border rounded" value={block.content.text || ''} onChange={e => updateBlock(index, { ...block.content, text: e.target.value })} />
                <select value={block.content.level || 2} className="mt-2 p-2 border rounded bg-white" onChange={e => updateBlock(index, { ...block.content, level: parseInt(e.target.value, 10) as any })}>
                    <option value={2}>H2</option><option value={3}>H3</option><option value= {4}>H4</option>
                </select>
            </>}
            {block.type === BlockType.TEXT && <textarea placeholder="Markdown supported text..." className="w-full p-2 border rounded" rows={5} value={block.content.text || ''} onChange={e => updateBlock(index, { text: e.target.value })} />}
            {block.type === BlockType.IMAGE && <>
                <input type="text" placeholder="Image URL" className="w-full p-2 border rounded" value={block.content.url || ''} onChange={e => updateBlock(index, { ...block.content, url: e.target.value })} />
                <input type="text" placeholder="Alt text" className="w-full p-2 border rounded mt-2" value={block.content.alt || ''} onChange={e => updateBlock(index, { ...block.content, alt: e.target.value })} />
            </>}
            {block.type === BlockType.CODE && <>
                <input type="text" placeholder="Language (e.g., javascript)" className="w-full p-2 border rounded mb-2" value={block.content.language || ''} onChange={e => updateBlock(index, { ...block.content, language: e.target.value })} />
                <textarea className="w-full p-2 border rounded font-mono" rows={8} placeholder="Code..." value={block.content.code || ''} onChange={e => updateBlock(index, { ...block.content, code: e.target.value })} />
            </>}
            {block.type === BlockType.QUOTE && <>
                <textarea placeholder="Quote text..." className="w-full p-2 border rounded" value={block.content.text || ''} onChange={e => updateBlock(index, { ...block.content, text: e.target.value })} />
                <input type="text" placeholder="Author" className="w-full p-2 border rounded mt-2" value={block.content.author || ''} onChange={e => updateBlock(index, { ...block.content, author: e.target.value })} />
            </>}
            {block.type === BlockType.CHANGELOG && <>
                 <input type="text" placeholder="Version (e.g., 1.0.0)" className="w-full p-2 border rounded mb-2" value={block.content.version || ''} onChange={e => updateBlock(index, {...block.content, version: e.target.value })} />
                 <textarea placeholder="Changes (one per line)" rows={4} className="w-full p-2 border rounded" value={block.content.changes?.join('\n') || ''} onChange={e => updateBlock(index, {...block.content, changes: e.target.value.split('\n') })} />
            </>}
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{postId ? 'Edit Post' : 'Create New Post'}</h1>
            
            <div className="space-y-4">
                 <input type="text" placeholder="Post Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded"/>
                 <input type="text" placeholder="Banner Image URL" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="w-full p-2 border rounded"/>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Or upload banner:</label>
                    <input type="file" onChange={handleBannerUpload} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[rgb(146,163,243)] hover:file:bg-violet-100"/>
                 </div>
                 <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white"><option value="HelaIA">HelaIA</option><option value="Creative Imagination">Creative Imagination</option><option value="Otros">Otros</option></select>
            </div>

            <hr className="my-6"/>
            <h2 className="text-2xl font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                {allTags.map(tag => <button key={tag.id} onClick={() => handleTagSelection(tag.id)} className={`px-3 py-1 text-sm rounded-full ${selectedTags.has(tag.id) ? 'bg-[rgb(146,163,243)] text-white' : 'bg-gray-200 text-gray-700'}`}>{tag.name}</button>)}
            </div>
            <div className="flex gap-2">
                <input type="text" placeholder="New tag name" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="flex-grow p-2 border rounded"/>
                <button onClick={handleAddNewTag} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Add Tag</button>
            </div>
            
            <hr className="my-6"/>
            <h2 className="text-2xl font-semibold mb-4">Content Blocks</h2>
            <div className="space-y-4" onDragOver={e => e.preventDefault()}>
                {blocks.map((block, index) => <BlockEditor key={block.id || index} block={block} index={index}/>)}
            </div>

            <div className="my-6 flex flex-wrap gap-2">
                <button onClick={() => addBlock(BlockType.HEADER)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Header</button>
                <button onClick={() => addBlock(BlockType.TEXT)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Text</button>
                <button onClick={() => addBlock(BlockType.IMAGE)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Image</button>
                <button onClick={() => addBlock(BlockType.CODE)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Code</button>
                <button onClick={() => addBlock(BlockType.QUOTE)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Quote</button>
                <button onClick={() => addBlock(BlockType.CHANGELOG)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Add Changelog</button>
            </div>
            
            <button onClick={handleSavePost} disabled={isSubmitting} className="w-full mt-6 py-3 text-white bg-gradient-to-r from-[rgb(146,163,243)] to-[rgb(241,125,215)] rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (postId ? 'Update Post' : 'Publish Post')}
            </button>
        </div>
    );
};

export default AdminPage;
