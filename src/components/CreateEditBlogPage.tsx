import React, { useState, useEffect } from 'react';
import { useBlog } from '../context/BlogContext';
import { BlogPost } from '../types';
import { INITIAL_CATEGORIES, PRESET_COVER_IMAGES } from '../data/initialData';
import {
  PenSquare,
  Sparkles,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  Quote,
  List,
  Link2,
  Eye,
  Check,
  AlertCircle,
  Tag,
  LayoutDashboard
} from 'lucide-react';

interface CreateEditBlogPageProps {
  editPost?: BlogPost | null;
}

export const CreateEditBlogPage: React.FC<CreateEditBlogPageProps> = ({ editPost }) => {
  const { currentUser, createPost, updatePost, navigateTo } = useBlog();

  const isEditing = Boolean(editPost);

  // Form State
  const [title, setTitle] = useState(editPost ? editPost.title : '');
  const [authorName, setAuthorName] = useState(
    editPost ? editPost.authorName : currentUser ? currentUser.name : 'Divya Goudar'
  );
  const [category, setCategory] = useState(editPost ? editPost.category : 'Technology');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState(editPost ? editPost.description : '');
  const [content, setContent] = useState(
    editPost
      ? editPost.content
      : `## Introduction\n\nStart writing your cyber-tech article here. Share your unique perspective, tutorial steps, or developer insights.\n\n### Key Takeaways\n- Deep dive into modern web technologies\n- Clean architecture & interactive user interfaces\n\n\`\`\`javascript\n// Sample code snippet\nfunction launchProject() {\n  console.log("MyBlog is live & running!");\n}\n\`\`\`\n\n### Conclusion\nWrap up your story with actionable next steps for fellow developers!`
  );
  const [coverImage, setCoverImage] = useState(
    editPost ? editPost.coverImage : PRESET_COVER_IMAGES[0]
  );
  const [tagsInput, setTagsInput] = useState(
    editPost ? editPost.tags.join(', ') : 'WebDev, Coding, Guide'
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize author name if currentUser loads
  useEffect(() => {
    if (!editPost && currentUser) {
      setAuthorName(currentUser.name);
    }
  }, [currentUser, editPost]);

  // Insert markdown helper into textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = document.getElementById('blog-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const validateForm = (): boolean => {
    setError(null);
    if (!title.trim()) {
      setError('Please provide a Blog Title.');
      return false;
    }
    if (!authorName.trim()) {
      setError('Please provide an Author Name.');
      return false;
    }
    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please specify a category for this blog.');
      return false;
    }
    if (!content.trim()) {
      setError('Blog content cannot be empty.');
      return false;
    }
    return true;
  };

  const handleSave = async (status: 'published' | 'draft') => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      const finalCategory = category === 'custom' ? customCategory.trim() : category;
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      // Auto-generate short description if omitted
      const finalDescription =
        description.trim() ||
        content
          .replace(/[#*`_\[\]]/g, '')
          .split('\n')
          .find((l) => l.trim().length > 20)
          ?.slice(0, 160) + '...' ||
        'A new blog article on MyBlog.';

      const authorAvatar =
        currentUser && currentUser.name === authorName
          ? currentUser.avatar
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

      const authorId = currentUser ? currentUser.id : 'user_guest';

      if (isEditing && editPost) {
        const updatePayload = {
          title: title.trim(),
          authorName: authorName.trim(),
          category: finalCategory,
          description: finalDescription,
          content: content.trim(),
          coverImage: coverImage.trim(),
          tags,
          status,
        };
        await updatePost(editPost.id, updatePayload);
        navigateTo('read', { ...editPost, ...updatePayload });
      } else {
        const created = await createPost({
          title: title.trim(),
          authorId,
          authorName: authorName.trim(),
          authorAvatar,
          category: finalCategory,
          description: finalDescription,
          content: content.trim(),
          coverImage: coverImage.trim(),
          tags,
          status,
        });
        if (status === 'published' && created) {
          navigateTo('read', created);
        } else if (currentUser) {
          navigateTo('dashboard');
        } else {
          navigateTo('home');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save blog post.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6" id="create-blog-root">
      
      {/* Top action header bar */}
      <div className="cyber-glass-glow rounded-3xl p-5 sm:p-6 border border-cyan-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
            <PenSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>{isEditing ? 'EDIT BLOG POST' : 'CREATE NEW BLOG'}</span>
            </h1>
            <p className="text-xs text-cyan-200/70">
              {isEditing
                ? 'Update your article details and save or publish changes.'
                : 'Draft a story, tutorial, or guide with live Markdown & syntax highlighting.'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => currentUser ? navigateTo('dashboard') : navigateTo('home')}
            disabled={isSaving}
            className="px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            id="cancel-blog-btn"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border border-amber-500/40 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            id="save-draft-btn"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSaving ? 'Saving...' : isEditing ? 'Save as Draft' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            id="publish-blog-btn"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Processing...' : isEditing ? 'Save Changes' : 'Publish Blog'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-medium" id="create-blog-error-alert">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Editor Card */}
      <div className="cyber-glass-glow rounded-3xl p-6 sm:p-8 border border-cyan-400/40 space-y-6">
        
        {/* Blog Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider">
            Blog Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Master Asynchronous TypeScript & Microservices in 2026"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            className="w-full px-4 py-3 text-lg sm:text-xl font-bold bg-cyan-950/70 focus:bg-cyan-950 text-white placeholder:text-cyan-400/30 rounded-2xl border border-cyan-500/30 focus:border-cyan-400 outline-none transition-all"
            id="blog-title-input"
          />
        </div>

        {/* Row: Author & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Author Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Author Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author display name"
              className="w-full px-3.5 py-2.5 bg-cyan-950/70 focus:bg-cyan-950 text-white text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none"
              id="blog-author-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Category <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cyan-950/70 focus:bg-cyan-950 text-white text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none font-medium"
                id="blog-category-select"
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">
                    {cat.name}
                  </option>
                ))}
                <option value="Tutorial" className="bg-slate-900 text-white">Tutorial</option>
                <option value="Opinion" className="bg-slate-900 text-white">Opinion / Essays</option>
                <option value="custom" className="bg-slate-900 text-white">+ Custom Category...</option>
              </select>

              {category === 'custom' && (
                <input
                  type="text"
                  placeholder="Type category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-48 px-3 py-2 text-xs bg-cyan-950 border border-cyan-500/40 rounded-xl text-white focus:border-cyan-400 focus:outline-none"
                  id="blog-custom-category-input"
                />
              )}
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider">
            Short Description / Excerpt
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief summary (1-2 sentences) shown on blog cards to captivate readers..."
            className="w-full px-3.5 py-2.5 bg-cyan-950/70 focus:bg-cyan-950 text-white text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none"
            id="blog-description-input"
          />
        </div>

        {/* Cover Image Selector */}
        <div className="space-y-2 p-4 bg-cyan-950/40 rounded-2xl border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Cover Image / Thumbnail</span>
            </label>
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="text-xs font-bold text-cyan-300 hover:text-white underline"
              id="toggle-cover-picker-btn"
            >
              {showImagePicker ? 'Hide preset gallery' : 'Choose from presets'}
            </button>
          </div>

          {/* Selected preview & URL input */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <img
              src={coverImage}
              alt="Cover preview"
              className="w-full sm:w-32 h-20 rounded-xl object-cover border border-cyan-500/40 shrink-0 bg-cyan-950"
              referrerPolicy="no-referrer"
            />
            <div className="w-full space-y-1">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-xs bg-cyan-950 rounded-xl border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 font-mono"
                id="blog-cover-url-input"
              />
              <p className="text-[11px] text-cyan-200/60">
                Paste any high-resolution image URL or choose a preset below.
              </p>
            </div>
          </div>

          {/* Presets Grid */}
          {showImagePicker && (
            <div className="pt-3 border-t border-cyan-500/20 grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_COVER_IMAGES.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverImage(imgUrl)}
                  className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all ${
                    coverImage === imgUrl ? 'border-cyan-400 ring-2 ring-cyan-300/50' : 'border-transparent hover:opacity-80'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {coverImage === imgUrl && (
                    <div className="absolute inset-0 bg-cyan-500/40 flex items-center justify-center text-slate-950">
                      <Check className="w-4 h-4 font-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content with Markdown Toolbar & Preview */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
              Blog Content <span className="text-rose-400">*</span>
            </label>

            {/* View Toggle: Edit vs Live Preview */}
            <div className="flex items-center p-1 bg-cyan-950/80 rounded-xl border border-cyan-500/30 text-xs font-medium">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  !previewMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200'
                }`}
                id="tab-content-editor"
              >
                Write Markdown
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  previewMode ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-cyan-200'
                }`}
                id="tab-content-preview"
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>
          </div>

          {/* Markdown Action Toolbar */}
          {!previewMode && (
            <div className="flex flex-wrap items-center gap-1 p-1.5 bg-cyan-950/70 rounded-xl border border-cyan-500/30 text-cyan-200 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**', 'Bold text')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Bold (**text**)"
                id="format-bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*', 'Italic text')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Italic (*text*)"
                id="format-italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ', '', 'Section Heading')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Heading 2 (## Heading)"
                id="format-h2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ', '', 'Sub-heading')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Heading 3 (### Heading)"
                id="format-h3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-cyan-500/30 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('```javascript\n', '\n```', '// Code snippet here')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Code Block"
                id="format-code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('> ', '', 'Quoted thought or takeaway')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Blockquote"
                id="format-quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ', '', 'List item')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Bulleted List"
                id="format-list"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[', '](https://example.com)', 'Link description')}
                className="p-1.5 hover:bg-cyan-500/20 hover:text-cyan-300 rounded-lg transition-colors"
                title="Hyperlink"
                id="format-link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Editor Textarea OR Live Preview */}
          {!previewMode ? (
            <textarea
              id="blog-content-textarea"
              rows={14}
              required
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Write your article in Markdown syntax or plain text..."
              className="w-full p-4 bg-cyan-950/70 focus:bg-cyan-950 text-white font-mono text-xs sm:text-sm leading-relaxed rounded-2xl border border-cyan-500/30 focus:border-cyan-400 outline-none resize-y"
            />
          ) : (
            <div className="p-6 bg-cyan-950/60 border border-cyan-500/30 rounded-2xl text-cyan-100 min-h-[350px] space-y-4">
              <h2 className="text-2xl font-black text-white">{title || 'Untitled Post'}</h2>
              <div className="text-xs text-cyan-300/80 flex items-center gap-2">
                <span>By {authorName}</span>
                <span>•</span>
                <span>Category: {category}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm text-cyan-100 font-sans">
                {content}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-cyan-300/60 pt-1">
            <span>Supports Markdown formatting (Headers, Lists, Code blocks, Quotes)</span>
            <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-cyan-200 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tags (comma separated)</span>
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. JavaScript, React, WebDev, CSS"
            className="w-full px-3.5 py-2.5 bg-cyan-950/70 focus:bg-cyan-950 text-white text-xs sm:text-sm rounded-xl border border-cyan-500/30 focus:border-cyan-400 outline-none"
            id="blog-tags-input"
          />
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-cyan-500/20">
          <button
            type="button"
            onClick={() => currentUser ? navigateTo('dashboard') : navigateTo('home')}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-cyan-200 bg-cyan-950 hover:bg-cyan-900 rounded-xl transition-colors"
          >
            Cancel & Back
          </button>
          <button
            type="button"
            onClick={() => handleSave('draft')}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
            id="bottom-save-draft-btn"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-1.5 hover:scale-105"
            id="bottom-publish-btn"
          >
            <Send className="w-4 h-4" />
            <span>{isEditing ? 'Update & Publish' : 'Publish Blog'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
