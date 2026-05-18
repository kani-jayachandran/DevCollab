# DevCollab

A real-time collaboration platform for developers — built with the MERN stack.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS      |
| Backend   | Node.js, Express                  |
| Database  | MongoDB (Mongoose)                |

## Project Structure

```
devcollab/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
└── backend/           # Express API server
    ├── src/
    │   ├── index.js
    │   ├── config/
    │   │   └── db.js
    │   └── routes/
    │       └── health.js
    └── .env
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` and fill in your values.

## API

| Method | Endpoint      | Description        |
|--------|---------------|--------------------|
| GET    | /api/health   | Server health check |
