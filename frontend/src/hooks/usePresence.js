import { useState, useEffect, useCallback } from 'react';
import { getSocket, EVENTS } from '../socket/socketClient.js';

/**
 * Tracks who else is currently viewing the same project board.
 * Returns an array of { userId, name, avatar, socketId } objects.
 *
 * The current user's own socket is included in the list from the server
 * but we filter it out so the presence bar only shows *other* users.
 */
export function usePresence(projectId) {
  const [members, setMembers] = useState([]);

  const handleList = useCallback((list) => {
    const socket = getSocket();
    // Exclude our own socket from the displayed list
    setMembers(list.filter((m) => m.socketId !== socket.id));
  }, []);

  const handleJoined = useCallback((member) => {
    setMembers((prev) => {
      // Avoid duplicates (e.g. reconnect)
      if (prev.some((m) => m.socketId === member.socketId)) return prev;
      return [...prev, member];
    });
  }, []);

  const handleLeft = useCallback(({ socketId }) => {
    setMembers((prev) => prev.filter((m) => m.socketId !== socketId));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();

    socket.on(EVENTS.PRESENCE_LIST, handleList);
    socket.on(EVENTS.USER_JOINED,   handleJoined);
    socket.on(EVENTS.USER_LEFT,     handleLeft);

    return () => {
      socket.off(EVENTS.PRESENCE_LIST, handleList);
      socket.off(EVENTS.USER_JOINED,   handleJoined);
      socket.off(EVENTS.USER_LEFT,     handleLeft);
    };
  }, [projectId, handleList, handleJoined, handleLeft]);

  return members;
}
