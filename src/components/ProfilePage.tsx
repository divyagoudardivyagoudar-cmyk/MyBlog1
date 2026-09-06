import React, { useState, useMemo, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  KeyRound,
  FileText,
  Eye,
  Heart,
  Edit3,
  Check,
  Copy,
  RefreshCw,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  PenSquare,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Camera,
  Loader2,
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya',
];

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    posts,
    navigateTo,
    updateProfile,
    openLogoutModal,
    sessionInfo,
    refreshSession,
    showToast,
  } = useBlog();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'session'>('profile');

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Session timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (!sessionInfo?.expiresAt) return 7 * 24 * 3600;
    const diff = Math.floor((new Date(sessionInfo.expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Sync inputs when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  // Live session timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      if (sessionInfo?.expiresAt) {
        const diff = Math.floor((new Date(sessionInfo.expiresAt).getTime() - Date.now()) / 1000);
        setTimeRemaining(Math.max(0, diff));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionInfo?.expiresAt]);

  // User's authored blogs
  const userBlogs = useMemo(() => {
    if (!currentUser) return [];
    const userId = currentUser.id;
    const userName = currentUser.name.trim().toLowerCase();
    const userUsername = (currentUser.username || '').trim().toLowerCase();

    return posts.filter((p) => {
      if (p.authorId && (p.authorId === userId || (userUsername && p.authorId === userUsername))) {
        return true;
      }
      if (p.authorName) {
        const pAuthor = p.authorName.trim().toLowerCase();
        if (pAuthor === userName || (userUsername && pAuthor === userUsername)) {
          return true;
        }
      }
      return false;
    });
  }, [posts, currentUser]);

  const stats = useMemo(() => {
    const total = userBlogs.length;
    const published = userBlogs.filter((p) => p.status === 'published').length;
    const drafts = userBlogs.filter((p) => p.status === 'draft').length;
    const views = userBlogs.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const likes = userBlogs.reduce((acc, p) => acc + (p.likesCount || 0), 0);
    return { total, published, drafts, views, likes };
  }, [userBlogs]);

  if (!currentUser) {
    return null;
  }

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Display name cannot be empty.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || currentUser.avatar,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match. Please recheck.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updateProfile({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    try {
      const ok = await refreshSession();
      if (ok) {
        showToast('success', 'JWT session token renewed successfully.');
      } else {
        showToast('error', 'Failed to refresh session token.');
      }
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const copySessionToken = () => {
    const token = sessionInfo?.token || 'jwt_token_sample';
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    showToast('info', 'JWT token copied to clipboard.');
    setTimeout(() => setTokenCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#071326] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 cyber-card rounded-2xl border border-cyan-500/20 bg-[#071326]/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-cyan-500/40">/</span>
            <button
              onClick={() => navigateTo('dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <span className="text-cyan-500/40">/</span>
            <span className="text-white font-bold">User Profile</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
              id="profile-goto-dashboard-btn"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>My Articles</span>
            </button>

            <button
              onClick={() => navigateTo('create')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              id="profile-goto-create-btn"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Blog</span>
            </button>

            <button
              onClick={openLogoutModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-white transition-colors cursor-pointer"
              id="profile-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Profile Hero Section */}
        <div className="relative overflow-hidden cyber-card rounded-3xl border border-cyan-500/30 p-6 sm:p-8 bg-gradient-to-b from-[#081b33] to-[#061426] shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          {/* Ambient Glow Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.35)] bg-cyan-950"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#071326] flex items-center justify-center text-slate-950" title="Online Session Active">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 font-bold">
                    Author
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-200/70 font-mono">
                  <span className="text-cyan-300 font-semibold">@{currentUser.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentUser.email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Joined {currentUser.joinedDate}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-cyan-100/80 max-w-xl italic mt-1">
                  "{currentUser.bio || 'Tech author and creator crafting stories on MyBlog.'}"
                </p>
              </div>
            </div>

            {/* Right: Security & Session Status Badge */}
            <div className="w-full md:w-auto p-4 bg-cyan-950/70 rounded-2xl border border-cyan-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  JWT Session Status
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                  Verified
                </span>
              </div>

              <div className="font-mono text-xs text-cyan-100 flex items-center justify-between gap-4">
                <span className="text-cyan-400/70">Expires in:</span>
                <span className="font-bold text-cyan-200 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  <Clock className="w-3 h-3 inline mr-1 text-cyan-400" />
                  {formatCountdown(timeRemaining)}
                </span>
              </div>

              <button
                onClick={handleRefreshToken}
                disabled={isRefreshingToken}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors disabled:opacity-50 cursor-pointer"
                id="profile-refresh-token-btn"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingToken ? 'animate-spin' : ''}`} />
                <span>{isRefreshingToken ? 'Renewing...' : 'Renew Token'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-cyan-500/20">
            <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Articles</span>
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{stats.total}</p>
              <p className="text-[10px] text-cyan-300/60">{stats.published} published • {stats.drafts} drafts</p>
            </div>

            <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Views</span>
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{stats.views.toLocaleString()}</p>
              <p className="text-[10px] text-cyan-300/60">Across all user articles</p>
            </div>

            <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Appreciation</span>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white font-mono">{stats.likes.toLocaleString()}</p>
              <p className="text-[10px] text-cyan-300/60">Reader likes collected</p>
            </div>

            <div className="p-3.5 bg-cyan-950/40 rounded-2xl border border-cyan-500/20">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Database Mode</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-white truncate font-mono">MongoDB / Mongoose</p>
              <p className="text-[10px] text-emerald-300/80">Persistent storage synchronized</p>
            </div>
          </div>
        </div>

        {/* Profile Settings Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-cyan-950/70 rounded-2xl border border-cyan-500/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-900/50'
            }`}
            id="profile-tab-edit"
          >
            <Edit3 className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-900/50'
            }`}
            id="profile-tab-security"
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'session'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-900/50'
            }`}
            id="profile-tab-session"
          >
            <Shield className="w-4 h-4" />
            <span>Session & Token</span>
          </button>
        </div>

        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <div className="cyber-card rounded-3xl border border-cyan-500/20 p-6 sm:p-8 bg-[#071326]/90 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-cyan-400" />
                <span>Personal & Author Details</span>
              </h2>
              <p className="text-xs text-cyan-200/70 mt-1">
                Update your display name, author biography, and profile picture avatar.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Name & Username Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-200">
                    Display Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none placeholder:text-cyan-400/40 font-medium"
                    placeholder="e.g. Divya Goudar"
                    id="profile-name-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-cyan-200 flex items-center justify-between">
                    <span>Username</span>
                    <span className="text-[10px] text-cyan-400/60 font-mono">Unique Handle</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full px-4 py-2.5 text-xs bg-slate-900/80 text-cyan-300/70 rounded-xl border border-cyan-500/20 font-mono cursor-not-allowed"
                    id="profile-username-input"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-200 flex items-center justify-between">
                  <span>Registered Email Address</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Account
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-4 py-2.5 text-xs bg-slate-900/80 text-cyan-300/70 rounded-xl border border-cyan-500/20 font-mono cursor-not-allowed"
                  id="profile-email-input"
                />
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-cyan-200">Author Biography</label>
                  <span className="text-[11px] text-cyan-400/60 font-mono">
                    {bio.length} / 300 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about yourself, your technical passions, or creative projects..."
                  className="w-full px-4 py-2.5 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none placeholder:text-cyan-400/40 resize-none"
                  id="profile-bio-input"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-cyan-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Choose Profile Avatar</span>
                </label>

                {/* Preset Avatar Gallery */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {AVATAR_PRESETS.map((presetUrl, idx) => {
                    const isSelected = avatar === presetUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(presetUrl);
                          setCustomAvatarUrl('');
                        }}
                        className={`relative rounded-2xl p-1 transition-all group cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-cyan-400 bg-cyan-500/20 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'hover:bg-cyan-950/60 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Avatar preset ${idx + 1}`}
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Avatar URL */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-cyan-300/80">Or enter a custom image URL:</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.png"
                      value={customAvatarUrl}
                      onChange={(e) => {
                        setCustomAvatarUrl(e.target.value);
                        if (e.target.value.trim()) setAvatar(e.target.value.trim());
                      }}
                      className="flex-1 px-4 py-2 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none"
                    />
                    {customAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatar(currentUser.avatar);
                          setCustomAvatarUrl('');
                        }}
                        className="px-3 py-2 rounded-xl bg-cyan-950 text-cyan-300 text-xs hover:text-white"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-cyan-500/20 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  id="save-profile-btn"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="cyber-card rounded-3xl border border-cyan-500/20 p-6 sm:p-8 bg-[#071326]/90 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <span>Account Password & Credentials</span>
              </h2>
              <p className="text-xs text-cyan-200/70 mt-1">
                Protect your creator account by maintaining a strong, unique password.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-200">
                  Current Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none"
                  id="current-password-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-200">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none"
                  id="new-password-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-200">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-2.5 text-xs bg-cyan-950/80 text-white rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:outline-none"
                  id="confirm-password-input"
                />
              </div>

              {/* Password Match / Strength helper */}
              {newPassword && (
                <div className="p-3 bg-cyan-950/60 rounded-xl border border-cyan-500/20 text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400">Password length:</span>
                    <span className={newPassword.length >= 6 ? 'text-emerald-400' : 'text-amber-400'}>
                      {newPassword.length >= 6 ? '✓ Valid (≥6 chars)' : 'Too short (<6 chars)'}
                    </span>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400">Passwords match:</span>
                      <span className={newPassword === confirmPassword ? 'text-emerald-400' : 'text-rose-400'}>
                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Do not match'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                  id="update-password-btn"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Session & Token Details */}
        {activeTab === 'session' && (
          <div className="cyber-card rounded-3xl border border-cyan-500/20 p-6 sm:p-8 bg-[#071326]/90 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>JWT Cryptographic Session Inspection</span>
              </h2>
              <p className="text-xs text-cyan-200/70 mt-1">
                Technical authentication metadata and active cryptographic bearer token details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-950/60 rounded-2xl border border-cyan-500/20 space-y-2.5 font-mono text-xs">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Session Metadata
                </span>
                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-cyan-300/60">Algorithm</span>
                  <span className="text-white font-bold">HS256 (HMAC SHA-256)</span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-cyan-300/60">Subject (User ID)</span>
                  <span className="text-cyan-200 truncate max-w-[180px]">{currentUser.id}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-cyan-300/60">Token Expiration</span>
                  <span className="text-cyan-200">
                    {sessionInfo?.expiresAt ? new Date(sessionInfo.expiresAt).toLocaleString() : '7 Days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-300/60">Countdown</span>
                  <span className="text-emerald-400 font-bold">{formatCountdown(timeRemaining)}</span>
                </div>
              </div>

              <div className="p-4 bg-cyan-950/60 rounded-2xl border border-cyan-500/20 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Bearer Token
                  </span>
                  <button
                    onClick={copySessionToken}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {tokenCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{tokenCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-cyan-500/20 text-[10px] text-cyan-300 break-all select-all">
                  {sessionInfo?.token ? sessionInfo.token.substring(0, 120) + '...' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                </div>
                <p className="text-[10px] text-cyan-400/60">
                  Transmitted via Authorization: Bearer header to protect API operations.
                </p>
              </div>
            </div>

            {/* Session Management Actions */}
            <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleRefreshToken}
                disabled={isRefreshingToken}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                id="session-tab-refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingToken ? 'animate-spin' : ''}`} />
                <span>{isRefreshingToken ? 'Renewing Token...' : 'Renew Session Token'}</span>
              </button>

              <button
                onClick={openLogoutModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors cursor-pointer"
                id="session-tab-logout-btn"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Terminate Session & Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* User's Recent Articles Quick Section */}
        <div className="cyber-card rounded-3xl border border-cyan-500/20 p-6 sm:p-8 bg-[#071326]/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Authored Articles ({userBlogs.length})</span>
              </h2>
              <p className="text-xs text-cyan-200/60">Quick preview of your stories created under this profile.</p>
            </div>

            <button
              onClick={() => navigateTo('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 transition-colors cursor-pointer"
            >
              <span>Manage in Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>

          {userBlogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-cyan-950/30 border border-cyan-500/10 space-y-2">
              <p className="text-xs text-cyan-200/70">You haven't written any articles yet.</p>
              <button
                onClick={() => navigateTo('create')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Write your first article now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userBlogs.slice(0, 3).map((blog) => (
                <div
                  key={blog.id}
                  className="p-4 bg-cyan-950/40 hover:bg-cyan-950/70 rounded-2xl border border-cyan-500/20 flex flex-col justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {blog.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          blog.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {blog.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                      {blog.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-[11px] text-cyan-300/70">
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.viewsCount}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {blog.likesCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigateTo('edit', blog)}
                        className="p-1 text-cyan-300 hover:text-white rounded hover:bg-cyan-900/60 cursor-pointer"
                        title="Edit post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigateTo('read', blog)}
                        className="p-1 text-cyan-300 hover:text-white rounded hover:bg-cyan-900/60 cursor-pointer"
                        title="View post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
