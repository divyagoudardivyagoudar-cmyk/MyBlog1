import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { LogOut, ShieldAlert, X, Check, Loader2 } from 'lucide-react';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, closeLogoutModal, logout, currentUser } = useBlog();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isLogoutModalOpen || !currentUser) {
    return null;
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      id="logout-confirmation-modal"
    >
      <div className="relative w-full max-w-md p-6 sm:p-7 cyber-card rounded-3xl border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] bg-[#071326]/95 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeLogoutModal}
          disabled={isLoggingOut}
          className="absolute top-4 right-4 p-2 text-cyan-300/60 hover:text-white hover:bg-cyan-950/60 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close modal"
          id="close-logout-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Glowing Icon */}
          <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)] mb-4">
            <LogOut className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono font-bold text-rose-300 uppercase tracking-widest mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Terminate Active Session</span>
          </div>

          <h2 id="logout-modal-title" className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
            Sign Out of Account?
          </h2>

          <p className="text-xs sm:text-sm text-cyan-100/70 mt-2 max-w-sm leading-relaxed">
            You are currently signed in as <strong className="text-white">{currentUser.name}</strong>. Are you sure you want to end your session?
          </p>

          {/* User Preview Box */}
          <div className="w-full mt-5 p-3.5 bg-cyan-950/60 rounded-2xl border border-cyan-500/20 flex items-center gap-3.5 text-left">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-500/50"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-cyan-300/80 truncate">@{currentUser.username}</p>
              <p className="text-[11px] text-cyan-400/60 truncate font-mono">{currentUser.email}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
              Active
            </span>
          </div>

          <div className="w-full mt-4 text-[11px] text-cyan-200/50 text-left bg-slate-900/60 p-3 rounded-xl border border-cyan-500/10">
            <p>• Your articles and drafts remain securely saved in the database.</p>
            <p>• Your JWT authorization token will be invalidated and cleared.</p>
          </div>

          {/* Actions */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={closeLogoutModal}
              disabled={isLoggingOut}
              className="px-4 py-2.5 rounded-xl border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:bg-cyan-950/70 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              id="cancel-logout-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-xs font-black shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all disabled:opacity-50 cursor-pointer"
              id="confirm-logout-btn"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Yes, Log Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
