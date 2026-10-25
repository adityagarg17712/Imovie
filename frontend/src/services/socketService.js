import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log(`[Socket Connected] ID: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] Reason: ${reason}`);
    });
  }
  return socket;
};

export const joinShowRoom = (showId) => {
  const s = getSocket();
  s.emit('join_show', { showId });
};

export const leaveShowRoom = (showId) => {
  const s = getSocket();
  s.emit('leave_show', { showId });
};
