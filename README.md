<div align="center">
  <h1>MyBlog Platform</h1>
  <p><strong>A Cyber-Tech Full-Stack Blogging Platform</strong></p>

  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-Backend-lightgrey.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

> A production-ready, full-stack blog application featuring a futuristic cyber-tech aesthetic, user authentication with bcrypt and JWT, and persistent data storage using **MongoDB & Mongoose**.

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [🌍 Deployment Guide](#-deployment-guide)
- [📡 API Reference](#-api-reference)
- [🛡️ Security](#-security)

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Secure Registration**: Input validation, duplicate email checks, and secure password hashing via `bcryptjs`.
- **JWT Sessions**: Login generates secure JWT Bearer tokens with 7-day expiration.
- **Protected Routes**: Middleware verifies tokens for sensitive actions (creating/editing posts, updating profiles).
- **Profile Management**: Users can update their display name, bio, and avatar, saved directly to MongoDB.

### 📝 Content Management (CRUD)
- **Markdown Editor**: Interactive rich text creation with live preview, preset banner cover images, automated read-time calculation, and category/tag tagging.
- **Advanced Querying**: Search blogs by keyword, filter by category or author, and sort by `Latest`, `Most Popular`, or `Most Views`.
- **Author Dashboard**: Dedicated dashboard strictly isolating the logged-in user's published articles and drafts.
- **Interactive Reader**: View-count increments, styled blockquotes, code syntax rendering, and related stories.

### 🗄️ Resilient Database
- **Dual-Storage Support**: Runs on a robust **MongoDB** cluster via Mongoose, with an automatic in-memory fallback store if the database URI is omitted.
- **Relational Integrity**: Comments and Likes stored in subdocuments; Author metadata synced elegantly across posts.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (Styling & Responsive Design)
- **Lucide React** (Iconography)
- **React Markdown** (Rich text rendering)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database & ODM)
- **JWT (jsonwebtoken)** (Authentication)
- **Bcrypt.js** (Password Cryptography)

---

## 📁 Architecture

```text
├── server.ts                    # Main Express server & Vite middleware
├── server/
│   ├── config/db.ts             # MongoDB connection & seeding
│   ├── models/                  # Mongoose Schemas (User, Blog)
│   ├── controllers/             # Business logic (Auth, Blogs)
│   ├── routes/                  # Express REST routes
│   └── middleware/auth.ts       # JWT verification middleware
├── src/
│   ├── components/              # React UI Components (Navbar, Dashboard, Editor, etc.)
│   ├── context/BlogContext.tsx  # Global State & API Dispatch
│   ├── services/api.ts          # Axios/Fetch API wrappers with JWT injection
│   └── App.tsx                  # Core React Routing
└── .env.example                 # Environment configuration template
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas cluster)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/myblog.git
cd myblog

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Update the `.env` file:
```env
# MongoDB Atlas Connection URI
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/myblog?retryWrites=true&w=majority"

# JWT Secret for Token Signing
JWT_SECRET="my_super_secure_jwt_secret_key_2026"
```

### 4. Run Locally
```bash
# Starts both Express API and Vite React server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌍 Deployment Guide

This is a full-stack **Express + Vite** application. For seamless deployment, we strongly recommend **Render** (or Railway/Heroku) to natively support full-stack Node.js servers without serverless workarounds.

### 🟢 Deploying to Render (Recommended)
1. **Push to GitHub**: Export your code and push it to a GitHub repository.
2. **Render Dashboard**: Go to [Render.com](https://render.com/) and click **New +** -> **Web Service**.
3. **Connect Repository**: Select your GitHub repository.
4. **Configure**:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. **Environment Variables**: Add `MONGO_URI` and `JWT_SECRET` in the Advanced Settings.
6. **Deploy**: Render will automatically build your Vite app and start your Express server!

*(Note: Deploying to Vercel/Netlify requires rewriting the backend to use Serverless Functions `/api` folder structure, which is not recommended for this setup).*

---

## 📡 API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Authenticate & return JWT | ❌ |
| `GET` | `/api/auth/me` | Get logged-in user profile | 🔐 Yes |
| `PUT` | `/api/auth/profile` | Update user metadata | 🔐 Yes |

### Blogs (`/api/blogs`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs` | Get all blogs (supports search, sort, filter) | ❌ |
| `GET` | `/api/blogs/:id` | Get single blog (increments views) | ❌ |
| `POST` | `/api/blogs` | Create a new blog post | 🔐 Yes |
| `PUT` | `/api/blogs/:id` | Update an existing post | 🔐 Yes |
| `DELETE`| `/api/blogs/:id` | Delete a post | 🔐 Yes |

---

## 🛡️ Security
- **Bcrypt Hashing**: Passwords are mathematically hashed (10 salt rounds) before ever touching the database.
- **JWT Signatures**: API protection enforced by stateless, tamper-proof JSON Web Tokens.
- **Sanitized Payloads**: Mongoose `.lean()` and custom serializers ensure sensitive data (passwords, `__v` tags) never leak to the client network.

---

<div align="center">
  <p>Built with ❤️ using React, Express, and MongoDB.</p>
</div>
