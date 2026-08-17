# Context: Trang phòng họp trực tuyến (InMeetingRoom) — chuẩn bị redesign layout hiển thị người tham gia

**File:** [src/pages/shared/InMeetingRoom.jsx](../src/pages/shared/InMeetingRoom.jsx)
**Mục tiêu redesign:** Thay cơ chế "mô phỏng chỗ ngồi cố định quanh bàn họp" hiện tại bằng **lưới (grid) tự động chia theo số người tham gia thực tế**.

---

## 1. Trang này dùng ở đâu, khi nào

`InMeetingRoom` là component dùng chung (`shared`) cho cả employee/manager và cả khách ngoài hệ thống (prop `isPublic`), render khi người dùng vào phòng họp trực tuyến gắn với 1 `meetingId` (route param `id`). Đây **không phải video-call thật qua WebRTC** — hiện tại là một **bản mô phỏng UI** (lấy tên "3D/2D Simulation" ngay trong header, dòng 1001): camera thật của máy người dùng chỉ được preview cho chính họ (`getUserMedia`), còn các "người tham gia" khác trong phòng chủ yếu là dữ liệu participant lấy từ API + bot giả lập luân phiên "đang nói" để demo hiệu ứng. Điều này quan trọng cho việc redesign: bạn đang thiết kế lại **layout hiển thị**, không phải pipeline video thật.

Trang có 4 view chuyển theo trạng thái cuộc họp (`meetingState.status`):
1. **Lobby cá nhân** (`scheduled` + chưa `isLobbyReady`) — preview camera/mic, nhập tên, nút "Tham gia phòng chờ".
2. **Waiting lobby** (`scheduled` + đã `isLobbyReady`) — danh sách người đã vào phòng chờ, chờ Host bấm bắt đầu.
3. **Active meeting room** (`in_progress`) — **đây là phần cần redesign**: khu vực hiển thị người tham gia dạng "bàn họp ảo" + toolbar + sidebar (Host controls, Agenda, Notes, Attendance).
4. **Completed** — màn hình kết thúc.

---

## 2. Mô hình dữ liệu participant (không đổi khi redesign)

`meetingState.participants` là mảng object, mỗi participant có các field cố định được dùng xuyên suốt UI (được chuẩn hoá tại `normalizeMeetingDetail`, dòng 153-168, và khi thêm người vào lobby ở `handleJoinLobby`, dòng 636-671):

```js
{
  id: string,          // userId thật, hoặc guest-xxxx cho khách
  fullName: string,
  avatarUrl: string,   // qua resolveAvatarUrl()
  role: 'Host' | 'Thành viên' | 'Khách',
  isMuted: boolean,
  isCameraOff: boolean,
  isSpeaking: boolean,
  isBot: boolean        // true = không phải người dùng hiện tại của trình duyệt này (giả lập demo)
}
```

Các biến số quan trọng khác khi render:
- `myParticipantId` — id của người đang xem trang (dòng 217-230), dùng để phân biệt "video thật của tôi" vs avatar tĩnh của người khác.
- `isHost` — `meetingState.hostId === myParticipantId` (dòng 594), quyết định có hiện overlay điều khiển (mute người khác, đổi tên người khác) hay không.
- `isVideoOn` / `isMicOn` — trạng thái thiết bị cục bộ của người dùng hiện tại.
- Video của chính mình được gắn vào DOM qua `id={`video-${p.id}`}` (dòng 1189) và `document.getElementById('video-'+myParticipantId)` ở effect dòng 505-525 — **quy ước id này phải giữ nguyên** nếu vẫn dùng cách gắn `srcObject` thủ công như hiện tại, nếu không phải sửa luôn effect đó.

---

## 3. Cơ chế "chỗ ngồi" hiện tại (phần cần thay thế)

### 3.1 Mảng toạ độ cố định

```js
// dòng 57-64
const seats = [
    { top: '8%',  left: '50%',  transform: 'translate(-50%, -50%)' },  // Seat 0: Top Center (Host)
    { top: '30%', left: '16%',  transform: 'translate(-50%, -50%)' },  // Seat 1: Top Left
    { top: '70%', left: '16%',  transform: 'translate(-50%, -50%)' },  // Seat 2: Bottom Left
    { top: '92%', left: '50%',  transform: 'translate(-50%, -50%)' },  // Seat 3: Bottom Center (You)
    { top: '70%', right: '16%', transform: 'translate(50%, -50%)' },   // Seat 4: Bottom Right
    { top: '30%', right: '16%', transform: 'translate(50%, -50%)' }    // Seat 5: Top Right
];
```

6 vị trí phần trăm cố định bố trí quanh một hình oval trang trí (`"OVAL CONFERENCE TABLE"`, dòng 1157-1163 — chỉ là 1 `div` bo tròn, **không mang dữ liệu gì**, thuần trang trí).

### 3.2 Cách gán người vào chỗ ngồi

```js
// dòng 1166-1167
{meetingState.participants?.slice(0, 6).map((p, idx) => {
    const seatStyle = seats[idx % seats.length];
```

- `.slice(0, 6)`: **cắt cứng ở 6 người** — người thứ 7 trở đi **biến mất hoàn toàn khỏi UI**, không có dấu hiệu "+N người khác" nào cả.
- `idx % seats.length`: chỉ có tác dụng phòng lỗi index-out-of-range, nhưng vì đã `.slice(0,6)` nên `idx` không bao giờ vượt quá 5 — dòng này thực chất dư thừa/chết, không giải quyết được trường hợp đông người.
- Vị trí gán theo **thứ tự index trong mảng**, không theo vai trò hay logic ưu tiên nào (Host không cố định luôn ở "seat 0" — seat 0 chỉ trùng hợp là vị trí đẹp nhất vì thường Host là phần tử đầu mảng do `initMeetingState` luôn `unshift` Host vào đầu, dòng 322-333).

### 3.3 Từng "ghế" render gì

Mỗi participant trong `seats` (dòng 1170-1263) gồm:
- Vòng tròn avatar/video cố định kích thước `w-20 h-20` (80×80px), border đổi màu + ring khi `isSpeaking`.
- Nếu là chính mình và `isVideoOn`: render `<video>` thật (camera). Ngược lại: `<UserAvatar>` (ảnh đại diện tĩnh, màu nền theo `role`).
- Badge góc: mic-off (nếu `isMuted`), sóng âm động khi `isSpeaking`.
- Overlay hiện khi hover (chỉ Host thấy, chỉ trên người khác): nút mute nhanh + đổi tên.
- Name badge bên dưới (click để đổi tên — chính mình hoặc Host đổi tên người khác).
- Role badge (Host / Thành viên / Khách), tô màu riêng theo vai trò.

### 3.4 Hiệu ứng thả cảm xúc (reaction) cũng neo theo `seatIndex`

```js
// dòng 1266-1283
{floatingReactions.map(fr => {
    const seatStyle = seats[fr.seatIndex % seats.length];
    ...
```

`sendReaction()` lưu `senderId`; effect dòng 548-561 tìm `seatIndex = participants.findIndex(p => p.id === senderId)` rồi map ngược sang toạ độ trong mảng `seats` để icon emoji bay lên đúng vị trí người gửi. **Nếu đổi sang layout lưới động, phần này phải đổi theo** — không thể tiếp tục dùng "seatIndex → toạ độ % cố định" vì lưới động không có toạ độ cố định biết trước.

---

## 4. Vì sao cách hiện tại không "tự động chia lưới theo số người"

| Vấn đề | Chi tiết |
|---|---|
| Số ghế cố định = 6 | Không co giãn theo số người thật; 2 người vẫn chiếm không gian như 6 người (nhiều khoảng trống lãng phí), 7+ người bị **ẩn im lặng** không cảnh báo. |
| Vị trí là toạ độ `%` viết tay | Không thể sinh thêm "ghế" bằng code nếu không tự tay thêm phần tử vào mảng `seats`, tức là không scale được bằng công thức. |
| Bàn oval chỉ trang trí | Không phản ánh số người thật, chỉ là background tĩnh — khi ít người trông trống trải, khi đông người các avatar chồng lấn quanh viền oval mà không gian giữa bàn bị bỏ phí. |
| Reaction bay lên theo index cố định | Gắn chặt vào hệ toạ độ `seats`, phải thiết kế lại cơ chế định vị (vd: theo `ref` DOM của từng tile thay vì toạ độ `%` cứng). |
| Không phân biệt speaker-focus / gallery | Tất cả participant luôn hiển thị đồng đều cùng kích thước; không có chế độ "phóng to người đang nói" như các app họp thật (Zoom/Meet) — có thể cân nhắc thêm nếu muốn, nhưng không bắt buộc cho yêu cầu hiện tại. |

---

## 5. Yêu cầu chức năng cho layout lưới mới (đề xuất phạm vi cần đáp ứng)

Để thay thế đúng phần đang lỗi mà không phá vỡ phần còn lại của trang, layout mới cần:

1. **Số cột/hàng tính theo `meetingState.participants.length`**, ví dụ công thức phổ biến `cols = Math.ceil(Math.sqrt(n))`, hoặc bảng breakpoint tay (1 người: full màn hình; 2: 2 cột; 3-4: lưới 2×2; 5-6: 3×2; 7-9: 3×3; 10+: cuộn dọc/scroll thay vì nhồi nhét) — chọn 1 chiến lược rõ ràng khi viết lại.
2. **Không giới hạn cứng 6 người** — bỏ `.slice(0, 6)`, hoặc nếu vẫn cần giới hạn hiển thị vì lý do hiệu năng thì phải có chỉ báo rõ ràng kiểu "+N người khác" thay vì im lặng ẩn.
3. **Giữ nguyên toàn bộ dữ liệu/props mỗi tile cần** (đã liệt kê ở mục 2 và 3.3): video thật cho chính mình (id `video-${p.id}`), avatar cho người khác, badge mute/speaking, overlay điều khiển Host, name badge đổi tên được, role badge.
4. **Responsive theo khung chứa** — khu vực lưới hiện nằm trong `flex-1` bên trái, cạnh sidebar 320px bên phải (`lg:w-80`, dòng 1347) và toolbar cao 80px bên dưới (dòng 1288) — layout lưới mới phải tự co trong phần không gian còn lại, giữ tỉ lệ hợp lý cho từng tile (video call thường ưu tiên tile dạng 4:3 hoặc 16:9 thay vì hình tròn cố định 80×80 như hiện tại, nhưng đây là quyết định thiết kế — không bắt buộc phải đổi hình tròn sang chữ nhật, tuỳ bạn chọn).
5. **Cơ chế định vị lại cho floating reaction** — thay vì `seats[seatIndex % 6]`, cần cách lấy toạ độ tile thực tế của người gửi (ví dụ set `ref` cho từng tile, dùng `getBoundingClientRect()`, hoặc đơn giản hơn là render emoji bay lên ngay trong tile của người đó thay vì absolute-position toàn khu vực).
6. **Không đụng vào phần ngoài khu vực lưới**: toolbar dưới (mic/camera/phát biểu/reaction picker/rời phòng, dòng 1287-1342) và sidebar phải (Host panel, Agenda, Notes, Attendance, dòng 1346-1546) giữ nguyên logic — chỉ thay khối "Conference Board Container" (dòng 1155-1285).

---

## 6. Ràng buộc kỹ thuật cần giữ nguyên khi viết lại

- **Không đổi tên/shape của `meetingState.participants`** — nhiều effect khác (mute all, host rename, auto speaker rotation dòng 564-591, monitor muting dòng 528-545) đều thao tác trực tiếp trên mảng này qua `id`.
- **Giữ quy ước DOM id `video-${myParticipantId}`** cho video thật của chính mình, trừ khi bạn cũng sửa lại effect gắn `srcObject` ở dòng 506-525.
- **`isHost` vẫn quyết định hiển thị overlay điều khiển** trên tile của người khác (mute nhanh + đổi tên) — hành vi này, không phải vị trí hiển thị, là phần không nên đổi.
- Trang đang chạy hoàn toàn bằng **state cục bộ đồng bộ qua `localStorage` + `storage` event** (không phải WebRTC/socket thật cho video — chỉ có `subscribeToMeeting`/socket cho 2 sự kiện `meeting.session.started/ended`). Vì vậy participant list hiện tại **không phải real-time đa người dùng thật sự** trong bản này; nếu redesign chỉ đổi layout hiển thị (không đổi nguồn dữ liệu), điều này không ảnh hưởng, nhưng cần biết để không kỳ vọng nhầm là hệ thống đã có video-call thật.

---

## 7. Phạm vi thay đổi đề xuất khi bắt tay redesign

- Xoá mảng `seats` (dòng 56-64) — không còn cần thiết.
- Viết lại khối JSX từ `{/* Conference Board Container */}` đến hết `{/* Floating Reactions Rendering */}` (khoảng dòng 1155-1285) thành 1 component lưới mới, nhận vào `meetingState.participants`, `myParticipantId`, `isHost`, `isVideoOn`, và các handler đã có (`handleHostMuteToggle`, `handleHostRename`, `handleRenameSelf`).
- Viết lại cơ chế floating reaction để không phụ thuộc `seatIndex` cố định.
- Có thể tách thành component riêng (vd `MeetingGrid.jsx`) để dễ kiểm soát logic tính cột/hàng, thay vì để lẫn trong file `InMeetingRoom.jsx` vốn đã hơn 1600 dòng.
