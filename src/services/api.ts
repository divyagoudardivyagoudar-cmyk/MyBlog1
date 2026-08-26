import { BlogPost, Comment, User } from '../types';

const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('myblog_token');
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('myblog_token', token);
  } else {
    localStorage.removeItem('myblog_token');
  }
};

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Auth
  register: async (name: string, email: string, username: string, password?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, username, password }),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  login: async (emailOrUsername: string, password?: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  resetPassword: async (email: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, newPassword }),
    });
    return res.json();
  },

  updateProfile: async (userData: Partial<User>) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  // Blogs
  getBlogs: async (params?: { category?: string; search?: string; authorId?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.authorId) query.set('authorId', params.authorId);
    if (params?.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/blogs?${query.toString()}`);
    return res.json();
  },

  getBlogById: async (id: string) => {
    const res = await fetch(`${API_BASE}/blogs/${id}`);
    return res.json();
  },

  createBlog: async (postData: Partial<BlogPost>) => {
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  updateBlog: async (id: string, postData: Partial<BlogPost>) => {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(postData),
    });
    return res.json();
  },

  deleteBlog: async (id: string) => {
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  likeBlog: async (id: string) => {
    const res = await fetch(`${API_BASE}/blogs/${id}/like`, {
      method: 'POST',
      headers: getHeaders(false),
    });
    return res.json();
  },

  addComment: async (id: string, commentData: { content: string; authorName?: string; authorEmail?: string; authorAvatar?: string }) => {
    const res = await fetch(`${API_BASE}/blogs/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(commentData),
    });
    return res.json();
  },
};
