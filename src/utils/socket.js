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

// Room `user:{userId}` dùng chung cho nhiều listener độc lập (meeting-request
// updates, notification bell, ...) trên cùng 1 socket. Chỉ join, KHÔNG bao giờ
// tự emit 'user:unsubscribe' khi 1 listener cleanup — vì các listener khác
// đang dùng chung room vẫn cần nhận event. Socket tự rời mọi room khi disconnect
// (logout/đóng tab) nên không cần rời tay.
const ensureUserRoomJoined = () => {
  const s = getSocket();
  s.emit('user:subscribe');
  return s;
};

// Dùng ở /manager/meeting-approvals — nhận `meeting_request.updated` realtime
// khi có yêu cầu mới/được duyệt/từ chối/hết hạn, thay vì phải bấm "Tải lại".
// BE chỉ cho join room user:{userId} của chính người gọi (bỏ qua mọi userId
// truyền lên) — xem EventsGateway#handleUserSubscribe.
export const subscribeToMeetingRequestUpdates = (onUpdate) => {
  const s = ensureUserRoomJoined();
  s.on('meeting_request.updated', onUpdate);
  return () => {
    s.off('meeting_request.updated', onUpdate);
  };
};

// Dùng ở chuông thông báo (NotificationBell) — nhận `notification.created`
// realtime ngay khi BE tạo notification mới cho user hiện tại (NotificationsService.
// createNotification → WebsocketService.emitToUser), để badge số lượng chưa đọc
// và banner cập nhật ngay, không cần load lại trang.
export const subscribeToNotificationUpdates = (onCreate) => {
  const s = ensureUserRoomJoined();
  s.on('notification.created', onCreate);
  return () => {
    s.off('notification.created', onCreate);
  };
};
