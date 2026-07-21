# Thực Trạng Tính Năng STT (Speech-to-Text) — Backend

Tài liệu này mô tả hiện trạng module **Transcription/Recording** bên `capstone-be`, để đội FE
biết cần implement luồng upload audio + hiển thị transcript như thế nào. Toàn bộ endpoint dưới
đây đã có trong code (không phải kế hoạch), đã đối chiếu trực tiếp với source (`transcription.controller.ts`,
`recording-session.controller.ts`, `transcript-segments.controller.ts`, `transcript.entity.ts`).

---

## 1. Tóm tắt luồng (điều FE cần hiểu trước tiên)

Đúng — **FE phải xử lý lấy audio của người dùng** (ghi âm hoặc chọn file có sẵn), rồi **upload file
audio lên BE**. BE **không** nhận audio streaming realtime, không nhận base64 trong JSON, không có
WebSocket audio — chỉ nhận file qua `multipart/form-data`.

Sau khi upload xong, việc transcribe là **bất đồng bộ (async job qua BullMQ)**:

```
[FE ghi âm/chọn file audio]
        │  multipart/form-data, field "file"
        ▼
POST .../recording-sessions/audio-upload  → 201, trả recordingSessionId
        │
        ▼
POST .../transcription-jobs { recordingSessionId } → 202 ACCEPTED (không đợi kết quả)
        │  (BE queue job, Whisper + Pyannote chạy nền, có thể mất vài chục giây → vài phút)
        ▼
FE poll GET .../transcription-jobs  hoặc  GET .../transcript
        │  status: processing → draft (xong) / failed
        ▼
[Hiển thị transcript, cho user sửa tay nếu confidence thấp]
```

Không có endpoint "chờ đồng bộ trả transcript ngay". FE **bắt buộc phải polling** (chưa xác nhận có
WebSocket event báo hoàn tất — xem mục 6).

---

## 2. Cách gửi audio lên BE

### 2.1. Trường hợp phổ biến: 1 file duy nhất (chế độ diarization)

```
POST /api/v1/meetings/:meetingId/recording-sessions/audio-upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
Permission cần có: transcript.create (Host/Organizer hoặc Admin)

Form field: file  →  1 file audio (.wav/.mp3/.m4a/...), tối đa 50MB
                      (giới hạn cấu hình qua STORAGE_MAX_FILE_SIZE)
```

Response `201`:
```json
{
  "success": true,
  "message": "Audio uploaded — dùng recordingSessionId để tạo transcription job",
  "data": {
    "recordingSessionId": "uuid",
    "mediaFileId": "uuid",
    "fileName": "recording.wav",
    "fileSize": 52428800,
    "uploadedAt": "2026-07-14T10:30:00Z"
  }
}
```

BE sẽ tự chạy Whisper (chuyển giọng nói → text) + Pyannote (tách người nói theo giọng — "diarization"),
speaker sẽ có nhãn `speakerLabel: "unknown"` (chưa map được vào participant thật, xem mục 5).

### 2.2. Trường hợp nhiều người ghi riêng từng track (chế độ channel_zone — mới có Phase 1)

Dùng khi mỗi participant ghi audio riêng của mình (ví dụ mỗi người 1 mic/track), BE ghép các track lại
theo channel thay vì tách giọng bằng AI:

```
1) POST /api/v1/meetings/:meetingId/recording-sessions
   Body: { "notes": "optional" }
   → 201, trả recordingSessionId (session rỗng)

2) Từng participant tự upload track của mình:
   POST /api/v1/meetings/:meetingId/recording-sessions/:sessionId/audio-tracks
   Content-Type: multipart/form-data, field "file"
   Permission: recording.upload_track
   → 201, trả mediaFileId cho từng track

3) GET /api/v1/meetings/:meetingId/recording-sessions
   Permission: transcript.read
   → liệt kê các session + số track đã có (mediaFileCount), dùng để FE biết đã đủ track chưa
```

**Lưu ý quan trọng**: Phase 1 (upload nhiều track) đã chạy được, nhưng **Phase 2 — AI Worker xử lý
riêng từng channel Whisper — vẫn đang hoàn thiện**. Vì vậy nên ưu tiên test luồng 1-file (mục 2.1)
trước, luồng multi-track có thể chưa cho kết quả tối ưu.

---

## 3. Tạo transcription job (bắt STT chạy)

```
POST /api/v1/meetings/:meetingId/transcription-jobs
Auth: Bearer JWT, permission transcript.create
Content-Type: application/json

Body:
{
  "recordingSessionId": "uuid",          // bắt buộc — lấy từ bước upload ở mục 2
  "language": "vi-VN",                   // optional, mặc định vi-VN
  "speakerMappingMode": "diarization_only", // optional, tự chọn theo số file nếu bỏ trống
                                             // "diarization_only" (1 file) | "channel_zone" (nhiều track)
  "initialPrompt": "tên riêng, thuật ngữ ngành cần STT nhận đúng", // optional, tối đa 1000 ký tự
  "forceRerun": false                    // optional — cho phép chạy lại nếu job cũ đang processing
}
```

Response `202 ACCEPTED` (trả về ngay, KHÔNG đợi transcribe xong):
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "meetingId": "uuid",
    "status": "queued",          // trạng thái job trong queue
    "transcriptStatus": "processing"  // trạng thái transcript entity
  }
}
```

Nếu backend tắt tính năng (`TRANSCRIPTION_ENABLED=false` trong env) → trả **403** với message
`"Tinh nang transcription dang bi tat"`. FE nên xử lý case này (ẩn nút "Tạo transcript" hoặc báo lỗi rõ ràng).

---

## 4. Theo dõi tiến trình & lấy kết quả

### 4.1. Danh sách job của meeting (dùng để polling trạng thái)
```
GET /api/v1/meetings/:meetingId/transcription-jobs
Permission: transcript.read
```
Trả danh sách job, mới nhất trước, kèm `status`/`transcriptStatus`. FE nên poll endpoint này (hoặc mục 4.2)
theo interval (gợi ý 3-5s) cho tới khi status không còn `processing`.

### 4.2. Lấy transcript (endpoint chính để hiển thị nội dung)
```
GET /api/v1/meetings/:meetingId/transcript?includeSegments=true&page=1&limit=50
Permission: transcript.read
```

- `includeSegments=false` (mặc định): chỉ trả `cleanedText` (toàn bộ text gộp), nhẹ, dùng cho preview.
- `includeSegments=true`: trả từng câu/đoạn (`segments[]`) kèm timestamp — dùng khi cần hiển thị theo
  dòng thời gian hoặc cho phép sửa tay từng câu. Có phân trang (`page`/`limit`, tối đa 100/trang).

Response mẫu (rút gọn từ dữ liệu thật, xem file [response_result_transcription](response_result_transcription) trong repo để xem full):
```json
{
  "success": true,
  "data": {
    "transcriptId": "uuid",
    "meetingId": "uuid",
    "status": "draft",
    "language": "vi-VN",
    "versionNo": 1,
    "confidenceScore": 0.53,
    "cleanedText": "Toàn bộ nội dung transcript dạng text liền...",
    "segments": [
      {
        "segmentId": "seg-0000",
        "startMs": 1460,
        "endMs": 4580,
        "speakerLabel": "unknown",
        "userId": null,
        "text": "Em đừng phải tấn đề về tiền tại gia đình, đúng không?",
        "confidence": 0.5582,
        "overlap": false,
        "lowConfidence": false,
        "manualReviewRequired": false
      }
    ],
    "generatedAt": "2026-06-29T10:39:50.065Z"
  },
  "meta": { "page": 1, "limit": 50, "total": 39 }
}
```

`status` của transcript là một trong: `processing` → `draft` (STT xong, chưa duyệt) → `reviewed`
(optional, đã người xem qua) → `approved` (đã chốt) — hoặc `failed`/`hidden`.

---

## 5. Sửa tay transcript (Host/Admin)

Vì độ chính xác STT hiện tại **chưa cao với tiếng Việt** (xem mục 7), BE có sẵn 3 endpoint để Host/Admin
sửa tay:

| Endpoint | Dùng để |
|---|---|
| `PATCH /api/v1/transcripts/:transcriptId/segments` | Sửa từng câu (`text`, gán `speakerLabel`/`speakerUserId`), có `revisionNote` audit |
| `PATCH /api/v1/transcripts/:transcriptId/content` | Ghi đè toàn bộ `rawText`/`cleanedText` (sửa nhanh cả đoạn) |
| `PATCH /api/v1/transcripts/:transcriptId/status` | Chuyển `draft → reviewed` hoặc `→ approved`. Chỉ nhận 2 giá trị này — các trạng thái khác do hệ thống tự set |

Quyền: chỉ **Host của meeting** hoặc **Admin** (BUSINESS_ADMIN/SYSTEM_ADMIN) mới sửa được — service
tự kiểm tra thêm ngoài permission `transcript.update`, nên FE cần ẩn nút Edit với user không phải Host/Admin.

---

## 6. Điểm FE cần lưu ý / chưa chắc chắn

- **Chưa xác nhận có WebSocket báo "transcript xong" hay không** — code hiện tại chỉ thấy BE gọi
  `notifyTranscriptReady()` (tạo in-app notification qua module `notifications`) sau khi job hoàn tất,
  **không tìm thấy** đoạn emit WebSocket event riêng trong module transcription. Vì vậy **FE nên implement
  polling là chính** (mục 4.1/4.2); nếu muốn dùng real-time, cần hỏi lại BE xem event nào (nếu có) được bắn qua
  WebSocket gateway chung của hệ thống, đừng tự đoán tên event.
- Không có endpoint hủy job đang chạy.
- Không có endpoint stream tiến độ % (chỉ có trạng thái rời rạc queued/running/completed/failed).

---

## 7. Giới hạn hiện tại (để FE set kỳ vọng đúng với người dùng)

1. **Độ chính xác STT tiếng Việt còn thấp** — trong file mẫu thực tế, `confidenceScore` tổng thể chỉ ~0.53,
   nhiều đoạn `lowConfidence: true` / `manualReviewRequired: true`. FE **nên hiển thị rõ các đoạn confidence
   thấp** (badge cảnh báo, highlight màu) để người dùng biết cần soát lại, thay vì hiển thị transcript như
   một kết quả "chắc chắn đúng".
2. **Không nhận diện người nói theo danh tính thật** — `speakerLabel` mặc định là `"unknown"` (chế độ
   diarization chỉ tách giọng theo cụm âm thanh, không biết đó là ai). Việc gán tên người nói thật hiện
   phải làm thủ công qua `PATCH .../segments` (field `speakerUserId`).
3. **Chỉ xử lý theo lô (batch/offline), không có STT trực tiếp khi đang họp** — audio phải ghi xong, upload
   xong file mới transcribe được. Không có mic streaming realtime.
4. **Giới hạn dung lượng file**: mặc định 50MB/track (cấu hình qua `STORAGE_MAX_FILE_SIZE`).
5. **Chế độ multi-track (channel_zone) mới có Phase 1** (upload xong nhiều file), phần AI Worker xử lý
   riêng từng channel còn đang hoàn thiện — ưu tiên test/launch với chế độ 1-file trước.
6. **Toàn bộ tính năng có thể bị tắt qua feature flag** `TRANSCRIPTION_ENABLED` (env) — khi tắt, mọi request
   tạo job sẽ trả 403.
7. **Tính năng AI tóm tắt biên bản họp (minutes) dùng transcript làm input đang là WIP**, chưa production-ready
   — nếu FE có UI "tóm tắt tự động", chưa nên bật.

---

## 8. Checklist cho FE

- [ ] UI ghi âm hoặc chọn file audio (.wav/.mp3/.m4a...), giới hạn ≤ 50MB.
- [ ] Upload file qua `multipart/form-data` tới `POST /meetings/:meetingId/recording-sessions/audio-upload`.
- [ ] Sau khi có `recordingSessionId`, gọi `POST /meetings/:meetingId/transcription-jobs` để bắt đầu STT.
- [ ] Polling `GET /meetings/:meetingId/transcript` (hoặc `/transcription-jobs`) cho tới khi `status !== "processing"`.
- [ ] Hiển thị `cleanedText` (preview nhanh) hoặc `segments[]` (dạng có timeline, phân trang) khi `includeSegments=true`.
- [ ] Highlight đoạn `lowConfidence`/`manualReviewRequired` để cảnh báo user.
- [ ] Nếu là Host/Admin: cho sửa tay từng câu (`PATCH .../segments`), sửa toàn văn (`PATCH .../content`), và chuyển trạng thái duyệt (`PATCH .../status`: `reviewed`/`approved`).
- [ ] Xử lý case 403 `TRANSCRIPTION_DISABLED` (feature flag tắt) và 409 khi chuyển status không hợp lệ (vd. đã approved).
- [ ] Tất cả request cần header `Authorization: Bearer <jwt>` — không có endpoint STT nào public.

---

*Tài liệu tạo ngày 14/07/2026, đối chiếu trực tiếp với source code `capstone-be/src/modules/transcription`
và `capstone-be/src/modules/recording` (nhánh hiện tại trên máy, chưa commit).*
