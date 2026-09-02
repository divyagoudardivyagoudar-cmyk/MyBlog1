# MyBlog - Full-Stack Modern Tech Blogging Platform with Node.js, Express & MongoDB

A production-ready, full-stack blog application with a cyber-tech aesthetic, 3D AI robot mascot, user authentication with bcrypt and JWT, and persistent data storage using **MongoDB & Mongoose**.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Authorization (Module 2 & 3)
- **User Registration**: Input validation, duplicate email check, and secure password hashing using **bcryptjs** before storage.
- **User Login**: Secure password comparison with **bcryptjs**, JWT-based authentication tokens with 7-day expiration.
- **Session Management**: Authenticated routes with Bearer token header verification.
- **Author Profiles**: Profile editing (name, bio, avatar) saved directly to MongoDB.

### 2. 📝 Blog Article Management (CRUD)
- **Create Post**: Interactive markdown editor with live preview, preset banner cover image picker, automated read-time calculation, category selection, and tags.
- **Retrieve All Blogs**: `GET /api/blogs` with multi-field search, category filtering, author-specific filtering, and sorting (Latest, Most Popular, Most Views).
- **Individual Blog Details**: `GET /api/blogs/:id` with dynamic view-count increments, styled blockquotes, code syntax rendering, and related stories.
- **Edit & Update**: `PUT /api/blogs/:id` with user authorization checks.
- **Delete Post**: `DELETE /api/blogs/:id` with modal confirmation dialog and author authorization.
- **Likes & Comments**: Real-time reader engagement with like increments and nested comment threads stored in MongoDB subdocuments.

### 3. 🗄️ Database Architecture (MongoDB & Mongoose)
- **Mongoose User Schema**: `id`, `name`, `email`, `username`, `password` (hashed), `avatar`, `bio`, `joinedDate`, `createdAt`.
- **Mongoose Blog Schema**: `id`, `title`, `slug`, `description`, `content`, `authorId`, `authorName`, `authorAvatar`, `category`, `tags`, `coverImage`, `status` (`published` | `draft`), `likesCount`, `viewsCount`, `readTimeMinutes`, `comments`, timestamps.
- **Graceful Error Handling & Fallback**: Database connection status monitoring, auto-seeding on fresh instances, and zero-downtime resilience.

---

## 📁 Project Structure

```
├── server.ts                    # Main Express server entry point & Vite middleware
├── server/
│   ├── config/
│   │   └── db.ts                # MongoDB connection handler & initial seed logic
│   ├── models/
│   │   ├── User.ts              # Mongoose User model & schema with bcrypt hooks
│   │   └── Blog.ts              # Mongoose Blog model & schema with comments
│   ├── controllers/
│   │   ├── authController.ts    # Register, login, me, reset password, update profile
│   │   └── blogController.ts    # CRUD controllers, search, filter, like, comments
│   ├── routes/
│   │   ├── authRoutes.ts        # REST endpoints for authentication
│   │   └── blogRoutes.ts        # REST endpoints for blog operations
│   ├── middleware/
│   │   └── auth.ts              # JWT verification middleware
│   └── db.ts                    # In-memory synchronized fallback store
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Global navigation with active page indicators
│   │   ├── HomePage.tsx         # Hero section, robot mascot, filters, blog cards
│   │   ├── BlogDetailPage.tsx   # Single blog reader with formatted markdown
│   │   ├── CreateEditBlogPage.tsx # Live markdown editor & draft/publish flow
│   │   ├── DashboardPage.tsx    # Author metrics, blog management table, quick actions
│   │   ├── LoginPage.tsx        # Sign-in form with demo credential shortcuts
│   │   ├── RegisterPage.tsx     # New account registration form
│   │   └── RobotMascot.tsx      # Cyber-tech 3D robot mascot
│   ├── context/
│   │   └── BlogContext.tsx      # Global React state management and API dispatch
│   ├── services/
│   │   └── api.ts               # Client-side API service layer with JWT headers
│   ├── data/
│   │   └── initialData.ts       # Curated initial tech articles & categories
│   ├── types.ts                 # TypeScript types & interfaces
│   ├── App.tsx                  # Root layout & page routing
│   └── main.tsx                 # React DOM mount point
├── .env.example                 # Environment variables specification
├── metadata.json                # Project metadata
└── package.json                 # Project dependencies and build scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/myblog.git
cd myblog

# Install dependencies
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the project root by copying the `.env.example`:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# MongoDB Atlas or Local connection URI
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/myblog?retryWrites=true&w=majority"

# JWT Secret for token signing
JWT_SECRET="my_super_secure_jwt_secret_key_2026"
```

### 4. Running the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 5. Building for Production
```bash
npm run build
npm start
```

---

## 📡 REST API Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user with hashed password | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Get current logged-in user details | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update author display name, bio, and avatar | Yes (Bearer Token) |
| `POST` | `/api/auth/reset-password` | Reset account password | No |

### Blog Endpoints (`/api/blogs`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs` | Get all blogs (supports query params: `search`, `category`, `status`, `sort`) | No |
| `GET` | `/api/blogs/:id` | Get single blog by ID & increment view count | No |
| `POST` | `/api/blogs` | Create a new blog post | Yes (Bearer Token) |
| `PUT` | `/api/blogs/:id` | Update an existing blog post | Yes (Bearer Token) |
| `DELETE` | `/api/blogs/:id` | Delete a blog post | Yes (Bearer Token) |
| `POST` | `/api/blogs/:id/like` | Like a blog post | No |
| `POST` | `/api/blogs/:id/comments` | Add a comment to a blog post | No |
| `GET` | `/api/categories` | Get predefined categories | No |

### Health & Analytics
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service and MongoDB connection status |
| `GET` | `/api/stats` | Aggregate metrics (total posts, views, likes, users) |

---

## 🛡️ Security & Quality Best Practices
- **Password Security**: Passwords are never stored in plaintext; hashed with `bcryptjs` (salt rounds = 10).
- **JWT Protection**: Protected routes require valid Bearer token headers.
- **Sensitive Config**: Database credentials and JWT secrets are managed via `.env` and never leaked to frontend code.
- **Sanitized Outputs**: User passwords and internal Mongoose revision keys (`__v`) are stripped from JSON serialization.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
