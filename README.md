# DevCollab

A full-stack real-time collaboration platform for software development teams — built with the MERN stack.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Seed Data & Test Credentials](#seed-data--test-credentials)
9. [API Reference](#api-reference)

---

## Overview

DevCollab gives development teams a single place to manage projects, track tasks on a Kanban board, write documentation, store code snippets, and get AI-powered assistance — all with real-time collaboration via WebSockets.

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | JWT-based register / login, bcrypt password hashing, protected routes |
| **Workspaces** | Multi-tenant workspaces with Owner / Admin / Member / Viewer roles |
| **Projects** | Projects nested inside workspaces, per-project member management |
| **Kanban Board** | Drag-and-drop task board (Todo → In Progress → In Review → Done), priority levels, assignees, due dates |
| **Real-time Sync** | Socket.IO — task creates, updates, moves and deletes broadcast to all viewers instantly |
| **Live Presence** | Avatar bubbles showing who else is viewing the same board |
| **Wiki / Docs** | TipTap rich-text editor with autosave, version history (up to 50 snapshots) |
| **Snippet Manager** | Syntax-highlighted code snippets with tag search, copy-to-clipboard, 28 languages |
| **AI Assistant** | Gemini-powered: project summary, daily standup report, feature → task breakdown |
| **AI Code Review** | Paste code → get bugs, performance, readability, security feedback + quality score (1–10) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v6 |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Rich Text** | TipTap v3 (StarterKit, Underline, Link, TaskList, CharacterCount, Placeholder) |
| **Syntax Highlight** | react-syntax-highlighter (VSCode Dark+ theme) |
| **Real-time (client)** | socket.io-client |
| **HTTP client** | Axios |
| **Backend** | Node.js 18+, Express 4 |
| **Database** | MongoDB 6+ with Mongoose 8 |
| **Auth** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **Real-time (server)** | Socket.IO 4 |
| **AI** | Google Gemini 1.5 Flash Latest (`@google/generative-ai`) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│                                                             │
│  Pages: Login · Register · Workspaces · Projects           │
│         Kanban · Docs · Snippets · AI Assistant            │
│                                                             │
│  State: AuthContext · WorkspaceContext · TaskContext        │
│  Socket: socketClient.js  ──────────────────────────────┐  │
└──────────────────────────┬──────────────────────────────┼──┘
                           │ REST (Axios)                  │ WS
                           ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                        │
│                                                             │
│  REST Routes                    Socket.IO Server            │
│  /api/auth          ──►  authController          JWT auth   │
│  /api/workspaces    ──►  workspaceController     middleware  │
│    /:id/projects    ──►  projectController                  │
│      /:id/tasks     ──►  taskController  ──► emitToProject  │
│      /:id/docs      ──►  docController                      │
│      /:id/snippets  ──►  snippetController                  │
│      /:id/ai        ──►  aiController ──► Gemini API        │
│                                                             │
│  Middleware: protect · loadWorkspace · loadProject          │
│              requireRole                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        MongoDB                               │
│                                                             │
│  Collections: users · workspaces · projects                 │
│               tasks · docs · snippets                       │
└─────────────────────────────────────────────────────────────┘
```

**Request flow (example — move a task):**
1. User drags a card → `moveTask()` optimistically updates local state
2. `PATCH /api/.../tasks/:id` persists the new status + order
3. Backend emits `task:moved` to the Socket.IO project room
4. All other connected clients receive the event and update their board

---

## Project Structure

```
devcollab/
├── backend/
│   ├── src/
│   │   ├── ai/                  # Gemini service + prompt templates
│   │   │   ├── geminiService.js
│   │   │   └── prompts.js
│   │   ├── config/
│   │   │   └── db.js            # Mongoose connection
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # auth, workspace, project guards
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Workspace.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   ├── Doc.js
│   │   │   └── Snippet.js
│   │   ├── routes/              # Express routers (nested)
│   │   ├── socket/
│   │   │   └── socketServer.js  # Socket.IO init + event handlers
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   └── index.js             # Entry point
│   ├── .env
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                 # Axios call modules
    │   ├── components/
    │   │   ├── ai/              # AI panel components
    │   │   └── *.jsx            # Shared UI components
    │   ├── context/             # React contexts (Auth, Workspace, Task)
    │   ├── hooks/               # useAI, usePresence, useCopyToClipboard
    │   ├── lib/                 # Static data (languages list)
    │   ├── pages/               # Route-level page components
    │   └── socket/
    │       └── socketClient.js  # Singleton socket instance
    ├── .env
    ├── .env.example
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (`mongod`) or a MongoDB Atlas connection string
- **Git**

### 1. Clone

```bash
git clone <repo-url>
cd devcollab
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env      # fill in your values (see below)
npm install
npm run dev               # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # starts on http://localhost:5173
```

### 4. Seed demo data (optional)

```bash
cd backend
node scripts/seed.js
```

This creates two demo users, a workspace, two projects, and sample tasks, docs, and snippets.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `NODE_ENV` | No | `development` or `production` |
| `JWT_SECRET` | Yes | Secret key for signing JWTs — use a long random string in production |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `CLIENT_URL` | No | Frontend origin for CORS (default `http://localhost:5173`) |
| `GEMINI_API_KEY` | AI features | Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey) |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend REST base URL (default `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | Yes | Backend WebSocket URL (default `http://localhost:5000`) |

---

## Seed Data & Test Credentials

Run `node backend/scripts/seed.js` to populate the database with demo data.

### Test accounts

| Role | Email | Password |
|---|---|---|
| Owner | `alice@devcollab.dev` | `password123` |
| Member | `bob@devcollab.dev` | `password123` |

### What gets seeded

- **1 workspace** — "DevCollab Demo"
- **2 projects** — "Website Redesign" and "API v2"
- **8 tasks** spread across all four Kanban columns
- **2 wiki documents** with sample content
- **3 code snippets** (JavaScript, Python, Go)

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in, returns JWT |
| `GET` | `/api/auth/me` | ✓ | Get current user |

### Workspaces

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/workspaces` | Any member | List user's workspaces |
| `POST` | `/api/workspaces` | Authenticated | Create workspace |
| `GET` | `/api/workspaces/:id` | Any member | Get workspace |
| `PATCH` | `/api/workspaces/:id` | Owner, Admin | Update workspace |
| `DELETE` | `/api/workspaces/:id` | Owner | Delete workspace |

### Projects

Nested under `/api/workspaces/:workspaceId/projects`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/projects` | Any member | List projects |
| `POST` | `/projects` | Member+ | Create project |
| `GET` | `/projects/:id` | Any member | Get project |
| `PATCH` | `/projects/:id` | Owner, Admin | Update project |
| `DELETE` | `/projects/:id` | Owner | Delete project |

### Tasks

Nested under `.../projects/:projectId/tasks`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/tasks` | Any member | List tasks (grouped by column) |
| `POST` | `/tasks` | Any member | Create task |
| `PATCH` | `/tasks/:id` | Any member | Update / move task |
| `DELETE` | `/tasks/:id` | Creator or Owner/Admin | Delete task |

### Docs, Snippets, AI

Same nesting pattern under `.../projects/:projectId/`

| Resource | Endpoints | Notes |
|---|---|---|
| `docs` | CRUD | `PATCH` saves a new version snapshot |
| `snippets` | CRUD + `?q=&tag=&lang=` search | |
| `ai/summary` | `POST` | Board → project summary |
| `ai/standup` | `POST` | Board → standup report |
| `ai/breakdown` | `POST` `{ featureDescription }` | Text → task list |
| `ai/review` | `POST` `{ language, code }` | Code → review + score |

### Socket.IO Events

| Event | Direction | Payload |
|---|---|---|
| `join:project` | Client → Server | `projectId` |
| `leave:project` | Client → Server | `projectId` |
| `task:created` | Server → Client | `{ task }` |
| `task:updated` | Server → Client | `{ task }` |
| `task:moved` | Server → Client | `{ task, prevStatus }` |
| `task:deleted` | Server → Client | `{ taskId }` |
| `presence:list` | Server → Client | `[{ userId, name, avatar, socketId }]` |
| `presence:joined` | Server → Client | `{ userId, name, avatar, socketId }` |
| `presence:left` | Server → Client | `{ userId, socketId }` |
