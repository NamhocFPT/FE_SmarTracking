# FE PLAN — Nhóm C: Nút "Kiểm tra trùng lịch & phòng" thủ công (thay auto-check khi sửa cuộc họp)

> Bối cảnh: phần của kế hoạch tổng `KE_HOACH_XU_LY_XUNG_DOT_PHONG_GIO_HOP_2026-08-08.md`
> (repo root). Nhóm A + B (chính sách chỉ chặn theo booking `approved`/`active`, buffer 15 phút)
> đã triển khai xong ở `capstone-be` cùng đợt — không cần API mới, endpoint
> `GET /meetings/:meetingId/available-rooms` (`getAvailableRoomsForMeeting`) đã tự áp dụng
> chính sách mới, FE chỉ cần đổi cách gọi. Đối chiếu trực tiếp source thật
> `MeetingDetail.jsx` (employee + manager) trong phiên này (2026-08-08), không giả định API.

**Vấn đề hiện tại:** `useEffect` (employee `MeetingDetail.jsx:290-328`, manager
`MeetingDetail.jsx:287-325`) tự động debounce 500ms rồi gọi `getAvailableRoomsForMeeting` mỗi khi
`editStart`/`editEnd` đổi. Nếu phòng đang chọn không còn nằm trong danh sách trả về (kể cả chỉ vì
một request `pending` khác trùng giờ — trước khi có Nhóm A), UI tự động: (1) khoá dropdown bằng
option ẩn `disabled`, (2) chặn nút Lưu qua `isSubmitDisabled = roomWarning || !isFormChanged()`
(employee dòng 690, manager dòng 655). Người dùng không có cách nào giữ lại lựa chọn của mình dù
họ hiểu rõ tình huống.

**Cách sửa:** bỏ auto-check theo thời gian, thay bằng nút chủ động. Áp dụng **giống hệt** cho cả
`src/pages/employee/MeetingDetail.jsx` và `src/pages/manager/MeetingDetail.jsx` (2 file gần như
song song nhau, lệch nhau ~13 dòng).

---

## 1 · State mới thay cho auto-check

Giữ nguyên `rooms`, `isFetchingRooms`. Đổi ý nghĩa `roomWarning`: từ "auto-detect, dùng để khoá
UI" sang "kết quả lần kiểm tra thủ công gần nhất, chỉ dùng để hiển thị banner/border — không
dùng để khoá dropdown hay chặn submit nữa".

Thêm:
- `const [checkStatus, setCheckStatus] = useState('idle');` — `'idle' | 'ok' | 'conflict'`.
- `const [selectedRoomInfo, setSelectedRoomInfo] = useState(null);` — snapshot `{roomId, roomName,
  siteName, capacity}` của phòng đang chọn, khởi tạo từ `data.room` trong `initEditStates`, cập
  nhật mỗi khi user đổi phòng qua dropdown (chọn từ `rooms`). Dùng để đảm bảo phòng đang chọn
  **luôn** có mặt trong danh sách option kể cả khi bị check gần nhất báo trùng lịch (không bị
  fetch mới loại khỏi `rooms` rồi biến mất khỏi dropdown).

## 2 · Bỏ auto-fetch theo thời gian, giữ fetch 1 lần khi mở modal

Đổi dependency array của effect hiện tại (employee dòng 328, manager dòng 325) từ
`[isEditModalOpen, editStartStr, editStart, editEnd]` → `[isEditModalOpen, meeting?.id]`, bỏ
`setTimeout` debounce (không còn cần vì chỉ chạy 1 lần lúc mở modal, dùng đúng giá trị
`editStart`/`editEnd` đã init từ `initEditStates` — tức giờ **gốc** của cuộc họp). Effect này chỉ
populate `rooms` ban đầu, **không** set `checkStatus`/`roomWarning`.

## 3 · Thêm nút "Kiểm tra trùng lịch & phòng"

Đặt ngay dưới khối 2 input giờ Bắt đầu/Kết thúc (employee ~dòng 1313, manager ~dòng 1340), trước
label "Chọn phòng họp". `onClick` (async, tái dùng logic cũ trong effect nhưng gọi thủ công):

```js
const handleCheckAvailability = async () => {
    if (!editStartStr || !editEndStr || !editStart || !editEnd) return;
    setIsFetchingRooms(true);
    try {
        const startISO = new Date(`${editStartStr}T${editStart}:00`).toISOString();
        const endISO = new Date(`${editEndStr}T${editEnd}:00`).toISOString();
        const res = await getAvailableRoomsForMeeting(meeting.id, { startTime: startISO, endTime: endISO, includeCurrentRoom: true });
        if (res?.success) {
            const fetchedRooms = res.data || [];
            setRooms(fetchedRooms);
            const isAvailable = fetchedRooms.some(r => String(r.roomId) === String(editRoomId));
            setRoomWarning(!isAvailable);
            setCheckStatus(isAvailable ? 'ok' : 'conflict');
        }
    } catch (e) {
        console.error('Failed to check room availability', e);
    } finally {
        setIsFetchingRooms(false);
    }
};
```

Nút disable khi `isFetchingRooms` hoặc thiếu `editStart`/`editEnd`. Label đổi thành "Đang kiểm
tra..." khi loading (đúng UI QUALITY RULES — loading state, không dùng spinner mặc định đơn điệu,
tái dùng style loading chữ đã có ở dòng "Đang tải danh sách phòng...").

## 4 · Reset `checkStatus` khi đổi giờ (không gọi API)

```js
useEffect(() => {
    setCheckStatus('idle');
}, [editStart, editEnd, editStartStr, editEndStr]);
```

Dùng để hiện nhắc nhở mềm (không chặn) khi user đổi giờ mà chưa bấm lại nút kiểm tra.

## 5 · Banner kết quả (thay logic ẩn option cũ)

- `checkStatus === 'ok'`: banner xanh nhỏ "Phòng đang chọn còn trống ở khung giờ này."
- `checkStatus === 'conflict'`: banner vàng/đỏ (tái dùng style `roomWarning` cũ) "Phòng đang chọn
  không còn trống ở khung giờ này. Bạn vẫn có thể giữ nguyên lựa chọn này (yêu cầu sẽ được gửi
  Manager duyệt lại) hoặc chọn phòng khác:" kèm danh sách 3-5 phòng còn trống lấy từ `rooms`
  (loại phòng đang chọn) — không tự động chọn thay, chỉ hiển thị gợi ý dạng chip bấm-để-chọn.
- `checkStatus === 'idle'` VÀ giờ hiện tại khác giờ gốc cuộc họp: dòng chữ xám nhỏ "Bạn đã đổi
  giờ họp — nên bấm 'Kiểm tra trùng lịch & phòng' trước khi lưu." (không phải lỗi, chỉ nhắc).

**Dropdown phòng:** bỏ hẳn khối `{roomWarning && (<option ... disabled>-- Phòng hiện tại (Không
trống) --</option>)}`. Thay bằng: nếu `editRoomId` không có trong `rooms`, chèn thêm 1 option từ
`selectedRoomInfo` vào cuối danh sách hiển thị (không `disabled`, không `hidden`) — đảm bảo lựa
chọn hiện tại luôn hiện diện và **chọn được**, đúng yêu cầu "không tự động khoá/xoá phòng đang
chọn". Border đổi màu (đỏ nhạt) chỉ khi `checkStatus === 'conflict'`, không còn dựa vào việc
option có tồn tại trong `rooms` hay không.

## 6 · Bỏ chặn nút Lưu theo `roomWarning`

Đổi `isSubmitDisabled = roomWarning || !isFormChanged()` → `isSubmitDisabled = !isFormChanged()`
(employee dòng 690, manager dòng 655). Nút Lưu không còn bị khoá bởi kết quả check — lưới an toàn
cuối cùng là recheck ở BE lúc `updateMeetingTime`/Manager approve (đã có sẵn, không đổi).

**Test:** mở modal sửa cuộc họp → thấy đúng phòng hiện tại trong dropdown ngay (không rỗng). Đổi
giờ → KHÔNG tự động gọi API, KHÔNG tự khoá dropdown; thấy dòng nhắc "nên kiểm tra lại". Bấm "Kiểm
tra trùng lịch & phòng" → gọi đúng 1 API call, thấy banner phù hợp (xanh/vàng), phòng đang chọn
**vẫn** chọn được trong dropdown kể cả khi banner báo trùng. Bấm Lưu ngay cả khi chưa kiểm tra
hoặc đang có banner vàng → vẫn submit được (không bị khoá nút).
