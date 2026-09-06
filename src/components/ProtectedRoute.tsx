import React from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost, ActivePage } from '../types';
import {
  ShieldAlert,
  Lock,
  LogIn,
  UserPlus,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage: 'dashboard' | 'create' | 'edit' | 'profile';
  postToEdit?: BlogPost | null;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPage,
  postToEdit,
}) => {
  const {
    currentUser,
    sessionInfo,
    isSessionLoading,
    navigateTo,
    setIntendedDestination,
  } = useBlog();

  // 1. Session verification in progress
  if (isSessionLoading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-12" id="protected-route-loading">
        <div className="w-full max-w-md cyber-card p-8 rounded-3xl text-center relative overflow-hidden border border-cyan-500/30">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-5 animate-pulse">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Cryptographic Handshake
            </div>

            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              Verifying Session
            </h2>
            <p className="text-sm text-cyan-100/70 mt-2 max-w-xs">
              Validating JWT token authenticity against security server...
            </p>

            <div className="w-full bg-slate-900/80 rounded-full h-1.5 mt-6 overflow-hidden border border-cyan-500/20">
              <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-300 w-2/3 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check (No valid user / session)
  const isAuthenticated = Boolean(currentUser && (sessionInfo ? sessionInfo.authenticated : true));

  if (!isAuthenticated) {
    const pageTitle =
      requiredPage === 'dashboard'
        ? 'Author Dashboard'
        : requiredPage === 'create'
        ? 'Article Studio'
        : requiredPage === 'profile'
        ? 'Creator Profile'
        : 'Article Editor';

    const pageDescription =
      requiredPage === 'dashboard'
        ? 'The Author Dashboard is a private command center for monitoring article performance, tracking views, and managing drafts.'
        : requiredPage === 'create'
        ? 'The Article Studio allows authenticated authors to compose and publish rich markdown stories.'
        : requiredPage === 'profile'
        ? 'Your Creator Profile contains sensitive account details, cryptographic session tokens, and security settings.'
        : 'The Editor is reserved for authorized post authors to update published content.';

    const handleRedirectToLogin = () => {
      setIntendedDestination({ page: requiredPage, post: postToEdit || null });
      navigateTo('login');
    };

    const handleRedirectToRegister = () => {
      setIntendedDestination({ page: requiredPage, post: postToEdit || null });
      navigateTo('register');
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12" id="protected-route-unauthorized">
        <div className="w-full max-w-lg cyber-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          {/* Neon background ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Shield Icon with Security Pulse */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-red-950/60 border-2 border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.35)]">
                <Lock className="w-9 h-9" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-red-500/60 rounded-full p-1.5 text-red-400 shadow-md">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-[10px] font-mono font-bold text-red-300 uppercase tracking-widest">
                401 UNAUTHORIZED
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                PROTECTED ROUTE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {pageTitle} Locked
            </h1>

            <p className="text-sm text-cyan-100/75 mt-2.5 max-w-md leading-relaxed">
              {pageDescription} Access requires an active cryptographic JWT session token.
            </p>

            {/* Technical Security Spec Box */}
            <div className="w-full bg-slate-950/80 rounded-2xl p-4 my-6 border border-cyan-500/20 text-left font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-cyan-300/80 border-b border-cyan-500/10 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Route Policy
                </span>
                <span className="text-amber-400 font-bold">STRICT_AUTH_REQUIRED</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Requested Path:</span>
                <span className="text-cyan-200">/{requiredPage}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Authentication Protocol:</span>
                <span className="text-cyan-200">Bearer JWT (HS256)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Access Status:</span>
                <span className="text-red-400 font-bold">Unauthenticated (Token Missing)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRedirectToLogin}
                className="w-full flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                id="protected-route-login-btn"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Unlock</span>
              </button>

              <button
                onClick={handleRedirectToRegister}
                className="w-full flex-1 py-3 px-4 bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-500/40 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                id="protected-route-register-btn"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </button>
            </div>

            <button
              onClick={() => navigateTo('home')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-cyan-400/80 hover:text-cyan-200 transition-colors"
              id="protected-route-back-home-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Feed</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Ownership Guard: If editing a post, verify the user is the author
  if (requiredPage === 'edit' && postToEdit && currentUser) {
    const isAuthor =
      postToEdit.authorId === currentUser.id ||
      postToEdit.authorName?.toLowerCase() === currentUser.name.toLowerCase();

    if (!isAuthor) {
      return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12" id="protected-route-forbidden">
          <div className="w-full max-w-lg cyber-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest mb-3">
              403 FORBIDDEN • OWNERSHIP GUARD
            </div>

            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Article Modification Restricted
            </h1>

            <p className="text-sm text-cyan-100/75 mt-2.5 max-w-md leading-relaxed mx-auto">
              You are signed in as <strong className="text-cyan-300">{currentUser.name}</strong>, but this post is owned by <strong className="text-amber-300">{postToEdit.authorName}</strong>. You can only modify articles you have authored.
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 my-6 border border-cyan-500/20 text-left font-mono text-xs space-y-1.5">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Target Article:
              </div>
              <div className="text-white font-sans font-semibold text-sm truncate">
                {postToEdit.title}
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                Post ID: <span className="text-cyan-200">{postToEdit.id}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => navigateTo('dashboard')}
                className="w-full flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                id="forbidden-to-dashboard-btn"
              >
                Go to My Dashboard
              </button>

              <button
                onClick={() => navigateTo('read', postToEdit)}
                className="w-full flex-1 py-3 px-4 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                id="forbidden-to-read-btn"
              >
                Read Article
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Authenticated and Authorized
  return <>{children}</>;
};
