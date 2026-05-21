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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// REST routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);

// Connect to MongoDB, then start HTTP + Socket.IO server
connectDB().then(() => {
  initSocket(httpServer);   // attach Socket.IO to the http server

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
});
