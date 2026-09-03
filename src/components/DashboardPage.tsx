import React, { useState, useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost, User } from '../types';
import {
  PenSquare,
  Eye,
  Edit3,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Heart,
  TrendingUp,
  FileText,
  FileCheck,
  Search,
  AlertTriangle,
  X,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  LogIn,
  UserPlus,
  RefreshCw,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    posts,
    navigateTo,
    deletePost,
    updateProfile,
    showToast,
    fetchBlogs,
    isLoadingPosts
  } = useBlog();

  const [scopeTab, setScopeTab] = useState<'my' | 'all'>('my');
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  // Edit Profile Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');

  // Filter posts based on scope
  const targetBlogs = useMemo(() => {
    if (scopeTab === 'all') return posts;
    if (!currentUser) return [];
    return posts.filter(
      (p) => p.authorId === currentUser.id || p.authorName.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [posts, currentUser, scopeTab]);

  // Distinct categories available in target blogs
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    targetBlogs.forEach((b) => {
      if (b.category?.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [targetBlogs]);

  // Derived filtered blogs
  const filteredUserBlogs = useMemo(() => {
    let list = [...targetBlogs];

    if (filterTab === 'published') {
      list = list.filter((p) => p.status === 'published');
    } else if (filterTab === 'draft') {
      list = list.filter((p) => p.status === 'draft');
    }

    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [targetBlogs, filterTab, selectedCategory, searchQuery]);

  // Stats calculation
  const totalPublished = targetBlogs.filter((p) => p.status === 'published').length;
  const totalDrafts = targetBlogs.filter((p) => p.status === 'draft').length;
  const totalViews = targetBlogs.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalLikes = targetBlogs.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  const handleDeleteConfirm = () => {
    if (postToDelete) {
      deletePost(postToDelete.id);
      setPostToDelete(null);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || currentUser?.avatar
    });
    setShowEditProfileModal(false);
  };

  if (!currentUser) {
    return (
      <div className="w-full min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto space-y-6" id="dashboard-unauth-view">
        <div className="cyber-glass-glow rounded-3xl p-8 border border-cyan-400/40 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Layers className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              AUTHOR DASHBOARD
            </h2>
            <p className="text-xs sm:text-sm text-cyan-200/80 max-w-sm mx-auto">
              Please sign in or create an account to view author analytics, manage posts, and publish stories.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigateTo('login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
              id="dashboard-goto-login-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => navigateTo('register')}
              className="w-full py-3 px-4 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 rounded-xl font-bold text-xs sm:text-sm border border-cyan-500/40 transition-all flex items-center justify-center gap-2"
              id="dashboard-goto-register-btn"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Create New Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6" id="dashboard-root">
      
      {/* Top Header & Stats Card */}
      <div className="cyber-glass-glow rounded-3xl p-5 sm:p-6 border border-cyan-400/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* User Profile Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-400/50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#071326] rounded-full flex items-center justify-center text-slate-950" title="Active">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white leading-tight uppercase">
                  {currentUser.name}
                </h1>
                <span className="text-xs text-cyan-300/80 font-mono">@{currentUser.username}</span>
              </div>
              <p className="text-xs text-cyan-100/75 line-clamp-1 max-w-md mt-0.5">
                {currentUser.bio || 'Author & Creator • Personal Dashboard'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar);
                setShowEditProfileModal(true);
              }}
              className="px-3.5 py-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors"
              id="edit-profile-btn"
            >
              Edit Profile
            </button>

            <button
              onClick={() => navigateTo('create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95"
              id="dashboard-create-new-blog-btn"
            >
              <Plus className="w-4 h-4" />
              <span>NEW BLOG</span>
            </button>
          </div>
        </div>

        {/* 3. Metric Counters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-cyan-500/20 text-center">
          <div className="cyber-glass rounded-2xl p-3 border border-cyan-500/30">
            <span className="text-[11px] font-bold text-cyan-300/80 uppercase">Total Articles</span>
            <p className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">{targetBlogs.length}</p>
          </div>

          <div className="cyber-glass rounded-2xl p-3 border border-emerald-500/30">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">Published</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-300 leading-tight mt-0.5">{totalPublished}</p>
          </div>

          <div className="cyber-glass rounded-2xl p-3 border border-amber-500/30">
            <span className="text-[11px] font-bold text-amber-400 uppercase">Drafts</span>
            <p className="text-xl sm:text-2xl font-black text-amber-300 leading-tight mt-0.5">{totalDrafts}</p>
          </div>

          <div className="cyber-glass rounded-2xl p-3 border border-rose-500/30">
            <span className="text-[11px] font-bold text-rose-400 uppercase">Total Views</span>
            <p className="text-xl sm:text-2xl font-black text-cyan-100 leading-tight mt-0.5">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* 4. My Blogs Management Table & Container */}
      <div className="cyber-glass-glow rounded-3xl border border-cyan-400/40 overflow-hidden space-y-0">
        
        {/* Controls Bar */}
        <div className="p-4 sm:px-6 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Switcher: My Blogs vs All DB Blogs */}
            <div className="flex items-center p-1 bg-cyan-950/90 rounded-xl border border-cyan-500/30 text-xs font-semibold">
              <button
                onClick={() => setScopeTab('my')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  scopeTab === 'my'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-cyan-300 hover:text-white'
                }`}
                id="scope-my-blogs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>My Articles</span>
              </button>

              <button
                onClick={() => setScopeTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  scopeTab === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-cyan-300 hover:text-white'
                }`}
                id="scope-all-db-blogs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>All Database Blogs ({posts.length})</span>
              </button>
            </div>

            <button
              onClick={async () => {
                await fetchBlogs();
                showToast('success', `Retrieved and synchronized ${posts.length} database blogs`);
              }}
              disabled={isLoadingPosts}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh database entries from MongoDB"
              id="dashboard-sync-db-btn"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isLoadingPosts ? 'animate-spin' : ''}`} />
              <span>{isLoadingPosts ? 'Syncing...' : 'Sync DB'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-44 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder={scopeTab === 'all' ? 'Search all blogs...' : 'Search my posts...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-cyan-950/70 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none placeholder:text-cyan-400/40"
                id="dashboard-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-cyan-950 border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-xs text-cyan-100 font-semibold focus:border-cyan-400 focus:outline-none cursor-pointer"
                  id="dashboard-category-filter"
                  title="Filter articles by category"
                >
                  <option value="all">All Categories ({targetBlogs.length})</option>
                  {availableCategories.map((cat) => {
                    const count = targetBlogs.filter((b) => b.category?.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-cyan-950/80 rounded-xl border border-cyan-500/30 text-xs font-semibold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'all' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200 hover:text-white'
                }`}
                id="tab-all-blogs"
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('published')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'published' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200 hover:text-white'
                }`}
                id="tab-published-blogs"
              >
                Published
              </button>
              <button
                onClick={() => setFilterTab('draft')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'draft' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200 hover:text-white'
                }`}
                id="tab-draft-blogs"
              >
                Drafts
              </button>
            </div>

            {(searchQuery || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-cyan-400 hover:text-white underline ml-1 cursor-pointer"
                title="Reset search and category filter"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Blog Table or Empty State */}
        <div>
          {filteredUserBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                <PenSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase">
                  {targetBlogs.length === 0 ? 'No Articles Found' : 'No Matching Articles Found'}
                </h3>
                <p className="text-xs text-cyan-200/70 max-w-sm mx-auto">
                  {targetBlogs.length === 0
                    ? 'Start drafting your first blog post right now using the live markdown editor!'
                    : 'Try changing your search query or switching tabs.'}
                </p>
              </div>
              <button
                onClick={() => navigateTo('create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                id="empty-dashboard-create-btn"
              >
                <Plus className="w-4 h-4" />
                <span>STEP 5 · CREATE NEW BLOG</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="user-blogs-table">
                <thead>
                  <tr className="bg-cyan-950/60 border-b border-cyan-500/20 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                    <th className="py-3 px-4">Article</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Engagement</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/15 text-xs">
                  {filteredUserBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-cyan-900/30 transition-colors group"
                      id={`dashboard-blog-row-${blog.id}`}
                    >
                      {/* Title & Preview */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="w-12 h-9 rounded-lg object-cover bg-cyan-950 border border-cyan-500/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 max-w-md">
                            <h4
                              onClick={() => navigateTo('read', blog)}
                              className="font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer truncate"
                            >
                              {blog.title}
                            </h4>
                            <p className="text-[11px] text-cyan-200/60 truncate max-w-sm mt-0.5">
                              {blog.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {blog.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-cyan-200/60 text-[11px]">
                        {blog.createdAt}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {blog.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Engagement */}
                      <td className="py-3 px-3 whitespace-nowrap text-center text-cyan-200/80">
                        <div className="inline-flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1" title="Views">
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            {blog.viewsCount}
                          </span>
                          <span className="flex items-center gap-1" title="Likes">
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            {blog.likesCount}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigateTo('read', blog)}
                            className="p-1.5 text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded-lg transition-colors"
                            title="Read post"
                            id={`action-view-${blog.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigateTo('edit', blog)}
                            className="p-1.5 text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-lg transition-colors"
                            title="Edit post"
                            id={`action-edit-${blog.id}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPostToDelete(blog)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Delete post"
                            id={`action-delete-${blog.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {postToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="cyber-glass-glow rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-500/50 space-y-4"
              id="delete-confirmation-modal"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Delete Blog Post?</h3>
                <p className="text-xs sm:text-sm text-cyan-200/80 leading-relaxed">
                  Are you sure you want to permanently delete <b className="text-white font-semibold">"{postToDelete.title}"</b>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPostToDelete(null)}
                  className="px-5 py-2.5 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 rounded-xl transition-colors"
                  id="cancel-delete-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg transition-colors"
                  id="confirm-delete-btn"
                >
                  Yes, Delete Blog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="cyber-glass-glow rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-cyan-400/50 relative"
              id="edit-profile-modal"
            >
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Edit Author Profile</h3>
                    <p className="text-xs text-cyan-200/70">Update your author name and bio</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyan-200">Display Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/40 text-white focus:outline-none focus:border-cyan-400"
                      id="profile-name-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyan-200">Bio / About</label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Tell readers a bit about your work and passions..."
                      className="w-full px-3.5 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/40 text-white focus:outline-none focus:border-cyan-400"
                      id="profile-bio-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyan-200">Avatar Image URL</label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/40 text-white focus:outline-none focus:border-cyan-400 font-mono"
                      id="profile-avatar-input"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold rounded-xl shadow-md"
                      id="profile-save-btn"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
