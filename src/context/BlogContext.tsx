import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BlogPost, Comment, ToastMessage, User, ActivePage, SessionInfo } from '../types';
import { INITIAL_BLOGS, INITIAL_USERS } from '../data/initialData';
import { api, setAuthToken, setApiToastHandler, getAuthToken, getSessionExpiresAt } from '../services/api';

export interface IntendedDestination {
  page: ActivePage;
  post?: BlogPost | null;
}

export const isRouteProtected = (page: ActivePage): boolean => {
  return page === 'dashboard' || page === 'create' || page === 'edit' || page === 'profile';
};

interface BlogContextType {
  currentUser: User | null;
  users: User[];
  posts: BlogPost[];
  activePage: ActivePage;
  selectedPost: BlogPost | null;
  searchQuery: string;
  selectedCategory: string;
  toasts: ToastMessage[];
  serverConnected: boolean;
  isLoadingPosts: boolean;
  sessionInfo: SessionInfo | null;
  isSessionLoading: boolean;
  intendedDestination: IntendedDestination | null;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  setIntendedDestination: (dest: IntendedDestination | null) => void;
  isRouteProtected: (page: ActivePage) => boolean;
  refreshSession: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  fetchBlogs: () => Promise<void>;
  navigateTo: (page: ActivePage, post?: BlogPost | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updatedData: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  createPost: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'viewsCount' | 'comments' | 'slug'>) => Promise<BlogPost>;
  updatePost: (id: string, postData: Partial<BlogPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'myblog_users_v1';
const POSTS_STORAGE_KEY = 'myblog_posts_v1';
const CURRENT_USER_STORAGE_KEY = 'myblog_current_user_v1';

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load users from localStorage', e);
    }
    return INITIAL_USERS;
  });

  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(POSTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load posts from localStorage', e);
    }
    return INITIAL_BLOGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load current user', e);
    }
    return null;
  });

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(() => {
    const token = getAuthToken();
    const expiresAt = getSessionExpiresAt();
    if (token) {
      return {
        authenticated: true,
        user: null,
        expiresAt,
        issuedAt: null,
        token,
      };
    }
    return null;
  });
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [intendedDestination, setIntendedDestination] = useState<IntendedDestination | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  // Retrieve and sync all blogs from backend / MongoDB database
  const fetchBlogs = async () => {
    setIsLoadingPosts(true);
    try {
      const blogRes = await api.getBlogs();
      if (blogRes && blogRes.blogs && Array.isArray(blogRes.blogs)) {
        setPosts(blogRes.blogs);
        setServerConnected(true);
      }
    } catch (err) {
      console.warn('Backend database fetching / fallback mode:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Verify active JWT session with backend
  const checkSession = useCallback(async (): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setSessionInfo(null);
      setIsSessionLoading(false);
      return false;
    }

    try {
      const res = await api.getSession();
      if (res && res.authenticated && res.user) {
        setCurrentUser(res.user);
        setSessionInfo({
          authenticated: true,
          user: res.user,
          expiresAt: res.session?.expiresAt || null,
          issuedAt: res.session?.issuedAt || null,
          expiresInSeconds: res.session?.timeRemainingSeconds,
          token,
        });
        setIsSessionLoading(false);
        return true;
      }
    } catch (_err) {
      // Backend session verification failed or returned 401
    }

    setAuthToken(null);
    setCurrentUser(null);
    setSessionInfo(null);
    setIsSessionLoading(false);
    return false;
  }, []);

  // Initial load from backend server & session bootstrap
  useEffect(() => {
    const initData = async () => {
      try {
        const health = await api.checkHealth();
        if (health && (health.status === 'ok' || health.status === 'healthy')) {
          setServerConnected(true);
        }
      } catch (err) {
        console.warn('Health check note:', err);
      }
      await Promise.all([checkSession(), fetchBlogs()]);
    };
    initData();
  }, [checkSession]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  // Register Toast handler and listen for JWT session expiration events
  useEffect(() => {
    setApiToastHandler(showToast);

    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: 'success' | 'error' | 'info'; message: string }>;
      if (customEvent.detail) {
        showToast(customEvent.detail.type || 'error', customEvent.detail.message);
      }
    };

    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      setCurrentUser(null);
      setSessionInfo(null);
      setAuthToken(null);
      showToast('error', customEvent.detail?.message || 'Your session has expired. Please sign in again.');
      if (isRouteProtected(activePage)) {
        setIntendedDestination({ page: activePage, post: selectedPost });
      }
      navigateTo('login');
    };

    window.addEventListener('blog:toast', handleCustomToast);
    window.addEventListener('blog:session-expired', handleSessionExpired);

    return () => {
      setApiToastHandler(null);
      window.removeEventListener('blog:toast', handleCustomToast);
      window.removeEventListener('blog:session-expired', handleSessionExpired);
    };
  }, [activePage, selectedPost]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (page: ActivePage, post: BlogPost | null = null) => {
    if (isRouteProtected(page) && !currentUser && !getAuthToken()) {
      setIntendedDestination({ page, post });
    }
    setActivePage(page);
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const res = await api.refreshToken();
      if (res && res.success && res.token) {
        setSessionInfo({
          authenticated: true,
          user: res.user || currentUser,
          expiresAt: res.session?.expiresAt || null,
          issuedAt: res.session?.issuedAt || null,
          expiresInSeconds: res.session?.expiresInSeconds,
          token: res.token,
        });
        showToast('success', 'JWT Session renewed successfully! Active for 7 days.');
        return true;
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to refresh session.');
    }
    return false;
  };

  const resolvePostAuthNavigation = () => {
    if (intendedDestination) {
      const dest = intendedDestination;
      setIntendedDestination(null);
      navigateTo(dest.page, dest.post || null);
      showToast('info', `Access granted: Resumed to ${dest.page} space.`);
    } else {
      navigateTo('dashboard');
    }
  };

  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.login(emailOrUsername, password || 'password123');
      if (response && response.success && response.user) {
        setCurrentUser(response.user);
        setSessionInfo({
          authenticated: true,
          user: response.user,
          expiresAt: response.session?.expiresAt || null,
          issuedAt: response.session?.issuedAt || null,
          expiresInSeconds: response.session?.expiresInSeconds,
          token: response.token,
        });
        showToast('success', `Welcome back, ${response.user.name}!`);
        resolvePostAuthNavigation();
        return { success: true, message: response.message || 'Login successful' };
      }
    } catch (e) {
      console.warn('API login error, fallback to local store:', e);
    }

    // Local fallback
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.username.toLowerCase() === cleanInput
    );

    if (!user) {
      return { success: false, message: 'No account found with this email or username.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    setCurrentUser(user);
    setSessionInfo({
      authenticated: true,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      issuedAt: new Date().toISOString(),
      expiresInSeconds: 7 * 24 * 3600,
    });
    showToast('success', `Welcome back, ${user.name}!`);
    resolvePostAuthNavigation();
    return { success: true, message: 'Login successful' };
  };

  const register = async (name: string, email: string, username: string, password?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.register(name, email, username, password || 'password123');
      if (response && response.success && response.user) {
        setUsers((prev) => [...prev, response.user]);
        setCurrentUser(response.user);
        setSessionInfo({
          authenticated: true,
          user: response.user,
          expiresAt: response.session?.expiresAt || null,
          issuedAt: response.session?.issuedAt || null,
          expiresInSeconds: response.session?.expiresInSeconds,
          token: response.token,
        });
        showToast('success', `Account created successfully! Welcome, ${response.user.name}!`);
        resolvePostAuthNavigation();
        return { success: true, message: 'Registration successful' };
      } else if (response && !response.success) {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (e) {
      console.warn('API register error, fallback to local store:', e);
    }

    // Local fallback
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      username: cleanUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
      bio: 'New blogger exploring ideas and sharing stories.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      password: password || 'password123',
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setSessionInfo({
      authenticated: true,
      user: newUser,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      issuedAt: new Date().toISOString(),
      expiresInSeconds: 7 * 24 * 3600,
    });
    showToast('success', `Account created successfully! Welcome, ${newUser.name}!`);
    resolvePostAuthNavigation();
    return { success: true, message: 'Registration successful' };
  };

  const logout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await api.logout();
    } catch (_e) {
      // Continue cleanup regardless
    }
    setAuthToken(null);
    setCurrentUser(null);
    setSessionInfo(null);
    setIntendedDestination(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    showToast('info', 'You have been successfully logged out.');
    if (isRouteProtected(activePage)) {
      navigateTo('home');
    }
  };

  const resetPassword = async (email: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.resetPassword(email, newPass);
      if (response && response.success) {
        return { success: true, message: response.message };
      }
    } catch (e) {
      console.warn('API reset password error:', e);
    }

    const cleanEmail = email.trim().toLowerCase();
    const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (index === -1) {
      return { success: false, message: 'No user found with that email address.' };
    }

    setUsers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], password: newPass };
      return updated;
    });

    return { success: true, message: 'Password reset successfully. You can now log in.' };
  };

  const updateProfile = async (
    updatedData: Partial<User> & { currentPassword?: string; newPassword?: string }
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to update your profile.' };
    }

    try {
      const res = await api.updateProfile(updatedData);
      if (res && res.success && res.user) {
        const updatedUser: User = {
          ...currentUser,
          ...res.user,
        };
        setCurrentUser(updatedUser);
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

        // Synchronize author data on cached posts
        if (updatedData.name || updatedData.avatar) {
          setPosts((prev) =>
            prev.map((p) => {
              if (p.authorId === currentUser.id || p.authorName === currentUser.name) {
                return {
                  ...p,
                  ...(updatedData.name ? { authorName: updatedData.name } : {}),
                  ...(updatedData.avatar ? { authorAvatar: updatedData.avatar } : {}),
                };
              }
              return p;
            })
          );
        }

        showToast('success', res.message || 'Profile updated successfully!');
        return { success: true, message: res.message || 'Profile updated successfully!', user: updatedUser };
      } else if (res && !res.success) {
        showToast('error', res.message || 'Failed to update profile.');
        return { success: false, message: res.message || 'Failed to update profile.' };
      }
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message || e?.message || 'Error updating profile.';
      showToast('error', serverMsg);
      return { success: false, message: serverMsg };
    }

    // Local fallback update
    const updated = {
      ...currentUser,
      ...(updatedData.name && { name: updatedData.name }),
      ...(updatedData.bio !== undefined && { bio: updatedData.bio }),
      ...(updatedData.avatar && { avatar: updatedData.avatar }),
    };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    showToast('success', 'Profile updated locally!');
    return { success: true, message: 'Profile updated successfully!', user: updated };
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'viewsCount' | 'comments' | 'slug'>): Promise<BlogPost> => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const words = postData.content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

    let createdPost: BlogPost = {
      ...postData,
      id: 'blog_' + Date.now(),
      slug: postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: formattedDate,
      updatedAt: formattedDate,
      likesCount: 0,
      viewsCount: 1,
      readTimeMinutes,
      comments: [],
    };

    try {
      const res = await api.createBlog(postData);
      if (res && res.success && res.blog) {
        createdPost = res.blog;
      }
    } catch (e) {
      console.warn('API createPost error, using client instance:', e);
    }

    setPosts((prev) => [createdPost, ...prev]);
    showToast('success', createdPost.status === 'published' ? '🎉 Blog published successfully!' : '💾 Blog saved as draft!');
    // Re-sync with backend to get latest database IDs and state
    fetchBlogs();
    return createdPost;
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      await api.updateBlog(id, postData);
    } catch (e) {
      console.warn('API updatePost error:', e);
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedWords = (postData.content || p.content).trim().split(/\s+/).length;
          const readTimeMinutes = Math.max(1, Math.ceil(updatedWords / 180));
          return {
            ...p,
            ...postData,
            updatedAt: formattedDate,
            readTimeMinutes,
          };
        }
        return p;
      })
    );
    showToast('success', 'Blog updated successfully!');
    fetchBlogs();
  };

  const deletePost = async (id: string) => {
    try {
      await api.deleteBlog(id);
    } catch (e) {
      console.warn('API deletePost error:', e);
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Blog post has been deleted.');
    fetchBlogs();
  };

  const likePost = async (id: string) => {
    try {
      await api.likeBlog(id);
    } catch (e) {
      console.warn('API likePost error:', e);
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, likesCount: p.likesCount + 1 };
        }
        return p;
      })
    );
    if (selectedPost && selectedPost.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
  };

  const addComment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    const authorName = currentUser ? currentUser.name : 'Guest Reader';
    const authorEmail = currentUser ? currentUser.email : 'guest@example.com';
    const authorAvatar = currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';

    const newComment: Comment = {
      id: 'c_' + Date.now(),
      authorName,
      authorEmail,
      authorAvatar,
      content: text.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      await api.addComment(postId, {
        content: text.trim(),
        authorName,
        authorEmail,
        authorAvatar,
      });
    } catch (e) {
      console.warn('API addComment error:', e);
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
            }
          : null
      );
    }
    showToast('success', 'Comment posted!');
  };

  return (
    <BlogContext.Provider
      value={{
        currentUser,
        users,
        posts,
        activePage,
        selectedPost,
        searchQuery,
        selectedCategory,
        toasts,
        serverConnected,
        isLoadingPosts,
        sessionInfo,
        isSessionLoading,
        intendedDestination,
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
        setIntendedDestination,
        isRouteProtected,
        refreshSession,
        checkSession,
        fetchBlogs,
        navigateTo,
        setSearchQuery,
        setSelectedCategory,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        createPost,
        updatePost,
        deletePost,
        likePost,
        addComment,
        showToast,
        removeToast,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
