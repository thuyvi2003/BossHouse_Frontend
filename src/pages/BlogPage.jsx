import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';


const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function BlogCard({ post }) {
	const imgSrc = post.image ? (post.image.startsWith('http') ? post.image : `${API_BASE}${post.image}`) : '';
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
			{imgSrc && (
				<img src={imgSrc} alt={post.title} className="h-40 w-full object-cover" />
			)}
			<div className="p-4 flex flex-col gap-2 flex-1">
				<h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
				<p
					className="text-sm text-gray-600 line-clamp-3"
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(post.description),
					}}
				></p>

				<div className="mt-auto pt-2 flex items-center justify-between text-sm text-gray-500">
					<span>{new Date(post.created_at || post.createdAt || Date.now()).toLocaleDateString()}</span>
					<Link to={`/post/${post._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">Read More →</Link>
				</div>
			</div>
		</div>
	);
}

export default function BlogScreen() {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState(''); // category filter
	const [featured, setFeatured] = useState(''); // '', 'true', 'false'
	const [postLimit, setPostLimit] = useState(12);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [posts, setPosts] = useState([]);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
	const [availableCategories, setAvailableCategories] = useState([]);


	const searchUrl = useMemo(() => {
		const hasQuery = Boolean(query.trim());
		// Use /search when has query (supports category), otherwise /filter (supports category + is_featured)
		const base = hasQuery ? `${API_BASE}/api/posts/search` : `${API_BASE}/api/posts/filter`;
		const url = new URL(base);
		if (hasQuery) url.searchParams.set('q', query.trim());
		// Only pass category when a specific child category is selected
		if (category) url.searchParams.set('category', category);
		if (!hasQuery && featured) url.searchParams.set('is_featured', featured);
		url.searchParams.set('limit', String(postLimit));
		return url.toString();
	}, [query, category, featured, postLimit]);

	// Fetch available categories from posts (to match Post Management)
	const loadCategories = async () => {
		try {
			console.log('BlogScreen: Loading categories from posts');
			const res = await fetch(`${API_BASE}/api/posts/filter?limit=1000&t=${Date.now()}`);
			if (res.ok) {
				const json = await res.json();
				console.log('BlogScreen: Posts API response:', json);
				const posts = json.data?.posts || json.data || [];
				const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
				console.log('BlogScreen: Mapped categories from posts:', categories);
				setAvailableCategories(categories);
			} else {
				console.error('BlogScreen: Posts API failed:', res.status, res.statusText);
			}
		} catch (e) {
			console.error('BlogScreen: Failed to load categories:', e);
		}
	};

	useEffect(() => {
		loadCategories();
		// Refresh categories every 10 seconds to stay in sync with dashboard
		const interval = setInterval(loadCategories, 10000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			setError('');
			try {
				const res = await fetch(searchUrl);
				if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
				const json = await res.json();
				const result = json.data?.posts ? json.data : { posts: json.data?.posts || json.data || [], total: json.data?.total || 0, page: 1, totalPages: 1 };
				if (!ignore) {
					let list = result.posts || [];
					setPosts(list);
					setPageInfo({ page: result.page || 1, totalPages: result.totalPages || 1, total: result.total || (result.posts?.length || 0) });
				}
			} catch (e) {
				if (!ignore) setError(e.message || 'Error loading posts');
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => {
			ignore = true;
		};
	}, [searchUrl]);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="text-center mb-8">
				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-700">Pet Care Service</h1>
				<p className="mt-2 text-gray-600">Stay updated with our latest pet care articles</p>
			</div>

			{/* Search and Filter Controls */}
			<div className="bg-gray-50 rounded-lg p-6 mb-8">
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Input */}
					<div className="flex-1">
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
							<input
								type="text"
								placeholder="Search posts by title or description..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-col sm:flex-row gap-3">
						{/* Category Filter */}
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📂</span>
							<select 
								value={category} 
								onChange={(e) => setCategory(e.target.value)} 
								className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[180px]"
							>
								<option value="">All Categories</option>
								{availableCategories.map(cat => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>
						

						{/* Post Limit Filter */}
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📄</span>
							<select 
								value={postLimit} 
								onChange={(e) => setPostLimit(Number(e.target.value))}
								className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
							>
								<option value={3}>3 Posts</option>
								<option value={6}>6 Posts</option>
								<option value={9}>9 Posts</option>
								<option value={12}>12 Posts</option>
							</select>
						</div>
					</div>
				</div>
				
				{/* Results info */}
				{pageInfo.total > 0 && (
					<div className="mt-4 text-center text-sm text-gray-500">
						Showing {posts.length} of {pageInfo.total} posts
					</div>
				)}
			</div>


			{loading && (
				<div className="text-center text-gray-500">Loading posts...</div>
			)}
			{error && (
				<div className="text-center text-red-600">{error}</div>
			)}

			{!loading && !error && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{posts.map((p) => (
						<BlogCard key={p._id} post={p} />
					))}
					{posts.length === 0 && (
						<div className="col-span-full text-center text-gray-500">No posts found.</div>
					)}
				</div>
			)}

		</div>
	);
}
