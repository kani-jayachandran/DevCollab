import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import workspacesRouter from './routes/workspaces.js';
import { initSocket } from './socket/socketServer.js';

const app = express();
const httpServer = createServer(app);   // Socket.IO needs the raw http.Server
const PORT = process.env.PORT || 5000;

// Build the list of allowed CORS origins from CLIENT_URL.
// Supports comma-separated values so multiple Vercel URLs can be whitelisted:
//   CLIENT_URL=https://dev-collab-awcd123.vercel.app,https://www.dev-collab-awcd123.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// REST routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);

// Root route — confirms the API is reachable
app.get('/', (_req, res) => {
  res.json({ name: 'DevCollab API', status: 'ok', docs: '/api/health' });
});

// Connect to MongoDB, then start HTTP + Socket.IO server
connectDB().then(() => {
  initSocket(httpServer);   // attach Socket.IO to the http server

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
});
