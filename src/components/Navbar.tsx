import React, { useState, useRef, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import {
  BookOpen,
  PenSquare,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  Search,
  Menu,
  X,
  User,
  Sparkles,
  HelpCircle,
  FolderGit2,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, activePage, navigateTo, openLogoutModal, searchQuery, setSearchQuery } = useBlog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Close menus on activePage change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
    setShowSearchInput(false);
  }, [activePage]);

  const handleNavClick = (page: 'home' | 'login' | 'register' | 'dashboard' | 'create' | 'profile', sectionId?: string) => {
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
    navigateTo(page);

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#071326]/90 backdrop-blur-xl border-b border-cyan-500/20 text-slate-100 transition-colors shadow-lg shadow-[#040d1a]/50" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Logo / Brand Name: MyBlog */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
            id="brand-logo-btn"
          >
            {/* Hexagonal / Diamond Cyber Badge */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform border border-cyan-300">
              <span className="text-xs font-black tracking-tighter">MB</span>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#071326]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase drop-shadow-sm">
                  MY<span className="text-cyan-400">BLOG</span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-bold text-cyan-200/70 tracking-widest uppercase -mt-0.5">
                TECH & CREATOR HUB
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder="Search articles, vector art..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== 'home') {
                    navigateTo('home');
                  }
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-cyan-950/60 hover:bg-cyan-950 focus:bg-[#061830] text-cyan-100 placeholder:text-cyan-200/40 rounded-full border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all outline-none"
                id="navbar-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links matching the reference navbar items: */}
          {/* Home | About | Services | Portfolio | Pricing/FAQ */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                activePage === 'home'
                  ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
              }`}
              id="nav-home-link"
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('home', 'about-section')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              id="nav-about-link"
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('home', 'services-section')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              id="nav-services-link"
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('home', 'articles-section')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              id="nav-portfolio-link"
            >
              Portfolio
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activePage === 'dashboard'
                      ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
                  }`}
                  id="nav-dashboard-link"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('create')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md transition-all ${
                    activePage === 'create'
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:scale-105'
                  }`}
                  id="nav-create-blog-btn"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Create Blog</span>
                </button>

                {/* User Dropdown / Profile pill */}
                <div ref={dropdownRef} className="relative flex items-center gap-2 pl-2 ml-1 border-l border-cyan-500/20">
                  <button
                    onClick={() => setShowUserDropdown((prev) => !prev)}
                    className={`flex items-center gap-2 p-1 pr-2.5 rounded-full transition-all group border cursor-pointer ${
                      activePage === 'profile'
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-cyan-500/30 hover:bg-cyan-950/60'
                    }`}
                    title={`Logged in as ${currentUser.name}`}
                    id="user-profile-menu-btn"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-400"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-semibold text-cyan-100 group-hover:text-cyan-300 max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[#071326] border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] z-50 backdrop-blur-xl">
                      <div className="px-4 py-2 border-b border-cyan-500/20">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-cyan-300/80 font-mono truncate">@{currentUser.username}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => handleNavClick('profile')}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors text-left cursor-pointer ${
                            activePage === 'profile'
                              ? 'text-cyan-300 bg-cyan-500/20 font-bold'
                              : 'text-cyan-200 hover:text-white hover:bg-cyan-950/70'
                          }`}
                          id="dropdown-profile-link"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span>My Profile</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors text-left cursor-pointer ${
                            activePage === 'dashboard'
                              ? 'text-cyan-300 bg-cyan-500/20 font-bold'
                              : 'text-cyan-200 hover:text-white hover:bg-cyan-950/70'
                          }`}
                          id="dropdown-dashboard-link"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Author Dashboard</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('create')}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-200 hover:text-white hover:bg-cyan-950/70 transition-colors text-left cursor-pointer"
                          id="dropdown-create-link"
                        >
                          <PenSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Create Blog</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-cyan-500/20">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            openLogoutModal();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left font-semibold cursor-pointer"
                          id="dropdown-logout-btn"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={openLogoutModal}
                    title="Log out"
                    className="p-1.5 text-cyan-300/70 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    id="logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick('create')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePage === 'create'
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                      : 'text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30'
                  }`}
                  id="nav-guest-create-blog-btn"
                >
                  <PenSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Write Blog</span>
                </button>

                <button
                  onClick={() => handleNavClick('login')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activePage === 'login'
                      ? 'text-cyan-300 bg-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-cyan-950/40'
                  }`}
                  id="nav-login-link"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Login</span>
                </button>

                {/* Create Account Cyan Pill button */}
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all hover:scale-105"
                  id="nav-register-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('create')}
              className="p-1.5 px-2.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
              id="mobile-quick-create-btn"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>

            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 text-cyan-300 hover:bg-cyan-950/50 rounded-lg"
              aria-label="Search"
              id="mobile-search-toggle"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-cyan-300 hover:bg-cyan-950/50 rounded-lg"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Expand */}
        {showSearchInput && (
          <div className="md:hidden py-2 border-t border-cyan-500/20">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activePage !== 'home') navigateTo('home');
                }}
                className="w-full pl-9 pr-8 py-2 text-xs bg-cyan-950 text-white rounded-lg outline-none border border-cyan-500/40 focus:border-cyan-300"
                id="mobile-search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/20 space-y-2 bg-[#08172e] rounded-b-2xl p-3 border-b border-cyan-500/30 max-h-[80vh] overflow-y-auto" id="mobile-nav-panel">
            {currentUser && (
              <button
                onClick={() => handleNavClick('profile')}
                className="w-full flex items-center gap-3 p-3 bg-cyan-950/80 hover:bg-cyan-900/80 rounded-xl mb-3 border border-cyan-500/30 text-left transition-colors cursor-pointer"
                id="mobile-user-profile-header"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-400"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-cyan-300 truncate font-mono">@{currentUser.username}</p>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                  Profile →
                </span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                activePage === 'home' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-cyan-950/60'
              }`}
              id="mobile-nav-home"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Home & Overview</span>
            </button>

            <button
              onClick={() => handleNavClick('home', 'about-section')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-cyan-950/60"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>About Us</span>
            </button>

            <button
              onClick={() => handleNavClick('home', 'services-section')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-cyan-950/60"
            >
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Our Services</span>
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activePage === 'profile' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-cyan-950/60'
                  }`}
                  id="mobile-nav-profile"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    activePage === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-cyan-950/60'
                  }`}
                  id="mobile-nav-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavClick('create')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-xs shadow-md"
                  id="mobile-nav-create"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Create New Blog</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogoutModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  id="mobile-nav-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleNavClick('create')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg text-xs shadow-md"
                  id="mobile-guest-nav-create"
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Create New Blog</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 hover:bg-cyan-950/60"
                    id="mobile-nav-login"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs shadow-md hover:bg-cyan-400"
                    id="mobile-nav-register"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
