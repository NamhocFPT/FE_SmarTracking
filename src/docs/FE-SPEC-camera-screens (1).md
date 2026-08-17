# Đặc tả màn FE — Nhóm tính năng Camera (Face / Presence / ANPR)

> Tài liệu cho đội FE. Mô tả các màn cần build dựa trên UC camera đã có BE.
> Stack: React 18 (CRA) + Tailwind + JavaScript. BE: NestJS, base URL `http://<host>:3000/api/v1`.
> Auth: tất cả request gửi header `Authorization: Bearer <accessToken>` (lấy từ `/auth/login`).
> Response chuẩn: `{ success, message, data }` (trừ endpoint tải file PDF — trả file trực tiếp).

---

## 0. Quy ước chung

- **Base URL:** `http://<host>:3000/api/v1`
- **Login:** `POST /auth/login` body `{ "email", "password" }` → token ở `data.accessToken` (hết hạn ~15 phút).
- **Header mọi request:** `Authorization: Bearer <token>`.
- **Lỗi:** BE trả HTTP status + `{ code, message }`. FE hiển thị `message` thân thiện.
- **Phân trang:** các endpoint danh sách nhận `?page=1&limit=50`.

---

## 1. Đăng ký khuôn mặt — UC-AM-13

**Mục đích:** Nhân viên (hoặc admin làm hộ) upload ảnh chân dung để hệ thống nhận diện. Đây là bước BẮT BUỘC trước khi camera nhận ra người.

**Endpoint:**
```
POST /users/:userId/face-profile
Content-Type: multipart/form-data
field: file  (ảnh chân dung, jpg/png)
Permission: account.face.register
```
**Response:** `{ success, message: "Face portrait enrolled", data: { ...profile } }`

**Layout màn:**
- Khu vực upload ảnh (kéo-thả hoặc chọn file), preview ảnh trước khi gửi.
- Nút "Đăng ký khuôn mặt".
- Hiển thị trạng thái ảnh hiện tại (đã có / chưa có / đang chờ duyệt).
- Thông báo thành công/thất bại.
- Gợi ý chụp ảnh: rõ mặt, chính diện, đủ sáng.

**Lưu ý:**
- Admin enroll hộ: gọi cùng endpoint với `:userId` là id nhân viên cần đăng ký.
- Sau khi đăng ký, BE/scheduler tự đẩy khuôn mặt sang thiết bị camera (FE không cần làm gì thêm).
- Màn duyệt khuôn mặt (PENDING→ACTIVE) hiện chưa có endpoint riêng — xem mục "Cần BE bổ sung".

---

## 2. Điểm danh / Hiện diện cuộc họp — UC-APM-02, UC-APM-09

**Mục đích:** Xem ai có mặt trong 1 cuộc họp, thời gian mỗi người ở trong phòng, tỉ lệ có mặt. Đây là màn tổng quan của 1 cuộc họp.

**Endpoint:**
```
GET /ivss/meetings/:meetingId/presence
Permission: ivss.presence.read
```
**Response `data`:**
```jsonc
{
  "participants": [
    {
      "userId": "uuid",
      "fullName": "Nguyễn Văn A" | null,
      "durationMs": 1234000,        // tổng thời gian trong phòng (ms)
      "segmentCount": 3,            // số lần vào
      "presentRatio": 0.42,         // tỉ lệ có mặt 0..1
      "unmatchedCount": 0
    }
  ],
  "meetingUnmatchedIdentityCount": 5  // số lượt camera thấy mặt nhưng không nhận ra ai
}
```

**Layout màn:**
- Header: tên cuộc họp + thời gian bắt đầu/kết thúc (xem mục "Cần BE bổ sung" để lấy giờ họp tự động).
- Danh sách participant dạng thẻ hoặc bảng: avatar/tên, thời gian trong phòng (format từ durationMs), số lần vào, tỉ lệ có mặt (%).
- Badge trạng thái: đang trong phòng / đã ra / chưa vào.
- Thẻ tổng: số người đã điểm danh, số lượt khuôn mặt lạ (meetingUnmatchedIdentityCount).
- (Tùy chọn) Auto-refresh mỗi 3-5s để theo dõi realtime.

**Tham khảo:** đã có bản demo HTML `checkin-checkout-demo.html` — FE có thể tham chiếu logic + giao diện.

---

## 3. Lịch sử vào/ra từng người (Timeline) — UC-APM-07, UC-APM-08

**Mục đích:** Xem chi tiết 1 người trong 1 cuộc họp: timeline các lượt vào/ra, tổng thời gian hiện diện.

**Endpoint:**
```
GET /ivss/meetings/:meetingId/presence/:userId
Permission: ivss.presence.read
```
**Response `data`:**
```jsonc
{
  "duration": { "durationMs": 900000, "presentRatio": 0.35 },
  "timeline": {
    "segments": [ { "start": "ISO", "end": "ISO", "state": "present", "source": "..." } ],
    "events":   [ { "at": "ISO", "direction": "enter" | "leave" } ]
  }
}
```

**Layout màn:**
- Header: tên người + tổng thời gian trong phòng + tỉ lệ có mặt.
- Ô lớn: giờ check-in (lần vào), check-out (lần ra gần nhất) — hoặc "còn trong phòng" nếu event cuối là enter.
- Timeline dọc các lượt vào (xanh) / ra (cam), kèm giờ. Nên xếp mới nhất lên trên.
- Logic "còn trong phòng": nếu event cuối cùng = enter → đang trong phòng; nếu = leave → đã ra (hiện giờ ra).

**Tham khảo:** logic này đã làm trong `checkin-checkout-demo.html`.

---

## 4. Tải báo cáo điểm danh (PDF) — UC-APM (xuất báo cáo)

**Mục đích:** Tải file PDF báo cáo hiện diện của cả cuộc họp.

**Endpoint:**
```
GET /ivss/meetings/:meetingId/presence/report
Permission: ivss.presence.read
→ Trả file PDF trực tiếp (Content-Disposition: attachment). KHÔNG có envelope {success,...}.
```

**Layout:** chỉ cần 1 nút "Tải báo cáo PDF" trong màn điểm danh (mục 2). FE gọi endpoint, nhận blob, trigger download.

```js
// ví dụ
const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
const blob = await res.blob();
// tạo link download từ blob
```

---

## 5. Dashboard điểm danh & hiện diện — UC-AA-03

**Mục đích:** Dashboard tổng hợp điểm danh nhiều cuộc họp (không chỉ 1 họp).

**Endpoint:** chưa có endpoint tổng hợp riêng. FE có 2 lựa chọn:
- Tạm thời: chọn 1 cuộc họp → gọi `/presence` (mục 2) hiển thị dạng dashboard.
- Đầy đủ: cần BE bổ sung endpoint tổng hợp (xem "Cần BE bổ sung").

**Layout (khi có dữ liệu):** thẻ số liệu (tổng người điểm danh, tỉ lệ có mặt trung bình, số khuôn mặt lạ), biểu đồ theo thời gian.

---

## 6. Gán camera nhận diện vào phòng họp — UC-RM-05

**Mục đích:** Cấu hình camera nào ứng với phòng họp nào (để hệ thống biết người đi qua camera X là vào phòng Y), và camera nào là cổng VÀO / cổng RA.

**Trạng thái BE:** hiện cấu hình này lưu ở `system_configs` (`ivss.channel_room_map`, `ivss.channel_direction_map`) và đang set bằng SQL tay. **Chưa có API quản lý.** Cần BE bổ sung (xem cuối file).

**Layout đề xuất (khi có API):**
- Danh sách camera (channel) của thiết bị.
- Mỗi camera: chọn phòng họp (dropdown) + chọn vai trò (Cổng vào / Cổng ra).
- Nút lưu.

---

## 7. Quản lý thiết bị camera / IoT — UC-IOT-01, 02, 03

**Mục đích:** Đăng ký thiết bị camera, cấu hình kết nối Face Server, cấu hình RTSP.

**Trạng thái BE:** cần kiểm endpoint (bảng `iot_devices`). Nhiều phần có thể chưa có API. Ưu tiên thấp cho demo.

**Layout đề xuất:** danh sách thiết bị (tên, IP, trạng thái online/offline) + form thêm/sửa thiết bị + form cấu hình RTSP/Face Server.

---

## 8. ANPR — Nhận diện biển số xe (nếu trong scope)

> ANPR không nằm rõ trong danh sách UC chuẩn — xác nhận với PM xem có thuộc scope demo không.

### 8.1 Đăng ký xe của tôi
```
GET    /anpr/vehicle-registrations          (danh sách xe của tôi)
GET    /anpr/vehicle-registrations/:id       (chi tiết)
POST   /anpr/vehicle-registrations           (đăng ký, body: CreateVehicleRegistrationDto)
PATCH  /anpr/vehicle-registrations/:id        (sửa note/loại xe)
PATCH  /anpr/vehicle-registrations/:id/status (bật/tắt, body: { status })
DELETE /anpr/vehicle-registrations/:id        (xóa mềm, data: null)
```
**Layout:** bảng danh sách xe (biển số, loại, trạng thái) + form thêm/sửa + nút bật/tắt/xóa.

### 8.2 Admin đăng ký xe hộ nhân viên
```
POST /anpr/admin/vehicle-registrations   (body có thêm userId, permission anpr.vehicle.admin_register)
```

### 8.3 Lịch sử quét biển (dashboard)
```
GET /anpr/vehicle-history          (lịch sử xe của tôi)
GET /anpr/admin/vehicle-history     (toàn hệ thống — admin)
   query: ?page=1&limit=50&matchState=matched|unmatched
```
**Response item:** `{ plateNumber, channelId, matchState, eventTime, userId }`
**Layout:** bảng/thẻ lịch sử biển số, badge matched (xanh) / unmatched (cam), lọc theo trạng thái, auto-refresh. **Đã có demo** `anpr-dashboard.html`.

### 8.4 Biển lạ / chưa đăng ký (admin)
```
GET /anpr/admin/unknown-vehicles
```
**Layout:** danh sách biển số quét được nhưng chưa đăng ký.

---

## Ưu tiên build (đề xuất)

**P0 — Bắt buộc để demo luồng camera trọn vẹn:**
1. Đăng ký khuôn mặt (mục 1)
2. Điểm danh/hiện diện cuộc họp (mục 2)
3. Timeline vào/ra từng người (mục 3)

**P1 — Nên có:**
4. Tải báo cáo PDF (mục 4)
5. Dashboard điểm danh (mục 5)
6. ANPR: đăng ký xe + dashboard biển số (mục 8.1, 8.3) — nếu trong scope

**P2 — Tùy chọn / nếu còn thời gian:**
7. Gán camera → phòng (mục 6)
8. Quản lý thiết bị camera (mục 7)
9. ANPR biển lạ, admin (mục 8.2, 8.4)
10. Cảnh báo khuôn mặt lạ / nhắc chưa check-in (UC-APM-06/10/11)

---

## Cần BE bổ sung (FE chưa gọi được nếu thiếu)

Các điểm này hiện chưa có API, FE nên báo PM/BE để bổ sung trước khi build màn tương ứng:

1. **Lấy giờ họp (start/end/title)** để hiển thị trong màn điểm danh (mục 2). Đề xuất: thêm `meeting: { startTime, endTime, status }` vào response `/presence`. (Đã có guide: `BE-add-meeting-time-to-presence.md`.)
2. **Duyệt khuôn mặt** (PENDING→ACTIVE) cho admin (mục 1) — hiện duyệt bằng SQL tay.
3. **Danh sách người đã đăng ký khuôn mặt** (GET) để admin quản lý.
4. **API gán camera → phòng** (mục 6) — hiện set bằng SQL.
5. **Endpoint dashboard điểm danh tổng hợp** nhiều cuộc họp (mục 5).
6. **API quản lý thiết bị camera/IoT** (mục 7) — nếu cần làm đầy đủ.
7. **API danh sách cảnh báo** (khuôn mặt lạ, người chưa check-in) — UC-APM-06/10/11.

---

## Phụ lục — Tài liệu tham khảo có sẵn

- `checkin-checkout-demo.html` — demo màn điểm danh + timeline vào/ra (mục 2, 3). Tham chiếu logic gọi API + giao diện.
- `anpr-dashboard.html` — demo dashboard biển số (mục 8.3).
- `BE-add-meeting-time-to-presence.md` — guide bổ sung giờ họp vào API presence.
