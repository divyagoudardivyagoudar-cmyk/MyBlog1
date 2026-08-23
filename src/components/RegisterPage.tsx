import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  UserPlus,
  User,
  Mail,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  LogIn,
  LayoutDashboard
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, navigateTo } = useBlog();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFillSample = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFullName('Divya Goudar');
    setEmail(`divya.goudar${randomNum}@example.com`);
    setUsername(`divya_${randomNum}`);
    setPassword('mysecurepass123');
    setConfirmPassword('mysecurepass123');
    setError(null);
  };

  // Field validation
  const validateForm = (): boolean => {
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your Full Name.');
      return false;
    }

    if (!email.trim()) {
      setError('Please enter your Email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email format (e.g. name@example.com).');
      return false;
    }

    if (!username.trim()) {
      setError('Please choose a Username.');
      return false;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }

    if (!password) {
      setError('Please enter a Password.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your Password.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      const res = register(fullName, email, username, password);
      setIsLoading(false);
      if (res.success) {
        navigateTo('dashboard');
      } else {
        setError(res.message);
      }
    }, 350);
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6" id="register-page-root">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between text-xs text-cyan-200/80 px-1">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors font-medium"
          id="reg-prev-home-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => navigateTo('login')}
          className="flex items-center gap-1.5 text-cyan-400 hover:text-white font-bold transition-colors"
          id="reg-goto-login-btn"
        >
          <span>Already have an account? Log in</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Register Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SIDE: Benefits & Quick Fill */}
        <div className="lg:col-span-5 cyber-glass-glow rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-cyan-400/40 relative overflow-hidden">
          {/* Ambient blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Create Account</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-snug">
                REGISTER FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">MYBLOG</span>
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/75 mt-2 leading-relaxed">
                Join our tech & creator hub to publish articles, draft guides with real-time markdown preview, and manage your author portfolio.
              </p>
            </div>

            {/* Quick Fill Demo Helper */}
            <div className="cyber-glass rounded-2xl p-4 space-y-2 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fast 1-Click Form Fill:</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
                  id="fast-fill-btn"
                >
                  Auto Fill
                </button>
              </div>
              <p className="text-[11px] text-cyan-200/70">
                Instantly populate demo author details to register and jump straight to the Dashboard and Blog Editor.
              </p>
            </div>

            {/* Creator Perks */}
            <div className="space-y-2 pt-1 text-xs text-cyan-100/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant access to Markdown & Code Snippet Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personal Author Dashboard & Reader Metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Save drafts or publish immediately</span>
              </div>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="pt-6 mt-4 border-t border-cyan-500/20 relative z-10 flex items-center justify-between text-xs">
            <span className="text-cyan-200/70">Already have an account?</span>
            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="text-cyan-300 hover:text-white font-bold flex items-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 rounded-lg border border-cyan-400/30 transition-all"
              id="reg-to-login-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Registration Form */}
        <div className="lg:col-span-7 cyber-glass-glow rounded-3xl p-6 sm:p-8 space-y-4 border border-cyan-400/40 flex flex-col justify-center">
          
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
                  CREATE NEW ACCOUNT
                </h2>
                <p className="text-xs text-cyan-200/70 leading-tight mt-0.5">
                  Set up your author profile to start blogging on MyBlog
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium" id="reg-error-alert">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" id="register-form">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-cyan-200">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Divya Goudar"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                  id="reg-fullname-input"
                />
              </div>
            </div>

            {/* Email & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-cyan-200">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="email"
                    required
                    placeholder="divya@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                    id="reg-email-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-cyan-200">
                  Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    required
                    placeholder="divya_author"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                    id="reg-username-input"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-cyan-200">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                    id="reg-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-cyan-200">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-cyan-950/60 focus:bg-cyan-950 text-white placeholder:text-cyan-300/30 text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                    id="reg-confirm-password-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
              id="register-submit-btn"
            >
              {isLoading ? (
                <span>Setting up your account...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT & OPEN DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
