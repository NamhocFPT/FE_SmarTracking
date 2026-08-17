// Tự động dò backend CHÍNH (chạy trên máy cá nhân, có thể tắt bất cứ lúc nào)
// và fallback sang backend BACKUP (EC2, luôn bật) nếu CHÍNH không phản hồi.
// request.js và socket.js đều đọc URL đã resolve từ đây để REST và WebSocket
// luôn trỏ cùng một domain, không bao giờ lệch nhau.

const PRIMARY_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.smartracking.io.vn/api/v1';
const BACKUP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL_BACKUP || 'https://api-backup.smartracking.io.vn/api/v1';
const PRIMARY_WS_URL = process.env.REACT_APP_WS_URL || 'https://api.smartracking.io.vn';
const BACKUP_WS_URL = process.env.REACT_APP_WS_URL_BACKUP || 'https://api-backup.smartracking.io.vn';

const HEALTH_CHECK_TIMEOUT_MS = 4000;
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

// Mặc định lạc quan là CHÍNH — không đổi hành vi hiện tại khi CHÍNH hoạt động bình thường.
let currentApiBaseUrl = PRIMARY_API_BASE_URL;
let currentWsUrl = PRIMARY_WS_URL;

const pingPrimary = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
    try {
        const response = await fetch(`${PRIMARY_API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
        });
        return response.ok;
    } catch (e) {
        return false;
    } finally {
        clearTimeout(timer);
    }
};

const resolveBackend = async () => {
    const primaryOk = await pingPrimary();
    const wasOnBackup = currentApiBaseUrl === BACKUP_API_BASE_URL;
    currentApiBaseUrl = primaryOk ? PRIMARY_API_BASE_URL : BACKUP_API_BASE_URL;
    currentWsUrl = primaryOk ? PRIMARY_WS_URL : BACKUP_WS_URL;

    if (!primaryOk && !wasOnBackup) {
        console.warn('[backendResolver] Backend CHÍNH không phản hồi, đã chuyển sang BACKUP:', BACKUP_API_BASE_URL);
    } else if (primaryOk && wasOnBackup) {
        console.info('[backendResolver] Backend CHÍNH đã hoạt động trở lại, chuyển về CHÍNH:', PRIMARY_API_BASE_URL);
    }
    return primaryOk;
};

// Dò ngay khi module được load (app khởi động). request()/getSocket() chờ promise
// này trước khi gọi lần đầu để không bao giờ bắn nhầm request vào domain đã chết.
export const backendReady = resolveBackend();

// Dò lại định kỳ để tự phục hồi về CHÍNH khi nó sống lại, hoặc phát hiện CHÍNH
// chết giữa session (không chỉ lúc khởi động).
setInterval(resolveBackend, RECHECK_INTERVAL_MS);

export const getApiBaseUrl = () => currentApiBaseUrl;
export const getWsBaseUrl = () => currentWsUrl;
