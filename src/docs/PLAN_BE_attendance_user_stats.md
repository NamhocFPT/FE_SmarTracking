# BE Plan — Endpoint: Thống kê đúng giờ theo nhân sự

**Module:** Analytics · Attendance  
**Ngày:** 2026-08-12  
**Liên quan FE:** `src/pages/shared/EmployeeOnTimeAnalytics.jsx`

---

## 1. Bối cảnh

Trang Phân tích Tỷ lệ Đúng giờ hiện chỉ trả dữ liệu tổng hợp theo phòng ban (`lateByDepartment[]`).  
Cần bổ sung endpoint mới để FE có thể:

- **Manager** → xem danh sách nhân sự đi muộn trong phòng ban mình quản lý (có phân trang)
- **Business Admin** → click vào một phòng ban → xem danh sách nhân sự đi muộn của phòng đó (modal, có phân trang)

---

## 2. Endpoint mới

### `GET /api/v1/analytics/attendance/on-time-rate/users`

#### Query Params

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `preset` | `string` | Không | `day` \| `week` \| `month` — mặc định `month` |
| `from` | `date` | Không | ISO date, dùng khi `preset=custom` |
| `to` | `date` | Không | ISO date, dùng khi `preset=custom` |
| `departmentId` | `string (UUID)` | Không* | *Bắt buộc đối với MANAGER (inject từ JWT). Business Admin tuỳ chọn. |
| `page` | `number` | Không | Trang hiện tại, mặc định `1` |
| `limit` | `number` | Không | Số bản ghi/trang, mặc định `10`, tối đa `50` |
| `sortBy` | `string` | Không | `lateRate` (default, desc) \| `lateCount` \| `fullName` |

#### Response Body

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "uuid",
        "fullName": "Nguyễn Văn A",
        "email": "a@company.com",
        "avatarUrl": "https://..." ,
        "employeeCode": "EMP0012",
        "departmentId": "uuid",
        "departmentName": "Phòng Nhân sự",
        "lateCount": 3,
        "onTimeCount": 14,
        "absentCount": 1,
        "totalRequired": 18,
        "lateRate": 16.7
      }
    ],
    "total": 24,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Ghi chú field

| Field | Kiểu | Mô tả |
|---|---|---|
| `userId` | `string` | UUID user |
| `fullName` | `string` | Họ tên đầy đủ |
| `email` | `string` | Email công ty |
| `avatarUrl` | `string \| null` | URL ảnh đại diện, `null` nếu chưa có |
| `employeeCode` | `string` | Mã nhân viên, ví dụ `EMP0012` |
| `departmentId` | `string` | UUID phòng ban |
| `departmentName` | `string` | Tên phòng ban (để Business Admin hiển thị trong modal) |
| `lateCount` | `number` | Số lượt đi muộn trong kỳ |
| `onTimeCount` | `number` | Số lượt đúng giờ |
| `absentCount` | `number` | Số lượt vắng mặt |
| `totalRequired` | `number` | Tổng số lượt tham dự bắt buộc |
| `lateRate` | `number` | Tỷ lệ đi muộn (%), làm tròn 1 chữ số thập phân |

---

## 3. Phân quyền (Authorization Guard)

| Role | Hành vi |
|---|---|
| `MANAGER` | BE **tự inject** `departmentId` từ JWT claim của manager — FE có thể truyền hoặc không, nhưng BE luôn override bằng phòng ban của manager từ token. Nếu FE truyền `departmentId` khác với phòng ban của manager → trả `403 Forbidden`. |
| `BUSINESS_ADMIN` | `departmentId` tuỳ chọn. Không truyền → trả tất cả nhân sự toàn công ty (có phân trang). Truyền → lọc theo phòng ban đó. |
| `SYSTEM_ADMIN` | Như `BUSINESS_ADMIN`, không giới hạn. |
| `EMPLOYEE` | Không có quyền truy cập → `403`. |

---

## 4. Logic tính toán

- **Kỳ tính:** dựa vào `preset` hoặc khoảng `from`–`to`, giống logic endpoint hiện có `GET /analytics/attendance/on-time-rate`.
- **Nguồn dữ liệu:** bảng attendance records, lọc các meeting có `isRequired = true` hoặc participant được đánh dấu bắt buộc tham dự.
- **`lateRate`** = `lateCount / totalRequired * 100`, làm tròn 1 chữ số.
- **Sort mặc định:** `lateRate DESC` (nhân sự đi muộn nhiều nhất lên đầu).
- **`avatarUrl`:** join với bảng user profiles để lấy URL ảnh đại diện.

---

## 5. Error Responses

| HTTP Code | Trường hợp |
|---|---|
| `400 Bad Request` | `from` sau `to`, `limit` > 50, `preset` không hợp lệ |
| `403 Forbidden` | MANAGER gọi `departmentId` không phải phòng của họ; EMPLOYEE truy cập |
| `404 Not Found` | `departmentId` không tồn tại trong hệ thống |

---

## 6. Checklist BE

- [ ] Tạo controller method cho `GET /analytics/attendance/on-time-rate/users`
- [ ] Tạo `UserLateStatsDto` với đủ các field trên
- [ ] Implement phân trang (`page`, `limit`, `total`, `totalPages`)
- [ ] Implement `sortBy`: `lateRate` (default desc), `lateCount`, `fullName`
- [ ] Guard: inject `departmentId` từ JWT cho MANAGER, trả `403` nếu sai phòng
- [ ] Join với bảng user profiles để lấy `avatarUrl`, `employeeCode`
- [ ] Unit test: MANAGER gọi đúng phòng → 200; MANAGER gọi sai phòng → 403
- [ ] Swagger/OpenAPI: document đầy đủ params và response schema
