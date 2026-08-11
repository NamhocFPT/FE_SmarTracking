# Yêu cầu BE — Bổ sung trường dữ liệu cho Analytics Phòng họp

> **Ngày tạo:** 2026-08-11  
> **Người yêu cầu:** FE Team  
> **Mức độ:** 🟡 Trung bình — các chart mới cần thêm dữ liệu từ BE

---

## 1. `GET /analytics/rooms/dashboard`

### 1.1 `trend[]` luôn trả về mảng rỗng

**Vấn đề:** Trường `trend[]` hiện luôn là `[]`, khiến biểu đồ xu hướng đặt phòng không hiển thị được dữ liệu gì.

**Yêu cầu:** BE trả về mảng dữ liệu theo ngày (hoặc theo granularity), mỗi phần tử có đầy đủ:

```json
"trend": [
  { "date": "2026-08-01", "meetingCount": 8, "bookedHours": 12.5, "utilizationRate": 65.0 },
  { "date": "2026-08-02", "meetingCount": 11, "bookedHours": 18.0, "utilizationRate": 75.0 }
]
```

**Trường mới cần thêm vào mỗi phần tử trend:**
| Trường | Kiểu | Mô tả |
|---|---|---|
| `bookedHours` | number | Tổng số giờ đặt phòng trong ngày/tuần/tháng đó |
| `utilizationRate` | number (%) | Tỷ lệ sử dụng (bookedHours / availableHours × 100) |

---

### 1.2 `rooms[]` — thiếu 2 chỉ số riêng biệt

**Vấn đề:** Mỗi phòng trong `rooms[]` hiện chỉ có `utilizationRate` chung, nhưng FE cần phân biệt 2 chỉ số khác nhau:
- `reservationUtilizationRate` — Tỷ lệ đặt phòng (số giờ đặt / giờ mở cửa)
- `roomOccupancyRate` — Tỷ lệ lấp đầy thực tế (từ cảm biến hiện diện)

**Yêu cầu:** Mỗi phần tử trong `rooms[]` cần trả về:

```json
{
  "roomId": "uuid",
  "roomName": "Phòng 101",
  "bookedHours": 45.0,
  "actualHours": 33.75,
  "reservationUtilizationRate": 75.0,
  "roomOccupancyRate": 56.3
}
```

**Trường mới cần thêm:**
| Trường | Kiểu | Mô tả |
|---|---|---|
| `reservationUtilizationRate` | number (%) | Giờ đặt / giờ mở cửa × 100 |
| `roomOccupancyRate` | number \| null (%) | Từ cảm biến IVSS; null nếu phòng không có camera/cảm biến |

---

## 2. `GET /analytics/rooms/:roomId/detail`

### 2.1 `meetings[]` — thiếu thống kê per-meeting

**Vấn đề:** Danh sách cuộc họp trong drilldown modal không có số liệu về người tham dự và no-show, không thể đánh giá chất lượng từng cuộc họp.

**Yêu cầu:** Mỗi phần tử `meetings[]` cần thêm:

```json
{
  "meetingId": "uuid",
  "title": "Họp Sprint",
  "organizerName": "Nguyễn Văn A",
  "status": "completed",
  "attendeeCount": 8,
  "noShowCount": 2,
  "reservedStartTime": "2026-08-01T09:00:00+07:00",
  "reservedEndTime": "2026-08-01T10:30:00+07:00",
  "actualStartTime": "2026-08-01T09:05:00+07:00",
  "actualEndTime": "2026-08-01T10:25:00+07:00"
}
```

**Trường mới cần thêm:**
| Trường | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `completed`, `cancelled`, `no_show`, `in_progress` |
| `attendeeCount` | number | Số người thực sự tham dự (có mặt) |
| `noShowCount` | number | Số người đặt phòng nhưng vắng mặt |

---

## 3. `GET /analytics/rooms/no-show-rate`

### 3.1 `trend[]` luôn rỗng

**Vấn đề:** Giống với `dashboard`, trường `trend[]` trong no-show-rate cũng luôn trả về `[]`.

**Yêu cầu:** Mảng `trend[]` cần trả về dữ liệu theo kỳ:

```json
"trend": [
  { "date": "2026-08-01", "noShowCount": 3, "totalBookings": 15, "noShowRate": 20.0 },
  { "date": "2026-08-02", "noShowCount": 1, "totalBookings": 12, "noShowRate": 8.3 }
]
```

---

## 4. `GET /analytics/rooms/utilization-rate`

### 4.1 Thiếu `noShowRate` và `availableHours` trong response

**Yêu cầu bổ sung vào response:**

```json
{
  "utilizationRate": 68.5,
  "bookedHours": 520.5,
  "actualUsedHours": 390.2,
  "availableHours": 760.0,
  "noShowRate": 7.2
}
```

| Trường | Kiểu | Mô tả |
|---|---|---|
| `availableHours` | number | Tổng giờ mở cửa của tất cả phòng trong kỳ |
| `noShowRate` | number (%) | Tỷ lệ đặt phòng nhưng không sử dụng trong kỳ |

---

## 5. Tóm tắt Action Items

| # | Endpoint | Thay đổi | Phụ trách | Ưu tiên |
|---|---|---|---|---|
| 1 | `GET /analytics/rooms/dashboard` | Thêm `bookedHours`, `utilizationRate` vào mỗi phần tử `trend[]` | BE | 🔴 Cao |
| 2 | `GET /analytics/rooms/dashboard` | Thêm `reservationUtilizationRate`, `roomOccupancyRate` vào `rooms[]` | BE | 🔴 Cao |
| 3 | `GET /analytics/rooms/:roomId/detail` | Thêm `status`, `attendeeCount`, `noShowCount` vào `meetings[]` | BE | 🟡 Trung bình |
| 4 | `GET /analytics/rooms/no-show-rate` | Populate `trend[]` với `{ date, noShowCount, totalBookings, noShowRate }` | BE | 🟡 Trung bình |
| 5 | `GET /analytics/rooms/utilization-rate` | Thêm `noShowRate`, `availableHours` vào response | BE | 🟢 Thấp |

---

## 6. Ghi chú FE

- FE hiện đã gọi các endpoint `no-show-rate` và `utilization-rate` và xử lý `byRoom[]` ranking.
- Các chart mới sẽ sử dụng dữ liệu từ `byRoom[]` (noShowRate per phòng) để vẽ bar chart xếp hạng phòng có tỷ lệ vắng mặt cao nhất.
- Khi BE populate `trend[]`, chart xu hướng đặt phòng sẽ tự động hiển thị mà không cần sửa FE thêm.
