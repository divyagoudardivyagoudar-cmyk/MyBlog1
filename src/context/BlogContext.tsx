import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, Comment, ToastMessage, User, ActivePage } from '../types';
import { INITIAL_BLOGS, INITIAL_USERS } from '../data/initialData';

interface BlogContextType {
  currentUser: User | null;
  users: User[];
  posts: BlogPost[];
  activePage: ActivePage;
  selectedPost: BlogPost | null;
  searchQuery: string;
  selectedCategory: string;
  toasts: ToastMessage[];
  navigateTo: (page: ActivePage, post?: BlogPost | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  login: (emailOrUsername: string, password?: string) => { success: boolean; message: string };
  register: (name: string, email: string, username: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  resetPassword: (email: string, newPass: string) => { success: boolean; message: string };
  updateProfile: (updatedData: Partial<User>) => void;
  createPost: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'viewsCount' | 'comments' | 'slug'>) => BlogPost;
  updatePost: (id: string, postData: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, text: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'myblog_users_v1';
const POSTS_STORAGE_KEY = 'myblog_posts_v1';
const CURRENT_USER_STORAGE_KEY = 'myblog_current_user_v1';

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage or initial
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

  // Load posts from localStorage or initial
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

  // Start on register (Create an Account) first as requested, or load user if previously saved
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

  const [activePage, setActivePage] = useState<ActivePage>('register');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (page: ActivePage, post: BlogPost | null = null) => {
    setActivePage(page);
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (emailOrUsername: string, password?: string) => {
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
    showToast('success', `Welcome back, ${user.name}!`);
    return { success: true, message: 'Login successful' };
  };

  const register = (name: string, email: string, username: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    // Check if email exists
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Check if username exists
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
    showToast('success', `Account created successfully! Welcome, ${newUser.name}!`);
    return { success: true, message: 'Registration successful' };
  };

  const logout = () => {
    const name = currentUser?.name || 'User';
    setCurrentUser(null);
    showToast('info', `You have been logged out.`);
    navigateTo('home');
  };

  const resetPassword = (email: string, newPass: string) => {
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

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    showToast('success', 'Profile updated successfully!');
  };

  const createPost = (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'viewsCount' | 'comments' | 'slug'>): BlogPost => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Estimate read time (roughly 200 words per minute)
    const words = postData.content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

    const newPost: BlogPost = {
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

    setPosts((prev) => [newPost, ...prev]);
    showToast('success', newPost.status === 'published' ? '🎉 Blog published successfully!' : '💾 Blog saved as draft!');
    return newPost;
  };

  const updatePost = (id: string, postData: Partial<BlogPost>) => {
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
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Blog post has been deleted.');
  };

  const likePost = (id: string) => {
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

  const addComment = (postId: string, text: string) => {
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
