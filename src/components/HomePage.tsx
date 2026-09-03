import React, { useState, useMemo } from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { RobotMascot } from './RobotMascot';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Heart,
  MessageSquare,
  Search,
  PenSquare,
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Filter,
  Eye,
  SlidersHorizontal,
  FileText,
  CreditCard,
  CheckCircle2,
  Palette,
  Globe,
  ShieldCheck,
  Cpu,
  Bookmark,
  Share2,
  ChevronRight,
  UserCheck,
  Zap,
  Tag,
  LogIn,
  LayoutDashboard,
  RefreshCw,
  Database,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const {
    posts,
    currentUser,
    navigateTo,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    likePost,
    fetchBlogs,
    isLoadingPosts,
    serverConnected,
    showToast
  } = useBlog();

  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');
  const [activeServiceTab, setActiveServiceTab] = useState<string>('vector');

  // Filter published posts
  const publishedPosts = useMemo(() => {
    return posts.filter((p) => p.status === 'published');
  }, [posts]);

  // Dynamically compute all available categories from published posts + presets
  const allCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    // Seed presets
    INITIAL_CATEGORIES.forEach((cat) => {
      map.set(cat.name.toLowerCase(), {
        id: cat.id,
        name: cat.name,
        count: 0,
      });
    });

    // Tally actual published posts and append any custom categories
    publishedPosts.forEach((p) => {
      const name = p.category?.trim() || 'General';
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          id: key.replace(/[^a-z0-9]/g, '-'),
          name,
          count: 1,
        });
      }
    });

    return Array.from(map.values());
  }, [publishedPosts]);

  // Extract top popular tags for instant chip click filtering
  const popularTags = useMemo(() => {
    const map = new Map<string, number>();
    publishedPosts.forEach((p) => {
      p.tags?.forEach((t) => {
        const clean = t.trim().replace(/^#/, '');
        if (clean) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [publishedPosts]);

  // Apply search, category filter, and sorting
  const filteredPosts = useMemo(() => {
    let result = [...publishedPosts];

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sortBy === 'views') {
      result.sort((a, b) => b.viewsCount - a.viewsCount);
    } else {
      // Latest (default)
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [publishedPosts, selectedCategory, searchQuery, sortBy]);

  // Highlight featured post (e.g. first post if no query filter)
  const featuredPost = useMemo(() => {
    if (searchQuery || selectedCategory !== 'all' || filteredPosts.length === 0) {
      return null;
    }
    return filteredPosts[0];
  }, [filteredPosts, searchQuery, selectedCategory]);

  const listPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.slice(1);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  return (
    <div className="min-h-screen bg-[#071326] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 pb-20 relative overflow-hidden" id="home-page-root">
      
      {/* Background ambient lighting effects matching the reference design */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-96 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_0.8px,transparent_0.8px)] [background-size:28px_28px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-12 relative z-10">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Top-Notch Diamond Card + 3D Robot Mascot (Matching Image) */}
        {/* ========================================================================= */}
        <section className="relative pt-2 sm:pt-4" id="hero-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero: The Rhomboid / Diamond Cyan Accent Card */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Cyan Rhombus Badge + Main Header Card */}
              <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden group">
                
                {/* Decorative glowing rhombus shape in top-left (from image) */}
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-cyan-400/30 to-blue-600/10 rotate-45 rounded-3xl blur-sm pointer-events-none border border-cyan-300/30" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-cyan-500/20 rotate-45 rounded-xl border border-cyan-400/40 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Top Branding Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>MyBlog Tech & Creator Hub</span>
                  </div>

                  {/* Main Title: MyBlog */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-sm">
                    MY<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white">BLOG</span>
                  </h1>

                  {/* Subheading text */}
                  <p className="text-sm sm:text-base text-cyan-100/85 leading-relaxed font-normal max-w-xl">
                    Delivering Modern Tech Insights, Vector Art, Web Dev Tutorials & Creative Stories with Excellence!
                  </p>

                  {/* Action Buttons matching image */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-3">
                    <button
                      onClick={() => {
                        const target = document.getElementById('articles-section');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      id="hero-get-started-btn"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigateTo('create')}
                      className="px-5 py-2.5 cyber-badge hover:bg-cyan-500/20 text-cyan-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
                      id="hero-start-writing-btn"
                    >
                      <PenSquare className="w-4 h-4 text-cyan-400" />
                      <span>Write New Blog</span>
                    </button>
                  </div>
                </div>

                {/* Corner light shine effect */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Quick Search Bar directly inside Hero Area */}
              <div className="cyber-glass rounded-2xl p-2 sm:p-3 flex items-center gap-2 border border-cyan-500/20">
                <Search className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search articles by title, vector art, coding, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm outline-none px-2 py-1"
                  id="hero-quick-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs px-2 py-1 bg-cyan-950 text-cyan-300 hover:text-white rounded-md border border-cyan-500/30 shrink-0"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    const target = document.getElementById('articles-section');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-400/30 shrink-0 transition-colors"
                >
                  Explore
                </button>
              </div>

            </div>

            {/* Right Hero: Floating 3D Robot Mascot with Glowing Eyes & Smile */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-6">
              
              {/* Animated Floating Robot Companion */}
              <RobotMascot size="hero" showSpeech={true} interactive={true} />

              {/* Decorative Tech Chips underneath mascot */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
                  ● SYSTEM: ONLINE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
                  ⚡ 24/7 DRAFT SYNC
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
                  ✨ GEMINI AI READY
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 2. STATS & FEATURE BAR: Frosted Glass Banner (Exact layout from image)     */}
        {/* ========================================================================= */}
        <section className="relative pt-2" id="metrics-feature-bar">
          <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 space-y-6 border border-cyan-400/30">
            
            {/* Top Metric Numbers Grid (239 | 1.5K+ | 2439 | 14) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-cyan-500/20">
              
              <div className="text-center md:text-left space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  239<span className="text-cyan-400">+</span>
                </div>
                <div className="text-xs text-cyan-200/70 font-medium uppercase tracking-wider">
                  Articles & Authors
                </div>
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  1.5K<span className="text-cyan-400">+</span>
                </div>
                <div className="text-xs text-cyan-200/70 font-medium uppercase tracking-wider">
                  Active Readers
                </div>
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  2439
                </div>
                <div className="text-xs text-cyan-200/70 font-medium uppercase tracking-wider">
                  Hours 24/7 Support
                </div>
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  14
                </div>
                <div className="text-xs text-cyan-200/70 font-medium uppercase tracking-wider">
                  Hard Tech Topics
                </div>
              </div>

            </div>

            {/* 3 Detail Feature Callout Boxes (Detail Oriented | Secure Payments | Market Updated) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
              
              {/* Box 1: Detail Oriented */}
              <div className="cyber-glass rounded-2xl p-4 sm:p-5 border border-cyan-500/20 space-y-2.5 hover:border-cyan-400/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Detail Oriented
                </h3>
                <p className="text-xs text-cyan-100/70 leading-relaxed">
                  "In digital spaces, precision is everything. From markdown typography to digitizing & vector art, our innovative approach sets new standards in tech."
                </p>
              </div>

              {/* Box 2: Secure Payments & Auth */}
              <div className="cyber-glass rounded-2xl p-4 sm:p-5 border border-cyan-500/20 space-y-2.5 hover:border-cyan-400/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/40 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Secure Payments & Auth
                </h3>
                <p className="text-xs text-cyan-100/70 leading-relaxed">
                  "In the realm of secure content & memberships, trust is paramount. Protected author authentication and cloud sync safeguard all writer data."
                </p>
              </div>

              {/* Box 3: Market Updated */}
              <div className="cyber-glass rounded-2xl p-4 sm:p-5 border border-cyan-500/20 space-y-2.5 hover:border-cyan-400/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/40 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Market Updated
                </h3>
                <p className="text-xs text-cyan-100/70 leading-relaxed">
                  "In tune with modern market trends, we lead with innovation. From emerging technologies to AI writing assistants, we stay ahead to deliver cutting-edge solutions."
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. OUR SERVICES: Cyber-Grid Feature Cards (Exact layout from image)       */}
        {/* ========================================================================= */}
        <section className="relative pt-4 space-y-6" id="services-section">
          
          {/* Glowing Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase inline-block relative">
              OUR SERVICES
              {/* Cyan underline accent matching the image */}
              <span className="block w-24 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-2 rounded-full shadow-[0_0_10px_#22d3ee]" />
            </h2>
            <p className="text-xs sm:text-sm text-cyan-200/70 font-medium">
              Dynamic Solutions · Transformative Insights · Creative Excellence
            </p>
          </div>

          {/* 4 Cards Grid matching image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Service 1: Vector Art & Graphics */}
            <div className="cyber-glass rounded-2xl p-5 sm:p-6 border border-cyan-500/20 hover:border-cyan-400/60 transition-all hover:-translate-y-1 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                VECTOR ART & GRAPHIX
              </h3>
              <p className="text-xs text-cyan-100/70 leading-relaxed">
                We offer expert Vector Art for blogs, digitizing, and illustration formats at competitive quality with custom color palettes and high-resolution SVG outputs.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Explore Art Posts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Service 2: Web Development */}
            <div className="cyber-glass rounded-2xl p-5 sm:p-6 border border-cyan-500/20 hover:border-cyan-400/60 transition-all hover:-translate-y-1 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/40 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                WEB DEVELOPMENT
              </h3>
              <p className="text-xs text-cyan-100/70 leading-relaxed">
                We offer a wide range of modern web development tutorials with ideal web development features, including responsive guidelines, TypeScript, and full-stack React.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Explore Tech Posts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Service 3: Custom Patches & Series */}
            <div className="cyber-glass rounded-2xl p-5 sm:p-6 border border-cyan-500/20 hover:border-cyan-400/60 transition-all hover:-translate-y-1 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/40 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                CUSTOM PATCHES
              </h3>
              <p className="text-xs text-cyan-100/70 leading-relaxed">
                Top-notch custom embroidery & digital patches in very reasonably market competitive price with best quality, series tagging, and curated creator hubs.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>View Curated Series</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Service 4: AI & Next-Gen Knowledge */}
            <div className="cyber-glass rounded-2xl p-5 sm:p-6 border border-cyan-500/20 hover:border-cyan-400/60 transition-all hover:-translate-y-1 space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/40 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                AI & AUTOMATION
              </h3>
              <p className="text-xs text-cyan-100/70 leading-relaxed">
                Empower your writing with automated summarization, keyword indexing, and live markdown preview powered by next-gen Gemini AI intelligence.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>AI Writing Tools</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. ABOUT US & MISSION SECTION: (From bottom of uploaded image)            */}
        {/* ========================================================================= */}
        <section className="relative pt-4" id="about-section">
          <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 lg:p-10 border border-cyan-400/30 overflow-hidden relative">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                
                {/* Glowing Section Header */}
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase inline-block">
                    ABOUT US
                    <span className="block w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent mt-1 rounded-full shadow-[0_0_8px_#22d3ee]" />
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-300 font-semibold">
                    Empowering precision at MyBlog
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed">
                  MyBlog is a leading platform delivering superior Tech Articles, Vector Art, Web Solutions, and Modern Stories. We provide writers, designers, and developers 24/7 access to state-of-the-art tools, insightful articles, and community engagement.
                </p>

                {/* Key Pillars */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-white font-medium">100% Vector Quality</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-white font-medium">Real-Time Metrics</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-white font-medium">Instant Publishing</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/20">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-white font-medium">24/7 Author Hub</span>
                  </div>
                </div>

              </div>

              {/* Mini Interactive mascot showcase in About section */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 cyber-glass rounded-2xl border border-cyan-500/20 text-center space-y-3">
                <RobotMascot size="sm" showSpeech={false} interactive={true} />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Join 1.5K+ Tech Creators</h4>
                  <p className="text-xs text-cyan-200/70 max-w-xs">
                    Sign in to customize your portfolio, draft articles with live markdown, and connect with readers worldwide.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('register')}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  Create Creator Account
                </button>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. PORTFOLIO & ARTICLES SECTION: Stories, Categories, Search & Cards      */}
        {/* ========================================================================= */}
        <section className="relative pt-6 space-y-6" id="articles-section">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cyan-500/20 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-400/20 uppercase">
                <TrendingUp className="w-3 h-3 text-cyan-300" />
                <span>Portfolio & Publications</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                FEATURED STORIES & TECH BLOGS
              </h2>
              <p className="text-xs sm:text-sm text-cyan-200/70">
                Explore in-depth articles on Web Development, Vector Art, AI, and Design
              </p>
            </div>

            {/* Quick Actions: DB Sync & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto text-xs">
              <button
                onClick={async () => {
                  await fetchBlogs();
                  showToast('success', `Retrieved ${posts.length} blogs from database`);
                }}
                disabled={isLoadingPosts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-semibold transition-all disabled:opacity-50 cursor-pointer group"
                id="sync-database-blogs-btn"
                title="Fetch & refresh all blogs from MongoDB database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingPosts ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span>{isLoadingPosts ? 'Fetching...' : 'Sync DB'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">
                  {posts.length}
                </span>
              </button>

              <div className="flex items-center gap-2 text-cyan-200">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-cyan-950 border border-cyan-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
                  id="blog-sort-select"
                >
                  <option value="latest">Latest First</option>
                  <option value="popular">Most Liked</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEARCH BLOGS & FILTER CONTROL HUB */}
          <div className="cyber-glass-glow rounded-2xl p-3 sm:p-4 border border-cyan-500/30 space-y-3" id="articles-search-filter-hub">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Search blogs by title, keywords, topic, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-cyan-950/80 text-white rounded-xl border border-cyan-500/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder:text-cyan-200/40 shadow-inner"
                  id="articles-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                    title="Clear search query"
                    id="articles-clear-search-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Dropdown (Compact Selector) */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto bg-cyan-950 text-cyan-200 font-semibold border border-cyan-500/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-cyan-400 focus:outline-none cursor-pointer"
                    id="articles-category-select"
                    title="Filter by blog category"
                  >
                    <option value="all">All Categories ({publishedPosts.length})</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Popular Topics / Tag Chips */}
            {popularTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-cyan-500/15">
                <span className="text-[11px] font-bold text-cyan-300/70 uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  Popular:
                </span>
                {popularTags.map((tag) => {
                  const isTagActive = searchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isTagActive) {
                          setSearchQuery('');
                        } else {
                          setSearchQuery(tag);
                        }
                      }}
                      className={`text-[11px] px-2.5 py-0.5 rounded-md font-mono transition-all cursor-pointer ${
                        isTagActive
                          ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                          : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/30'
                      }`}
                      id={`tag-chip-${tag}`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter Horizontal Pills Bar */}
          <div className="cyber-glass rounded-xl p-2 sm:p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border border-cyan-500/20" id="category-pills-bar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60 hover:text-white border border-cyan-500/20'
              }`}
              id="cat-pill-all"
            >
              <Layers className="w-3 h-3" />
              <span>All Topics ({publishedPosts.length})</span>
            </button>

            {allCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60 hover:text-white border border-cyan-500/20'
                  }`}
                  id={`cat-pill-${cat.id}`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-cyan-300 font-bold' : 'bg-cyan-900 text-cyan-300'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Filter Notice */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center justify-between gap-2 cyber-glass rounded-xl px-3.5 py-2.5 text-xs text-cyan-200 border border-cyan-500/30">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  Found <b className="text-white font-bold">{filteredPosts.length}</b> {filteredPosts.length === 1 ? 'article' : 'articles'}
                </span>

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold">
                    Category: {selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="text-cyan-400 hover:text-white cursor-pointer ml-0.5"
                      title="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold">
                    Keyword: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-cyan-400 hover:text-white cursor-pointer ml-0.5"
                      title="Clear keyword search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-cyan-400 hover:text-white underline cursor-pointer"
                id="clear-all-filters-btn"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* FEATURED STORY SPOTLIGHT (when on All Topics) */}
          {featuredPost && (
            <div className="cyber-glass-glow rounded-3xl border border-cyan-400/40 shadow-xl overflow-hidden group grid grid-cols-1 md:grid-cols-12 gap-0" id={`featured-post-${featuredPost.id}`}>
              {/* Cover Image */}
              <div
                className="md:col-span-5 relative h-52 sm:h-64 md:h-auto overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => navigateTo('read', featuredPost)}
              >
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-transparent md:hidden" />
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 text-xs font-extrabold rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.6)] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    FEATURED STORY
                  </span>
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-[11px] font-semibold rounded-lg border border-cyan-500/30">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-cyan-200/70 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {featuredPost.createdAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {featuredPost.readTimeMinutes} min read
                    </span>
                  </div>

                  <h3
                    onClick={() => navigateTo('read', featuredPost)}
                    className="text-xl sm:text-2xl font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer leading-snug tracking-tight"
                  >
                    {featuredPost.title}
                  </h3>

                  <p className="text-cyan-100/75 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {featuredPost.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
                  {/* Author avatar */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.authorAvatar}
                      alt={featuredPost.authorName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/40"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {featuredPost.authorName}
                      </h4>
                      <p className="text-[10px] text-cyan-300/70">Verified Author</p>
                    </div>
                  </div>

                  {/* Read story button */}
                  <button
                    onClick={() => navigateTo('read', featuredPost)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/30 transition-all hover:scale-105"
                    id={`featured-read-btn-${featuredPost.id}`}
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="cyber-glass-glow rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 border border-cyan-500/30 my-8 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Search className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white uppercase tracking-wide">
                  No Matching Articles Found
                </h4>
                <p className="text-xs sm:text-sm text-cyan-200/70 leading-relaxed">
                  {searchQuery && selectedCategory !== 'all' ? (
                    <>
                      No blogs found matching <b className="text-cyan-300 font-bold">"{searchQuery}"</b> in category <b className="text-cyan-300 font-bold">"{selectedCategory}"</b>.
                    </>
                  ) : searchQuery ? (
                    <>
                      No articles found containing keyword <b className="text-cyan-300 font-bold">"{searchQuery}"</b>. Try broader terms or check the spelling.
                    </>
                  ) : (
                    <>
                      There are currently no published articles in category <b className="text-cyan-300 font-bold">"{selectedCategory}"</b>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                  id="empty-state-reset-filters-btn"
                >
                  Reset All Filters
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('create')}
                  className="px-4 py-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  id="empty-state-write-btn"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Write an Article</span>
                </button>
              </div>
            </div>
          )}

          {/* BLOG CARDS GRID: Modern Cyber Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listPosts.map((post) => (
              <article
                key={post.id}
                className="cyber-glass rounded-2xl border border-cyan-500/20 overflow-hidden hover:border-cyan-400/60 transition-all flex flex-col justify-between group hover:-translate-y-1"
                id={`blog-card-${post.id}`}
              >
                <div>
                  {/* Thumbnail Cover */}
                  <div
                    className="relative h-44 w-full overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => navigateTo('read', post)}
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-cyan-300 font-bold text-[10px] rounded-md border border-cyan-400/30">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-cyan-200 text-[10px] rounded-md font-mono flex items-center gap-1 border border-cyan-500/20">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      {post.readTimeMinutes} min
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    
                    {/* Meta stats */}
                    <div className="flex items-center justify-between text-[11px] text-cyan-300/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {post.createdAt}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1" title={`${post.viewsCount} views`}>
                          <Eye className="w-3 h-3 text-cyan-400" />
                          {post.viewsCount}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            likePost(post.id);
                          }}
                          className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Like post"
                        >
                          <Heart className="w-3 h-3 fill-rose-400/30" />
                          {post.likesCount}
                        </button>
                        <span className="flex items-center gap-1" title={`${post.comments.length} comments`}>
                          <MessageSquare className="w-3 h-3 text-cyan-400" />
                          {post.comments.length}
                        </span>
                      </div>
                    </div>

                    {/* Blog Title */}
                    <h4
                      onClick={() => navigateTo('read', post)}
                      className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {post.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-cyan-100/70 line-clamp-2 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Author + Read Link */}
                <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between mt-auto bg-cyan-950/30">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-cyan-400/40 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-white truncate">
                        {post.authorName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('read', post)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 rounded-lg text-xs font-bold border border-cyan-400/30 transition-all group/btn"
                    id={`read-more-btn-${post.id}`}
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </article>
            ))}
          </div>

        </section>


        {/* ========================================================================= */}
        {/* 6. BOTTOM CALLOUT BANNER: Join as Creator & Publish                       */}
        {/* ========================================================================= */}
        <section className="relative pt-4">
          <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-cyan-400/40 relative overflow-hidden">
            
            <div className="space-y-1.5 text-center sm:text-left relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-400/30">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Ready to Share Your Expertise?</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Publish Vector Art, IT Retrospectives & Stories
              </h3>
              <p className="text-xs sm:text-sm text-cyan-100/75 max-w-xl">
                Join our growing network of developers, designers, and authors. Publish with live Markdown, track reader engagement, and showcase your portfolio.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <button
                onClick={() => {
                  if (currentUser) navigateTo('create');
                  else navigateTo('register');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                id="bottom-cta-register-write-btn"
              >
                {currentUser ? 'Write New Blog Post' : 'Create Free Account'}
              </button>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </section>

      </div>

    </div>
  );
};
