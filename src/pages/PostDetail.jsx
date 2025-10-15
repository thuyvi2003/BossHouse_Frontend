import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function PostDetail() {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [post, setPost] = useState(null);

	useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			setError('');
			try {
				const res = await fetch(`${API_BASE}/api/posts/${id}`);
				if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
				const json = await res.json();
				if (!ignore) setPost(json.data);
			} catch (e) {
				if (!ignore) setError(e.message || 'Error loading post');
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => { ignore = true; };
	}, [id]);

	if (loading) {
		return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-500">Loading...</div>;
	}
	if (error) {
		return (
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<p className="text-red-600 mb-4">{error}</p>
				<Link to="/post" className="text-indigo-600">← Back to blog</Link>
			</div>
		);
	}
	if (!post) return null;

	const createdAt = new Date(post.created_at || post.createdAt || Date.now());
	
	// Handle different image URL types
	let imgSrc = '';
	if (post.image && post.image.trim() !== '') {
		if (post.image.startsWith('data:')) {
			// Base64 data URL - use directly
			imgSrc = post.image;
		} else if (post.image.startsWith('http')) {
			// Full HTTP URL - use directly
			imgSrc = post.image;
		} else {
			// Relative path - prepend API_BASE
			imgSrc = `${API_BASE}${post.image}`;
		}
	}
	
	console.log('PostDetail: Post', post._id, '- title:', post.title, '- image field:', post.image, '- final imgSrc:', imgSrc);

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<nav className="text-sm text-gray-500 mb-4">
				<Link to="/" className="hover:text-indigo-600">Homepage</Link>
				<span> / </span>
				<Link to="/post" className="hover:text-indigo-600">Blog</Link>
				<span> / </span>
				<span className="text-gray-700">{post.title}</span>
			</nav>

			<h1 className="text-3xl font-extrabold text-gray-900 mb-2">{post.title}</h1>
			<p className="text-sm text-gray-500 mb-6">Created At: {createdAt.toLocaleDateString()} · Author: {post.created_by || 'Unknown'}</p>

			{imgSrc && (
				<div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
					<img 
						src={imgSrc} 
						alt={post.title} 
						className="w-full object-cover"
						onError={(e) => {
							console.log('PostDetail: Image load error for post:', post._id, 'src:', e.target.src);
							e.target.style.display = 'none';
						}}
						onLoad={() => {
							console.log('PostDetail: Image loaded successfully for post:', post._id);
						}}
					/>
					<p className="text-center text-sm text-gray-500 py-2">{post.title}</p>
				</div>
			)}

			<div
				className="prose max-w-none"
				dangerouslySetInnerHTML={{
					__html: DOMPurify.sanitize(post.description || '', {
						ALLOWED_TAGS: [
							"b","strong","i","em","u","s","sub","sup",
							"p","br","span","div","ul","ol","li","blockquote",
							"h1","h2","h3","h4","h5","h6","table","thead","tbody","tr","td","th","hr","pre","code"
						],
						ALLOWED_ATTR: ["style","class","align","dir"],
						KEEP_CONTENT: true
					}),
				}}
			></div>

		</div>
	);
}
