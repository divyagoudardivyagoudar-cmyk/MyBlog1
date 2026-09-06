import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { BlogPost, Comment, User } from '../types';

const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('myblog_token');
};

export const getSessionExpiresAt = (): string | null => {
  return localStorage.getItem('myblog_session_expires_at');
};

export const isTokenExpired = (): boolean => {
  const expiresAt = getSessionExpiresAt();
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
};

export const setAuthToken = (token: string | null, expiresAt?: string | null): void => {
  if (token) {
    localStorage.setItem('myblog_token', token);
    if (expiresAt) {
      localStorage.setItem('myblog_session_expires_at', expiresAt);
    }
  } else {
    localStorage.removeItem('myblog_token');
    localStorage.removeItem('myblog_session_expires_at');
  }
};

// Toast notification callback handler type
type ToastCallback = (type: 'success' | 'error' | 'info', message: string) => void;
let globalToastHandler: ToastCallback | null = null;

export const setApiToastHandler = (handler: ToastCallback | null): void => {
  globalToastHandler = handler;
};

const triggerToast = (type: 'success' | 'error' | 'info', message: string) => {
  if (globalToastHandler) {
    globalToastHandler(type, message);
  }
  // Dispatch custom window event as fallback
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('blog:toast', {
        detail: { type, message },
      })
    );
  }
};

// Create configured Axios client instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global 401 & 500 error handling with Toast alerts and Session auto-expiry
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Returns unwrapped data payload directly
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string; code?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const serverMessage = data?.error || data?.message;
      const errorCode = data?.code;

      if (status === 401) {
        // Specific JWT Token Expiration or Invalidation handling
        if (errorCode === 'TOKEN_EXPIRED') {
          setAuthToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('blog:session-expired', {
                detail: { message: serverMessage || 'Your session has expired. Please sign in again.' },
              })
            );
          }
          triggerToast('error', serverMessage || 'Your session has expired. Please log in again.');
        } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'USER_NOT_FOUND') {
          setAuthToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('blog:session-expired', {
                detail: { message: 'Invalid session token. Please sign in.' },
              })
            );
          }
          triggerToast('error', serverMessage || 'Session authentication failed. Please sign in.');
        } else {
          // General 401 (e.g. invalid credentials during login/register)
          triggerToast('error', serverMessage || 'Unauthorized access (401). Please check credentials.');
        }
      } else if (status === 500) {
        // 500 Server Error
        const userMessage =
          serverMessage || 'Internal Server Error (500). Please try again in a few moments.';
        triggerToast('error', userMessage);
      } else if (status === 403) {
        triggerToast('error', serverMessage || 'Forbidden: You do not have permission to perform this action.');
      } else if (status >= 400 && status < 500 && serverMessage) {
        // Other 4xx errors with a server message
      }
    } else if (error.request) {
      // Network or connectivity failure
      triggerToast(
        'error',
        'Unable to connect to backend server. Please verify your connection.'
      );
    } else {
      triggerToast('error', error.message || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch (err: any) {
      return err.response?.data || { status: 'error' };
    }
  },

  // Stats
  getStats: async () => {
    const res = await apiClient.get('/stats');
    return res.data;
  },

  // Auth & Session Management
  register: async (name: string, email: string, username: string, password?: string) => {
    const res = await apiClient.post('/auth/register', { name, email, username, password });
    const data = res.data;
    if (data.token) {
      setAuthToken(data.token, data.session?.expiresAt);
    }
    return data;
  },

  login: async (emailOrUsername: string, password?: string) => {
    const res = await apiClient.post('/auth/login', {
      emailOrUsername,
      email: emailOrUsername,
      username: emailOrUsername,
      password,
    });
    const data = res.data;
    if (data.token) {
      setAuthToken(data.token, data.session?.expiresAt);
    }
    return data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  getSession: async () => {
    const res = await apiClient.get('/auth/session');
    return res.data;
  },

  refreshToken: async () => {
    const res = await apiClient.post('/auth/refresh');
    const data = res.data;
    if (data.token) {
      setAuthToken(data.token, data.session?.expiresAt);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (_e) {
      // Graceful fallback
    } finally {
      setAuthToken(null);
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    const res = await apiClient.post('/auth/reset-password', { email, newPassword });
    return res.data;
  },

  updateProfile: async (userData: Partial<User> & { currentPassword?: string; newPassword?: string }) => {
    const res = await apiClient.put('/auth/profile', userData);
    return res.data;
  },

  // Blogs
  getBlogs: async (params?: { category?: string; search?: string; authorId?: string; sort?: string }) => {
    const queryParams: Record<string, string> = {};
    if (params?.category && params.category !== 'all') queryParams.category = params.category;
    if (params?.search) queryParams.search = params.search;
    if (params?.authorId) queryParams.authorId = params.authorId;
    if (params?.sort) queryParams.sort = params.sort;

    const res = await apiClient.get('/blogs', { params: queryParams });
    return res.data;
  },

  getAuthorDashboard: async () => {
    const res = await apiClient.get('/blogs/author/dashboard');
    return res.data;
  },

  getBlogById: async (id: string) => {
    const res = await apiClient.get(`/blogs/${id}`);
    return res.data;
  },

  createBlog: async (postData: Partial<BlogPost>) => {
    const res = await apiClient.post('/blogs', postData);
    return res.data;
  },

  updateBlog: async (id: string, postData: Partial<BlogPost>) => {
    const res = await apiClient.put(`/blogs/${id}`, postData);
    return res.data;
  },

  deleteBlog: async (id: string) => {
    const res = await apiClient.delete(`/blogs/${id}`);
    return res.data;
  },

  likeBlog: async (id: string) => {
    const res = await apiClient.post(`/blogs/${id}/like`);
    return res.data;
  },

  addComment: async (
    id: string,
    commentData: { content: string; authorName?: string; authorEmail?: string; authorAvatar?: string }
  ) => {
    const res = await apiClient.post(`/blogs/${id}/comments`, commentData);
    return res.data;
  },
};
