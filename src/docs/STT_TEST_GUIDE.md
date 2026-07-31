# Hướng dẫn Test tay — Tính năng Speech-to-Text / Transcript

> Dành cho người test (không cần đọc code). Test trên trình duyệt thật, mở kèm tab **Network** và **Console**
> (F12) để đối chiếu request/response khi cần. Một số bước đánh dấu **(cần sửa xong FE-1/FE-2/FE-3)** — nếu chưa
> sửa, bước đó sẽ lỗi đúng như mô tả, đó là hành vi đã biết chứ không phải lỗi mới.

## Chuẩn bị

- 1 tài khoản có vai trò **Host** của một cuộc họp đã ở trạng thái **completed** (đã kết thúc).
- 1 file âm thanh ngắn (~10-20 giây), định dạng `.wav`/`.mp3`/`.m4a`, dung lượng **dưới 50MB**.
- 1 file âm thanh khác **trên 50MB** (để test giới hạn dung lượng — có thể ghép file cũ nhiều lần hoặc dùng file
  video dài rồi đổi đuôi tạm, chỉ cần đủ lớn).
- (Tuỳ chọn, cho Bước 7) một tài khoản BUSINESS_ADMIN hoặc SYSTEM_ADMIN không phải Host của cuộc họp trên.

---

## Bước 1 — Upload audio & tạo job

1. Vào trang chi tiết cuộc họp (Meeting Detail) với tài khoản Host, chuyển sang tab **Transcript**.
2. Kéo-thả hoặc bấm "Chọn File từ máy tính", chọn file audio ngắn đã chuẩn bị.
3. Bấm "Tiến hành Upload".

**Kỳ vọng:**
- Giao diện chuyển lần lượt: "Đang tải file lên..." → "Đang khởi tạo AI xử lý..." → "Khởi tạo thành công!".
- Mở tab Network: thấy request `POST .../recording-sessions/audio-upload` trả **201**, sau đó
  `POST .../transcription-jobs` trả **202**.
- Nếu thấy lỗi ngay ở bước này, chụp lại response body của request bị lỗi (không phải chỉ message hiển thị trên
  UI) để báo cho BE dễ tra.

## Bước 2 — Theo dõi polling tự động

Sau khi upload thành công, không cần làm gì thêm — quan sát khu vực Transcript.

**Kỳ vọng:**
- Hiện trạng thái "Đang xử lý Speech-to-Text" kèm animation xoay.
- Cứ ~3 giây, tab Network có thêm 1 request `GET .../transcription-jobs` (kiểm tra bằng cách lọc Network theo từ
  khoá `transcription-jobs`).
- Khi xử lý xong (có thể mất vài chục giây tới vài phút tuỳ độ dài audio), UI tự chuyển sang hiển thị nội dung
  transcript — **không cần F5 tay**.

## Bước 3 — Xem nội dung transcript & đoạn cần chú ý

**Kỳ vọng:**
- Danh sách câu (segment) hiển thị theo thời gian tăng dần, có mốc thời gian dạng `phút:giây`.
- Đoạn nào có badge cam "⚠ Chú ý" là đoạn `lowConfidence`/`manualReviewRequired` — đối chiếu bằng mắt xem đoạn đó
  có thực sự khó nghe/không rõ không (STT tiếng Việt hiện chỉ ~53% chính xác, nên kỳ vọng thấy khá nhiều badge
  này, đó là bình thường).
- Góc trên bên phải hiển thị "Độ chính xác: XX%" — số này khớp với `confidenceScore` tổng thể của transcript.

## Bước 4 — Sửa tay 1 câu ⭐ (trọng tâm — nơi có bug 400 nếu FE-1 chưa sửa)

1. Đưa chuột vào 1 câu bất kỳ, bấm icon bút chì (sửa).
2. Sửa lại nội dung text, có thể đổi luôn tên người nói (speaker label).
3. Bấm "Lưu".

**Kỳ vọng SAU KHI FE-1 đã sửa:**
- Request `PATCH .../transcripts/:id/segments` trả **200**, không phải 400.
- Mở Network, xem request body — phải có dạng:
  ```json
  { "segments": [{ "segmentId": "...", "text": "...", "speakerLabel": "..." }] }
  ```
  (mảng `segments`, không phải object phẳng `{ "segmentId": ..., "text": ... }`).
- Toast xanh "Cập nhật nội dung thành công!" hiện ra, nội dung câu đổi ngay trên UI.
- F5 lại trang, vào lại tab Transcript — nội dung sửa vẫn còn (đã lưu thật vào DB, không phải chỉ đổi tạm trên
  UI).

**Nếu FE-1 CHƯA sửa:** bước này sẽ trả về lỗi 400 — đây là bug đã biết, không cần báo lại, chỉ cần xác nhận đã
tái hiện được để đối chiếu sau khi fix.

## Bước 5 — Chuyển trạng thái duyệt (reviewed/approved)

- Nếu FE-3 đã làm: bấm "Đánh dấu đã xem" trước (trạng thái chuyển `draft` → `reviewed`), sau đó mới bấm "Duyệt
  toàn bộ" (`reviewed` → `approved`). Xác nhận badge trạng thái ở góc trên đổi màu tương ứng (tím `draft` → xanh
  dương `reviewed` → xanh lá `approved`).
- Nếu FE-3 chưa làm: chỉ có nút "Duyệt toàn bộ" (nhảy thẳng `draft` → `approved`), test bước này thay thế.
- **Test lỗi 409**: sau khi đã `approved`, thử tìm cách gọi lại duyệt lần nữa (hoặc dùng Postman/curl với JWT
  thật gọi `PATCH .../status` với `{"status":"approved"}`) — kỳ vọng nhận **409** báo "chuyển trạng thái không
  hợp lệ", không phải lỗi 500 hay bị treo.

## Bước 6 — Test quyền Admin xem/sửa transcript của meeting không phải mình host *(cần FE-2 đã làm)*

1. Đăng xuất, đăng nhập bằng tài khoản BUSINESS_ADMIN hoặc SYSTEM_ADMIN (không phải Host của cuộc họp ở Bước 1).
2. Tìm và vào lại đúng cuộc họp đó.

**Kỳ vọng:** vẫn thấy tab Transcript, thấy được nút sửa/duyệt như khi đăng nhập bằng Host. Nếu không thấy nút
sửa mà chỉ xem được nội dung, kiểm tra lại đúng role đã đăng nhập (roleCodes phải là `BUSINESS_ADMIN` hoặc
`SYSTEM_ADMIN`).

## Bước 7 — Test khi tính năng bị tắt (`TRANSCRIPTION_ENABLED=false`)

*(Cần phối hợp với BE tạm thời set biến môi trường này = false trên môi trường test, xong nhớ bật lại.)*

1. Vào 1 meeting khác (chưa có transcript), thử bấm Upload audio.

**Kỳ vọng:** nút Upload bị ẩn sẵn (nếu FE-4 đã làm), hoặc hiện thông báo lỗi rõ ràng dạng "Tính năng đang bị tắt"
ngay sau khi bấm — không phải màn hình trắng, không phải lỗi chung chung "Đã xảy ra lỗi hệ thống".

## Bước 8 — Test giới hạn dung lượng file

1. Thử chọn file audio đã chuẩn bị **trên 50MB**.

**Kỳ vọng:** FE chặn ngay lập tức với thông báo "Dung lượng file vượt quá giới hạn 50MB", **không gửi request lên
server** (kiểm tra tab Network không thấy request `audio-upload` nào được gửi).

---

## Bảng tra nhanh lỗi thường gặp

| Hiện tượng | Nguyên nhân khả dĩ | Đối chiếu |
|---|---|---|
| Sửa câu xong bấm Lưu → lỗi 400 | FE-1 chưa sửa (payload sai hình dạng) | `FE_PLAN_STT_Transcription_Fixes.md` mục FE-1 |
| Admin không thấy nút sửa dù không phải Host | FE-2 chưa sửa, hoặc role check sai giá trị (PascalCase vs UPPER_SNAKE) | `FE_PLAN_STT_Transcription_Fixes.md` mục FE-2 |
| Không có nút "Đánh dấu đã xem" riêng | FE-3 chưa sửa — bình thường nếu team quyết định chưa cần bước này | `FE_PLAN_STT_Transcription_Fixes.md` mục FE-3 |
| Bấm Upload dù tính năng đã tắt vẫn không báo rõ | FE-4 chưa sửa | `FE_PLAN_STT_Transcription_Fixes.md` mục FE-4 |
| Trạng thái "processing" treo mãi không xong | Có thể do AI Worker (BE) đang xử lý audio dài/máy chậm — chờ thêm, nếu quá 5 phút thì báo BE kiểm tra log `transcription-worker.processor.ts` | Không phải lỗi FE |
| Nút "Tóm tắt bằng AI" không hiện | Bình thường nếu BE để `ai-draft-config.enabled=false` (tính năng đang WIP, cố ý chưa bật) | Không phải bug |
