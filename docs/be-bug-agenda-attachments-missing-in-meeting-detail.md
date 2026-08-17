# BUG: `GET /meetings/:meetingId` không trả về `attachments` trong từng agenda item

**Ngày phát hiện:** 2026-08-09  
**Phía:** Backend  
**Mức độ:** Medium — chức năng xem tài liệu đính kèm trong phòng họp không hoạt động

---

## Mô tả vấn đề

Khi người dùng đính kèm file vào một agenda item (qua `POST /meetings/:meetingId/agendas/:agendaId/attachments`), file đó xuất hiện đúng ở trang chi tiết cuộc họp (`MeetingDetail`), nhưng **hoàn toàn không xuất hiện trong phòng họp** (`InMeetingRoom`).

FE đã xử lý đúng — `InMeetingRoom` map `attachments: a.attachments || []` từ response của `GET /meetings/:meetingId`. Vấn đề là BE không trả `attachments` trong mảng `agendas` của response đó.

---

## Nguyên nhân gốc rễ

### Luồng gọi

```
GET /meetings/:meetingId
  → MeetingsController.getMeetingById()
  → MeetingsService.getMyScheduleDetail()
```

### File liên quan

| File | Vị trí | Vấn đề |
|------|--------|--------|
| `src/modules/meetings/services/meetings.service.ts` | hàm `getMyScheduleDetail()` | Load agendas nhưng không gọi `loadAgendaAttachmentsMap()` |
| `src/modules/meetings/dto/my-schedule-detail.dto.ts` | class `DetailAgendaDto` | Không có field `attachments` |

### Chi tiết

Trong `getMyScheduleDetail()`, agendas được load và map như sau:

```typescript
// meetings.service.ts — getMyScheduleDetail()

// Agendas được load đúng
agendas: this.dataSource
    .getRepository(MeetingAgendaEntity)
    .find({ where: { meetingId }, order: { agendaOrder: 'ASC' } }),

// Nhưng khi map sang DTO — THIẾU attachments:
agendas: (agendas ?? []).map(
    (a) => new DetailAgendaDto({
        id: a.id,
        title: a.title,
        durationMinutes: a.plannedDurationMinutes,
        sortOrder: a.agendaOrder,
        // ❌ KHÔNG CÓ attachments
    }),
),
```

Trong khi đó, hàm `loadAgendaAttachmentsMap()` **đã tồn tại** trong cùng service và được dùng đúng ở `getAgendas()` (endpoint `GET /meetings/:meetingId/agendas`):

```typescript
// getAgendas() — hoạt động đúng
const attachmentsByAgendaId = await this.loadAgendaAttachmentsMap(
    agendas.map((a) => a.id),
);
// → trả về Map<agendaId, AgendaAttachmentDto[]>
// → lấy từ MediaFileEntity WHERE relatedEntityType = 'meeting_agenda'
```

`DetailAgendaDto` cũng không có field `attachments`:

```typescript
// my-schedule-detail.dto.ts
export class DetailAgendaDto {
    id: string;
    title: string;
    durationMinutes: number | null;
    sortOrder: number;
    // ❌ KHÔNG CÓ attachments
}
```

---

## Hướng fix đề xuất

### Bước 1 — Thêm `attachments` vào `DetailAgendaDto`

```typescript
// my-schedule-detail.dto.ts

export class AgendaAttachmentSummaryDto {
    id: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: string | null;

    constructor(data: AgendaAttachmentSummaryDto) {
        this.id = data.id;
        this.fileName = data.fileName;
        this.mimeType = data.mimeType;
        this.fileSizeBytes = data.fileSizeBytes;
    }
}

export class DetailAgendaDto {
    id: string;
    title: string;
    durationMinutes: number | null;
    sortOrder: number;
    attachments: AgendaAttachmentSummaryDto[]; // ← thêm

    constructor(data: DetailAgendaDto) {
        this.id = data.id;
        this.title = data.title;
        this.durationMinutes = data.durationMinutes;
        this.sortOrder = data.sortOrder;
        this.attachments = data.attachments ?? []; // ← thêm
    }
}
```

### Bước 2 — Gọi `loadAgendaAttachmentsMap()` trong `getMyScheduleDetail()`

```typescript
// meetings.service.ts — getMyScheduleDetail()

// Sau khi Promise.all() load xong agendas, thêm:
const agendaAttachmentsMap = await this.loadAgendaAttachmentsMap(
    (agendas ?? []).map((a) => a.id),
);

// Khi map agendas sang DTO:
agendas: (agendas ?? []).map(
    (a) => new DetailAgendaDto({
        id: a.id,
        title: a.title,
        durationMinutes: a.plannedDurationMinutes,
        sortOrder: a.agendaOrder,
        attachments: (agendaAttachmentsMap.get(a.id) ?? []).map(
            (att) => new AgendaAttachmentSummaryDto({
                id: att.id,
                fileName: att.fileName,
                mimeType: att.mimeType,
                fileSizeBytes: att.fileSizeBytes,
            }),
        ),
    }),
),
```

> **Lưu ý:** `loadAgendaAttachmentsMap()` là private method đã có sẵn trong `MeetingsService` — không cần viết thêm logic mới, chỉ gọi lại.

---

## Kết quả mong đợi sau fix

Response của `GET /meetings/:meetingId` trả về `agendas` có đủ `attachments`:

```json
{
  "success": true,
  "data": {
    "agendas": [
      {
        "id": "uuid-agenda-1",
        "title": "Nam đẹp trai thật mà",
        "durationMinutes": 10,
        "sortOrder": 1,
        "attachments": [
          {
            "id": "uuid-file-1",
            "fileName": "tai-lieu.pdf",
            "mimeType": "application/pdf",
            "fileSizeBytes": "204800"
          }
        ]
      }
    ]
  }
}
```

FE (`InMeetingRoom`) sẽ tự động hiển thị nút xem tài liệu đính kèm mà không cần thay đổi gì thêm.
