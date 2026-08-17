# BE Plan — Thống kê chuyên cần cá nhân (Employee Personal Stats)

**Module:** Analytics · Attendance  
**Ngày:** 2026-08-13  
**Liên quan FE:** `src/pages/employee/homePage.jsx` — tab "Thống kê" hiện đang trả placeholder  
**Liên quan plan cùng module:** `src/docs/PLAN_BE_attendance_user_stats.md` (endpoint cho Manager/Admin xem theo người)

---

## 0. TL;DR

Tab "Thống kê" trên trang chủ nhân viên hiện hiện placeholder cứng vì không có endpoint nào trả dữ liệu chuyên cần của **chính người dùng đang đăng nhập**. Cần thêm:

| # | Endpoint | Mô tả |
|---|---|---|
| 1 | `GET /analytics/attendance/on-time-rate/me` | Tổng hợp cá nhân: tỷ lệ đúng giờ, đi muộn, vắng mặt + trend |
| 2 | *(có sẵn)* `GET /analytics/attendance/on-time-rate/users/:userId/late-history` | Danh sách các lần đi muộn cụ thể — đã tồn tại, FE đang dùng ở `EmployeeOnTimeAnalytics.jsx` |

Endpoint #2 đã tồn tại và hoạt động — không cần sửa. Chỉ cần implement endpoint #1.

---

## 1. Bối cảnh & Lý do cần thiết

### Hiện tại
- `GET /analytics/attendance/on-time-rate` → tổng hợp **toàn tổ chức** (admin/manager dùng)
- `GET /analytics/attendance/on-time-rate/users` → danh sách **tất cả nhân viên** (admin/manager dùng, plan riêng)
- `GET /analytics/attendance/on-time-rate/users/:userId/late-history` → lịch sử muộn **của 1 user** (yêu cầu quyền cao hơn employee)

### Khoảng trống
Không có endpoint nào cho phép **employee tự xem thống kê chuyên cần của mình** mà không cần `userId` cụ thể hay quyền admin. Nhân viên phải dùng `userId` của chính họ để gọi endpoint dành cho manager — sai về thiết kế phân quyền.

### Endpoint mới: `GET /api/v1/analytics/attendance/on-time-rate/me`
- Tự động lấy `userId` từ JWT token đang gọi — không cần truyền `userId` trong URL
- Chỉ trả dữ liệu của chính người dùng đó
- Tất cả 4 role đều gọi được (employee, manager, business_admin, system_admin — ai cũng có quyền xem chuyên cần bản thân)

---

## 2. Endpoint chi tiết

### `GET /api/v1/analytics/attendance/on-time-rate/me`

#### Query Parameters

| Param | Type | Bắt buộc | Mô tả | Validation |
|---|---|---|---|---|
| `preset` | `string` | Không | `week` \| `month` \| `quarter` \| `custom` — mặc định `month` | enum |
| `from` | `date (YYYY-MM-DD)` | Có khi `preset=custom` | Ngày bắt đầu kỳ | Không được sau `to` |
| `to` | `date (YYYY-MM-DD)` | Có khi `preset=custom` | Ngày kết thúc kỳ | Không được trước `from`, không được là tương lai |
| `graceMinutes` | `number` | Không | Số phút ân hạn được tính là đúng giờ — mặc định lấy từ system config (`noShow.presenceConfirmSeconds / 60`) | `>= 0`, `<= 30` |

**Lưu ý `preset` mapping sang khoảng ngày:**
- `week` → 7 ngày gần nhất kể từ hôm nay
- `month` → tháng hiện tại (ngày 1 đến hôm nay)
- `quarter` → quý hiện tại (đầu quý đến hôm nay)
- `custom` → `from`–`to` do người dùng chọn (cả hai bắt buộc)

---

#### Response Body

```jsonc
{
    "success": true,
    "data": {
        // ─── Thông tin người dùng ───────────────────────────
        "userId": "uuid",
        "fullName": "Nguyễn Văn A",
        "email": "a@company.com",
        "employeeCode": "EMP0012",
        "departmentName": "Phòng Kinh doanh",
        "avatarUrl": "https://cdn.example.com/avatar.jpg",   // null nếu chưa có

        // ─── Kỳ tính ────────────────────────────────────────
        "period": {
            "preset": "month",      // giá trị preset hoặc "custom"
            "from": "2026-08-01",
            "to": "2026-08-13"
        },
        "graceMinutes": 5,          // giá trị thực tế đang áp dụng

        // ─── Tổng hợp kỳ ────────────────────────────────────
        "summary": {
            "totalRequired": 18,    // tổng số lượt tham dự bắt buộc trong kỳ
            "onTimeCount": 14,      // đúng giờ (check-in trong graceMinutes)
            "lateCount": 3,         // đi muộn (check-in sau graceMinutes)
            "absentCount": 1,       // vắng mặt (không check-in)
            "onTimeRate": 77.8,     // % = onTimeCount / totalRequired * 100, 1 chữ số
            "lateRate": 16.7        // % = lateCount / totalRequired * 100, 1 chữ số
        },

        // ─── So sánh với phòng ban ───────────────────────────
        // Để hiển thị "Bạn đang tốt hơn / kém hơn trung bình phòng X%"
        "departmentAvg": {
            "onTimeRate": 82.4,     // % trung bình phòng ban trong cùng kỳ
            "lateRate": 12.1,
            "sampleSize": 15        // số nhân viên trong phòng ban được tính
        },

        // ─── Trend theo tuần (nếu preset=month/quarter) ─────
        // hoặc theo ngày (nếu preset=week)
        // Dùng để vẽ biểu đồ đường trên FE
        "trend": [
            {
                "label": "T1",          // "Tuần 1" / "T2" / tên ngày viết tắt
                "from": "2026-08-01",
                "to": "2026-08-07",
                "totalRequired": 5,
                "onTimeCount": 4,
                "lateCount": 1,
                "absentCount": 0,
                "onTimeRate": 80.0
            }
            // ... thêm các kỳ con
        ],

        // ─── Các cuộc họp đi muộn gần nhất ─────────────────
        // Giới hạn 5 bản ghi, sắp xếp mới nhất trước
        // (Chi tiết hơn → FE gọi endpoint /late-history đã có)
        "recentLate": [
            {
                "meetingId": "uuid",
                "meetingTitle": "Họp dự án Q3",
                "scheduledAt": "2026-08-10T08:00:00.000Z",
                "checkedInAt": "2026-08-10T08:12:00.000Z",
                "lateByMinutes": 12,
                "roomName": "Phòng A"
            }
        ]
    }
}
```

---

#### Ghi chú field

| Field | Kiểu | Mô tả |
|---|---|---|
| `summary.totalRequired` | `number` | Đếm các meeting mà user được đánh dấu là participant bắt buộc (`isRequired = true`) trong kỳ |
| `summary.absentCount` | `number` | Số meeting bắt buộc mà user không có bất kỳ attendance record nào trong cửa sổ grace |
| `summary.onTimeRate` | `number` | Làm tròn 1 chữ số thập phân. Trả `null` nếu `totalRequired === 0` (không có meeting nào trong kỳ) |
| `departmentAvg` | `object \| null` | `null` nếu user không thuộc phòng ban nào (edge case: partner account, PARTNER_DEPARTMENT_ID) |
| `trend` | `array` | Granularity: ngày nếu `preset=week`; tuần nếu `preset=month`; tháng nếu `preset=quarter`. Mảng rỗng `[]` nếu không có dữ liệu |
| `recentLate` | `array` | Tối đa 5 phần tử, đủ để preview — không cần phân trang |
| `recentLate[].lateByMinutes` | `number` | = (`checkedInAt` − `scheduledAt`) tính bằng phút, đã trừ `graceMinutes` |

---

## 3. Phân quyền

| Role | Hành vi |
|---|---|
| `EMPLOYEE` | ✅ Cho phép — chỉ trả dữ liệu của chính user đó từ JWT |
| `MANAGER` | ✅ Cho phép — trả dữ liệu của manager đó (không phải phòng ban) |
| `BUSINESS_ADMIN` | ✅ Cho phép |
| `SYSTEM_ADMIN` | ✅ Cho phép |
| Unauthenticated | ❌ `401 Unauthorized` |

**Quan trọng:** Permission guard dùng `analytics.attendance.read.self` (permission mới, hẹp hơn `analytics.attendance.read`), hoặc đơn giản hơn: không cần permission riêng — chỉ cần `JwtAuthGuard` (đăng nhập là đủ). Khuyến nghị dùng cách sau để giảm phức tạp seeding.

---

## 4. Logic tính toán

### 4.1 Xác định khoảng thời gian

```typescript
// Pseudo-code
const { from, to } = resolvePeriod(preset, fromParam, toParam);
// from/to đều là ISO datetime: from = ngày bắt đầu 00:00:00, to = ngày kết thúc 23:59:59
```

Tái dụng hàm `resolvePeriod` đã có trong `AnalyticsAttendanceService` (dùng cho endpoint tổng hợp hiện tại).

### 4.2 Lọc meetings bắt buộc

```sql
-- Pseudo SQL
SELECT m.id, m.title, m.start_time, m.room_id
FROM meetings m
JOIN meeting_participants mp ON mp.meeting_id = m.id
WHERE mp.user_id = :currentUserId
  AND mp.is_required = true
  AND m.start_time >= :from
  AND m.start_time <= :to
  AND m.status = 'completed'
```

### 4.3 Phân loại attendance

Với mỗi meeting, lấy attendance record của user:

```typescript
const checkinTime = attendanceRecord?.checkedInAt ?? null;
const graceDeadline = addMinutes(meeting.startTime, graceMinutes);

if (!checkinTime) {
    row = 'absent';
} else if (checkinTime <= graceDeadline) {
    row = 'on_time';
} else {
    row = 'late';
    lateByMinutes = differenceInMinutes(checkinTime, meeting.startTime) - graceMinutes;
}
```

**Lưu ý:** Cùng logic với endpoint `on-time-rate` hiện có — tái dụng tối đa hàm đã có trong service.

### 4.4 `departmentAvg`

Tái dụng dữ liệu đã tính trong endpoint `GET /analytics/attendance/on-time-rate` (response hiện trả `lateByDepartment[]` có `onTimeRate` theo phòng). Nếu endpoint đó chưa expose `onTimeRate` per-department, cần tính riêng hoặc extract từ query hiện có.

```sql
-- Lấy onTimeRate trung bình phòng ban của user trong cùng kỳ
SELECT
    COUNT(CASE WHEN checkin <= grace_deadline THEN 1 END)::float
    / NULLIF(COUNT(*), 0) * 100 AS dept_on_time_rate,
    COUNT(DISTINCT mp.user_id) AS sample_size
FROM meetings m
JOIN meeting_participants mp ON mp.meeting_id = m.id
LEFT JOIN attendance_records ar ON ar.meeting_id = m.id AND ar.user_id = mp.user_id
WHERE mp.department_id = :userDeptId   -- hoặc join qua users.department_id
  AND m.start_time BETWEEN :from AND :to
  AND m.status = 'completed'
  AND mp.is_required = true
```

### 4.5 Trend granularity

| `preset` | Granularity | Label ví dụ |
|---|---|---|
| `week` | Mỗi ngày | `"T2"`, `"T3"`, ..., `"CN"` |
| `month` | Mỗi tuần (Tuần 1 → Tuần N của tháng) | `"T1"`, `"T2"`, `"T3"`, `"T4"` |
| `quarter` | Mỗi tháng | `"Tháng 6"`, `"Tháng 7"`, `"Tháng 8"` |
| `custom` | Auto-detect: ≤ 14 ngày → theo ngày; ≤ 90 ngày → theo tuần; > 90 ngày → theo tháng | — |

---

## 5. Error Responses

| HTTP | Trường hợp | Body `message` |
|---|---|---|
| `400` | `preset` không hợp lệ | `"preset must be one of: week, month, quarter, custom"` |
| `400` | `preset=custom` nhưng thiếu `from` hoặc `to` | `"from and to are required when preset is custom"` |
| `400` | `from` sau `to` | `"from must not be after to"` |
| `400` | `to` là ngày tương lai | `"to must not be in the future"` |
| `400` | `graceMinutes` ngoài range | `"graceMinutes must be between 0 and 30"` |
| `400` | Khoảng `custom` quá lớn (> 1 năm) | `"Custom date range must not exceed 365 days"` |
| `401` | Không có JWT | standard 401 |

---

## 6. Checklist BE

### Chuẩn bị

- [ ] Đọc `AnalyticsAttendanceService` hiện tại — xác định hàm `resolvePeriod` và logic phân loại attendance để tái dùng
- [ ] Xác nhận cột `is_required` / `isRequired` trong bảng `meeting_participants` đang tồn tại và được populate đúng
- [ ] Xác nhận `attendance_records` có cột `checked_in_at` hoặc tương đương

### DTO & Validation

- [ ] Tạo `GetPersonalAttendanceStatsDto` với các field `preset`, `from`, `to`, `graceMinutes`
- [ ] Validate: `@IsEnum(['week','month','quarter','custom'])`, `@IsOptional()`, `@IsDateString()`, cross-field validation `from < to`, `to <= today`, custom range ≤ 365 ngày
- [ ] Tạo response DTO `PersonalAttendanceStatsResponseDto` (dùng cho Swagger)

### Service

- [ ] Tạo method `getPersonalAttendanceStats(userId, dto)` trong `AnalyticsAttendanceService`
- [ ] Implement `resolvePeriod(preset, from, to)` — nếu đã có, gọi lại không viết mới
- [ ] Query meetings bắt buộc của user trong kỳ (`status = 'completed'`, `is_required = true`)
- [ ] Tính `onTimeCount`, `lateCount`, `absentCount`, `onTimeRate`, `lateRate`
- [ ] Tính `departmentAvg` (query riêng theo `departmentId` của user)
- [ ] Build `trend[]` với đúng granularity theo preset (xem bảng §4.5)
- [ ] Build `recentLate[]` — lấy tối đa 5 meeting đi muộn mới nhất
- [ ] Lấy `avatarUrl`, `employeeCode` từ user profile join

### Controller

- [ ] Thêm route `GET /analytics/attendance/on-time-rate/me` vào `AnalyticsAttendanceController`
- [ ] Guard: `JwtAuthGuard` (không cần RolesGuard — tất cả role được phép)
- [ ] Extract `userId` từ `@GetUser()` decorator (không nhận userId từ URL)
- [ ] Truyền `userId` vào service, không cho FE tự truyền userId

### Testing

- [ ] Unit test `resolvePeriod`: week, month, quarter, custom, edge cases (cuối tháng, đầu quý)
- [ ] Unit test tính `onTimeRate` khi `totalRequired = 0` → trả `null` thay vì `NaN`/`Infinity`
- [ ] Unit test `departmentAvg` khi user không có phòng ban → trả `null`
- [ ] E2E test: `GET /analytics/attendance/on-time-rate/me` với JWT employee → 200
- [ ] E2E test: không có JWT → 401

### Swagger

- [ ] Document endpoint với `@ApiOperation`, `@ApiQuery` cho tất cả params
- [ ] Document `PersonalAttendanceStatsResponseDto` với `@ApiProperty` đầy đủ
- [ ] Thêm example response

---

## 7. Contract FE cần để implement

Sau khi BE hoàn thành, FE sẽ implement tab Thống kê trong `homePage.jsx` với:

```javascript
// Service call (thêm vào employeeServices.js)
export const getMyAttendanceStats = async (params = {}) => {
    const query = buildQuery(params);
    return await get(`/analytics/attendance/on-time-rate/me${query}`);
};
```

**UI cần hiển thị (dựa trên response):**

| Vùng | Dữ liệu |
|---|---|
| 3 stat cards | `onTimeCount` / `lateCount` / `absentCount` |
| Vòng tròn tỷ lệ | `onTimeRate` % + so sánh với `departmentAvg.onTimeRate` |
| Biểu đồ đường | `trend[]` — `onTimeRate` theo kỳ con |
| Danh sách muộn | `recentLate[]` — 5 lần gần nhất + link "Xem đầy đủ" → `/analytics` |
| Bộ lọc | `preset` selector (Tuần / Tháng / Quý) + date range nếu custom |

---

## 8. Rủi ro & Lưu ý

1. **`totalRequired = 0`:** Nhân viên mới, chưa có meeting nào trong kỳ → tất cả rate = `null`, FE cần hiển thị "Chưa có dữ liệu trong kỳ này" thay vì `0%`.

2. **Partner accounts:** `departmentId = PARTNER_DEPARTMENT_ID` → `departmentAvg` trả `null` (không tính trung bình phòng đối tác vô nghĩa).

3. **Performance:** Nếu `preset=quarter` với nhiều meetings, query có thể nặng. Cân nhắc thêm index trên `meeting_participants(user_id, is_required)` và `meetings(start_time, status)` nếu chưa có.

4. **`graceMinutes` default:** Lấy từ system config `noShow.presenceConfirmSeconds` (convert sang phút). Nếu system config chưa load được → fallback `5`.

5. **`to` là ngày hiện tại hay tương lai?** BE nên tự cap `to = min(to, today)` thay vì trả lỗi khi `to = today + 1 ngày` do múi giờ client/server lệch nhau.
