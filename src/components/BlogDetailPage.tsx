import React, { useState } from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Check,
  Eye,
  Send,
  User,
  Tag,
  PenSquare,
  Sparkles,
  LayoutDashboard,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogDetailPageProps {
  post: BlogPost;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ post }) => {
  const { currentUser, navigateTo, likePost, addComment, showToast, posts, deletePost } = useBlog();
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthorOrPermitted =
    !currentUser ||
    currentUser.id === post.authorId ||
    currentUser.name.toLowerCase() === post.authorName.toLowerCase() ||
    post.authorId.startsWith('user_');

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      showToast('info', `Deleted "${post.title}" successfully.`);
      navigateTo('home');
    } catch (err: any) {
      showToast('error', 'Failed to delete blog post.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLike = () => {
    likePost(post.id);
    setIsLiked(true);
    showToast('info', 'Thanks for supporting this story!');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    showToast('success', 'Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  // Related articles (same category or recent, excluding current)
  const relatedPosts = posts
    .filter((p) => p.id !== post.id && p.status === 'published')
    .slice(0, 3);

  // Render markdown-like content blocks safely
  const renderFormattedContent = (raw: string) => {
    const lines = raw.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-4 p-4 rounded-2xl bg-slate-950 text-cyan-200 font-mono text-xs sm:text-sm overflow-x-auto border border-cyan-500/30"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-white mt-8 mb-3 tracking-tight">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-black text-white mt-10 mb-4 tracking-tight border-b border-cyan-500/20 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-black text-white mt-10 mb-4 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="my-4 pl-4 border-l-4 border-cyan-400 italic text-cyan-100 bg-cyan-950/40 py-2 rounded-r-xl"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ml-5 list-disc text-cyan-100 text-base leading-relaxed my-1">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-3" />);
      } else {
        elements.push(
          <p key={index} className="text-cyan-100/90 text-base sm:text-lg leading-relaxed my-2">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <article className="min-h-screen bg-[#071326] text-slate-100 pb-24" id={`blog-detail-root-${post.id}`}>
      
      {/* 1. TOP BREADCRUMB & BACK NAV */}
      <div className="bg-[#040d1a]/80 border-b border-cyan-500/20 py-4 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-white transition-colors"
            id="read-back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 rounded-xl transition-colors"
              id="read-goto-dashboard-btn"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {isAuthorOrPermitted && (
              <>
                <button
                  onClick={() => navigateTo('edit', post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-xl transition-colors cursor-pointer"
                  id="read-edit-post-btn"
                  title="Edit this article"
                >
                  <PenSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 rounded-xl transition-colors cursor-pointer"
                  id="read-delete-post-btn"
                  title="Delete this article"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete</span>
                </button>
              </>
            )}

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-sm transition-all cursor-pointer"
              id="read-share-btn"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ARTICLE HEADER */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 space-y-6">
        
        {/* Category, Status & Read Time */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          {post.status === 'draft' && (
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold rounded-full uppercase tracking-wider">
              Draft Preview
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-cyan-200/70 font-medium">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {post.readTimeMinutes} min read
          </span>
          <span className="flex items-center gap-1 text-xs text-cyan-200/70 font-medium">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Published on {post.createdAt}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg sm:text-xl text-cyan-100/80 leading-relaxed font-normal">
          {post.description}
        </p>

        {/* Author Details Bar */}
        <div className="flex items-center justify-between py-4 border-y border-cyan-500/20">
          <div className="flex items-center gap-3.5">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-400 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {post.authorName}
              </h3>
              <p className="text-xs text-cyan-200/60">Author & Content Creator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                isLiked
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-200 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40'
              }`}
              id="like-article-btn"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
              <span>{post.likesCount} Likes</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. COVER IMAGE */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-cyan-500/30 max-h-[460px] bg-slate-900">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* 4. MAIN BODY CONTENT */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30">
          {renderFormattedContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 mt-10 border-t border-cyan-500/20 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mr-2">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-cyan-950/70 text-cyan-200 border border-cyan-500/30 font-medium rounded-lg hover:border-cyan-400 cursor-default transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 5. AUTHOR BIO BOX */}
        <div className="mt-10 p-6 sm:p-8 cyber-glass rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400 shadow-sm shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Written by {post.authorName}</h4>
            <p className="text-xs sm:text-sm text-cyan-200/70 leading-relaxed">
              Passionate writer and contributor at MyBlog. Exploring the intersection of software architecture, cyber-tech design, and developer knowledge sharing.
            </p>
          </div>
        </div>

        {/* 6. COMMENTS SECTION */}
        <section className="mt-14 pt-8 border-t border-cyan-500/20 space-y-6" id="comments-section">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span>Discussion ({post.comments.length})</span>
            </h3>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-3" id="add-comment-form">
            <div className="flex items-start gap-3">
              <img
                src={currentUser ? currentUser.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-1 ring-cyan-400 shrink-0 mt-1"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder={currentUser ? `Share your thoughts on this story, ${currentUser.name}...` : 'Share your thoughts as a guest...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3.5 bg-cyan-950/70 focus:bg-cyan-950 text-white placeholder:text-cyan-400/30 text-xs sm:text-sm rounded-2xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
                  id="comment-textarea"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black rounded-xl shadow-sm transition-transform active:scale-95"
                    id="submit-comment-btn"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-xs text-cyan-300/50 italic text-center py-4 bg-cyan-950/30 rounded-2xl border border-cyan-500/20">
                No comments yet. Be the first to start the conversation!
              </p>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 space-y-2"
                  id={`comment-${comment.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-7 h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-bold text-white">{comment.authorName}</span>
                    </div>
                    <span className="text-[11px] text-cyan-200/50">{comment.createdAt}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed pl-9">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 7. RELATED STORIES */}
      {relatedPosts.length > 0 && (
        <aside className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-cyan-500/20">
          <h3 className="text-lg font-bold text-white mb-6">More Stories from MyBlog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <div
                key={related.id}
                onClick={() => navigateTo('read', related)}
                className="group cursor-pointer space-y-2.5 cyber-glass p-3.5 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 transition-all"
              >
                <img
                  src={related.coverImage}
                  alt={related.title}
                  className="w-full h-32 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  {related.category}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 line-clamp-2 transition-colors">
                  {related.title}
                </h4>
              </div>
            ))}
          </div>
        </aside>
      )}
      {/* 8. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="cyber-glass-glow rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-500/50 space-y-4"
              id="read-delete-confirmation-modal"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">Delete Blog Post?</h3>
                <p className="text-xs sm:text-sm text-cyan-200/80 leading-relaxed">
                  Are you sure you want to permanently delete <b className="text-white font-semibold">"{post.title}"</b>? This action will remove the article from the database.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 rounded-xl transition-colors cursor-pointer"
                  id="read-cancel-delete-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  id="read-confirm-delete-btn"
                >
                  {isDeleting ? (
                    <span>Deleting...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Blog</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </article>
  );
};
