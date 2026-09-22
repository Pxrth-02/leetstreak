# LeetStreak — Module 1

A web app where a user signs in with Google, links their LeetCode username (verified against LeetCode's public GraphQL API), and maintains a secure session via JWT and httpOnly refresh cookies.

## Architecture & Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS (dark theme, glassmorphism design system)
- **Backend**: Node.js + Express (Modular Monolith)
- **Database**: MongoDB Atlas / local MongoDB (Mongoose)
- **Authentication**: Google OAuth (Google Identity Services) + Custom 15-min JWT + 30-day httpOnly Refresh Token Cookie
- **Verification**: LeetCode public GraphQL API (`matchedUser` query)

---

## Directory Structure

```
leetstreak/
├── server/
│   ├── models/
│   │   └── User.js                 # Mongoose User schema strictly per spec
│   ├── routes/
│   │   ├── auth.js                 # POST /api/auth/google, /refresh, /logout
│   │   └── user.js                 # POST /api/user/leetcode-username, GET /me
│   ├── services/
│   │   └── leetcode.js             # verifyUsername() via LeetCode GraphQL
│   ├── middleware/
│   │   └── authenticate.js         # JWT Bearer token authentication
│   ├── server.js                   # Express server setup & MongoDB connection
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios with credentials & auto-refresh
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # In-memory access token & auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Google Sign-In & dev test flow
│   │   │   ├── LinkLeetCode.jsx    # LeetCode handle submission & verification
│   │   │   └── Profile.jsx         # User dashboard & linked handle view
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Design system & sleek dark theme
│   ├── package.json
│   ├── vite.config.js
│   └── .env
└── README.md
```

---

## Getting Started

### 1. Backend Setup

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:5000`.

#### Environment Variables (`server/.env`)
- `PORT`: 5000
- `CLIENT_URL`: `http://localhost:5173`
- `JWT_SECRET`: A secret string for signing access tokens
- `MONGO_URI`: MongoDB connection string (e.g., `mongodb://127.0.0.1:27017/leetstreak` or MongoDB Atlas URI)
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will start on `http://localhost:5173`.

#### Environment Variables (`client/.env`)
- `VITE_API_URL`: `http://localhost:5000/api`
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/google` | No | Verifies Google ID token, creates/finds user, issues 15-min JWT + 30-day httpOnly refresh cookie |
| `POST` | `/api/auth/refresh` | Cookie | Reads httpOnly cookie, validates bcrypt hash, issues new access token |
| `POST` | `/api/auth/logout` | Cookie | Clears cookie, removes refresh token hash from DB |
| `POST` | `/api/user/leetcode-username` | Yes (Bearer) | Validates handle against LeetCode GraphQL, saves to profile |
| `GET` | `/api/user/me` | Yes (Bearer) | Returns authenticated user profile |
