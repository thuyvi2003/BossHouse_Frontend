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
	const [group, setGroup] = useState(''); // health, grooming, lifestyle, shopping, adoption
	const [category, setCategory] = useState(''); // child category like pet-bath, pet-care
	const [featured, setFeatured] = useState(''); // '', 'true', 'false'
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [posts, setPosts] = useState([]);
	const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });

	const GROUP_TO_CATEGORIES = {
		health: ['pet-care', 'pet-health'],
		grooming: ['pet-grooming', 'pet-bath', 'pet-skin'],
		lifestyle: ['pet-training', 'pet-activity', 'pet-travel'],
		shopping: ['pet-food', 'pet-supplies', 'pet-hygiene'],
		adoption: ['pet-adoption', 'pet-community'],
	};

	const searchUrl = useMemo(() => {
		const hasQuery = Boolean(query.trim());
		// Use /search when has query (supports category), otherwise /filter (supports category + is_featured)
		const base = hasQuery ? `${API_BASE}/api/posts/search` : `${API_BASE}/api/posts/filter`;
		const url = new URL(base);
		if (hasQuery) url.searchParams.set('q', query.trim());
		// Only pass category when a specific child category is selected
		if (category) url.searchParams.set('category', category);
		if (!hasQuery && featured) url.searchParams.set('is_featured', featured);
		url.searchParams.set('limit', '12');
		return url.toString();
	}, [query, category, featured]);

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
					// If group is selected but no child category chosen, apply client-side filter by group mapping
					if (group && !category) {
						const allowed = new Set(GROUP_TO_CATEGORIES[group] || []);
						list = list.filter(p => allowed.has(p.category));
					}
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
				<p className="mt-2 text-gray-600"></p>
			</div>

			<form
				onSubmit={(e) => e.preventDefault()}
				className="mx-auto mb-8 max-w-5xl flex flex-col gap-3 sm:flex-row sm:items-center"
			>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search blog..."
					className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
				/>
				{/* Group select (parent) */}
				<select
					value={group}
					onChange={(e) => { setCategory(''); setGroup(e.target.value); }}
					className="rounded-lg border border-gray-300 px-3 py-2"
				>
					<option value="">All groups</option>
					<option value="health">Health</option>
					<option value="grooming">Grooming</option>
					<option value="lifestyle">Lifestyle</option>
					<option value="shopping">Shopping</option>
					<option value="adoption">Adoption</option>
				</select>

				{/* Category select (child) */}
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="rounded-lg border border-gray-300 px-3 py-2"
					disabled={!group}
				>
					<option value="">{group ? 'All in group' : 'Select group first'}</option>
					{(GROUP_TO_CATEGORIES[group] || []).map((c) => (
						<option key={c} value={c}>{c}</option>
					))}
				</select>
				<select
					value={featured}
					onChange={(e) => setFeatured(e.target.value)}
					className="rounded-lg border border-gray-300 px-3 py-2"
				>
					<option value="">All</option>
					<option value="true">Featured</option>
					<option value="false">Non-featured</option>
				</select>
				<button
					type="submit"
					className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
				>
					Search
				</button>
			</form>

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

			{pageInfo.total > 0 && (
				<p className="mt-6 text-center text-sm text-gray-500">
					Showing {posts.length} of {pageInfo.total} posts
				</p>
			)}
		</div>
	);
}
