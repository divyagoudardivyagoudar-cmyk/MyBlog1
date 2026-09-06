import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { BookOpen, Heart, Mail, CheckCircle2, ArrowRight, Sparkles, Shield, Cpu } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialData';

export const Footer: React.FC = () => {
  const { navigateTo, setSelectedCategory, currentUser } = useBlog();
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail && subscribedEmail.includes('@')) {
      setIsSubscribed(true);
      setSubscribedEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#050e1c] text-cyan-100 border-t border-cyan-500/20 relative overflow-hidden" id="main-footer">
      
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <span className="text-xs font-black">MB</span>
              </div>
              <span className="text-lg font-black text-white uppercase tracking-wider">
                MY<span className="text-cyan-400">BLOG</span>
              </span>
            </div>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Delivering superior Tech Insights, Vector Art, Web Dev Tutorials & Modern Stories with excellence. Built for writers, developers, and designers.
            </p>
            <div className="text-[11px] text-cyan-400/80 flex items-center gap-1.5 pt-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-assisted 24/7 Publishing Engine</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('home')}
                  className="hover:text-cyan-300 transition-colors text-cyan-100/70"
                  id="footer-home-link"
                >
                  Home & Overview
                </button>
              </li>
              {currentUser && (
                <li>
                  <button
                    onClick={() => navigateTo('profile')}
                    className="hover:text-cyan-300 transition-colors text-cyan-100/70 font-semibold"
                    id="footer-profile-link"
                  >
                    My Profile & Settings
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="hover:text-cyan-300 transition-colors text-cyan-100/70"
                  id="footer-dashboard-link"
                >
                  Author Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('create')}
                  className="hover:text-cyan-300 transition-colors text-cyan-100/70"
                  id="footer-create-link"
                >
                  Write a New Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('login')}
                  className="hover:text-cyan-300 transition-colors text-cyan-100/70"
                  id="footer-login-link"
                >
                  Sign In to Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('register')}
                  className="hover:text-cyan-300 transition-colors text-cyan-100/70"
                  id="footer-register-link"
                >
                  Create Free Account
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Explore Topics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    navigateTo('home');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 transition-all font-medium"
                  id={`footer-cat-${cat.id}`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  navigateTo('home');
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 border border-cyan-500/30"
              >
                All Topics
              </button>
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Stay In The Loop
            </h4>
            <p className="text-xs text-cyan-200/70 leading-relaxed">
              Get the best articles and vector graphics trends delivered straight to your inbox weekly.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-cyan-950/80 border border-cyan-400/80 rounded-xl text-cyan-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>You're subscribed! Welcome aboard.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2" id="footer-newsletter-form">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-white placeholder:text-cyan-300/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    id="newsletter-email-input"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  id="newsletter-submit-btn"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cyan-200/50">
          <p>© {new Date().getFullYear()} MyBlog. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-cyan-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-cyan-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-cyan-300 cursor-pointer">Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
