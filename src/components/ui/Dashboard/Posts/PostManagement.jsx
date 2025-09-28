import { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from "dompurify";
import RichTextEditor from '../../RichTextEditor';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function Modal({ open, onClose, children, title, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 mt-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">✕</button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-auto">{children}</div>
        {footer && <div className="px-5 py-3 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}


function getInputValue(id) {
	const el = document.getElementById(id);
	// Works for input/textarea elements in plain JS
	return el && typeof el === 'object' && 'value' in el ? el.value : '';
}

export default function PostManagement() {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState('');
	const [status, setStatus] = useState(''); // '', 'ACTIVE', 'INACTIVE'
	const [limit, setLimit] = useState(5);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [availableCategories, setAvailableCategories] = useState([]);

	// modals
	const [viewPost, setViewPost] = useState(null);
	const [editPost, setEditPost] = useState(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [deletePost, setDeletePost] = useState(null);

	// form states
	const [createForm, setCreateForm] = useState({ title: '', description: '', category: '' });
	const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
	
	// validation states
	const [createErrors, setCreateErrors] = useState({});
	const [editErrors, setEditErrors] = useState({});

	// file input refs
	const createFileRef = useRef(null);
	const editFileRef = useRef(null);

	const listUrl = useMemo(() => {
		const hasQuery = Boolean(query?.trim());
		const base = hasQuery ? `${API_BASE}/api/posts/search` : `${API_BASE}/api/posts/filter`;
		const url = new URL(base);
		if (hasQuery) url.searchParams.set('q', query.trim());
		if (category) url.searchParams.set('category', category);
		if (!hasQuery && status) url.searchParams.set('status', status);
		// For admin dashboard, we want to see all posts including INACTIVE ones
		// The backend filterPosts endpoint should return all posts for admin
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('skip', String((page - 1) * limit));
		return url.toString();
	}, [query, category, status, limit, page]);

	async function load() {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(listUrl);
			if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
			const json = await res.json();
			const result = json.data?.posts ? json.data : { posts: json.data || [], total: json.data?.total || 0 };
			setPosts(result.posts || []);
			setTotal(result.total || (result.posts?.length || 0));
		} catch (e) {
			setError(e.message || 'Error loading posts');
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, [listUrl]);

	// Load available categories from posts
	const loadCategories = async () => {
		try {
			console.log('PostManagement: Loading categories from posts');
			const res = await fetch(`${API_BASE}/api/posts/filter?limit=1000&t=${Date.now()}`);
			if (res.ok) {
				const json = await res.json();
				console.log('PostManagement: Posts API response:', json);
				const posts = json.data?.posts || json.data || [];
				const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
				console.log('PostManagement: Mapped categories from posts:', categories);
				setAvailableCategories(categories);
			} else {
				console.error('PostManagement: Posts API failed:', res.status, res.statusText);
			}
		} catch (e) {
			console.error('PostManagement: Failed to load categories:', e);
		}
	};

	useEffect(() => {
		loadCategories();
	}, []);

	function authHeaders() {
		const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
		return {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		};
	}

	async function apiCreate(body) {
		const res = await fetch(`${API_BASE}/api/posts`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
		if (!res.ok) throw new Error('Create failed');
		return res.json();
	}
	async function apiUpdate(id, body) {
		const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
		if (!res.ok) throw new Error('Update failed');
		return res.json();
	}
	async function apiDelete(id) {
		const res = await fetch(`${API_BASE}/api/posts/${id}`, { method: 'DELETE', headers: authHeaders() });
		if (!res.ok) throw new Error('Delete failed');
	}

	// Extract first image from HTML content and remove images from description
	function extractFirstImage(htmlContent) {
		if (!htmlContent) return '';
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');
		const img = doc.querySelector('img');
		return img ? img.src : '';
	}

	// Remove images from HTML content, keep only text
	function removeImagesFromDescription(htmlContent) {
		if (!htmlContent) return '';
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');
		// Remove all img tags
		const images = doc.querySelectorAll('img');
		images.forEach(img => img.remove());
		return doc.body.innerHTML;
	}

	// Validation functions
	function validateForm(formData, isEdit = false) {
		const errors = {};
		
		// Check title - required
		if (!formData.title || formData.title.trim() === '') {
			errors.title = 'Post title is required';
		}
		
		// Check description - required
		if (!formData.description || formData.description.trim() === '') {
			errors.description = 'Post content is required';
		} else {
			// Remove HTML tags and check if there's actual text content
			const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
			if (textContent === '') {
				errors.description = 'Post content cannot be empty';
			}
		}
		
		// Check category - required
		if (!formData.category || formData.category.trim() === '') {
			errors.category = 'Category is required';
		}
		
		return errors;
	}

	function resetAndReload() {
		setCreateOpen(false);
		setEditPost(null);
		setDeletePost(null);
		setCreateForm({ title: '', description: '', category: '' });
		setEditForm({ title: '', description: '', category: '' });
		setCreateErrors({});
		setEditErrors({});
		load();
		loadCategories(); // Refresh categories after any post operation
	}

	function handleEditClick(post) {
		setEditPost(post);
		setEditErrors({}); // Clear previous errors
		// Reconstruct description with image for editing
		let descriptionWithImage = post.description || '';
		if (post.image && !descriptionWithImage.includes('<img')) {
			// Add image back to description for editing
			descriptionWithImage = `<img src="${post.image.startsWith('http') ? post.image : `${API_BASE}${post.image}`}" alt="Post image" style="max-width: 100%; height: auto;" /><br/>` + descriptionWithImage;
		}
		setEditForm({
			title: post.title || '',
			description: descriptionWithImage,
			category: post.category || ''
		});
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return (
		<div className="bg-white shadow-xl overflow-hidden flex-1 animate-fade-in">
			{/* Header */}
			<div className="p-6 flex justify-between items-center bg-[#d7cbbf]">
				<h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-[#2c2c2c] drop-shadow-sm">
					<span className="text-[#846551]">📝</span>
					<span className="bg-gradient-to-r from-[#846551] to-[#5a4639] bg-clip-text text-transparent">
						Post Management
					</span>
				</h2>
				<button
					onClick={() => setCreateOpen(true)}
					className="px-4 py-2 bg-[#846551] text-white font-semibold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-transform duration-300"
				>
					+ Create Post
				</button>
			</div>

			{/* Search and Filter Bar */}
			<div className="p-6 bg-[#f5f3f2] border-b border-[#eae7e5]">
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Input */}
					<div className="flex-1">
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
							<input
								type="text"
								placeholder="Search posts by title or description..."
								value={query}
								onChange={(e) => { setPage(1); setQuery(e.target.value); }}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent"
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
								onChange={(e) => { setPage(1); setCategory(e.target.value); }} 
								className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
							>
								<option value="">All Categories</option>
								{availableCategories.map(cat => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>

						{/* Status Filter */}
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">⚡</span>
							<select 
								value={status} 
								onChange={(e) => { setPage(1); setStatus(e.target.value); }} 
								className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#846551] focus:border-transparent bg-white"
							>
								<option value="">All Status</option>
								<option value="ACTIVE">ACTIVE</option>
								<option value="INACTIVE">INACTIVE</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">

			{loading && <div className="text-gray-500">Loading...</div>}
			{error && <div className="text-red-600">{error}</div>}

			<div className="overflow-x-auto">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-gray-100">
						<tr>
							<th className="px-3 py-2">ID</th>
							<th className="px-3 py-2">Title</th>
							<th className="px-3 py-2">Description</th>
							<th className="px-3 py-2">Created By</th>
							<th className="px-3 py-2">Status</th>
							<th className="px-3 py-2">Image</th>
							<th className="px-3 py-2">Created At</th>
							<th className="px-3 py-2 text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{posts.map((p, idx) => (
							<tr key={p._id} className="border-b last:border-0">
								<td className="px-3 py-2">{(page - 1) * limit + idx + 1}</td>
								<td className="px-3 py-2 font-medium max-w-[200px] break-words" title={p.title}>{p.title}</td>
								<td className="px-3 py-2 max-w-[300px] text-gray-600 break-words">
									<div
										className="line-clamp-2"
										dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.description) }}
									/>
								</td>

								<td className="px-3 py-2 text-gray-600 break-words">{p.created_by || '—'}</td>
								<td className="px-3 py-2">
									<span className={`px-2 py-1 rounded text-xs ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : p.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{p.status}</span>
								</td>
								<td className="px-4 py-3">
									{p.image ? (
										<img 
											src={p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`} 
											alt="thumb" 
											className="h-10 w-14 object-cover rounded-md"
											onError={(e) => {
												e.target.style.display = 'none';
												e.target.nextSibling.style.display = 'inline';
											}}
										/>
									) : null}
									<span style={{display: p.image ? 'none' : 'inline'}} className="text-gray-400 text-xs">No image</span>
								</td>
								<td className="px-3 py-2">{new Date(p.created_at || p.createdAt).toLocaleDateString()}</td>
								<td className="px-3 py-2">
									<div className="flex gap-2 justify-end">
										<button onClick={() => setViewPost(p)} className="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50" title="View">👁️</button>
										<button onClick={() => handleEditClick(p)} className="px-2.5 py-1 rounded bg-amber-500 text-white hover:bg-amber-600" title="Edit">✎</button>
										<button onClick={() => setDeletePost(p)} className="px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700" title="Delete">🗑️</button>
									</div>
								</td>
							</tr>
						))}
						{posts.length === 0 && !loading && (
							<tr>
								<td className="px-3 py-6 text-center text-gray-500" colSpan={8}>No posts</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between mt-4 text-sm">
				<div className="flex items-center gap-2">
					<span>Items per page:</span>
					<select value={limit} onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }} className="border rounded px-2 py-1">
						<option value={3}>3</option>
						<option value={5}>5</option>
						<option value={8}>8</option>
						<option value={10}>10</option>
					</select>
				</div>
				<div className="flex items-center gap-2">
					<button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border disabled:opacity-50">Previous</button>
					<span>{page}</span>
					<button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
				</div>
			</div>

			{/* View Modal */}
			<Modal open={Boolean(viewPost)} onClose={() => setViewPost(null)} title={viewPost?.title || 'View Post'}>
				{viewPost && (
					<div className="space-y-4">
						{viewPost.image && <img src={viewPost.image.startsWith('http') ? viewPost.image : `${API_BASE}${viewPost.image}`} alt={viewPost.title} className="w-full rounded" />}
						<h3 className="text-2xl font-bold">{viewPost.title}</h3>
						<div
							className="prose prose-sm max-w-none text-gray-700"
							dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(viewPost.description) }}
						/>
						<div className="text-sm text-gray-500 flex items-center justify-between">
							<span>{viewPost.created_by || 'Unknown'}</span>
							<span>{new Date(viewPost.created_at || viewPost.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
				)}
			</Modal>

			{/* Create Modal */}
			<Modal open={createOpen} onClose={() => {
				setCreateOpen(false);
				setCreateErrors({});
			}} title="Create New Post" footer={
				<div className="flex justify-end gap-2">
					<button onClick={() => {
						setCreateOpen(false);
						setCreateErrors({});
					}} className="px-4 py-2 rounded border">Cancel</button>
					<button onClick={async () => {
						// Validate form
						const errors = validateForm(createForm);
						if (Object.keys(errors).length > 0) {
							setCreateErrors(errors);
							return;
						}
						
						try {
							const extractedImage = extractFirstImage(createForm.description);
							const cleanDescription = removeImagesFromDescription(createForm.description);
							await apiCreate({
								title: createForm.title,
								description: cleanDescription,
								category: createForm.category,
								status: 'ACTIVE',
								image: extractedImage
							});
							resetAndReload();
						} catch (e) { alert(e.message); }
					}} className="px-4 py-2 rounded bg-indigo-600 text-white">Submit</button>
				</div>
			}>
				<div className="grid gap-3">
					<div>
						<input
							value={createForm.title}
							onChange={(e) => {
								setCreateForm({ ...createForm, title: e.target.value });
								if (createErrors.title) {
									setCreateErrors({ ...createErrors, title: '' });
								}
							}}
							className={`rounded border px-3 py-2 w-full ${createErrors.title ? 'border-red-500' : ''}`}
							placeholder="Post title *"
						/>
						{createErrors.title && <p className="text-red-500 text-sm mt-1">{createErrors.title}</p>}
					</div>
					<div>
						<RichTextEditor
							value={createForm.description}
							onChange={(content) => {
								setCreateForm({ ...createForm, description: content });
								if (createErrors.description) {
									setCreateErrors({ ...createErrors, description: '' });
								}
							}}
							placeholder="Enter post content... (images can be added here) *"
						/>
						{createErrors.description && <p className="text-red-500 text-sm mt-1">{createErrors.description}</p>}
					</div>
					<div>
						<input
							value={createForm.category}
							onChange={(e) => {
								setCreateForm({ ...createForm, category: e.target.value });
								if (createErrors.category) {
									setCreateErrors({ ...createErrors, category: '' });
								}
							}}
							className={`rounded border px-3 py-2 w-full ${createErrors.category ? 'border-red-500' : ''}`}
							placeholder="Category *"
						/>
						{createErrors.category && <p className="text-red-500 text-sm mt-1">{createErrors.category}</p>}
					</div>
				</div>
			</Modal>

			{/* Edit Modal */}
			<Modal open={Boolean(editPost)} onClose={() => {
				setEditPost(null);
				setEditErrors({});
			}} title="Edit Post" footer={
				<div className="flex justify-end gap-2">
					<button onClick={() => {
						setEditPost(null);
						setEditErrors({});
					}} className="px-4 py-2 rounded border">Cancel</button>
					<button onClick={async () => {
						if (!editPost) return;
						
						// Validate form
						const errors = validateForm(editForm, true);
						if (Object.keys(errors).length > 0) {
							setEditErrors(errors);
							return;
						}
						
						try {
							const extractedImage = extractFirstImage(editForm.description);
							const cleanDescription = removeImagesFromDescription(editForm.description);
							await apiUpdate(editPost._id, {
								title: editForm.title,
								description: cleanDescription,
								category: editForm.category,
								image: extractedImage || editPost.image || ''
							});
							resetAndReload();
						} catch (e) { alert(e.message); }
					}} className="px-4 py-2 rounded bg-amber-600 text-white">Update</button>
				</div>
			}>
				{editPost && (
					<div className="grid gap-3">
						<div>
							<input
								value={editForm.title}
								onChange={(e) => {
									setEditForm({ ...editForm, title: e.target.value });
									if (editErrors.title) {
										setEditErrors({ ...editErrors, title: '' });
									}
								}}
								className={`rounded border px-3 py-2 w-full ${editErrors.title ? 'border-red-500' : ''}`}
								placeholder="Post title *"
							/>
							{editErrors.title && <p className="text-red-500 text-sm mt-1">{editErrors.title}</p>}
						</div>
						<div>
							<RichTextEditor
								value={editForm.description}
								onChange={(content) => {
									setEditForm({ ...editForm, description: content });
									if (editErrors.description) {
										setEditErrors({ ...editErrors, description: '' });
									}
								}}
								placeholder="Enter post content... (images can be added here) *"
							/>
							{editErrors.description && <p className="text-red-500 text-sm mt-1">{editErrors.description}</p>}
						</div>
						<div>
							<input
								value={editForm.category}
								onChange={(e) => {
									setEditForm({ ...editForm, category: e.target.value });
									if (editErrors.category) {
										setEditErrors({ ...editErrors, category: '' });
									}
								}}
								className={`rounded border px-3 py-2 w-full ${editErrors.category ? 'border-red-500' : ''}`}
								placeholder="Category *"
							/>
							{editErrors.category && <p className="text-red-500 text-sm mt-1">{editErrors.category}</p>}
						</div>
					</div>
				)}
			</Modal>

			{/* Delete confirm */}
			<Modal open={Boolean(deletePost)} onClose={() => setDeletePost(null)} title="Confirm Delete" footer={
				<div className="flex justify-end gap-2">
					<button onClick={() => setDeletePost(null)} className="px-4 py-2 rounded border">No</button>
					<button onClick={async () => { if (!deletePost) return; try { await apiDelete(deletePost._id); resetAndReload(); } catch (e) { alert(e.message); } }} className="px-4 py-2 rounded bg-red-600 text-white">Yes, Delete</button>
				</div>
			}>
				{deletePost && (
					<p className="text-gray-700">Are you sure you want to delete post: <span className="font-semibold">{deletePost.title}</span>?</p>
				)}
			</Modal>
			</div>
		</div>
	);
}
