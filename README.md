# 🛡️ TrackShield — Issue & Vulnerability Management Platform

A production-ready, full-stack issue tracking and vulnerability management system built with the **MERN stack** (MongoDB, Express, React, Node.js).

---

## 📋 Table of Contents

1. [Project Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation)
7. [Environment Variables](#environment-variables)
8. [Running the App](#running)
9. [Default Credentials](#credentials)
10. [API Reference](#api)
11. [Security Best Practices](#security)

---

## 🏠 Project Overview <a name="overview"></a>

**TrackShield** is a Jira-inspired issue tracking and vulnerability management platform designed for development teams. It supports:

- Bug tracking and feature requests
- Security vulnerability management with CVSS scoring
- Role-based access control (Admin, Manager, Developer, QA, Security Analyst)
- Rich dashboard with analytics charts
- File attachments (images and PDFs)
- Threaded comments with edit/delete
- Approval workflows

---

## ✨ Features <a name="features"></a>

### Authentication & Access Control
- JWT-based authentication with 7-day expiry
- Role-based access control (RBAC) — 5 roles
- Admin user management (create, edit, deactivate)
- Password change functionality
- Profile management

### Issue Management
- Full CRUD for issues with unique IDs (TS-0001, TS-0002…)
- Types: Bug, Feature, Security Vulnerability, Task, Improvement
- Priority: Low / Medium / High / Critical
- Status: Open / In Progress / Resolved / Closed / Reopened
- Environments: Development / Staging / Production
- Approval workflow: Pending / Approved / Rejected
- Security fields: CVSS Score, CVE ID, Affected/Fix Version
- Tags support
- Due dates

### File Attachments
- Upload images (JPEG, PNG, GIF, WebP)
- Upload documents (PDF)
- Max 10MB per file, up to 5 per issue
- Secure storage with unique filenames

### Comments System
- Add, edit, and delete comments
- Timestamps and author info
- Ctrl+Enter keyboard shortcut
- Edit history indicator

### Dashboard Analytics
- Summary cards: total, open, in-progress, resolved, closed
- Bar chart: Issues by priority
- Pie chart: Issues by type
- Line chart: Issue trend (last 30 days)
- Recent issues list
- Critical open issues
- User assignment stats

### Filtering & Search
- Search by title, description, issue ID, tags
- Filter by status, priority, type, assignee
- Pagination (20 per page)
- Sort by creation date

---

## 🛠️ Tech Stack <a name="tech-stack"></a>

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — Database & ODM
- **JWT** (jsonwebtoken) — Authentication
- **bcryptjs** — Password hashing
- **Multer** — File upload handling
- **Helmet** — Security headers
- **express-rate-limit** — Rate limiting
- **Morgan** — HTTP logging

### Frontend
- **React 18** + **Vite** — UI framework + build tool
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Data visualization
- **Zustand** — State management
- **Axios** — HTTP client
- **react-hot-toast** — Notifications
- **Heroicons** — Icon set
- **date-fns** — Date utilities

---

## 📁 Folder Structure <a name="folder-structure"></a>

```
trackshield/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── issueController.js
│   │   ├── commentController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication + RBAC
│   │   └── upload.js         # Multer file upload config
│   ├── models/
│   │   ├── User.js
│   │   ├── Issue.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── issues.js
│   │   ├── comments.js
│   │   ├── dashboard.js
│   │   └── uploads.js
│   ├── utils/
│   │   └── seed.js           # Sample data seeder
│   ├── uploads/              # File storage (auto-created)
│   │   ├── images/
│   │   ├── documents/
│   │   └── attachments/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   └── Sidebar.jsx
    │   │   ├── issues/
    │   │   │   ├── IssueForm.jsx
    │   │   │   └── CommentSection.jsx
    │   │   └── ui/
    │   │       └── index.jsx     # Badge, Avatar, Modal, etc.
    │   ├── context/
    │   │   └── authStore.js      # Zustand auth store
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── IssuesPage.jsx
    │   │   ├── IssueDetailPage.jsx
    │   │   ├── CreateIssuePage.jsx
    │   │   ├── EditIssuePage.jsx
    │   │   ├── UsersPage.jsx
    │   │   └── ProfilePage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios instance
    │   ├── utils/
    │   │   └── helpers.js        # Constants + helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## ✅ Prerequisites <a name="prerequisites"></a>

Make sure you have the following installed:

| Software | Version | Download |
|----------|---------|----------|
| Node.js  | v18+    | https://nodejs.org |
| npm      | v9+     | (comes with Node.js) |
| MongoDB  | v6+     | https://mongodb.com/try/download/community |
| Git      | any     | https://git-scm.com |

### Recommended VS Code Extensions
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Tailwind CSS IntelliSense** — Tailwind autocomplete
- **MongoDB for VS Code** — Database explorer
- **REST Client** or **Thunder Client** — API testing

---

## 🚀 Installation & Setup <a name="installation"></a>

### Step 1: Extract the project

```bash
unzip trackshield.zip
cd trackshield
```

### Step 2: Set up the Backend

```bash
cd backend
npm install
```

### Step 3: Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and update the values (see [Environment Variables](#environment-variables) section).

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows — MongoDB should run as a service, or start manually:
# "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**Option B: MongoDB Atlas (Cloud — Free)**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Get the connection string
4. Update `MONGODB_URI` in your `.env`

### Step 5: Seed sample data (recommended)

```bash
npm run seed
```

This creates 5 users, 10 issues, and 9 comments.

### Step 6: Set up the Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables <a name="environment-variables"></a>

Create `backend/.env` with these values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/db name

# JWT — CHANGE THIS! Use a random 32+ character string
JWT_SECRET=change_this_to_a_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email (Optional — for future notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@trackshield.io
```

> ⚠️ **Security note**: Never commit your `.env` file to version control!

---

## ▶️ Running the App <a name="running"></a>

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev        # Development (auto-reload with nodemon)
# OR
npm start          # Production
```

Backend starts at: **http://localhost:5000**

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend starts at: **http://localhost:5173**

### Open in Browser

Navigate to: **http://localhost:5173**

---

## 🔑 Default Credentials <a name="credentials"></a>

After running `npm run seed` in the backend:

| Role             | Email                       | Password    |
|------------------|-----------------------------|-------------|



> ⚠️ Change all passwords before deploying to production!

---

## 🌐 API Reference <a name="api"></a>

Base URL: `http://localhost:5000/api`

All routes (except login) require: `Authorization: Bearer <token>`

### Auth
| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| POST   | /auth/login               | Login                 |
| GET    | /auth/me                  | Get current user      |
| PATCH  | /auth/change-password     | Change password       |

### Users (Admin only for create/delete)
| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| GET    | /users         | List all users      |
| POST   | /users         | Create user (admin) |
| GET    | /users/:id     | Get user by ID      |
| PUT    | /users/:id     | Update user         |
| DELETE | /users/:id     | Deactivate user     |
| PATCH  | /users/profile | Update own profile  |

### Issues
| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| GET    | /issues                          | List issues (filtered) |
| POST   | /issues                          | Create issue           |
| GET    | /issues/:id                      | Get issue detail       |
| PUT    | /issues/:id                      | Update issue           |
| PATCH  | /issues/:id                      | Partial update         |
| DELETE | /issues/:id                      | Delete/archive issue   |
| POST   | /issues/:id/attachments          | Upload attachment      |
| DELETE | /issues/:id/attachments/:attId   | Delete attachment      |

### Comments
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /comments/issue/:issueId    | Get issue comments    |
| POST   | /comments/issue/:issueId    | Add comment           |
| PUT    | /comments/:id               | Edit comment          |
| DELETE | /comments/:id               | Delete comment        |

### Dashboard
| Method | Endpoint    | Description         |
|--------|-------------|---------------------|
| GET    | /dashboard  | Dashboard analytics |

---

## 🔐 Security Best Practices <a name="security"></a>

This project implements the following security measures:

1. **Password Hashing** — bcrypt with salt factor 12
2. **JWT Authentication** — Stateless, signed tokens with expiry
3. **RBAC** — Role-based access control on every route
4. **Helmet.js** — Sets 15+ security HTTP headers
5. **Rate Limiting** — 500 requests/15 min per IP on `/api/`
6. **CORS** — Whitelist-only origins
7. **Input Validation** — Server-side validation on all inputs
8. **File Upload Security** — Mimetype checking, size limits, randomized filenames
9. **Error Handling** — Never exposes stack traces in production
10. **MongoDB Injection** — Mongoose sanitizes queries

### For Production Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET` (32+ random chars)
- [ ] Enable HTTPS / SSL termination
- [ ] Use MongoDB Atlas or a managed database
- [ ] Store uploads on AWS S3 or Cloudflare R2 (not local disk)
- [ ] Set up proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Set up log monitoring (e.g., Logtail, Datadog)
- [ ] Configure automatic backups

---

## 🏗️ Building for Production

### Backend
```bash
cd backend
NODE_ENV=production npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

Serve the `dist/` folder with Nginx, Apache, or deploy to Vercel/Netlify.

---

## 📞 Support

For issues or questions, refer to the inline code comments or open a GitHub issue.

**TrackShield** — Built with ❤️ for security-conscious development teams.
