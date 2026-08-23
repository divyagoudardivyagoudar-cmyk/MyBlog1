import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  KeyRound,
  X,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { login, navigateTo, resetPassword } = useBlog();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Validation function
  const validateForm = (): boolean => {
    setError(null);
    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your email or username.');
      return false;
    }

    if (cleanId.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanId)) {
        setError('Please enter a valid email address.');
        return false;
      }
    }

    if (!password) {
      setError('Please enter your password.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        navigateTo('dashboard');
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleQuickLogin = (email: string) => {
    setIdentifier(email);
    setPassword('password123');
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, 'password123');
      setIsLoading(false);
      if (res.success) {
        navigateTo('dashboard');
      }
    }, 300);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    const res = resetPassword(forgotEmail, newPassword);
    if (res.success) {
      setForgotMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setShowForgotModal(false);
        setIdentifier(forgotEmail);
        setPassword(newPassword);
      }, 1500);
    } else {
      setForgotMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6" id="login-page-root">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between text-xs text-cyan-200/80 px-1">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors font-medium"
          id="login-prev-home-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => navigateTo('register')}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-white font-bold transition-colors"
          id="login-next-register-btn"
        >
          <span>Need an account? Register</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SIDE: Creator Studio & Quick Access */}
        <div className="lg:col-span-5 cyber-glass-glow rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-cyan-400/40 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Creator Authentication</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-snug">
                LOGIN TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">MYBLOG</span>
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/75 mt-2 leading-relaxed">
                Sign in to manage your published blogs, live markdown drafts, track views, and proceed to the creator dashboard.
              </p>
            </div>

            {/* Quick Demo Login Presets */}
            <div className="cyber-glass rounded-2xl p-4 space-y-2.5 border border-cyan-500/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Instant 1-Click Demo Profiles:</span>
              </div>
              <p className="text-[11px] text-cyan-200/70">
                Click any profile to log in immediately and unlock Dashboard + Create Blog:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('divyagoudardivyagoudar@gmail.com')}
                  className="flex items-center gap-2 p-2.5 bg-cyan-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-100 rounded-xl text-xs font-bold border border-cyan-500/40 transition-all text-left shadow-sm group"
                  id="demo-login-divya"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 group-hover:bg-slate-950 shrink-0"></span>
                  <div className="min-w-0">
                    <div className="truncate font-bold">Divya Goudar</div>
                    <div className="text-[10px] opacity-75 truncate">Author & Lead</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('alex.rivera@example.com')}
                  className="flex items-center gap-2 p-2.5 bg-cyan-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-100 rounded-xl text-xs font-bold border border-cyan-500/40 transition-all text-left shadow-sm group"
                  id="demo-login-alex"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:bg-slate-950 shrink-0"></span>
                  <div className="min-w-0">
                    <div className="truncate font-bold">Alex Rivera</div>
                    <div className="text-[10px] opacity-75 truncate">Tech Writer</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom helper */}
          <div className="pt-6 mt-4 border-t border-cyan-500/20 relative z-10 flex items-center justify-between text-xs">
            <span className="text-cyan-200/70">No account yet?</span>
            <button
              type="button"
              onClick={() => navigateTo('register')}
              className="text-cyan-300 hover:text-white font-bold flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 rounded-lg border border-cyan-400/30 transition-all"
              id="login-to-register-btn"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="lg:col-span-7 cyber-glass-glow rounded-3xl p-6 sm:p-8 space-y-5 border border-cyan-400/40 flex flex-col justify-center">
          
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
                  LOGIN CREDENTIALS
                </h2>
                <p className="text-xs text-cyan-200/70 leading-tight mt-0.5">
                  Sign in to unlock Author Dashboard and live post creation
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium" id="login-error-alert">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            
            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-cyan-200">
                Email Address or Username <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. divyagoudardivyagoudar@gmail.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                  id="login-email-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-cyan-200">
                  Password <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
                  id="forgot-password-btn"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-9 py-2.5 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              id="login-submit-btn"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>SIGN IN TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Flow Switcher */}
          <div className="pt-3 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-cyan-200/70">Want to create a brand new account instead?</span>
            <button
              type="button"
              onClick={() => navigateTo('register')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Go to Register</span>
            </button>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="cyber-glass-glow rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-cyan-400/50 relative"
              id="forgot-password-modal"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 text-cyan-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                  <KeyRound className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
                  <p className="text-xs text-cyan-200/70 mt-1">
                    Enter the email registered with your account and set a new password.
                  </p>
                </div>

                {forgotMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      forgotMsg.type === 'success'
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
                        : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
                    }`}
                  >
                    {forgotMsg.text}
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyan-200">Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. divyagoudardivyagoudar@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/40 text-white focus:outline-none focus:border-cyan-400"
                      id="reset-email-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyan-200">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/40 text-white focus:outline-none focus:border-cyan-400"
                      id="reset-password-input"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-bold rounded-xl shadow-md"
                      id="reset-confirm-btn"
                    >
                      Update Password
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
