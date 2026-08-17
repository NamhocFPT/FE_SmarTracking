# BE Required Endpoints — FE Analysis

## Missing: GET /analytics/attendance/on-time-rate/users

### Tại sao cần
FE dùng endpoint này ở 2 nơi:
- **Manager → Home** (`src/pages/manager/homePage.jsx`): bảng thống kê on-time rate theo từng nhân viên trong team
- **BusinessAdmin → EmployeeOnTimeAnalytics modal** (`src/pages/shared/EmployeeOnTimeAnalytics.jsx`): bảng tổng hợp on-time rate toàn bộ nhân viên, có thể lọc theo department

Endpoint gọi từ service: `src/service/sysAdminServices.js`
```js
export const getAttendanceUserStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate/users${query}`);
};
```

### Request

**Method:** GET  
**Path:** `/analytics/attendance/on-time-rate/users`

**Query params:**

| Param | Type | Mô tả |
|---|---|---|
| `from` | ISO date string | Ngày bắt đầu lọc (ví dụ: `2026-06-01T00:00:00.000Z`) |
| `to` | ISO date string | Ngày kết thúc lọc |
| `departmentId` | string (UUID) | Lọc theo phòng ban (tuỳ chọn) |
| `page` | number | Trang hiện tại (mặc định: 1) |
| `limit` | number | Số bản ghi mỗi trang (mặc định: 10) |

### Response

**HTTP 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "uuid-string",
        "fullName": "Nguyễn Văn A",
        "email": "nva@company.com",
        "departmentName": "Phòng Kỹ Thuật",
        "totalMeetings": 20,
        "onTimeCount": 17,
        "lateCount": 2,
        "absentCount": 1,
        "onTimeRate": 85.0
      }
    ]
  },
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Mô tả từng field trong `items[]`

| Field | Type | Mô tả |
|---|---|---|
| `userId` | string | UUID của user |
| `fullName` | string | Họ tên đầy đủ |
| `email` | string | Email |
| `departmentName` | string | Tên phòng ban (có thể null nếu chưa phân bổ) |
| `totalMeetings` | number | Tổng số meeting user tham gia trong khoảng thời gian |
| `onTimeCount` | number | Số lần đúng giờ |
| `lateCount` | number | Số lần đến muộn |
| `absentCount` | number | Số lần vắng mặt |
| `onTimeRate` | number | Tỷ lệ đúng giờ (%) = onTimeCount / totalMeetings × 100, làm tròn 1 chữ số thập phân |

### Cách FE dùng dữ liệu

```jsx
// EmployeeOnTimeAnalytics.jsx (simplified)
const res = await getAttendanceUserStats({ from, to, departmentId, page, limit });
if (res?.success) {
    setItems(res.data.items);
    setTotalPages(res.meta.totalPages);
    setTotal(res.meta.total);
}
```

Bảng render các cột: Họ tên, Email, Phòng ban, Tổng meetings, Đúng giờ, Đến muộn, Vắng, Tỷ lệ đúng giờ (%).

### Endpoint liên quan đã có

- `GET /analytics/attendance/on-time-rate` — tổng hợp toàn tổ chức (đã tồn tại ✓)
- `GET /analytics/attendance/on-time-rate/users/:userId/late-history` — lịch sử muộn của 1 user cụ thể (đã tồn tại ✓)

Endpoint này (`/users` không có `:userId`) là trang danh sách, cần thêm mới.
