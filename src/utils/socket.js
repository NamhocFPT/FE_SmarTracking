import { io } from 'socket.io-client';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(WS_BASE_URL, {
      path: '/ws',
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const subscribeToMeeting = (meetingId) => {
  const s = getSocket();
  s.emit('meeting:subscribe', { meetingId });
  return () => {
    s.emit('meeting:unsubscribe', { meetingId });
  };
};
