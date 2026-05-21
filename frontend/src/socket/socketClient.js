import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Returns the singleton socket, creating it on first call.
 * Passes the stored JWT as auth so the server middleware can verify it.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,       // we connect manually when the board mounts
      withCredentials: true,
      auth: {
        token: localStorage.getItem('devcollab_token') ?? '',
      },
    });
  }
  return socket;
}

/**
 * Refreshes the auth token on the existing socket instance.
 * Call this after login so the token is always current.
 */
export function updateSocketToken() {
  const s = getSocket();
  s.auth = { token: localStorage.getItem('devcollab_token') ?? '' };
}

// ── Event name constants (mirrors backend EVENTS) ────────────────────────────
export const EVENTS = Object.freeze({
  TASK_CREATED:  'task:created',
  TASK_UPDATED:  'task:updated',
  TASK_MOVED:    'task:moved',
  TASK_DELETED:  'task:deleted',
  USER_JOINED:   'presence:joined',
  USER_LEFT:     'presence:left',
  PRESENCE_LIST: 'presence:list',
});
