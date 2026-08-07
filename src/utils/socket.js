import { io } from 'socket.io-client';
import { getAccessToken } from './request';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'https://api.smartracking.io.vn';

let socket = null;

// Token getter — trang khách ghi đè bằng guestToken trong sessionStorage
const resolveToken = () => {
  const guestToken = sessionStorage.getItem('guestToken');
  return guestToken || getAccessToken() || null;
};

export const getSocket = () => {
  if (!socket) {
    socket = io(WS_BASE_URL, {
      path: '/ws',
      transports: ['websocket'],
      autoConnect: true,
      auth: { token: resolveToken() },
    });
  }
  return socket;
};

// Dùng khi khách vào /guest/meeting — cần socket mới với guestToken
export const getGuestSocket = () => {
  const guestToken = sessionStorage.getItem('guestToken');
  if (!guestToken) return null;
  // Nếu socket hiện tại đang chạy với accessToken nhân viên, tạo socket tạm riêng
  return io(WS_BASE_URL, {
    path: '/ws',
    transports: ['websocket'],
    autoConnect: true,
    auth: { token: guestToken },
  });
};

export const subscribeToMeeting = (meetingId) => {
  const s = getSocket();
  s.emit('meeting:subscribe', { meetingId });
  return () => {
    s.emit('meeting:unsubscribe', { meetingId });
  };
};
