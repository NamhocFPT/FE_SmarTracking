# Đối chiếu API Backend ↔ Cách sử dụng của Frontend — SmartTracking

**Ngày lập:** 2026-08-02
**Phạm vi:** Toàn bộ API do backend NestJS (`capstone-be`, prefix `/api/v1`) cung cấp, đối chiếu với cách frontend React (`fe_smartracking`) gọi và tiêu thụ dữ liệu.
**Phương pháp:** Đọc trực tiếp source code hai phía (controller/DTO ở BE, `src/service/**` ở FE), không dựa trên tài liệu cũ hay giả định. Mọi phát hiện đều kèm `file:line` để tra cứu lại.
**Không thuộc phạm vi:** Các module an ninh vật lý thuần (IoT, ANPR, Zones, Face-Access, Alerts, Equipment, Gate-Access, Campus-Dashboard) chỉ được đối chiếu ở mức tổng quan vì đây không phải trọng tâm nghiệp vụ họp/ghi hình đang được sửa gần đây, nhưng vẫn được liệt kê đầy đủ trong bảng ở Mục 4.

---

## 1. Tóm tắt điều hành

| # | Mức độ | Vấn đề | Tác động |
|---|--------|--------|----------|
| 1 | 🔴 Nghiêm trọng | Recording-config: 3 nơi FE gửi 3 bộ field khác nhau, 2/3 sai | Bật/tắt ghi hình khi sửa cuộc họp **không có tác dụng thật** |
| 2 | 🔴 Nghiêm trọng | Avatar/Biometric: FE gọi sai path (đã tự ghi chú path đúng nhưng không sửa) | Toàn bộ luồng đăng ký/xem avatar khuôn mặt trả **404** |
| 3 | 🔴 Nghiêm trọng | Minutes share: FE đoán 5 tên field, chỉ 1 đúng | Tên người được chia sẻ hiển thị sai/rỗng trong đa số trường hợp |
| 4 | 🟠 Trung bình | `MinutesTabContent` không dùng query `meetingId` sẵn có, tự filter phía client | Không scale, tải thừa dữ liệu |
| 5 | 🟠 Trung bình | TODO "BE chưa có route" bị lỗi thời cho `notifications` và `system-configurations` | Tính năng đã sẵn sàng ở BE nhưng FE tưởng chưa có, có thể chưa bật UI |
| 6 | 🟠 Trung bình | `POST /meetings/:id/check-in` — BE thật sự chưa có | Gap thật, cần backlog BE, không phải lỗi FE |
| 7 | 🟠 Trung bình | `callWithFallback` trong `InMeetingRoom.jsx` che giấu lỗi phân quyền | Khó phát hiện bug phân quyền khi debug |
| 8 | 🟠 Trung bình | Field-fallback chain 3-5 tầng ở nhiều nơi (`normalizeMeetingDetail`, `InMeetingRoom.jsx`) | Code khó bảo trì, dấu hiệu thiếu type chung với BE |
| 9 | 🟢 Thông tin | snake_case ở Alerts/PersonControlList là chủ đích, không phải lỗi | Không cần sửa, chỉ cần ghi chú tránh sửa nhầm |
| 10 | 🟢 Thông tin | Fix `downloadUrl` qua `GET /media-files/:id` — đã đúng | Xác nhận không cần sửa thêm |
| 11 | 🟢 Thông tin | Giới hạn IVSS presence chỉ cho manager — đã đúng | Xác nhận không cần sửa thêm |

---

## 2. Phát hiện chi tiết

### 🔴 #1 — Recording-config: hợp đồng ghi/đọc khác nhau, FE nhầm lẫn ở 2/3 điểm gọi

**Backend có 2 hình dạng dữ liệu khác nhau cho cùng một khái niệm:**

- **Write** — `POST /meetings/:meetingId/recording-config`, `PATCH /meetings/:meetingId/recording-config`
  DTO: `CreateRecordingConfigDto` / `UpdateRecordingConfigDto`
  (`capstone-be/src/modules/recording/dto/create-recording-config.dto.ts`, `update-recording-config.dto.ts`)
  Field: `enableAudio`, `enableVideo`, `enableTranscription`, `videoSourceDeviceId`, `audioSourceMode`, `autoStart`, `consentRequired`, `retentionDays`

- **Read** — lồng trong `GET /meetings/:meetingId` tại `recordingConfig`
  Xây dựng tại `capstone-be/src/modules/meetings/services/meetings.service.ts:3171-3178`:
  ```ts
  recordingConfig: recordingConfig
    ? new DetailRecordingConfigDto({
        autoRecord: recordingConfig.autoStart,
        allowRecording:
          recordingConfig.enableVideo || recordingConfig.enableAudio,
        enableTranscription: recordingConfig.enableTranscription,
      })
    : null,
  ```
  Field trả về: `autoRecord`, `allowRecording` (tính lại = `enableVideo OR enableAudio`), `enableTranscription`.

**⚠️ Đây KHÔNG phải cùng field với `allowRecording` của phòng họp (`Room.allowRecording`, `CreateRoomDto`/`UpdateRoomDto`) — hai khái niệm trùng tên nhưng khác domain: một cái là khả năng phòng có cho phép ghi hình hay không, một cái là trạng thái cấu hình ghi hình của cuộc họp cụ thể.**

**FE — 3 điểm gọi, chỉ 1 đúng:**

| File | Hành động | Body gửi lên | Đúng/Sai |
|---|---|---|---|
| `src/pages/employee/BookMeeting.jsx:573-577` | Tạo cấu hình khi đặt lịch | `{ enableVideo, enableAudio, consentRequired }` | ✅ Đúng — khớp `CreateRecordingConfigDto` |
| `src/pages/manager/MeetingDetail.jsx:291` | Cập nhật khi sửa cuộc họp (manager) | `{ autoRecord: editRecordingEnabled, allowRecording: editRecordingEnabled }` | ❌ Sai — đây là field của **read**-shape, không tồn tại trong `UpdateRecordingConfigDto`. NestJS `ValidationPipe({ whitelist: true })` sẽ loại các field lạ ra khỏi body → PATCH gửi lên **rỗng**, coi như không đổi gì, nhưng FE vẫn hiển thị "cập nhật thành công". |
| `src/pages/employee/MeetingDetail.jsx:269` | Cập nhật khi sửa cuộc họp (employee) | `{ recordingEnabled: editRecordingEnabled }` | ❌ Sai — field này không khớp bất kỳ DTO nào ở BE (không phải write-shape, cũng không phải read-shape). |

**Đọc dữ liệu ngược lại (`normalizeMeetingDetail`, `manager/MeetingDetail.jsx` dòng ~113-114):**
```js
dto.recordingConfig?.allowRecording || dto.recordingEnabled || dto.recording_enabled || false
```
Phần `dto.recordingConfig?.allowRecording` khớp đúng read-shape của BE (đây chính là commit "update recordingEnabled to use allowRecording" đã fix đúng hướng cho chiều **đọc**). Vấn đề chỉ nằm ở chiều **ghi** — 2 màn hình sửa cuộc họp chưa được cập nhật theo cùng field chuẩn.

**Phương án sửa:**
1. Sửa `manager/MeetingDetail.jsx:291` và `employee/MeetingDetail.jsx:269`: khi PATCH `/meetings/:id/recording-config`, phải gửi `{ enableVideo: editRecordingEnabled, enableAudio: editRecordingEnabled }` (giống hệt payload tạo mới ở `BookMeeting.jsx`), **không gửi** `autoRecord`/`allowRecording`/`recordingEnabled`.
2. Cân nhắc viết 1 hàm dùng chung `buildRecordingConfigPayload(enabled)` trong `src/service/` để 3 nơi gọi (create + 2 update) luôn dùng cùng 1 nguồn sự thật, tránh lặp lại lỗi này khi có thay đổi DTO trong tương lai.
3. Viết 1 test tay: bật ghi hình ở màn hình sửa cuộc họp (cả vai trò manager và employee) → gọi `GET /meetings/:id` lại → xác nhận `recordingConfig.allowRecording` đổi giá trị thật.

---

### 🔴 #2 — Avatar/Biometric: FE tự ghi chú path đúng nhưng vẫn gọi path sai

File `src/service/avatarService.js`:
```js
/** GET /api/v1/me/avatar-status (đối chiếu avatar.controller.ts:55 — path thật, không phải biometric-status) */
export const getBiometricStatus = async () => get('/me/biometric-status');   // dòng 4 — SAI

/**
 * POST /api/v1/me/avatar-submission (multipart/form-data)
 * (đối chiếu avatar.controller.ts:80 — path thật, không phải biometric-submission)
 */
export const submitBiometric = async (formData) => post('/me/biometric-submission', formData); // dòng 16 — SAI

/** POST /api/v1/me/avatar (multipart/form-data) */
export const uploadAvatar = async (formData) => post('/me/avatar', formData); // dòng 26 — SAI, route này không tồn tại
```

**Backend thật** (`capstone-be/src/modules/accounts/controllers/avatar.controller.ts`, base path `/api/v1/me`):
- `GET /me/avatar-status` → `AvatarStatusResponseDto { avatarReviewStatus, avatarRequired, shouldShowAvatarPopup }`
- `POST /me/avatar-submission` (multipart: `file`, `consentAccepted: boolean`)

Không có route `/me/biometric-status`, `/me/biometric-submission`, hay `/me/avatar` nào ở BE. Cả 3 hàm trong `avatarService.js` sẽ nhận **404** khi gọi thật.

**Phương án sửa:**
1. Đổi `getBiometricStatus` → gọi `GET /me/avatar-status`.
2. Đổi `submitBiometric` → gọi `POST /me/avatar-submission`, đảm bảo `FormData` có đúng 2 field `file` và `consentAccepted`.
3. Xoá `uploadAvatar` (gọi `/me/avatar`) nếu không có route tương đương ở BE, hoặc nếu nghiệp vụ cần "upload lại avatar" thì dùng chung `POST /me/avatar-submission`.
4. Đổi luôn tên hàm/file từ "biometric" sang "avatar" cho khớp danh xưng BE, tránh nhầm lẫn tiếp về sau.
5. Kiểm tra `src/service/avatarReviewService.js` (phía admin duyệt avatar) — đối chiếu nhanh cho thấy các route `/admin/avatar-submissions/**`, `/admin/avatar-submissions/:id/download-url`, `/approve`, `/reject` đã khớp đúng `AdminAvatarReviewController` ở BE, **không cần sửa**.

---

### 🔴 #3 — Minutes share: field tên người dùng bị đoán sai 4/5 lần

Backend `MinutesShareListItemDto` (`capstone-be/src/modules/minutes/dto/minutes-share-list-response.dto.ts`):
```ts
export class MinutesShareListItemDto {
  id: string;
  userId: string;
  userFullName: string;   // ← field phẳng, ĐÚNG
  userEmail: string;
  grantedBy: string;
  grantedByName: string;
  grantedAt: Date;
}
```

FE (`src/component/ShareMinutesModal.jsx` và service liên quan) đang thử tuần tự:
```js
s.user?.fullName || s.user?.full_name || s.userFullName || s.fullName || s.full_name
```
Chỉ `s.userFullName` (thứ 3 trong chuỗi fallback) là đúng — 4 fallback còn lại vô nghĩa vì response không hề có object `user` lồng bên trong, cũng không có field `fullName`/`full_name` phẳng.

**Phương án sửa:**
- Rút gọn về `s.userFullName` (và `s.userEmail` nếu cần hiển thị email).
- Xoá các fallback thừa để code sạch, dễ đọc, và không "che" lỗi thật nếu BE đổi field trong tương lai.

---

### 🟠 #4 — `MinutesTabContent.jsx`: không dùng filter server-side sẵn có

BE `GET /meeting-minutes` hỗ trợ query `meetingId` trong `MinutesQueryDto`. FE hiện gọi **không kèm** `meetingId`, lấy toàn bộ danh sách rồi tự lọc:
```js
m.meeting?.id === meetingId || m.meetingId === meetingId
```
→ Vừa tải dư dữ liệu (không scale khi số biên bản tăng), vừa cho thấy FE không chắc field nào đúng nên thử cả hai.

**Phương án sửa:** gọi `GET /meeting-minutes?meetingId=<id>` trực tiếp, bỏ toàn bộ logic filter client-side.

---

### 🟠 #5 — TODO "BE chưa có route" đã lỗi thời

| Route | Trạng thái BE thực tế | Vị trí TODO ở FE |
|---|---|---|
| `PATCH /notifications/read-all` | ✅ Đã có — `notifications.controller.ts:171` | `sysAdminServices.js`, `businessAdminServices.js`: comment "BE chưa có route — chờ §5.3" |
| `PATCH /notifications/:id/read` | ✅ Đã có — `notifications.controller.ts:179` | tương tự |
| `GET /system-configurations` | ✅ Đã có — `SystemConfigController` | `sysAdminServices.js`: comment "BE chưa có controller — chờ §5.2" |
| `PATCH /system-configurations` | ✅ Đã có — `SystemConfigController` | tương tự |

**Phương án sửa:** Xoá các comment TODO lỗi thời, kiểm tra lại UI (trang cấu hình hệ thống, chuông thông báo) đã bấm gọi đúng các hàm này chưa; nếu UI vẫn đang mock/disable vì tưởng thiếu BE thì bật lại và kiểm thử tay.

---

### 🟠 #6 — `checkInMeeting` — gap thật của Backend

FE (`src/service/managerServices.js` / `employeeServices.js`) có hàm gọi `POST /meetings/:id/check-in` kèm comment `// CHỜ BE-11`. Khảo sát toàn bộ controller ở BE **không tìm thấy** route check-in nào tương ứng (chỉ có `GET/PATCH .../attendance`, không có endpoint check-in riêng theo path này).

**Phương án:** Đây là backlog thật của BE (ticket BE-11), không phải lỗi FE. Giữ nguyên TODO, theo dõi tiến độ BE-11; khi BE bổ sung route, đối chiếu lại path/field thật trước khi bật tính năng.

---

### 🟠 #7 — `callWithFallback` che giấu lỗi phân quyền

`src/pages/shared/InMeetingRoom.jsx` dùng pattern: gọi hàm service dành cho employee trước, nếu lỗi thì âm thầm gọi lại bằng hàm dành cho manager, không log lại lý do fallback.

**Rủi ro:** Nếu một tài khoản employee vô tình có quyền gọi API cấp manager (cấu hình role sai), lỗi phân quyền sẽ bị che thay vì lộ ra để phát hiện sớm. Ngược lại, nếu cả 2 lời gọi đều lỗi, log gộp làm khó xác định lỗi thật nằm ở đâu.

**Phương án sửa:** Log rõ ràng khi fallback được kích hoạt (kèm mã lỗi lần gọi đầu), và cân nhắc chọn service theo `role` thực của user (đã có trong context auth) thay vì "thử rồi mới biết".

---

### 🟠 #8 — Field-fallback chain nhiều tầng

Ví dụ tiêu biểu:
- `normalizeMeetingDetail` (`manager/MeetingDetail.jsx`): `p.userId || p.user_id || p.user?.id || p.id`, `a.durationMinutes ?? a.durationMin ?? a.plannedDurationMinutes ?? 15`...
- `InMeetingRoom.jsx`: `att.fullName || att.userFullName`, `res.data?.presentUsers || res.data?.items || (Array.isArray(res.data) ? res.data : [])`

Đây là hệ quả của việc không có type/schema dùng chung giữa FE-BE, khiến mỗi lần API đổi field, FE thêm 1 fallback thay vì sửa tận gốc — chuỗi fallback ngày càng dài, khó biết field nào còn thật sự được BE trả về.

**Phương án cải thiện tổng thể** (xem thêm Mục 5): sinh type TypeScript từ Swagger/OpenAPI của BE, dùng chung cho toàn bộ response, để lỗi field sai lộ ra ngay ở biên dịch/eslint thay vì phải đoán qua fallback.

---

### 🟢 #9 — snake_case ở Alerts/PersonControlList là chủ đích

`personControlListService.js`, `alertRuleService.js`, `securityAlertService.js` gửi body snake_case (`display_name`, `user_id`, `alert_type`, `zone_id`, `resolution_note`...). Đối chiếu BE:

- `CreatePersonControlListDto`, `CreateAlertRuleDto` dùng `@Expose({ name: 'snake_case' })` (class-transformer) trên từng field — wire format thật sự là snake_case dù property nội bộ là camelCase.
- `ResolveSecurityAlertDto.resolutionNote` cũng có `@Expose({ name: 'resolution_note' })`.
- Response `SecurityAlertResponseDto` trả **toàn bộ** field dạng snake_case (`resolution_note`, `resolved_by`, `resolved_at`, `created_at`...).

→ **Đây là convention có chủ đích riêng của các module an ninh (Alerts/PersonControlList/Vehicle), khác với convention camelCase của các module nghiệp vụ họp (Meetings/Users/Minutes).** FE hiện đang làm đúng cho các module này — không cần sửa, chỉ cần ghi chú lại để dev sau không "chuẩn hoá nhầm" về camelCase.

---

### 🟢 #10 — `downloadUrl` qua `GET /media-files/:id` — đã fix đúng

Fix gần đây (đổi từ gọi `/media-files/:id/secure-download` trực tiếp — bị 403 — sang `GET /media-files/:id` rồi đọc `downloadUrl`) khớp chính xác với BE: `capstone-be/src/modules/recording/services/media-files.service.ts:103` trả `downloadUrl: this.buildSignedDownloadUrl(m)`. Không cần sửa thêm.

---

### 🟢 #11 — Giới hạn IVSS presence chỉ cho manager — đã đúng

BE gate `GET /ivss/meetings/:meetingId/presence*` bằng permission `ivss.presence.read`. Việc gỡ lời gọi presence khỏi `employeeServices.js` (giữ lại ở `managerServices.js`) là đúng hướng, khớp với phân quyền thật của BE. Không cần sửa thêm.

---

## 3. Phương án cải thiện tổng thể

1. **Chuẩn hoá payload recording-config qua 1 hàm dùng chung** — sửa cả 2 điểm update (manager + employee) để gửi đúng `enableVideo`/`enableAudio` như điểm create, loại bỏ hoàn toàn `autoRecord`/`allowRecording`/`recordingEnabled` khỏi request body.
2. **Sửa toàn bộ path trong `avatarService.js`** theo đúng comment đã có sẵn trong chính file đó — đây là việc sửa nhanh, rủi ro thấp, tác động lớn (mở khoá cả tính năng đang hỏng hoàn toàn).
3. **Dọn field-fallback chain** ở `ShareMinutesModal`, `normalizeMeetingDetail`, `InMeetingRoom.jsx` — thay bằng đúng field BE trả, giảm surface lỗi ẩn.
4. **Dùng query filter server-side thay vì lọc client-side** cho `MinutesTabContent.jsx` (`GET /meeting-minutes?meetingId=`).
5. **Dọn TODO lỗi thời** cho notifications/system-configurations, xác nhận UI đã bật đúng tính năng BE đã sẵn sàng.
6. **Log rõ khi fallback phân quyền kích hoạt** trong `InMeetingRoom.jsx`, tránh che giấu lỗi phân quyền thật.
7. **Về lâu dài:** BE đã dùng NestJS + rải rác decorator kiểu Swagger — nên bật `@nestjs/swagger` đầy đủ để sinh OpenAPI schema, sau đó dùng `openapi-typescript` (hoặc tương đương) sinh type cho FE. Việc này giải quyết tận gốc nguyên nhân của phần lớn phát hiện ở tài liệu này: FE hiện không có nguồn sự thật duy nhất về field response nên phải đoán qua fallback chain, dễ tái diễn lỗi tương tự #1–#3 mỗi khi BE đổi DTO.

---

## 4. Bảng đối chiếu toàn bộ module

Chú thích trạng thái: ✅ khớp · ⚠️ lệch field (xem Mục 2) · ❌ FE gọi endpoint/field không tồn tại ở BE · ➖ BE có nhưng FE chưa dùng/gap thật ở BE · — chưa phát hiện lệch field cụ thể (chỉ đối chiếu ở mức endpoint)

### Auth
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST /auth/login` | `authService.js: login` | ✅ |
| `POST /auth/refresh` | `utils/request.js` (tự động) | ✅ |
| `POST /auth/logout` | `authService.js: logout` | ✅ |
| `POST /auth/password-reset/request` | `authService.js: requestPasswordResetOtp` | ✅ |
| `POST /auth/password-reset/confirm` | `authService.js: confirmPasswordReset` | ✅ |
| `PATCH /auth/change-password` | `authService.js: changePassword` | ✅ |
| `GET /auth/me` | `authService.js: getCurrentUser` | ✅ |

### Meetings (đặt lịch, CRUD)
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST /meetings` | `employeeServices.js: createMeeting` | ✅ |
| `PATCH /meetings/:id/time` | `updateMeetingTime` | ✅ |
| `GET /meetings` | — | — (chưa xác nhận nơi gọi list; nếu có màn hình danh sách cuộc họp cần rà lại) |
| `GET /meetings/:id` | `getMeetingById` (manager/employee services) | ✅ (đọc), xem #1 cho phần recordingConfig lồng bên trong |
| `PATCH /meetings/:id` (chỉ title/description) | `updateMeeting` | ✅ |
| `GET /meetings/:id/available-rooms` | `businessAdminServices.js` | ✅ |
| `POST /meetings/:id/participants/internal` | `addInternalParticipant` | ✅ |
| `POST/GET /meetings/:id/participants/import*` | `importMeetingParticipants`, `getMeetingParticipantsImportTemplate` | ✅ |
| `PATCH /meetings/:id/room` | `updateMeetingRoom` | ✅ |
| `POST /meetings/:id/cancel` | `cancelMeeting` | ✅ |
| `GET /rooms/available` | `getAvailableRooms`, `getRooms` | ✅ |
| `POST /meeting-requests/:id/approve`\|`/reject` | `approveMeetingRequest`, `rejectMeetingRequest` | ✅ |
| `GET /me/schedule`, `GET /me/schedule/:id` | `getMySchedule`, `getManagerSchedule` | ✅ |
| `POST/DELETE .../participants/external*` | `addExternalParticipant`, `removeExternalParticipant` | ✅ |
| `GET/PUT/PATCH/DELETE .../agendas*` | `replaceAgendas` (PUT) | ✅ (PUT); GET/PATCH/DELETE agenda item chưa thấy FE gọi — rà lại nếu có UI sửa từng mục agenda |
| `POST /meetings/:id/check-in` | gọi nhưng route **không tồn tại** ở BE | ➖ Gap thật ở BE (#6) |

### Recording
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST /meetings/:id/recording-config` | `BookMeeting.jsx` | ✅ |
| `PATCH /meetings/:id/recording-config` | `manager/MeetingDetail.jsx`, `employee/MeetingDetail.jsx` | ❌ Sai field, xem #1 |
| `GET /meetings/:id/recording-config` | `getRecordingConfig` | ✅ |
| `POST .../recording/start-video` | `startVideoRecording` | ✅ |
| `POST .../recording/:id/{stop,pause,resume}-video` | tương ứng | ✅ |
| `GET .../recording/:id/status` | `getRecordingStatus` | ✅ |
| `POST .../recording-sessions/audio-upload` | `transcriptionServices.js: uploadAudio` | ✅ (giới hạn 500MB đã khớp yêu cầu) |
| `POST/GET .../recording-sessions` | `getRecordingSessions` | ✅ |
| `POST .../recording-sessions/:id/audio-tracks` | — | — chưa thấy FE gọi, rà lại nếu cần multi-track |
| `GET .../media-files` | `getMeetingMediaFiles` | ✅ |
| `GET /media-files/:id` | `getMediaFile` | ✅ (đã fix, xem #10) |
| `GET /media-files/:id/playback` | `getMediaFilePlayback` | ✅ |
| `PATCH /media-files/:id/visibility` | `updateMediaFileVisibility` | ✅ |
| `GET /media-files/:id/secure-download` | không gọi trực tiếp nữa (đã đổi sang flow #10) | ✅ |

### Transcription (STT)
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST .../transcription-jobs` | `transcriptionServices.js: createTranscriptionJob` | ✅ |
| `GET .../transcription-jobs` | `getTranscriptionJobs` | ✅ |
| `GET .../transcript` | `getTranscript` | ✅ |
| `PATCH /transcripts/:id/segments` | `updateTranscriptSegments` | ✅ |
| `PATCH /transcripts/:id/content` | `updateTranscriptContent` | ✅ |
| `PATCH /transcripts/:id/status` | `updateTranscriptStatus` | ✅ |

### Minutes
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST .../minutes` | `createManualMinutes` | ✅ |
| `POST .../minutes/ai-draft-jobs` | `createAiDraftJob` | ✅ |
| `GET .../minutes/ai-draft-jobs` | `getAiDraftJobs` | ✅ |
| `GET .../minutes/ai-draft-config` | `getAiDraftConfig` | ✅ |
| `GET /meeting-minutes` | `MinutesTabContent.jsx` (không truyền `meetingId`) | ⚠️ Xem #4 |
| `GET /meeting-minutes/search-by-person` | `searchMinutesByPerson` | ✅ |
| `GET/PATCH/DELETE /meeting-minutes/:id` | `getMeetingMinutesById`, `updateMeetingMinutes`, `deleteMeetingMinutes` | ✅ |
| `POST /meeting-minutes/:id/issue` | `issueMeetingMinutes` | ✅ |
| `PATCH /meeting-minutes/:id/link-resources` | `linkMinutesResources` | ✅ |
| `POST/GET/DELETE /meeting-minutes/:id/shares*` | `getMinutesShares`, `createMinutesShare`, `revokeMinutesShare` | ⚠️ Field tên người sai, xem #3 |
| `POST /meeting-minutes/:id/exports` | `exportMinutes` | ✅ |
| `POST/GET/DELETE .../attachments*` | `uploadMinutesAttachment`, `getMinutesAttachments`, `deleteMinutesAttachment` | ✅ |

### Live-Meeting
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST /live-meetings/:id/start` | `startMeeting` | ✅ |
| `POST /live-meetings/:id/end` | `endMeeting` | ✅ |
| `GET /live-meetings/:id/present-attendees` | `getPresentAttendees` | ✅ (field fallback thừa, xem #8) |
| `GET /live-meetings/:id/attendance` | `getMeetingAttendance` (dùng chung path `/meetings/:id/attendance`, cần xác nhận đúng biến thể live) | — rà lại: FE dùng `/meetings/:id/attendance` (non-live) hay `/live-meetings/:id/attendance`? Xem module Attendance bên dưới |
| `POST .../extension-requests`, `POST .../decide` | `requestExtension`, `decideExtension` | ✅ |
| `POST/GET .../notes` | `createMeetingNote`, `listMeetingNotes` | ✅ |
| `GET .../timeline` | — | — chưa thấy FE gọi |

### Notifications
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST .../invitations`, `.../reminders`, `.../cancellation-notifications`, `.../minutes/distributions` | `businessAdminServices.js` | ✅ |
| `GET /notifications`, `GET /notifications/:id` | `getNotifications`, `getNotificationById` | ✅ |
| `PATCH /notifications/read-all`, `PATCH /notifications/:id/read` | `markAllNotificationsRead`, `markNotificationRead` | ⚠️ TODO lỗi thời, xem #5 |

### Accounts (Users/Roles/Permissions/Departments/Avatar)
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `POST/GET/PATCH/DELETE /users*` | `employeeServices.js`, `managerServices.js`, `sysAdminServices.js` | ✅ |
| `PUT /users/:id/roles` | `assignUserRoles` | ✅ |
| `PATCH /users/:id/{status,lock,unlock}` | tương ứng | ✅ |
| `GET /users/import/template`, `POST /users/import` | ✅ | ✅ |
| `GET /users/manage` | `businessAdminServices.js: getManageUsers` | ✅ |
| `GET /users/export` | `exportUsers` | ✅ |
| `GET /users/:id/public-profile` | `getUserPublicProfile` | ✅ |
| `GET/POST/PATCH/DELETE /roles*`, `/permissions*`, `/roles/:id/permissions*` | `permissionServices.js` | ✅ |
| `POST/GET/PATCH /departments*` | tương ứng | ✅ |
| `GET /me/avatar-status`, `POST /me/avatar-submission` | `avatarService.js` gọi sai path | ❌ Xem #2 |
| `GET/POST /admin/avatar-submissions*` | `avatarReviewService.js` | ✅ |

### Rooms
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET /rooms/search` | `searchRooms` | ✅ |
| `POST/PATCH/DELETE /rooms*` | `createRoom`, `updateRoom`, `deleteRoom` | ✅ (bao gồm field `allowRecording` đúng convention Room) |
| `GET /rooms/:id/deletion-impact` | `getRoomDeletionImpact` | ✅ |
| `GET /rooms/realtime-status`, `GET /rooms/:id/status` | `getRealtimeRoomStatus`/`getRealtimeRoomsStatus`, `getRoomStatus` | ✅ |
| `GET /room-bookings` | `getRoomBookings` | ✅ |
| `POST/GET/PATCH /no-show-cases*`, `.../release` | `getNoShowCases`, `updateNoShowCase`, `releaseNoShowCase` | ✅ |
| `GET/PUT /no-show-config`, `/early-vacancy-config` | tương ứng | ✅ |

### Attendance
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET /meetings/:id/attendance`, `GET .../attendance/:recordId` | `getMeetingAttendance` | — cần xác nhận không nhầm với biến thể `/live-meetings/:id/attendance` (xem ghi chú module Live-Meeting) |
| `POST/PATCH .../attendance*` (create/update/invalidate) | các hàm tương ứng trong `managerServices.js`/`employeeServices.js` | — BE agent không liệt kê rõ các route ghi attendance (POST/PATCH) trong controller đã khảo sát; **cần BE xác nhận các route này có tồn tại** trước khi coi FE đúng/sai |

### Scheduling
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET /scheduling/room-suggestions` | `schedulingServices.js: getRoomSuggestions` | ✅ (dùng đúng `allowRecording`) |
| `POST /scheduling/participant-conflicts/check` | `checkParticipantConflicts` | ✅ |
| `POST /scheduling/time-suggestions` | `getTimeSuggestions` | ✅ |

### IVSS / Presence
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET /ivss/meetings/:id/presence`, `.../presence/:userId`, `.../presence/report` | `managerServices.js` only | ✅ Xem #11 |

### Administration
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET/PATCH /system-configurations` | `sysAdminServices.js` | ⚠️ TODO lỗi thời, xem #5 |
| `GET /audit-logs` | `getAuditLogs`, `getUserAuditLogs` | ✅ |
| `GET /background-jobs/:id` | `getBackgroundJob` | ✅ |

### Analytics / Reports
| Endpoint BE | FE gọi (file) | Trạng thái |
|---|---|---|
| `GET /analytics/dashboard/overview` và các endpoint analytics khác | `managerServices.js`, `sysAdminServices.js`, `businessAdminServices.js` | — BE chỉ liệt kê controller theo nhóm, chưa đối chiếu path chi tiết từng chỉ số; khuyến nghị rà lại riêng nếu dashboard có số liệu sai |
| `POST /reports/meeting-activity/exports` | `exportMeetingActivityReport` | ✅ |
| Các report khác (room-utilization, gate-access, security-alert, vehicle) | chưa xác nhận FE có gọi đủ | — cần rà lại nếu có màn hình report tương ứng |

### Bảo mật vật lý / Ngoài phạm vi trọng tâm (IoT, ANPR, Zones, Face-Access, Alerts, Equipment)
| Nhóm | Ghi chú |
|---|---|
| IoT devices | FE (`sysAdminServices.js`) gọi `/iot-devices*` — chưa đối chiếu chi tiết field, cần khảo sát riêng nếu ưu tiên |
| ANPR/Vehicles | `anprService.js` — snake_case ở phần request cần đối chiếu tương tự #9 (chưa verify riêng từng DTO) |
| Zones | `zoneServices.js` gửi `device_ids` (snake_case) — cần verify DTO `UpdateZoneDto` có `@Expose` tương ứng hay không trước khi kết luận đúng/sai |
| Person Control List | `personControlListService.js` | ✅ snake_case đúng chủ đích, xem #9 |
| Alert Rules / Security Alerts | `alertRuleService.js`, `securityAlertService.js` | ✅ snake_case đúng chủ đích, xem #9 |
| Equipment | `equipmentServices.js` — camelCase, chưa đối chiếu chi tiết field với DTO BE |

---

## 5. Phụ lục — Field DTO tham chiếu nhanh

### RecordingConfig
| Chiều | Field |
|---|---|
| Write (Create/Update) | `enableAudio`, `enableVideo`, `enableTranscription`, `videoSourceDeviceId`, `audioSourceMode`, `autoStart`, `consentRequired`, `retentionDays` |
| Read (lồng trong `GET /meetings/:id`) | `autoRecord`, `allowRecording` (tính = `enableVideo OR enableAudio`), `enableTranscription` |

### Room (khác biệt với RecordingConfig — đừng nhầm)
| Field | Ghi chú |
|---|---|
| `allowRecording` | Khả năng phòng có hỗ trợ ghi hình hay không — dùng trong `CreateRoomDto`, `UpdateRoomDto`, `GET /rooms/available`, `GET /scheduling/room-suggestions` |

### MinutesShareListItemDto (`GET /meeting-minutes/:id/shares`)
```
id, userId, userFullName, userEmail, grantedBy, grantedByName, grantedAt
```

### AvatarController routes thật
```
GET  /me/avatar-status        → { avatarReviewStatus, avatarRequired, shouldShowAvatarPopup }
POST /me/avatar-submission    → multipart: file, consentAccepted
```

### MediaFile detail (`GET /media-files/:id`)
```
... , downloadUrl   // đã xác nhận field name khớp FE
```
