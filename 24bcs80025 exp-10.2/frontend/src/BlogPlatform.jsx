import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { User, LogOut, Edit2, Trash2, MessageSquare, X, Check } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || '';

const socket = io(API || '/', { autoConnect: false });

const BlogPlatform = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [view, setView] = useState('login');
  const [selectedPost, setSelectedPost] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '', bio: '' });
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [commentText, setCommentText] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('bl_token');
    if (stored) {
      setToken(stored);
      fetchCurrentUser(stored);
    }
    fetchAll();
    // socket
    if (!socket.connected) socket.connect();
    socket.on('newPost', (p)=> setPosts(prev=> [p, ...prev]));
    socket.on('newComment', (c)=> setComments(prev=> [...prev, c]));
    socket.on('deletePost', (id)=> setPosts(prev=> prev.filter(p=> p._id !== id)));
    socket.on('deleteComment', (id)=> setComments(prev=> prev.filter(c=> c._id !== id)));
    return ()=> {
      socket.off('newPost');
      socket.off('newComment');
      socket.off('deletePost');
      socket.off('deleteComment');
      socket.disconnect();
    }
  }, []);

  const authHeaders = (t)=> ({ headers: { Authorization: `Bearer ${t || token}` } });

  const fetchAll = async ()=> {
    try {
      const [postsRes, commentsRes, usersRes] = await Promise.all([
        axios.get(`${API}/api/posts`),
        axios.get(`${API}/api/comments`),
        axios.get(`${API}/api/users`)
      ]);
      setPosts(postsRes.data);
      setComments(commentsRes.data);
      setUsers(usersRes.data);
    } catch (e) { console.error(e); }
  };

  const fetchCurrentUser = async (t) => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, authHeaders(t));
      setCurrentUser(res.data.user);
      setToken(t);
      localStorage.setItem('bl_token', t);
      setView('home');
    } catch (e) {
      console.error('invalid token', e);
      localStorage.removeItem('bl_token');
    }
  };

  // Auth
  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/signup`, authForm);
      fetchCurrentUser(res.data.token);
      setAuthForm({ username: '', email: '', password: '', bio: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email: authForm.email, password: authForm.password });
      fetchCurrentUser(res.data.token);
      setAuthForm({ username: '', email: '', password: '', bio: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = ()=> {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('bl_token');
    setView('login');
  };

  // Posts
  const handleCreatePost = async () => {
    if (!postForm.title || !postForm.content) return alert('Fill fields');
    try {
      const res = await axios.post(`${API}/api/posts`, postForm, authHeaders());
      // server emits newPost; local optimistic update not necessary
      setPostForm({ title: '', content: '' });
      setView('home');
    } catch (e) { alert('failed'); }
  };

  const handleUpdatePost = async () => {
    if (!postForm.title || !postForm.content) return alert('Fill fields');
    try {
      await axios.put(`${API}/api/posts/${editingPost._id}`, postForm, authHeaders());
      setEditingPost(null);
      setPostForm({ title: '', content: '' });
      setView('home');
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete post?')) return;
    try {
      await axios.delete(`${API}/api/posts/${postId}`, authHeaders());
      // server emits deletePost
      if (selectedPost?._id === postId) setSelectedPost(null);
    } catch (e) { console.error(e); }
  };

  // Comments
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`${API}/api/comments`, { postId: selectedPost._id, text: commentText }, authHeaders());
      setCommentText('');
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/api/comments/${commentId}`, authHeaders());
    } catch (e) { console.error(e); }
  };

  const getUserById = (id) => users.find(u=> u._id === id) || {};
  const getPostComments = (postId) => comments.filter(c=> c.postId === postId);
  const getUserPosts = (userId) => posts.filter(p=> p.userId === userId);

  // Render UI (kept same structure as original but using _id fields)
  const renderAuth = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BlogSpace</h1>
          <p className="text-gray-600">Share your thoughts with the world</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={()=> setView('login')} className={`flex-1 py-2 px-4 rounded-lg font-medium ${view==='login' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Login</button>
          <button onClick={()=> setView('signup')} className={`flex-1 py-2 px-4 rounded-lg font-medium ${view==='signup' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Sign Up</button>
        </div>

        <div className="space-y-4">
          {view === 'signup' && <input type="text" placeholder="Username" value={authForm.username} onChange={e=> setAuthForm({...authForm, username: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />}
          <input type="email" placeholder="Email" value={authForm.email} onChange={e=> setAuthForm({...authForm, email: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
          <input type="password" placeholder="Password" value={authForm.password} onChange={e=> setAuthForm({...authForm, password: e.target.value})} className="w-full px-4 py-3 border rounded-lg" />
          {view === 'signup' && <textarea placeholder="Bio (optional)" value={authForm.bio} onChange={e=> setAuthForm({...authForm, bio: e.target.value})} className="w-full px-4 py-3 border rounded-lg" rows={3} />}
          <button onClick={view==='signup' ? handleSignup : handleLogin} className="w-full bg-indigo-600 text-white py-3 rounded-lg">{view==='signup' ? 'Create Account' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  );

  const renderHome = () => {
    const allPosts = [...posts].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">BlogSpace</h1>
            <div className="flex items-center gap-4">
              <button onClick={()=> setView('profile')} className="flex items-center gap-2 px-4 py-2"><User className="w-5 h-5" /> {currentUser?.username}</button>
              <button onClick={()=> setView('create')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">New Post</button>
              <button onClick={handleLogout} className="p-2"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
          {allPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p>No posts yet.</p>
              <button onClick={()=> setView('create')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Create Post</button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allPosts.map(post => {
                const author = getUserById(post.userId);
                const postComments = getPostComments(post._id);
                return (
                  <div key={post._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-indigo-600" /></div>
                      <div><p className="font-medium">{author.username}</p><p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content}</p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <button onClick={()=> { setSelectedPost(post); setView('post'); }} className="flex items-center gap-2 text-indigo-600"><MessageSquare className="w-4 h-4" />{postComments.length} Comments</button>
                      {post.userId === currentUser?._id && (<div className="flex gap-2">
                        <button onClick={()=> { setEditingPost(post); setPostForm({ title: post.title, content: post.content }); setView('edit'); }} className="p-2"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={()=> handleDeletePost(post._id)} className="p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPostForm = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">{editingPost ? 'Edit Post' : 'Create New Post'}</h1>
          <button onClick={()=> { setView('home'); setEditingPost(null); setPostForm({ title:'', content:'' }); }} className="p-2"><X className="w-5 h-5" /></button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Title</label><input value={postForm.title} onChange={e=> setPostForm({...postForm, title: e.target.value})} className="w-full px-4 py-3 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-2">Content</label><textarea value={postForm.content} onChange={e=> setPostForm({...postForm, content: e.target.value})} className="w-full px-4 py-3 border rounded-lg" rows={12} /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={editingPost ? handleUpdatePost : handleCreatePost} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"><Check className="w-5 h-5" />{editingPost ? 'Update Post' : 'Publish Post'}</button>
              <button onClick={()=> { setView('home'); setEditingPost(null); setPostForm({ title:'', content:'' }); }} className="px-6 py-3 border rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPost = () => {
    if (!selectedPost) return renderHome();
    const author = getUserById(selectedPost.userId);
    const postComments = getPostComments(selectedPost._id);
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={()=> { setSelectedPost(null); setView('home'); }} className="flex items-center gap-2">← Back</button>
            <h1 className="text-xl font-bold text-indigo-600">BlogSpace</h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-indigo-600" /></div>
              <div><p className="font-medium">{author.username}</p><p className="text-sm text-gray-500">{new Date(selectedPost.createdAt).toLocaleDateString()} at {new Date(selectedPost.createdAt).toLocaleTimeString()}</p></div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{selectedPost.title}</h1>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Comments ({postComments.length})</h2>
            <div className="mb-6">
              <textarea value={commentText} onChange={e=> setCommentText(e.target.value)} placeholder="Write a comment..." className="w-full px-4 py-3 border rounded-lg" rows={3} />
              <button onClick={handleAddComment} disabled={!commentText.trim()} className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300">Post Comment</button>
            </div>

            <div className="space-y-4">
              {postComments.length === 0 ? <p className="text-gray-500 text-center py-8">No comments yet.</p> : postComments.map(comment => {
                const commentAuthor = getUserById(comment.userId);
                return (
                  <div key={comment._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><User className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{commentAuthor.username}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                            {comment.userId === currentUser?._id && <button onClick={()=> handleDeleteComment(comment._id)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const userPosts = getUserPosts(currentUser?._id);
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={()=> setView('home')} className="flex items-center gap-2">← Back</button>
            <h1 className="text-xl font-bold text-indigo-600">My Profile</h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-10 h-10 text-indigo-600" /></div>
              <div><h2 className="text-2xl font-bold">{currentUser?.username}</h2><p className="text-gray-600">{currentUser?.email}</p><p className="text-sm text-gray-500 mt-1">Joined {new Date(currentUser?.createdAt).toLocaleDateString()}</p></div>
            </div>
            {currentUser?.bio && <p className="text-gray-700 border-t pt-4">{currentUser.bio}</p>}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">My Posts ({userPosts.length})</h3>
            {userPosts.length === 0 ? <p className="text-gray-500 text-center py-8">You haven't created any posts yet.</p> : <div className="space-y-4">{userPosts.map(post=> { const postComments = getPostComments(post._id); return (<div key={post._id} className="border rounded-lg p-4"><h4 className="font-bold mb-2">{post.title}</h4><p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p><div className="flex items-center justify-between text-sm text-gray-500"><span>{postComments.length} comments</span><span>{new Date(post.createdAt).toLocaleDateString()}</span></div></div>) })}</div>}
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) return renderAuth();
  switch(view){ case 'home': return renderHome(); case 'create': case 'edit': return renderPostForm(); case 'post': return renderPost(); case 'profile': return renderProfile(); default: return renderHome(); }
};

export default BlogPlatform;