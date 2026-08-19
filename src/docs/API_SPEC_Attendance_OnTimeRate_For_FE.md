# API Spec — Attendance On-Time Rate Analytics (cho FE)

**Author**: BE (đối chiếu code thực tế `src/modules/analytics`)
**Date**: 2026-08-11
**Mục đích**: Tài liệu này mô tả ĐÚNG contract mà BE đang trả về (không phải spec dự kiến), dùng để FE sửa lại `EmployeeOnTimeAnalytics.jsx` — trang này hiện đang đọc sai field (`data.summary`, `data.users`) không tồn tại trong response thật, dẫn đến trang trông "rỗng" dù API có data.

---

## 1. Auth & phân quyền

Tất cả 2 endpoint dưới đây dùng chung:
- `JwtAuthGuard` + `PermissionsGuard`
- Permission bắt buộc: **`analytics.attendance.read`**
- Role đang có permission này: `MANAGER`, `BUSINESS_ADMIN`, `SYSTEM_ADMIN`

### Quy tắc scope theo role (áp dụng ở BE, FE không cần tự lọc)

| Role | Phạm vi dữ liệu thấy được |
|---|---|
| `SYSTEM_ADMIN` | Toàn bộ công ty, mọi phòng ban |
| `BUSINESS_ADMIN` | Toàn bộ công ty, mọi phòng ban |
| `MANAGER` | **Chỉ** những phòng ban mà `departments.manager_user_id` trỏ đúng về user này (không phải phòng ban mà manager trực thuộc). Nếu manager không được gán quản lý phòng ban nào → BE trả response "rỗng có chủ đích" (200 OK, toàn bộ số liệu = 0), không phải lỗi. |

Nếu MANAGER truyền `departmentId` nằm ngoài phạm vi quản lý → BE trả **403 `DEPARTMENT_OUT_OF_SCOPE`**.

---

## 2. API chính — Thống kê tỷ lệ đúng giờ

```
GET /api/v1/analytics/attendance/on-time-rate
```

### Query Parameters

| Param | Type | Required | Default | Ghi chú |
|---|---|---|---|---|
| `preset` | enum: `day`\|`week`\|`month`\|`quarter`\|`custom` | No | `month` | Khoảng thời gian nhanh |
| `from` | ISO date `YYYY-MM-DD` | Chỉ khi `preset=custom` | — | |
| `to` | ISO date `YYYY-MM-DD` | Chỉ khi `preset=custom` | — | Phải `>= from` |
| `departmentId` | UUID v4 | No | — | Lọc theo phòng ban. Với MANAGER phải nằm trong scope, ngoài scope → 403 |
| `meetingId` | UUID v4 | No | — | Lọc theo 1 cuộc họp cụ thể |
| `search` | string, max 150 ký tự | No | — | Tìm theo `full_name`/`email`/`employee_code` (ILIKE) |
| `graceMinutes` | integer >= 0 | No | `0` | Số phút ân hạn trước khi tính là "đi muộn" |

**Giới hạn khoảng ngày**: `to - from` không được vượt `analytics.dashboard_max_range_days` (system_configs, mặc định **366 ngày**) → vượt quá trả **400 `DATE_RANGE_TOO_LARGE`**.

### Response — 200 OK

Envelope chuẩn toàn hệ thống:
```json
{
  "success": true,
  "message": "Thống kê tỷ lệ tham dự đúng giờ được truy xuất thành công",
  "data": { /* xem schema bên dưới */ },
  "meta": {}
}
```

### Schema của `data` (⚠️ KHÔNG có `summary`, KHÔNG có `users` — đây là field FE hiện đang đọc sai)

```ts
{
  period: { from: string; to: string };   // "YYYY-MM-DD"
  graceMinutes: number;

  onTimeCount: number;                    // tổng lượt đúng giờ trong kỳ
  lateCount: number;                      // tổng lượt đi muộn
  absentCount: number;                    // tổng lượt vắng mặt (không check-in / không present)
  totalRequiredParticipants: number;      // tổng lượt tham dự bắt buộc (mẫu số)
  onTimeRate: number;                     // % đúng giờ, làm tròn 1 chữ số thập phân (vd 82.5)

  trend: Array<{                          // xu hướng theo TUẦN (Monday-start), phủ hết các tuần trong [from, to]
    period: string;                       // ngày Thứ Hai của tuần, "YYYY-MM-DD"
    onTimeCount: number;
    lateCount: number;
    absentCount: number;
    totalRequiredParticipants: number;
    onTimeRate: number;
  }>;

  lateByHourOfDay: Array<{                // luôn đủ 24 phần tử (giờ 0-23, theo giờ VN)
    hourOfDay: number;                    // 0-23
    lateCount: number;
    totalRequiredParticipants: number;
    lateRate: number;
  }>;

  lateByDepartment: Array<{               // sắp xếp giảm dần theo lateRate
    departmentId: string;
    departmentName: string;
    lateCount: number;
    totalRequiredParticipants: number;
    lateRate: number;
  }>;

  message?: string;                       // chỉ có khi rỗng, vd "Không tìm thấy dữ liệu điểm danh hợp lệ..."
}
```

**KHÔNG có breakdown theo từng nhân viên** (kiểu bảng "mỗi dòng 1 user" mà FE hiện đang render qua `data.users`). Nếu FE cần bảng này, đây là gap ở BE cần bổ sung thêm — chưa có sẵn.

### Ví dụ response thật (đối chiếu DB production, tháng 8/2026, role BUSINESS_ADMIN, không lọc phòng ban)

```json
{
  "success": true,
  "message": "Thống kê tỷ lệ tham dự đúng giờ được truy xuất thành công",
  "data": {
    "period": { "from": "2026-08-01", "to": "2026-08-31" },
    "graceMinutes": 0,
    "onTimeCount": 0,
    "lateCount": 0,
    "absentCount": 181,
    "totalRequiredParticipants": 181,
    "onTimeRate": 0,
    "trend": [
      { "period": "2026-07-27", "onTimeCount": 0, "lateCount": 0, "absentCount": 40, "totalRequiredParticipants": 40, "onTimeRate": 0 }
    ],
    "lateByHourOfDay": [
      { "hourOfDay": 0, "lateCount": 0, "totalRequiredParticipants": 0, "lateRate": 0 }
    ],
    "lateByDepartment": [
      { "departmentId": "7fc9adc5-...", "departmentName": "Phong Cong nghe thong tin", "lateCount": 0, "totalRequiredParticipants": 30, "lateRate": 0 }
    ]
  },
  "meta": {}
}
```
*(mảng `trend`/`lateByHourOfDay`/`lateByDepartment` rút gọn để minh hoạ, thực tế đủ phần tử theo mô tả schema)*

### Response rỗng (khi không có dữ liệu / manager không quản lý phòng ban nào)

```json
{
  "success": true,
  "message": "Không tìm thấy dữ liệu điểm danh hợp lệ cho các điều kiện lọc được chọn.",
  "data": {
    "period": { "from": "2026-08-01", "to": "2026-08-31" },
    "graceMinutes": 0,
    "onTimeCount": 0, "lateCount": 0, "absentCount": 0, "totalRequiredParticipants": 0, "onTimeRate": 0,
    "trend": [ /* toàn 0, đủ số tuần */ ],
    "lateByHourOfDay": [ /* toàn 0, đủ 24 giờ */ ],
    "lateByDepartment": [],
    "message": "Không tìm thấy dữ liệu điểm danh hợp lệ cho các điều kiện lọc được chọn."
  },
  "meta": {}
}
```

### Error responses

| Status | Code | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | DTO validate fail, hoặc `preset=custom` thiếu `from`/`to`, hoặc `from > to` |
| 400 | `DATE_RANGE_TOO_LARGE` | Khoảng ngày vượt `maxRangeDays` (kèm `error.details.maxDays`) |
| 401 | — | Chưa đăng nhập / token hết hạn |
| 403 | `PERMISSION_DENIED` | Role không có permission `analytics.attendance.read` |
| 403 | `DEPARTMENT_OUT_OF_SCOPE` | MANAGER truyền `departmentId` ngoài phạm vi quản lý |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống |

---

## 3. API phụ — Lịch sử đi muộn của 1 nhân viên (drilldown)

```
GET /api/v1/analytics/attendance/on-time-rate/users/:userId/late-history
```

### Path param
- `userId`: UUID (ParseUUIDPipe — sai format → 400 tự động từ Nest, không có body chuẩn hóa)

### Query Parameters
Giống hệt API 1 nhưng **không có** `departmentId`/`meetingId`/`search`: `preset`, `from`, `to`, `graceMinutes`.

### Response — 200 OK

```ts
{
  success: true,
  message: "Lịch sử đi muộn của nhân sự được truy xuất thành công",
  data: {
    user: { userId: string; fullName: string; email: string };
    period: { from: string; to: string };
    lateMeetings: Array<{              // ⚠️ tên field là "lateMeetings", KHÔNG phải "meetings"
      meetingId: string;
      meetingTitle: string;            // ⚠️ KHÔNG phải "title"
      scheduledStartTime: string;      // ISO datetime — ⚠️ KHÔNG phải "startTime"
      checkInTime: string;             // ISO datetime
      lateMinutes: number;
    }>;
  },
  meta: {}
}
```

Trang FE hiện đọc `lateHistory.meetings[].title/startTime` — **sai cả tên mảng lẫn tên field con**, cần sửa thành `lateHistory.lateMeetings[].meetingTitle/scheduledStartTime`.

### Error responses

| Status | Code | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Tương tự API 1 |
| 401 | — | Chưa đăng nhập |
| 403 | `USER_OUT_OF_SCOPE` | MANAGER xem user ngoài phòng ban mình quản lý |
| 404 | `USER_NOT_FOUND` | `userId` không tồn tại |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống |

---

## 4. API hỗ trợ — Danh sách phòng ban (để build dropdown filter)

```
GET /api/v1/departments
```

Đã sẵn có, FE đã có hàm gọi (`sysAdminServices.js`, `businessAdminServices.js`, `managerServices.js` đều có, xem `get('/departments'+query)`). Permission `department.read` — cả `MANAGER`/`BUSINESS_ADMIN`/`SYSTEM_ADMIN` đều có.

### Query: `page`, `limit` (mặc định 20, max 100 — công ty hiện có 7 phòng ban nên 1 trang là đủ), `search`, `parentId`

### Response `data[]` item:
```ts
{
  id: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId: string | null;
  managerUserId: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Lưu ý quan trọng**: endpoint này trả **TẤT CẢ** phòng ban, không tự lọc theo scope của người gọi. Nếu FE dùng nó để build dropdown cho MANAGER, dropdown sẽ hiện đủ 7 phòng ban dù MANAGER chỉ được xem 1 phòng — chọn phòng ngoài scope sẽ bị API chính (mục 2) trả 403. FE nên tự ẩn bớt lựa chọn cho MANAGER (ví dụ: chỉ hiện phòng ban họ quản lý) để tránh trải nghiệm click-rồi-lỗi.

---

## 5. Gaps đã biết (không phải lỗi code, cần xử lý riêng)

1. **Dữ liệu**: 4/7 phòng ban trong DB hiện chưa có `manager_user_id` (Đối tác, Hành chính-Lễ tân, Vận hành-CSVC + 1 phòng khác). Nếu gán role MANAGER cho ai đó ở các phòng này mà quên set `manager_user_id` trên bảng `departments`, người đó sẽ luôn thấy trang rỗng dù có quyền.
2. **Không có breakdown theo từng nhân viên** ở API 1 — nếu FE cần bảng "mỗi dòng 1 nhân viên kèm tỷ lệ đúng giờ", cần đề xuất bổ sung endpoint/field riêng ở BE.
