# FE PLAN — Biến hướng dẫn quét khuôn mặt từ mô phỏng thành tương tác thật

> Phạm vi: `pages/employee/FaceRegistration.jsx` + `pages/manager/FaceRegistration.jsx` (2 file gần như giống hệt
> nhau) + `component/BiometricReminder/BiometricReminderModal.jsx` (cùng logic scanner, tách riêng cho modal
> nhắc nhở). Đối chiếu trực tiếp source hiện tại + xác nhận với BE về ranh giới trách nhiệm trước khi lên kế hoạch
> (xem `capstone-be/docs/BE_PLAN_Realtime_Biometric_Guidance_Alignment.md`).

---

## 🔴 Việc phải sửa trước — bug độc lập nhưng chặn toàn bộ tính năng

**Phát hiện khi rà soát:** `src/service/avatarService.js` gọi sai endpoint hoàn toàn:

```js
// avatarService.js — SAI, luôn 404
export const submitBiometric = async (file, consentAccepted) => {
    ...
    return post('/me/biometric-submission', formData); // route thật: /me/avatar-submission
};
```

Đối chiếu trực tiếp `avatar.controller.ts:47,80` (`@Controller('me')` + `@Post('avatar-submission')`), route thật
là **`POST /me/avatar-submission`** (và `GET /me/avatar-status`, không phải `/me/biometric-status`). Nghĩa là
**toàn bộ luồng nộp ảnh sinh trắc học hiện tại đang 404 ở bước cuối cùng** — dù có làm hướng dẫn thật đẹp đến đâu,
bấm "Liên kết khuôn mặt" vẫn sẽ lỗi. **Phải sửa file `avatarService.js` (đổi 2 path) trước khi làm bất cứ việc gì
khác trong plan này**, nếu không mọi cải tiến UI phía sau đều vô nghĩa.

```js
// avatarService.js — SỬA
export const submitBiometric = async (file, consentAccepted) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('consentAccepted', consentAccepted ? 'true' : 'false');
    return post('/me/avatar-submission', formData);
};
export const getBiometricStatus = async () => await get('/me/avatar-status');
```

---

## Vấn đề hiện tại: hướng dẫn là animation hẹn giờ, không đọc khung hình thật

`runWebcamGuideSequence()` (`FaceRegistration.jsx:114-134`) là một `setInterval` đếm giây cố định:

```js
// SAI — không hề đọc pixel nào từ video, chỉ đếm giây
duration += 1;
if (duration === 3) setWebcamStep('too_far');
else if (duration === 6) setWebcamStep('too_close');
else if (duration === 9) setWebcamStep('perfect');
else if (duration === 11) { setWebcamStep('countdown'); startCaptureCountdown(); }
```

Nghĩa là dù người dùng ngồi im, che camera, hay đứng cách xa cả mét — chuỗi trạng thái vẫn chạy y hệt và tự động
chụp sau đúng 11 giây. Đây là "hướng dẫn giả" đúng như nhận định — cần thay bằng vòng lặp phân tích khung hình
thật.

---

## Xác nhận ranh giới trách nhiệm (đã hỏi và đối chiếu `CLAUDE.md` phía BE)

BE **tuyệt đối không được** làm face detection/nhận diện/chấm điểm chất lượng ảnh (`CLAUDE.md` mục 11.2, 11.12 —
"Backend không tự detect face... Implement backend-side face recognition model" là điều cấm rõ ràng). Kiểm tra
thực tế: `POST /me/avatar-submission` hiện **không có bất kỳ validate chất lượng ảnh nào** (chỉ check MIME + kích
thước file), cột `face_profiles.quality_score` tồn tại trong DB nhưng chưa từng được ghi.

**Kết luận: toàn bộ vòng lặp hướng dẫn thời gian thực (phát hiện có mặt/không, đo khoảng cách, căn giữa khung hình,
kiểm tra độ sáng) phải chạy 100% phía trình duyệt (client-side), không gọi BE.** BE chỉ nhận ảnh cuối cùng đã chụp
— giữ nguyên contract hiện tại.

---

## FE-BIO-1 · Chọn thư viện face-detection chạy trên trình duyệt

**Khuyến nghị: `@mediapipe/tasks-vision`** (Google MediaPipe Face Detector task):
- Chạy hoàn toàn client-side qua WASM, không cần server, không gửi ảnh đi đâu (đúng yêu cầu bảo mật PDPA đã cam
  kết trong màn hình consent — dữ liệu khuôn mặt không rời khỏi máy người dùng cho tới khi họ chủ động bấm nộp).
- Model nhẹ (~vài trăm KB), tốc độ đủ nhanh để chạy real-time trên khung hình 640×480 mỗi ~150-200ms trên máy tính
  văn phòng thông thường.
- Trả về bounding box + vài keypoint cơ bản (mắt, mũi, tai) — đủ để tính khoảng cách/căn giữa, không cần tới mức
  landmark chi tiết hay face descriptor (không cần nhận diện danh tính ở bước này, chỉ cần "có mặt người + đúng vị
  trí").

**Phương án thay thế:** `face-api.js` (nền tảng TensorFlow.js) — phổ biến hơn, nhiều tài liệu hơn, nhưng model
lớn hơn và dự án đã ngừng cập nhật vài năm — chỉ chọn nếu team đã quen thuộc sẵn, không có lợi thế rõ so với
MediaPipe cho use case này.

**Việc cụ thể:** `npm install @mediapipe/tasks-vision`, tải model `blaze_face_short_range.tflite` (hoặc bản CDN
Google cung cấp sẵn, load qua URL — không cần tự host nếu không có yêu cầu offline nghiêm ngặt).

---

## FE-BIO-2 · Thay `runWebcamGuideSequence` bằng vòng lặp phân tích khung hình thật

**Thiết kế:**
1. Khởi tạo `FaceDetector` từ MediaPipe 1 lần khi component mount (không phải mỗi lần bắt đầu quét).
2. Thay `setInterval` đếm giây bằng `requestAnimationFrame` hoặc `setInterval(~150ms)` gọi
   `detector.detectForVideo(videoRef.current, timestamp)` lấy `detections[0]?.boundingBox`.
3. Từ bounding box, tính toán:
   - **`no_face`** (trạng thái mới, hiện chưa có): không có detection nào → hiện "Không phát hiện khuôn mặt, vui
     lòng nhìn vào camera".
   - **`too_far`**: `boundingBox.width / video.videoWidth < NGƯỠNG_NHỎ` (ví dụ < 25%).
   - **`too_close`**: tỉ lệ > `NGƯỠNG_LỚN` (ví dụ > 60%) hoặc bounding box tràn ra ngoài khung video.
   - **căn giữa lệch** (trạng thái mới, hiện chưa có): tâm bounding box lệch quá xa tâm khung hình theo trục
     ngang/dọc → hiện "Di chuyển mặt vào giữa khung hình" kèm hướng (trái/phải/lên/xuống).
   - **`perfect`**: tỉ lệ nằm trong khoảng chuẩn VÀ tâm bounding box gần tâm khung hình.
4. **Chống rung/chống chụp nhầm**: chỉ chuyển sang `countdown` khi trạng thái `perfect` giữ liên tục đủ N frame
   liên tiếp (ví dụ 8-10 frame ~1.5s), không chuyển ngay lập tức khi vừa đạt để tránh giật hình do rung tay/rung
   khung hình thoáng qua.
5. Nếu người dùng rời khỏi trạng thái `perfect` trong lúc đang đếm ngược (countdown) — hủy đếm ngược, quay lại
   phân tích bình thường thay vì cứ chụp bừa theo giờ như hiện tại.

**File cần sửa:** `FaceRegistration.jsx` (cả 2 bản employee/manager) — thay `runWebcamGuideSequence` +
`webcamStep` transitions; `BiometricReminderModal.jsx` dùng chung logic scanner nên cũng cần đồng bộ (khuyến nghị
tách logic phân tích khung hình thành 1 custom hook dùng chung, ví dụ `hooks/useFaceGuidance.js`, để không phải
sửa 3 chỗ trùng lặp mỗi lần chỉnh ngưỡng).

**UI cần thêm:** 2 trạng thái HUD mới chưa có sẵn trong overlay hiện tại (`no_face`, lệch tâm theo hướng) — dùng
cùng pattern khung viền màu + text hướng dẫn đã có (dòng 344-371), chỉ thêm case mới vào switch hiển thị text.

---

## FE-BIO-3 · Kiểm tra ánh sáng cơ bản (tuỳ chọn, nhẹ)

Lấy mẫu độ sáng trung bình từ canvas (đọc `ImageData`, tính trung bình kênh RGB quy đổi luminance) trong vùng
bounding box — nếu quá tối, hiện cảnh báo "Ánh sáng yếu, vui lòng di chuyển đến nơi sáng hơn" thay vì để BE/con
người phát hiện sau khi đã nộp ảnh mờ. Không cần thư viện riêng — chỉ cần Canvas API có sẵn của trình duyệt.

---

## FE-BIO-4 · Gửi kèm metadata chất lượng (tuỳ chọn — cần BE xác nhận DTO trước, xem file BE plan)

Nếu BE đồng ý mở rộng DTO (mục BE-BIO-1 phía BE), gửi kèm các field client tự tính được khi nộp ảnh cuối cùng:
`clientFaceDetected: true`, `clientBoundingBoxRatio`, `clientEstimatedBrightness` — **chỉ mang tính thông tin cho
người duyệt (admin xem thấy FE đã tự tin ảnh rõ nét), BE không được dùng các giá trị này để tự động chấp
nhận/từ chối** (client-side, không đáng tin cậy để làm cơ sở quyết định an ninh).

---

## Việc KHÔNG làm trong đợt này (tránh over-engineering)

- Không làm liveness detection nâng cao (yêu cầu chớp mắt/quay đầu để chống giả mạo bằng ảnh in) — đây là tính
  năng bảo mật riêng, cần được PO xác nhận có cần thiết cho MVP không trước khi đầu tư thêm công sức, vì làm đúng
  cần nhiều bước UI (yêu cầu thao tác) + rủi ro trải nghiệm kém nếu detection không ổn định.
- Không tự làm face recognition/so khớp danh tính ở bước này — bounding box chỉ dùng để căn khung, không dùng để
  xác minh "đúng người này hay không" (việc đó là của Face Server/thiết bị enrollment thật, ngoài phạm vi web app).

## Checklist test tay

- [ ] Sửa xong `avatarService.js`, xác nhận `POST /me/avatar-submission` trả `201`/`200` thật (không còn 404).
- [ ] Che camera hoàn toàn → hiện đúng thông báo "Không phát hiện khuôn mặt".
- [ ] Lùi ra xa >1m → hiện "Chưa đủ gần".
- [ ] Áp sát camera → hiện "Quá gần".
- [ ] Ngồi lệch hẳn sang trái/phải khung hình → hiện đúng hướng cần di chuyển.
- [ ] Ngồi đúng vị trí, giữ yên ~2s → tự chuyển countdown và chụp, không chụp nhầm lúc đang di chuyển.
- [ ] Rung nhẹ/nói chuyện trong lúc đang ở trạng thái perfect → không bị false-negative liên tục nhảy qua lại giữa
      các trạng thái (kiểm tra ngưỡng N-frame ở FE-BIO-2 có đủ ổn định chưa).
