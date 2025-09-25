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
	const [featured, setFeatured] = useState(''); // '', 'true', 'false'
	const [limit, setLimit] = useState(10);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	// modals
	const [viewPost, setViewPost] = useState(null);
	const [editPost, setEditPost] = useState(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [deletePost, setDeletePost] = useState(null);

	// form states
	const [createForm, setCreateForm] = useState({ title: '', description: '', image: '', category: '' });
	const [editForm, setEditForm] = useState({ title: '', description: '', image: '', category: '' });

	// file input refs
	const createFileRef = useRef(null);
	const editFileRef = useRef(null);

	const listUrl = useMemo(() => {
		const hasQuery = Boolean(query?.trim());
		const base = hasQuery ? `${API_BASE}/api/posts/search` : `${API_BASE}/api/posts/filter`;
		const url = new URL(base);
		if (hasQuery) url.searchParams.set('q', query.trim());
		if (category) url.searchParams.set('category', category);
		if (!hasQuery && featured) url.searchParams.set('is_featured', featured);
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('skip', String((page - 1) * limit));
		return url.toString();
	}, [query, category, featured, limit, page]);

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

	async function uploadLocal(file) {
		const form = new FormData();
		form.append('file', file);
		const res = await fetch(`${API_BASE}/api/posts/upload`, { method: 'POST', body: form });
		if (!res.ok) throw new Error('Upload failed');
		const json = await res.json();
		return json.url; // e.g. /uploads/filename.jpg
	}

	function resetAndReload() {
		setCreateOpen(false);
		setEditPost(null);
		setDeletePost(null);
		setCreateForm({ title: '', description: '', image: '', category: '' });
		setEditForm({ title: '', description: '', image: '', category: '' });
		load();
	}

	function handleEditClick(post) {
		setEditPost(post);
		setEditForm({
			title: post.title || '',
			description: post.description || '',
			image: post.image || '',
			category: post.category || ''
		});
	}

	const totalPages = Math.max(1, Math.ceil(total / limit));

	return (
		<div className="backdrop-blur-sm bg-white/70 rounded-xl shadow-md m-6 p-5">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold">📝 Post Management</h2>
				<div className="flex gap-2">
					<button onClick={() => setCreateOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Create +</button>
					<input
						type="text"
						placeholder="Search title or description..."
						value={query}
						onChange={(e) => { setPage(1); setQuery(e.target.value); }}
						className="w-60 rounded-md border border-gray-300 px-3 py-2"
					/>
					<select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} className="rounded-md border border-gray-300 px-3 py-2">
						<option value="">All categories</option>
						<option value="general">General</option>
						<option value="health">Health</option>
						<option value="grooming">Grooming</option>
					</select>
					<select value={featured} onChange={(e) => { setPage(1); setFeatured(e.target.value); }} className="rounded-md border border-gray-300 px-3 py-2">
						<option value="">All</option>
						<option value="true">Featured</option>
						<option value="false">Non-featured</option>
					</select>
				</div>
			</div>

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
								<td className="px-3 py-2 font-medium max-w-[260px] truncate" title={p.title}>{p.title}</td>
								<td className="px-3 py-2 max-w-[340px] text-gray-600 truncate">
									<div
										className="line-clamp-1"
										dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.description) }}
									/>
								</td>

								<td className="px-3 py-2 text-gray-600">{p.created_by || '—'}</td>
								<td className="px-3 py-2">
									<span className={`px-2 py-1 rounded text-xs ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : p.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>{p.status}</span>
								</td>
								<td className="px-3 py-2">
									{p.image ? <img src={p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`} alt="thumb" className="h-12 w-12 object-cover rounded" /> : '—'}
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
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
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
			<Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Post" footer={
				<div className="flex justify-end gap-2">
					<button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
					<button onClick={async () => {
						try {
							await apiCreate({
								title: createForm.title,
								description: createForm.description,
								image: createForm.image,
								category: createForm.category,
								status: 'ACTIVE'
							});
							resetAndReload();
						} catch (e) { alert(e.message); }
					}} className="px-4 py-2 rounded bg-indigo-600 text-white">Submit</button>
				</div>
			}>
				<div className="grid gap-3">
					<input
						value={createForm.title}
						onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
						className="rounded border px-3 py-2"
						placeholder="Post title"
					/>
					<RichTextEditor
						value={createForm.description}
						onChange={(content) => setCreateForm({ ...createForm, description: content })}
						placeholder="Enter post content..."
					/>
					<div className="flex items-center gap-2">
						<input
							value={createForm.image}
							className="flex-1 rounded border px-3 py-2"
							placeholder="Image URL will be filled after upload"
							readOnly
						/>
						<input ref={createFileRef} type="file" accept="image/*" hidden onChange={async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							try {
								const url = await uploadLocal(file);
								setCreateForm({ ...createForm, image: url });
							} catch (err) { alert(err.message || 'Upload error'); }
						}} />
						<button type="button" className="px-3 py-2 rounded border hover:bg-gray-50" onClick={() => createFileRef.current && createFileRef.current.click()}>{createForm.image ? 'Replace' : 'Upload'}</button>
						{createForm.image && (
							<button type="button" className="px-3 py-2 rounded border text-red-600 hover:bg-red-50" onClick={() => setCreateForm({ ...createForm, image: '' })}>Remove</button>
						)}
					</div>
					{createForm.image && (
						<img src={`${API_BASE}${createForm.image}`} alt="preview" className="h-24 w-24 object-cover rounded border" />
					)}
					<input
						value={createForm.category}
						onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
						className="rounded border px-3 py-2"
						placeholder="Category (optional)"
					/>
				</div>
			</Modal>

			{/* Edit Modal */}
			<Modal open={Boolean(editPost)} onClose={() => setEditPost(null)} title="Edit Post" footer={
				<div className="flex justify-end gap-2">
					<button onClick={() => setEditPost(null)} className="px-4 py-2 rounded border">Cancel</button>
					<button onClick={async () => {
						if (!editPost) return;
						try {
							await apiUpdate(editPost._id, {
								title: editForm.title,
								description: editForm.description,
								image: editForm.image,
								category: editForm.category
							});
							resetAndReload();
						} catch (e) { alert(e.message); }
					}} className="px-4 py-2 rounded bg-amber-600 text-white">Update</button>
				</div>
			}>
				{editPost && (
					<div className="grid gap-3">
						<input
							value={editForm.title}
							onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
							className="rounded border px-3 py-2"
						/>
						<RichTextEditor
							value={editForm.description}
							onChange={(content) => setEditForm({ ...editForm, description: content })}
							placeholder="Enter post content..."
						/>
						<div className="flex items-center gap-2">
							<input
								value={editForm.image}
								className="flex-1 rounded border px-3 py-2"
								readOnly
							/>
							<input ref={editFileRef} type="file" accept="image/*" hidden onChange={async (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								try {
									const url = await uploadLocal(file);
									setEditForm({ ...editForm, image: url });
								} catch (err) { alert(err.message || 'Upload error'); }
							}} />
							<button type="button" className="px-3 py-2 rounded border hover:bg-gray-50" onClick={() => editFileRef.current && editFileRef.current.click()}>{editForm.image ? 'Replace' : 'Upload'}</button>
							{editForm.image && (
								<button type="button" className="px-3 py-2 rounded border text-red-600 hover:bg-red-50" onClick={() => setEditForm({ ...editForm, image: '' })}>Remove</button>
							)}
						</div>
						{editForm.image && (
							<img src={`${API_BASE}${editForm.image}`} alt="preview" className="h-24 w-24 object-cover rounded border" />
						)}
						<input
							value={editForm.category}
							onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
							className="rounded border px-3 py-2"
						/>
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
	);
}
