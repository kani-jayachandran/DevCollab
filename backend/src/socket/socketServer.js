import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

// ─── Socket event names (single source of truth) ─────────────────────────────
export const EVENTS = Object.freeze({
  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_MOVED:   'task:moved',
  TASK_DELETED: 'task:deleted',

  // Presence events
  USER_JOINED:  'presence:joined',
  USER_LEFT:    'presence:left',
  PRESENCE_LIST:'presence:list',
});

/**
 * Initialise Socket.IO on the HTTP server.
 * Called once from index.js after the Express server starts.
 */
export function initSocket(httpServer) {
  // Accept the same origins as the Express CORS config
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // ── JWT auth middleware ────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email avatar');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { user } = socket;

    // Client joins a project room: socket.emit('join:project', projectId)
    socket.on('join:project', (projectId) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);

      // Announce presence to others in the room
      socket.to(`project:${projectId}`).emit(EVENTS.USER_JOINED, {
        userId:    user._id,
        name:      user.name,
        avatar:    user.avatar,
        socketId:  socket.id,
      });

      // Send the current room members back to the joining client
      const room = io.sockets.adapter.rooms.get(`project:${projectId}`);
      const memberSocketIds = room ? [...room] : [];
      const members = memberSocketIds
        .map((sid) => {
          const s = io.sockets.sockets.get(sid);
          return s?.user
            ? { userId: s.user._id, name: s.user.name, avatar: s.user.avatar, socketId: sid }
            : null;
        })
        .filter(Boolean);

      socket.emit(EVENTS.PRESENCE_LIST, members);
    });

    socket.on('leave:project', (projectId) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit(EVENTS.USER_LEFT, {
        userId:   user._id,
        socketId: socket.id,
      });
    });

    socket.on('disconnect', () => {
      // Notify all rooms this socket was in
      socket.rooms.forEach((room) => {
        if (room.startsWith('project:')) {
          socket.to(room).emit(EVENTS.USER_LEFT, {
            userId:   user._id,
            socketId: socket.id,
          });
        }
      });
    });
  });

  return io;
}

/**
 * Returns the Socket.IO instance.
 * Safe to call from controllers — returns null if not yet initialised.
 */
export function getIO() {
  return io;
}

/**
 * Emit a task event to everyone in the project room.
 * The `excludeSocketId` param lets us skip the sender (optional).
 */
export function emitToProject(projectId, event, payload, excludeSocketId = null) {
  if (!io) return;
  const room = `project:${projectId}`;
  if (excludeSocketId) {
    io.to(room).except(excludeSocketId).emit(event, payload);
  } else {
    io.to(room).emit(event, payload);
  }
}
