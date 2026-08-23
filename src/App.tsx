/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BlogProvider, useBlog } from './context/BlogContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardPage } from './components/DashboardPage';
import { CreateEditBlogPage } from './components/CreateEditBlogPage';
import { BlogDetailPage } from './components/BlogDetailPage';

const MainRouter: React.FC = () => {
  const { activePage, selectedPost, posts } = useBlog();

  return (
    <div className="flex flex-col min-h-screen bg-[#071326] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased">
      <Navbar />

      <main className="flex-1">
        {activePage === 'home' && <HomePage />}
        {activePage === 'login' && <LoginPage />}
        {activePage === 'register' && <RegisterPage />}
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'create' && <CreateEditBlogPage />}
        {activePage === 'edit' && <CreateEditBlogPage editPost={selectedPost} />}
        {activePage === 'read' && (
          <BlogDetailPage post={selectedPost || posts[0]} />
        )}
      </main>

      <Footer />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <BlogProvider>
      <MainRouter />
    </BlogProvider>
  );
}
