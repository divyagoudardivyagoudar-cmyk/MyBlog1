export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  password?: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft';
  likesCount: number;
  viewsCount: number;
  readTimeMinutes: number;
  comments: Comment[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
}

export type ActivePage = 'home' | 'login' | 'register' | 'dashboard' | 'create' | 'edit' | 'read';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
