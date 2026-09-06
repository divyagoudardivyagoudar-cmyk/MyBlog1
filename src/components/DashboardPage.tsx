import React, { useState, useMemo, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost, User } from '../types';
import { api } from '../services/api';
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
  Database,
  ShieldCheck,
  Clock,
  Key,
  Copy,
  Check,
  LogOut
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
    isLoadingPosts,
    sessionInfo,
    refreshSession,
    openLogoutModal,
    logout
  } = useBlog();

  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  // Edit Profile Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');

  // Strictly filter posts for the logged-in user only
  const targetBlogs = useMemo(() => {
    if (!currentUser) return [];
    const userId = currentUser.id;
    const userName = currentUser.name.trim().toLowerCase();
    const userUsername = (currentUser.username || '').trim().toLowerCase();

    return posts.filter((p) => {
      // Check author ID
      if (p.authorId) {
        if (p.authorId === userId) return true;
        if (userUsername && p.authorId === userUsername) return true;
      }
      // Check author name
      if (p.authorName) {
        const pAuthor = p.authorName.trim().toLowerCase();
        if (pAuthor === userName) return true;
        if (userUsername && pAuthor === userUsername) return true;
      }
      return false;
    });
  }, [posts, currentUser]);

  // Distinct categories available in user's blogs
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    targetBlogs.forEach((b) => {
      if (b.category?.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [targetBlogs]);

  // Derived filtered user blogs
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
          p.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [targetBlogs, filterTab, selectedCategory, searchQuery]);

  // Stats calculation for logged-in user's blogs
  const [serverStats, setServerStats] = useState<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    database: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      let isMounted = true;
      api.getAuthorDashboard()
        .then((res) => {
          if (isMounted && res.success && res.stats) {
            setServerStats({
              totalPosts: res.stats.totalPosts,
              publishedPosts: res.stats.publishedCount,
              draftPosts: res.stats.draftCount,
              totalViews: res.stats.totalViews,
              totalLikes: res.stats.totalLikes,
              database: res.database || 'MongoDB Atlas / Express',
            });
          }
        })
        .catch((err) => {
          console.warn('Author dashboard api call fallback to local:', err);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentUser, posts]);

  const totalArticles = targetBlogs.length;
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white leading-tight uppercase">
                  {currentUser.name}
                </h1>
                <span className="text-xs text-cyan-300/80 font-mono">@{currentUser.username}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Private Route
                </span>
              </div>
              <p className="text-xs text-cyan-100/75 line-clamp-1 max-w-md mt-0.5">
                {currentUser.bio || 'Author & Creator • Personal Dashboard'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('profile')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="view-full-profile-btn"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>User Profile</span>
            </button>

            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar);
                setShowEditProfileModal(true);
              }}
              className="px-3.5 py-2 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300/90 border border-cyan-500/20 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              id="edit-profile-btn"
            >
              Quick Edit
            </button>

            <button
              onClick={() => navigateTo('create')}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              id="dashboard-create-new-blog-btn"
            >
              <Plus className="w-4 h-4" />
              <span>NEW BLOG</span>
            </button>

            <button
              onClick={openLogoutModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              id="dashboard-logout-btn"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* 3. Metric Counters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-cyan-500/20 text-center">
          <div className="cyber-glass rounded-2xl p-3 border border-cyan-500/30">
            <span className="text-[11px] font-bold text-cyan-300/80 uppercase">Total Articles</span>
            <p className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">{totalArticles}</p>
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

      {/* JWT Authentication & Session Status Card */}
      <div className="cyber-glass-glow rounded-3xl p-4 sm:p-5 border border-cyan-500/30 bg-[#07172b]/80 space-y-3" id="jwt-session-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  JWT Session Management
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AUTHENTICATED
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-500/30">
                  HS256
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/70">
                {sessionInfo?.expiresAt ? (
                  <>Expires: <span className="text-white font-mono">{new Date(sessionInfo.expiresAt).toLocaleString()}</span></>
                ) : (
                  'Active session secured with JSON Web Token verification'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSessionDetails(!showSessionDetails)}
              className="px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-colors flex items-center gap-1.5"
              id="view-session-details-btn"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showSessionDetails ? 'Hide Token' : 'View Token'}</span>
            </button>

            <button
              onClick={async () => {
                setIsRefreshingToken(true);
                await refreshSession();
                setIsRefreshingToken(false);
              }}
              disabled={isRefreshingToken}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-semibold rounded-xl border border-cyan-400/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              id="refresh-session-token-btn"
              title="Renews JWT token expiration for 7 days"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isRefreshingToken ? 'animate-spin' : ''}`} />
              <span>{isRefreshingToken ? 'Renewing...' : 'Renew Token'}</span>
            </button>
          </div>
        </div>

        {showSessionDetails && sessionInfo?.token && (
          <div className="pt-3 border-t border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-cyan-300">
              <span className="font-mono">Bearer Token (Header Authorization)</span>
              <button
                onClick={() => {
                  if (sessionInfo.token) {
                    navigator.clipboard.writeText(sessionInfo.token);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }
                }}
                className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 font-sans"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-cyan-500/30 font-mono text-[11px] text-cyan-100/80 break-all select-all">
              {sessionInfo.token}
            </div>
          </div>
        )}
      </div>

      {/* 4. My Blogs Management Table & Container */}
      <div className="cyber-glass-glow rounded-3xl border border-cyan-400/40 overflow-hidden space-y-0">
        
        {/* Controls Bar */}
        <div className="p-4 sm:px-6 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>My Articles</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-bold">
                {targetBlogs.length} {targetBlogs.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            <button
              onClick={async () => {
                await fetchBlogs();
                showToast('success', 'Synchronized your articles with the database');
              }}
              disabled={isLoadingPosts}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh your articles from database"
              id="dashboard-sync-db-btn"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isLoadingPosts ? 'animate-spin' : ''}`} />
              <span>{isLoadingPosts ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-44 sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder="Search my articles..."
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
                All ({targetBlogs.length})
              </button>
              <button
                onClick={() => setFilterTab('published')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'published' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200 hover:text-white'
                }`}
                id="tab-published-blogs"
              >
                Published ({totalPublished})
              </button>
              <button
                onClick={() => setFilterTab('draft')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'draft' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200 hover:text-white'
                }`}
                id="tab-draft-blogs"
              >
                Drafts ({totalDrafts})
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
                  {targetBlogs.length === 0 ? 'No Articles Created Yet' : 'No Matching Articles Found'}
                </h3>
                <p className="text-xs text-cyan-200/70 max-w-sm mx-auto">
                  {targetBlogs.length === 0
                    ? 'You have not published or drafted any articles yet. Start crafting your first blog post with live markdown editor!'
                    : 'Try changing your search query or switching tabs.'}
                </p>
              </div>
              <button
                onClick={() => navigateTo('create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform cursor-pointer"
                id="empty-dashboard-create-btn"
              >
                <Plus className="w-4 h-4" />
                <span>WRITE FIRST ARTICLE</span>
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
