# BE Requirement — `GET /meeting-minutes` & `GET /meeting-minutes/:id` Field Enrichment

**Ngày yêu cầu:** 2026-08-14  
**Người yêu cầu:** FE team  
**Ưu tiên:** Cao — ảnh hưởng trực tiếp đến màn hình Kho tài liệu (Business Admin) và modal chi tiết biên bản

---

## 1. Vấn đề hiện tại

Endpoint `GET /api/v1/meeting-minutes` (list) trả response **thiếu** các trường embed cần thiết:

| Trường | Trạng thái | Ghi chú |
|---|---|---|
| `meeting.startTime` | ❌ Thiếu | Cột "Ngày họp" hiển thị `—` |
| `meeting.endTime` | ❌ Thiếu | Để tính thời lượng |
| `meeting.title` | ⚠️ Có thể thiếu | Cột "Cuộc họp" dòng phụ |
| `meeting.room.roomName` | ❌ Thiếu | |
| `meeting.organizer` | ❌ Thiếu | Thông tin người tổ chức |
| `issuedBy` (object đầy đủ) | ❌ Thiếu | Cột "Người ban hành" hiển thị `—` |
| `issuedBy.avatarUrl` | ❌ Thiếu | Cần cho modal chi tiết |
| `preparedBy` (object đầy đủ) | ❌ Thiếu | Người soạn thảo |

---

## 2. Yêu cầu thay đổi Response Shape

### 2.1 `GET /api/v1/meeting-minutes` — List Endpoint

**Yêu cầu:** Mỗi item trong mảng `data[]` phải embed đầy đủ các nested object sau:

```jsonc
{
  "id": "uuid",
  "title": "Biên bản cuộc họp Q3",
  "status": "published",           // "draft" | "published" | "archived"
  "isAiGenerated": false,
  "versionNo": 2,
  "issuedAt": "2026-08-10T09:30:00+07:00",  // nullable nếu draft
  "createdAt": "2026-08-08T14:00:00+07:00",
  "updatedAt": "2026-08-10T09:30:00+07:00",

  // ── BẮT BUỘC THÊM MỚI ──────────────────────────────────────
  "meeting": {
    "id": "uuid",
    "title": "Họp tổng kết tháng 8",
    "startTime": "2026-08-08T09:00:00+07:00",   // ← BẮT BUỘC
    "endTime":   "2026-08-08T11:00:00+07:00",   // ← BẮT BUỘC
    "status": "completed",
    "room": {
      "id": "uuid",
      "roomName": "Phòng họp A"                 // ← BẮT BUỘC
    },
    "organizer": {
      "id": "uuid",
      "fullName": "Nguyễn Văn A",
      "email": "a@company.com",
      "avatarUrl": "https://..."                // ← BẮT BUỘC
    }
  },

  "issuedBy": {                                 // ← BẮT BUỘC (null nếu draft)
    "id": "uuid",
    "fullName": "Trần Thị B",
    "email": "b@company.com",
    "jobTitle": "Trưởng phòng",                 // ← BẮT BUỘC
    "department": {
      "id": "uuid",
      "departmentName": "Phòng Kinh doanh"      // ← BẮT BUỘC
    },
    "avatarUrl": "https://cdn.../avatar.jpg"    // ← BẮT BUỘC
  },

  "preparedBy": {                               // ← BẮT BUỘC (user soạn thảo)
    "id": "uuid",
    "fullName": "Lê Văn C",
    "email": "c@company.com",
    "jobTitle": "Nhân viên",
    "avatarUrl": "https://..."
  }
}
```

> **Lưu ý về performance:** Nếu lo ngại N+1, có thể dùng LEFT JOIN hoặc batch-select users/meetings một lần rồi map vào từng item — không cần gọi riêng từng record.

---

### 2.2 `GET /api/v1/meeting-minutes/:id` — Detail Endpoint

Ngoài tất cả trường của list, endpoint detail phải bổ sung:

```jsonc
{
  // ... tất cả trường của list response ở trên ...

  // ── BẮT BUỘC THÊM CHO DETAIL ────────────────────────────────
  "minutesContent": "<p>Nội dung biên bản...</p>",   // rich-text HTML

  "mainContent": {
    "decisions": [
      { "text": "Thông qua ngân sách Q4", "confidence": "high" }
    ],
    "actionItems": [
      {
        "task": "Chuẩn bị báo cáo",
        "owner": "Nguyễn Văn A",
        "deadline": "2026-08-20",
        "priority": "high",
        "confidence": "high"
      }
    ]
  },

  "attendees": [                                      // ← BẮT BUỘC
    {
      "id": "uuid",
      "fullName": "Nguyễn Văn A",
      "email": "a@company.com",
      "jobTitle": "Giám đốc",
      "department": { "departmentName": "Ban Giám đốc" },
      "avatarUrl": "https://...",
      "role": "organizer",                            // "organizer" | "host" | "attendee"
      "attendanceStatus": "present"                  // "present" | "absent" | "late"
    }
  ],

  "attachments": [
    {
      "id": "uuid",
      "fileName": "Tài liệu tham khảo.pdf",
      "fileUrl": "https://...",
      "fileSize": 204800,
      "uploadedAt": "2026-08-08T10:00:00+07:00"
    }
  ],

  "shares": [
    {
      "userId": "uuid",
      "fullName": "Phạm Thị D",
      "avatarUrl": "https://...",
      "sharedAt": "2026-08-10T10:00:00+07:00"
    }
  ]
}
```

---

## 3. Thay đổi bộ lọc (Query Params) — List Endpoint

Hiện tại FE gửi các filter sau, BE cần đảm bảo hỗ trợ đầy đủ:

| Param | Type | Mô tả |
|---|---|---|
| `page` | number | Phân trang |
| `limit` | number | Số item/trang |
| `q` | string | Full-text search trên `minutes.title` và `meeting.title` |
| `status` | string | `draft` \| `published` \| `archived` |
| `from` | ISO 8601 | Lọc theo `meeting.startTime >= from` |
| `to` | ISO 8601 | Lọc theo `meeting.startTime <= to` |
| `sortBy` | string | Field để sort (default: `created_at`) |
| `sortOrder` | string | `asc` \| `desc` |
| `meetingId` | uuid | Lọc theo meeting cụ thể (dùng trong MinutesTabContent) |

---

## 4. Phân quyền (Authorization)

| Role | Scope dữ liệu |
|---|---|
| `BUSINESS_ADMIN` | Tất cả biên bản toàn công ty |
| `MANAGER` | Chỉ biên bản các cuộc họp thuộc phòng ban mình quản lý |
| `EMPLOYEE` | Chỉ biên bản các cuộc họp mà bản thân tham gia |

> Phân quyền đã được backend xử lý theo token — FE không cần gửi thêm tham số role.

---

## 5. Meta Pagination

Response `GET /meeting-minutes` phải có `meta` object:

```jsonc
{
  "success": true,
  "data": [ /* array items */ ],
  "meta": {
    "page": 1,
    "limit": 15,
    "total": 42,
    "totalPages": 3
  }
}
```

---

## 6. Checklist kiểm thử

- [ ] List trả đúng `meeting.startTime`, `meeting.room.roomName`
- [ ] `issuedBy.avatarUrl` là URL có thể truy cập công khai (hoặc signed URL còn hạn)
- [ ] `issuedBy` = `null` khi biên bản ở trạng thái `draft`
- [ ] `preparedBy` luôn có giá trị (người tạo biên bản)
- [ ] Filter `from`/`to` lọc đúng theo `meeting.startTime`, không phải `minutes.createdAt`
- [ ] Filter `q` search được cả `meeting.title`
- [ ] Business Admin thấy tất cả, Manager chỉ thấy dept-scope, Employee chỉ thấy của mình
- [ ] `GET /meeting-minutes/:id` trả `attendees[]` đầy đủ `avatarUrl`
- [ ] `meta.total` và `meta.totalPages` chính xác khi có filter

---

*Tài liệu này là yêu cầu từ phía FE. Mọi thay đổi về breaking change cần thông báo trước cho FE team để update service layer.*
