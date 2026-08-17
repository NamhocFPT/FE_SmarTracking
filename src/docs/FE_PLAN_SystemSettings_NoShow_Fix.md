# FE PLAN — Sửa lỗi cấu hình No-show / Early-vacancy tại `SystemSettings.jsx`

> Bối cảnh: user báo lỗi thật khi lưu tab "Quy tắc không gian" tại `/system-admin/settings`:
> `no_show.threshold_minutes must be an integer >= 1.` Đã đối chiếu trực tiếp source thật của BE
> (`no-show-config.controller.ts`, `no-show-config.service.ts`, `early-vacancy-config.*`,
> `system-config-allowlist.ts`, `system-config.service.ts`, `channel-map-config.*`) với
> `SystemSettings.jsx` + `sysAdminServices.js` trong phiên này (2026-08-06). Không có API mới nào
> được giả định — toàn bộ field/kiểu dữ liệu dưới đây lấy trực tiếp từ code BE thật.

**Thứ tự thực hiện đề xuất:** 1 (bug NaN) → 2 (thiếu input) → 3 (mock data) → 4 (validate sai) →
5 (max input sai) → 6 (default cosmetic) → chờ quyết định mục "Cần hỏi trước khi code" trước khi
đụng vào Section B.

---

## 1 · [CRITICAL] Bug NaN khi lưu no-show config — nguyên nhân trực tiếp lỗi trong ảnh chụp

**Xác nhận root cause:** `GET /no-show-config` trả `data` dạng lồng object:
```json
{ "thresholdMinutes": { "value": 15, "source": "default" }, "warningGraceMinutes": {...}, "autoReleaseGraceMinutes": {...} }
```
(xem `no-show-config.service.ts` hàm `getAll()`).

`fetchConfigs()` tại `SystemSettings.jsx:88-91` gán thẳng cả object vào state, không lấy `.value`:
```js
merged.thresholdMinutes = noShowRes.data.thresholdMinutes ?? merged.thresholdMinutes;
```
→ `configs.thresholdMinutes` là object `{value, source}`, không phải number. Vì **không có input nào** bind
vào `thresholdMinutes` trong UI, giá trị lỗi này tồn tại vĩnh viễn.

Khi lưu (dù chỉ đổi `warningGraceMinutes` hoặc `autoReleaseGraceMinutes`), `handleSubmit`
(`SystemSettings.jsx:320-327`) luôn gửi cả 3 field cùng lúc:
```js
updateNoShowConfig({
  thresholdMinutes: Number(configs.thresholdMinutes), // Number({value,source}) === NaN
  ...
});
```
`NaN` → `JSON.stringify` → `null` → BE nhận `null`, fail `Min(1)` → đúng message
`"no_show.threshold_minutes must be an integer >= 1."` trong ảnh chụp. **Lỗi này xảy ra 100% mỗi
lần lưu tab "Quy tắc không gian" một khi đã load qua API thật.**

**Cách sửa:**
- Unwrap `.value` khi map response: `merged.thresholdMinutes = noShowRes.data.thresholdMinutes?.value ?? merged.thresholdMinutes;` (tương tự cho `warningGraceMinutes`, `autoReleaseGraceMinutes`).
- Giữ `Number(...)` khi build payload lúc submit (an toàn cho input dạng string), nhưng giờ input đã là number thật nên không còn NaN.

**Test:** sửa `warningGraceMinutes` từ 2→5 phút, bấm Lưu → không còn banner đỏ, F5 lại trang thấy giá trị 5 được giữ.

---

## 2 · [CRITICAL] Thiếu input cho `thresholdMinutes` — ngưỡng no-show chính (BR-NS-03/UC-RUM-14)

JSDoc đầu file ghi rõ "UC-RUM-14: Cập nhật cấu hình ngưỡng thời gian chờ no-show", nhưng UI hiện tại
(Section A, `SystemSettings.jsx:534-594`) chỉ có 2 input: "Thời gian ân hạn (Grace Period)"
(`warningGraceMinutes`) và "Thời gian chờ phản hồi" (`autoReleaseGraceMinutes`). **Không có input nào
cho `thresholdMinutes`** — chính là ngưỡng no-show gốc (BE: `no_show.threshold_minutes`, min 1 – max
1440, default 15, mô tả BE: "Số phút chờ trước khi đánh dấu no-show").

**Cách sửa:** thêm 1 ô input "Ngưỡng thời gian chờ No-show" (phút) vào Section A, cùng grid với 2 ô
hiện có, bind vào `configs.thresholdMinutes`, `min={1} max={1440}`.

**Test:** đổi giá trị, lưu, F5 lại — giá trị được giữ và phản ánh đúng ngưỡng no-show thật của BE.

---

## 3 · [CRITICAL] Xóa toàn bộ mock data (yêu cầu tường minh từ user)

`fetchConfigs()` catch block (`SystemSettings.jsx:158-173`) khi API lỗi sẽ âm thầm gán `mockDb`
hardcode và coi như tải thành công (không set `error`, không có nút thử lại) — vi phạm
`src/docs/AGENTS.md` mục API RULES ("Không hardcode dữ liệu nếu API đã tồn tại", "Không giả lập
API") và mục UI QUALITY RULES ("Error State: Nguyên nhân, Hành động khắc phục, Nút thử lại").

Tương tự, các `.catch(() => ({ success: true, data: [] }))` gắn vào `getChannelMaps()`,
`getRooms()`, `getNoShowConfig()` trong `Promise.all` (`SystemSettings.jsx:65-70`) đang biến lỗi
thật thành "thành công rỗng" một cách âm thầm.

**Cách sửa:**
- Xóa hoàn toàn khối `mockDb` trong catch của `fetchConfigs`. Thay bằng `setError(...)` với thông
  điệp tiếng Việt rõ nguyên nhân, và render Error State chuẩn (banner đỏ đã có sẵn + nút "Thử lại"
  gọi lại `fetchConfigs()`).
- Bỏ các `.catch(() => ({success:true, data:[]}))` — thay bằng cờ lỗi riêng cho từng phần
  (channel maps / rooms / no-show) để 1 phần lỗi không làm sập toàn trang, nhưng vẫn hiển thị đúng
  banner lỗi cho phần đó thay vì giả vờ rỗng/thành công.

**Test:** tắt mạng / chặn 1 endpoint bất kỳ (DevTools) → phải thấy banner lỗi thật với nút thử lại,
không được thấy trang tải xong với dữ liệu mặc định như không có gì xảy ra.

---

## 4 · Validate client chặn nhầm giá trị hợp lệ

`validateConfigs()` (`SystemSettings.jsx:209`) chặn `warningGraceMinutes <= 0`, nhưng BE
(`UpdateNoShowConfigDto`) cho phép `Min(0)` — tức 0 phút là giá trị hợp lệ theo BE.

**Cách sửa:** đổi điều kiện chặn `warningGraceMinutes` thành `< 0` (cho phép 0), giữ nguyên `<= 0`
cho `thresholdMinutes` và `autoReleaseGraceMinutes` (BE yêu cầu `Min(1)` cho 2 field này).

---

## 5 · Thuộc tính `max` trên input hẹp hơn giới hạn BE thật cho phép

| Input (state key) | FE `max` hiện tại | BE min–max thật |
|---|---|---|
| `warningGraceMinutes` | 60 | 0–1440 (`no-show-config` DTO) |
| `autoReleaseGraceMinutes` | 60 | 1–1440 |
| `early_departure_threshold_minutes` | 60 | 1–120 (allowlist) |
| `recording_retention_days` | 365 | 1–3650 (allowlist) |
| `overrun_grace_minutes` | 60 | 1–120 (allowlist) |

**Cách sửa:** cập nhật `max` (và `min` nếu cần) khớp đúng bảng trên để không chặn nhầm giá trị BE
đã hỗ trợ.

---

## 6 · [Cosmetic] Default tạm thời của 2 ngưỡng camera lệch với default code BE

State khởi tạo `channelMaps` (`SystemSettings.jsx:48-49`) đặt
`'ivss.presence.gap_threshold_seconds': 30` và `'campus.journey.gap_threshold_seconds': 60`, trong
khi default code thật của BE là `120` và `600` (theo comment trong
`channel-map-config.constant.ts`). Chỉ hiển thị sai trong khoảnh khắc trước khi fetch xong nên mức
độ thấp, nhưng nên sửa cho nhất quán.

---

## ⚠️ Cần quyết định nghiệp vụ trước khi code (không tự suy diễn theo AGENTS.md)

Section B "Chính sách kết thúc và trả phòng sớm (Early Departure)" mô tả dùng "cảm biến IoT đếm
hiện diện", nhưng thực tế đang lưu qua 3 key allowlist chung (`is_early_release_enabled`,
`early_departure_threshold_minutes`, `is_host_warning_enabled` — endpoint `/system-configurations`),
**không hề gọi** endpoint sensor thật `GET/PUT /early-vacancy-config`
(`emptyMinutes`, `minRemainingMinutes`, `minElapsedMinutes`) dù hàm `getEarlyVacancyConfig` /
`updateEarlyVacancyConfig` đã có sẵn trong `sysAdminServices.js:560-567` nhưng chưa từng được gọi ở
đâu.

Cần xác nhận với PO/BE: Section B nên bind vào `/early-vacancy-config` (đúng tính năng sensor thật),
hay giữ nguyên 3 key allowlist hiện tại và chỉ cần sửa lại copy mô tả cho đúng thực tế? Việc này ảnh
hưởng trực tiếp đến business logic hiển thị, không tự quyết định.
