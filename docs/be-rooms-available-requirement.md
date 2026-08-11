# Yêu cầu BE — GET /rooms/available (Tìm phòng trống theo khung giờ)

> **Ngày tạo:** 2026-08-12
> **Người yêu cầu:** FE Team
> **Mức độ:** 🔴 Cao — tính năng đặt lịch họp (BookMeeting) không lọc được phòng còn trống

---

## 1. Vấn đề hiện tại

`BookMeeting.jsx` (màn hình đặt lịch mới) cần hiển thị danh sách **phòng còn trống** trong khung giờ người dùng chọn. FE hiện đang gọi:

```
GET /rooms/available?startTime=...&endTime=...&minCapacity=...
```

**Route này không tồn tại trên BE** — mọi lần gọi nhận về **404**. FE đã tạm fallback sang `GET /rooms/search?minCapacity=X` để tránh lỗi trắng màn hình, nhưng cách này **không lọc được phòng đã bị đặt** trong khung giờ đó.

---

## 2. Endpoint yêu cầu

```
GET /api/v1/rooms/available
```

### Query params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `startTime` | string (ISO8601) | ✅ | Thời gian bắt đầu cần đặt |
| `endTime` | string (ISO8601) | ✅ | Thời gian kết thúc cần đặt |
| `minCapacity` | number | Không | Sức chứa tối thiểu; nếu không truyền thì trả tất cả phòng còn trống |

### Response shape mong đợi

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Phòng họp A",
      "capacity": 10,
      "location": "Tầng 3",
      "allowRecording": true
    }
  ]
}
```

> Nếu BE dùng shape khác (ví dụ `rooms[]` thay vì `data[]`, hoặc có thêm trường `pagination`) vui lòng thông báo để FE cập nhật parser.

---

## 3. Logic lọc (phía BE)

Loại ra khỏi kết quả tất cả phòng có ít nhất 1 meeting **đang hoạt động** (không phải `cancelled`) với:
- `reservedStartTime < endTime` **VÀ** `reservedEndTime > startTime`

(Tức là bất kỳ meeting nào overlap với khung giờ được yêu cầu.)

---

## 4. Phương án thay thế (nếu không muốn tạo route mới)

Nếu BE không muốn tạo route `/rooms/available` riêng, có thể mở rộng `GET /rooms/search` để nhận thêm 2 param:

| Param | Kiểu | Mô tả |
|---|---|---|
| `startTime` | string (ISO8601) | Nếu truyền, chỉ trả phòng không có conflict |
| `endTime` | string (ISO8601) | Phải đi kèm `startTime` |

FE sẽ cập nhật theo bất kỳ convention nào BE chọn — chỉ cần thông báo tên param và endpoint chính xác.

---

## 5. So sánh với endpoint liên quan đã có

| Endpoint | Use case | Trạng thái |
|---|---|---|
| `GET /rooms/search` | Lấy toàn bộ phòng (không lọc conflict) | ✅ Có |
| `GET /meetings/:id/available-rooms` | Tìm phòng thay thế cho **cuộc họp đã tồn tại** | ✅ Có |
| `GET /rooms/available` | Tìm phòng trống cho **cuộc đặt mới** (không có meetingId) | ❌ **Chưa có — cần tạo** |

---

## 6. Tác động khi chưa có endpoint

- Người dùng nhập khung giờ, bấm "Tìm phòng" → thấy **tất cả phòng** (kể cả đã bị đặt)
- Người dùng chọn phòng đã bị đặt → bấm "Đặt lịch" → `POST /meetings` từ chối → hiện lỗi
- Trải nghiệm kém: không có gợi ý chủ động phòng nào còn trống trước khi thử đặt
