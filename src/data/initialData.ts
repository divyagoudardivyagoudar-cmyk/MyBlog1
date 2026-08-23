import { BlogPost, CategoryInfo, User } from '../types';

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  { id: 'tech', name: 'Technology', iconName: 'Laptop', color: '#2563eb', bgLight: '#eff6ff' },
  { id: 'javascript', name: 'JavaScript', iconName: 'Code', color: '#eab308', bgLight: '#fefce8' },
  { id: 'design', name: 'Design & UI', iconName: 'Palette', color: '#ec4899', bgLight: '#fdf2f8' },
  { id: 'lifestyle', name: 'Lifestyle', iconName: 'Compass', color: '#10b981', bgLight: '#ecfdf5' },
  { id: 'career', name: 'Career & Tips', iconName: 'Briefcase', color: '#8b5cf6', bgLight: '#f5f3ff' },
  { id: 'ai', name: 'AI & Future', iconName: 'Sparkles', color: '#06b6d4', bgLight: '#ecfeff' },
];

export const PRESET_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_divya',
    name: 'Divya Goudar',
    email: 'divyagoudardivyagoudar@gmail.com',
    username: 'divya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    bio: 'Software engineer, passionate web developer, and tech writer exploring modern frontend architectures.',
    joinedDate: 'Aug 10, 2026',
    password: 'password123',
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    username: 'alexdev',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    bio: 'Fullstack architect sharing tips on Node, React, and cloud native microservices.',
    joinedDate: 'Jul 15, 2026',
    password: 'password123',
  },
  {
    id: 'user_sophia',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    username: 'sophiacodes',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    bio: 'UI/UX designer turned frontend developer. Passionate about design systems and digital craft.',
    joinedDate: 'Aug 01, 2026',
    password: 'password123',
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog_1',
    title: 'My First Blog: Starting the Journey in Modern Web Development',
    slug: 'my-first-blog-starting-journey',
    description: 'Reflections and actionable milestones as I embark on crafting web applications with contemporary frontend frameworks.',
    content: `## Welcome to My First Blog Post!

Starting something new is always exciting and a little daunting. Today, I'm thrilled to launch **MyBlog**—a space dedicated to sharing ideas, coding tutorials, and knowledge with fellow developers across the globe.

### Why I Started This Blog

When you learn in public, two remarkable things happen:
1. **You solidify your understanding**: Teaching a concept requires breaking it down into simple, intuitive steps.
2. **You connect with community**: Sharing solutions helps others who are tackling the same obstacles.

\`\`\`javascript
function welcomeLearner(name) {
  return \`Welcome \${name}! Let's build something remarkable today.\`;
}

console.log(welcomeLearner("Developer"));
\`\`\`

### What to Expect
In upcoming articles, I will be deep-diving into:
- Modern JavaScript fundamentals (ES6+ features, async/await, closures)
- React 19 and reactive state management patterns
- Clean, accessible component UI design
- Real-world project walkthroughs

Thank you for reading and joining me on this journey. Feel free to leave a comment or share your thoughts below!`,
    authorId: 'user_divya',
    authorName: 'Divya Goudar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    category: 'Technology',
    tags: ['WebDev', 'Beginner', 'Career'],
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    createdAt: 'Aug 22, 2026',
    updatedAt: 'Aug 22, 2026',
    status: 'published',
    likesCount: 28,
    viewsCount: 342,
    readTimeMinutes: 3,
    comments: [
      {
        id: 'c1',
        authorName: 'Alex Rivera',
        authorEmail: 'alex.rivera@example.com',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        content: 'Great first post, Divya! Excited to follow your series on JavaScript and React.',
        createdAt: 'Aug 22, 2026'
      },
      {
        id: 'c2',
        authorName: 'Sophia Chen',
        authorEmail: 'sophia.chen@example.com',
        authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        content: 'The layout of this blog is clean and easy to read. Best of luck on the journey!',
        createdAt: 'Aug 22, 2026'
      }
    ]
  },
  {
    id: 'blog_2',
    title: 'Learning JavaScript: The 5 Core Concepts Every Developer Must Master',
    slug: 'learning-javascript-5-core-concepts',
    description: 'A comprehensive beginner-friendly breakdown of closures, asynchronous promises, scope, event loops, and array manipulations.',
    content: `## Demystifying JavaScript Fundamentals

JavaScript is the engine of the web. Whether you are building interactive web applications, backend services with Node.js, or mobile apps, understanding the bedrock principles of JavaScript is essential.

### 1. Scope & Hoisting
JavaScript has global, function, and block scope. Using \`const\` and \`let\` provides predictable block scoping:

\`\`\`javascript
function scopeExample() {
  if (true) {
    let blockScoped = "I exist only inside this block";
    var functionScoped = "I am hoisted to function top";
  }
  // blockScoped is not accessible here
  console.log(functionScoped); // Works!
}
\`\`\`

### 2. Closures
A closure is the combination of a function bundled together with references to its surrounding lexical state. Closures give you access to an outer function’s scope from an inner function.

\`\`\`javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
\`\`\`

### 3. Asynchronous JavaScript & Promises
Gone are the days of callback hell. Modern JavaScript uses async/await syntax to write asynchronous code that looks and behaves like synchronous code:

\`\`\`javascript
async function fetchUserStories(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}/stories\`);
    if (!response.ok) throw new Error("Failed to load");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
\`\`\`

### 4. Array Methods (\`.map\`, \`.filter\`, \`.reduce\`)
Functional programming patterns in JavaScript allow writing declarative, bug-resistant transformations.

### 5. The Event Loop
Understanding how the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout) collaborate ensures you never accidentally block UI rendering.

Keep practicing these concepts daily with small interactive sandbox challenges!`,
    authorId: 'user_divya',
    authorName: 'Divya Goudar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    category: 'JavaScript',
    tags: ['JavaScript', 'Programming', 'Tutorial'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    createdAt: 'Aug 20, 2026',
    updatedAt: 'Aug 21, 2026',
    status: 'published',
    likesCount: 45,
    viewsCount: 512,
    readTimeMinutes: 5,
    comments: [
      {
        id: 'c3',
        authorName: 'Marcus Vance',
        authorEmail: 'marcus@example.com',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        content: 'The closure code snippet made it click for me. Thanks for breaking it down!',
        createdAt: 'Aug 21, 2026'
      }
    ]
  },
  {
    id: 'blog_3',
    title: 'Building Clean & Accessible UI: A Developer’s Guide to Design Systems',
    slug: 'building-clean-accessible-ui-guide',
    description: 'Learn the principles of visual balance, mathematical padding, high-contrast colors, and keyboard accessibility for web apps.',
    content: `## Design is More Than Aesthetics—It's Usability

Creating modern web interfaces is an art of restraint, mathematical spacing, and empathetic usability. Great user interfaces feel effortless because every pixel, font size, and color tone was chosen intentionally.

### Principles of Visual Rhythm
1. **The 4px / 8px Spatial Grid**: Keeping margin and padding values divisible by 4 or 8 creates visual harmony.
2. **Typography Scale**: Pairing an expressive display header with a crisp, readable body typeface prevents monotonous UI.
3. **Contrast Ratios**: Always guarantee a minimum 4.5:1 contrast ratio for body text to satisfy WCAG AA accessibility criteria.

### Practical Tips for Component Styling
- **Avoid pure black and pure white**: Soften #000000 to slate or charcoal (#0f172a) for lower eye strain.
- **Button Feedback**: Provide clear active, focus-visible, and hover states with smooth transitions.
- **Form Validation**: Always display inline, descriptive error messages next to fields rather than generic alerts.`,
    authorId: 'user_sophia',
    authorName: 'Sophia Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    category: 'Design & UI',
    tags: ['Design', 'UI/UX', 'Accessibility'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    createdAt: 'Aug 18, 2026',
    updatedAt: 'Aug 18, 2026',
    status: 'published',
    likesCount: 39,
    viewsCount: 420,
    readTimeMinutes: 4,
    comments: []
  },
  {
    id: 'blog_4',
    title: 'How Artificial Intelligence is Shaping the Future of Developer Productivity',
    slug: 'ai-shaping-future-developer-productivity',
    description: 'Exploring how AI coding assistants, automated test generation, and intelligent scaffolding enhance developer workflows.',
    content: `## The Modern AI-Augmented Workflow

Software engineering is evolving faster than ever. Generative AI tools and intelligent compilers are not replacing developers—they are removing repetitive boilerplate, helping debug complex stack traces, and acting as thought partners.

### Key Productivity Multipliers
- **Rapid Prototyping**: Generating initial scaffolding and mock data allows rapid validation of ideas.
- **Automated Test Generation**: Creating edge-case unit tests and schema validations in seconds.
- **Documentation Summaries**: Transforming complex codebases into readable architectural overviews.

As developers, mastering how to prompt, verify, and architect systems with AI tools is becoming a superpower.`,
    authorId: 'user_alex',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    category: 'AI & Future',
    tags: ['AI', 'Tech', 'Productivity'],
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    createdAt: 'Aug 16, 2026',
    updatedAt: 'Aug 16, 2026',
    status: 'published',
    likesCount: 52,
    viewsCount: 680,
    readTimeMinutes: 4,
    comments: []
  },
  {
    id: 'blog_5',
    title: 'Work-Life Balance for Tech Professionals: Avoiding Burnout',
    slug: 'work-life-balance-tech-burnout',
    description: 'Practical daily habits, timeboxing strategies, and mental wellness techniques for staying energized and productive.',
    content: `## Finding Sustainable Momentum in Tech

In a field where technology evolves constantly and remote work can blur the boundary between home and office, avoiding burnout is vital.

### 3 Daily Habits That Made a Difference
1. **Strict Shutdown Ritual**: Close your laptop at a fixed hour each evening and step outside for a walk.
2. **Pomodoro Timeboxing**: Work in 25-minute focused bursts with 5-minute movement breaks.
3. **Physical Hobbies**: Engage in activities that do not involve screens (cooking, sports, reading physical books).

Remember: your career is a marathon, not a sprint. Take care of your well-being first!`,
    authorId: 'user_divya',
    authorName: 'Divya Goudar',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    category: 'Lifestyle',
    tags: ['Productivity', 'Wellness', 'Life'],
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    createdAt: 'Aug 14, 2026',
    updatedAt: 'Aug 14, 2026',
    status: 'draft',
    likesCount: 12,
    viewsCount: 88,
    readTimeMinutes: 3,
    comments: []
  }
];
