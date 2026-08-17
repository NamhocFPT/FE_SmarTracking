import { io } from 'socket.io-client';
import { getAccessToken } from './request';
import { getWsBaseUrl } from './backendResolver';

let socket = null;

// Token getter — trang khách ghi đè bằng guestToken trong sessionStorage
const resolveToken = () => {
  const guestToken = sessionStorage.getItem('guestToken');
  return guestToken || getAccessToken() || null;
};

// getSocket()/getGuestSocket() luôn được gọi từ trong phòng họp (sau khi người dùng đã
// đăng nhập/điều hướng qua vài trang), tức là sau khi request() đã await backendReady ít
// nhất 1 lần — nên đọc getWsBaseUrl() tại thời điểm gọi là đủ để đồng bộ đúng domain với
// REST, không cần đổi getSocket() thành async (tránh phải sửa thêm các nơi gọi nó).
export const getSocket = () => {
  if (!socket) {
    socket = io(getWsBaseUrl(), {
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
  return io(getWsBaseUrl(), {
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
