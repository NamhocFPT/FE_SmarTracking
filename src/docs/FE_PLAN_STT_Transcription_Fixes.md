# FE PLAN — Sửa lệch phần Speech-to-Text / Transcript (chỉ việc của FE team)

> Phạm vi: chỉ phần **Transcription/Recording** (upload audio → STT → sửa tay → duyệt). Bản này đã cập nhật theo
> `BE_PLAN_STT_Frontend_Alignment.md` (2026-07-31) — **BE đã xác nhận + cập nhật tài liệu xong BE-1 và BE-2**, nên
> mọi contract dưới đây là **đã chốt, không còn phải đoán**. Đối chiếu trực tiếp
> `AudioUploader.jsx`, `TranscriptViewer.jsx`, `transcriptionServices.js` với source BE
> (`capstone-be/src/modules/transcription/*`) và `stt-feature-status-cho-fe.md` bản mới nhất (mục 5.1/5.2/5.3).
> **Trạng thái implement (2026-07-31): FE-1, FE-2, FE-3, FE-4 đã sửa xong** trong `transcriptionServices.js`,
> `TranscriptViewer.jsx`, `AudioUploader.jsx`, `employee/MeetingDetail.jsx`, `manager/MeetingDetail.jsx`,
> `BookMeeting.jsx`. FE-5 (progress bar giả) vẫn để nguyên vì là polish tuỳ chọn. Phần "Mở rộng" của FE-2 (trang
> audit nhiều meeting cho Admin) chưa làm — chờ quyết định nghiệp vụ. Đã build (`CI=true npm run build`) xác nhận
> không có lỗi cú pháp mới; chưa test tay trên trình duyệt (cần đăng nhập thật).

---

## FE-1 · Sửa payload PATCH sửa segment — hiện sai contract, sẽ luôn 400 *(bắt buộc, ưu tiên cao nhất)*

**Vấn đề (đã xác nhận với BE, không còn nghi ngờ):** BE dùng `ValidationPipe({ whitelist: true,
forbidNonWhitelisted: true })`, contract thật là **mảng** `segments[]` (mục 5.1 tài liệu BE), nhưng FE đang gửi
1 object phẳng:

```js
// transcriptionServices.js:47-52 — SAI, sẽ luôn 400
export const updateTranscriptSegment = async (transcriptId, segmentId, payload) => {
    return await patch(`/transcripts/${transcriptId}/segments`, { segmentId, ...payload });
};
```

**Request body chuẩn (copy nguyên từ mục 5.1 tài liệu BE):**
```jsonc
{
  "segments": [
    { "segmentId": "seg-0001", "text": "...", "speakerLabel": "...", "speakerUserId": "uuid", "reason": "..." }
  ],
  "revisionNote": "..."
}
```

**Response `200` chuẩn (mục 5.1):**
```jsonc
{ "success": true, "data": { "transcriptId": "uuid", "revisionNo": 2, "updatedSegments": ["seg-0001"], "editedBy": "uuid", "updatedAt": "2026-07-31T10:00:00.000Z" } }
```
Lưu ý: request này **không đổi `status`** transcript — chuyển trạng thái phải gọi riêng `PATCH .../status`.

**Sửa `src/service/transcriptionServices.js`:**
```js
/**
 * Sửa 1 hoặc nhiều segment cùng lúc — PATCH /transcripts/:transcriptId/segments
 * @param {string} transcriptId
 * @param {Array<{segmentId, text?, speakerLabel?, speakerUserId?, reason?}>} segments
 * @param {string} [revisionNote]
 */
export const updateTranscriptSegments = async (transcriptId, segments, revisionNote) => {
    const body = { segments };
    if (revisionNote) body.revisionNote = revisionNote;
    return await patch(`/transcripts/${transcriptId}/segments`, body);
};
```
Xoá hàm `updateTranscriptSegment` (số ít, sai) cũ, đổi tên chỗ import ở `TranscriptViewer.jsx`.

**Sửa `src/components/transcription/TranscriptViewer.jsx`:**
- `handleSaveEdit` (dòng 111-140): gọi
  `updateTranscriptSegments(transcript.transcriptId, [{ segmentId: editingSegmentId, text: editForm.text, speakerLabel: editForm.speakerLabel }])`
  (bọc trong mảng 1 phần tử).
- Sau khi có response, dùng `res.data.updatedSegments`/`res.data.editedBy`/`res.data.updatedAt` để cập nhật state
  thay vì tự gán lại `editForm.text`/`editForm.speakerLabel` như hiện tại (dòng 122-130) — tránh lệch nếu BE có
  chuẩn hoá dữ liệu khác input.
- Thêm 1 ô nhập optional cho `revisionNote` (ghi chú cho cả lần sửa) trong form — không bắt buộc nhưng BE đã hỗ
  trợ audit trail này, bỏ phí nếu không dùng.

---

## FE-2 · Quyền Admin xem/sửa transcript — contract role đã chốt, chọn mức triển khai

**Vấn đề (đã xác nhận với BE — mục 5.3 tài liệu BE):** BE cho Host **hoặc** Admin (BUSINESS_ADMIN/SYSTEM_ADMIN)
sửa/duyệt transcript. `GET /api/v1/auth/me` trả:
```jsonc
{ "success": true, "data": { "id": "uuid", "roles": [{ "id": "uuid", "roleCode": "BUSINESS_ADMIN", "roleName": "Business Admin" }] } }
```
Tức field là **`roles` — mảng object**, giá trị `roleCode` là **UPPER_SNAKE** (`EMPLOYEE`/`MANAGER`/`BUSINESS_ADMIN`/`SYSTEM_ADMIN`).
`login.jsx` (`getRedirectPathByRoles`, dòng 100-104) đã chứng minh `user.roles` được lưu vào `localStorage['user']`
đúng dạng mảng từ lúc đăng nhập, và đã tự chuẩn hoá cả 2 khả năng (`r.roleCode || r.role_code`) — dùng lại đúng
pattern này để nhất quán toàn app, **không** dùng `currentUser?.role === 'BusinessAdmin'` (sai cả tên field lẫn
định dạng giá trị — điều kiện này đang tồn tại sai ở `BookMeeting.jsx:654`, BE đã xác nhận đây là bug, cần sửa
luôn khi đụng vào role-check, dù không thuộc phạm vi transcript).

**Điều kiện đúng (dùng chung mọi nơi cần check Admin):**
```js
const isAdmin = currentUser?.roles?.some(r =>
    ['BUSINESS_ADMIN', 'SYSTEM_ADMIN'].includes(r.roleCode || r.role_code)
);
```

> Đối chiếu rule FE (`FE_RULES_SMARTRACKING.md` mục 4: "check `user.permissions[]` NOT `role.name`"): check role ở
> đây **chỉ để ẩn/hiện nút trên UI** (UX), không phải cơ chế phân quyền chính — BE vẫn tự enforce lại
> Host-hoặc-Admin ở tầng service bất kể FE hiện nút hay không (`isAdminRole()`), nên không vi phạm tinh thần "không
> bypass RBAC" của rule. Đây là ngoại lệ hợp lý vì bản thân BE cũng dùng role (không phải permission string) để
> phân biệt Host cụ thể của 1 meeting với Admin toàn hệ thống — permission `transcript.update` dùng chung cho cả
> hai, không đủ để phân biệt UI cần hiện nút cho ai.

**Mức triển khai đợt này — theo quyết định giữ nguyên hướng đã phân tích (Hướng A, tối thiểu):**
- Chỉ sửa điều kiện `canManage`/`isHost` ở `employee/MeetingDetail.jsx` và `manager/MeetingDetail.jsx` để thêm
  nhánh `isAdmin` như trên. Không tạo trang/route danh sách mới cho Admin đợt này.
- **Tác dụng:** nếu 1 BUSINESS_ADMIN/SYSTEM_ADMIN tự điều hướng đúng vào trang chi tiết 1 cuộc họp cụ thể (biết
  trước ID/URL, hoặc được dẫn tới qua thông báo/link), họ sẽ thấy nút Sửa/Duyệt transcript như Host. Họ vẫn
  **không có** một màn hình liệt kê "tất cả meeting có transcript" để tự duyệt qua — đây là giới hạn có chủ đích
  của mức tối thiểu này, không phải thiếu sót.
- **File cần sửa:** `pages/employee/MeetingDetail.jsx:359-361`, `pages/manager/MeetingDetail.jsx` (dòng tương ứng
  khai báo `isHost`/`canManage`).

### Mở rộng (tuỳ chọn — CHƯA làm đợt này, ghi lại để 2 bên tham khảo nếu sau cần)

Nếu sau này team quyết định Admin cần một màn hình riêng để chủ động rà soát transcript của nhiều cuộc họp (không
phải chỉ khi được dẫn link tới 1 meeting cụ thể), đây là việc cần làm — tách rõ phần BE và FE:

**Lý do cần mở rộng:** mức tối thiểu ở trên chỉ phục vụ được kịch bản "có người báo Admin xem lại 1 cuộc họp cụ
thể". Nếu nghiệp vụ thực tế là "Admin định kỳ tự rà soát chất lượng transcript toàn tổ chức" (audit/QA), mức tối
thiểu không đáp ứng được vì không có nơi liệt kê ứng viên cần xem.

**Phía BE cần làm (đối chiếu BE-5 trong `BE_PLAN_STT_Frontend_Alignment.md`, hiện đang để mở):**
- Thêm field `hasTranscript: boolean` (hoặc `transcriptStatus: string | null`) vào response `GET /meetings` (list
  admin) — để FE lọc nhanh, tránh phải gọi `GET .../transcript` cho từng meeting một chỉ để biết có transcript
  hay không (tốn N request không cần thiết).
- Không cần entity/migration mới — chỉ cần join thêm `transcripts` khi build response list, đúng nguyên tắc BE
  "không mở rộng scope khi chưa cần" vì đây chỉ là 1 field phái sinh (derived), không đổi schema.

**Phía FE cần làm (khi BE-5 xong):**
- Trang mới: `src/pages/systemAdmin/TranscriptReview.jsx` + `src/pages/bussinessAdmin/TranscriptReview.jsx` (hoặc
  1 component dùng chung nếu 2 layout cho phép), liệt kê meeting có `hasTranscript=true`, mỗi dòng có nút "Xem
  transcript" điều hướng vào đúng trang chi tiết đã có sẵn (tái dùng `TranscriptViewer`/`AudioUploader`, không
  viết lại UI transcript).
- Thêm route + menu item trong `SystemAdminLayout.jsx`/`BusinessAdminLayout.jsx` (theo đúng pattern đã dùng cho
  các trang campus khác trong repo, ví dụ mục "Hành trình khuôn viên" đã thêm trước đó).
- **Công dụng:** cho phép Admin chủ động audit chất lượng STT toàn tổ chức theo lịch, không phụ thuộc việc có ai
  báo hay không — phù hợp nếu đây là một quy trình vận hành định kỳ thay vì xử lý sự vụ.

**Khi nào cần quyết định:** chỉ triển khai phần mở rộng này nếu PO/team xác nhận nghiệp vụ audit định kỳ là có
thật; nếu không, giữ mức tối thiểu là đủ và tránh over-engineering.

---

## FE-3 · Thiếu bước "reviewed" — hiện chỉ có "Duyệt toàn bộ" nhảy thẳng lên `approved`

**Vấn đề:** BE hỗ trợ 2 trạng thái đích qua `PATCH .../status`: `reviewed` và `approved` (có `note` optional).
Response chuẩn (mục 5.2 tài liệu BE): `{ success: true, data: { transcriptId, status, updatedAt } }`.
FE (`TranscriptViewer.jsx:142-153`) chỉ có 1 nút "Duyệt toàn bộ" hard-code `status: 'approved'`.

**Cách sửa:**
- `updateTranscriptStatus` (`transcriptionServices.js:68-70`): đổi signature thành
  `updateTranscriptStatus(transcriptId, status, note)` → gửi `{ status, ...(note && { note }) }`.
- Sau khi gọi thành công, dùng `res.data.status` (không tự gán `status` theo tham số truyền vào) để đồng bộ đúng
  giá trị BE xác nhận đã lưu.
- Thêm nút phụ "Đánh dấu đã xem" (`status: 'reviewed'`) hiện khi `transcript.status === 'draft'`; nút "Duyệt toàn
  bộ" chỉ hiện khi `status === 'reviewed'` — dẫn đúng luồng draft → reviewed → approved thay vì cho nhảy 2 bước
  cùng lúc (BE không cấm nhảy thẳng, nhưng UI nên dẫn đúng quy trình QA).

---

## FE-4 · Dùng `error.code` có sẵn thay vì so message text cho case tắt tính năng *(nhẹ, dễ làm)*

**Đã verify:** BE trả đúng `error.code: 'TRANSCRIPTION_DISABLED'` khi `TRANSCRIPTION_ENABLED=false`
(`transcription.service.ts:89-96`) — không cần BE sửa gì thêm.

**Cách sửa — `AudioUploader.jsx` (`handleUpload`, dòng 58-92):** bắt riêng
`err?.error?.code === 'TRANSCRIPTION_DISABLED'` để hiện thông báo tĩnh + ẩn hẳn nút Upload cho các lần sau trong
session đó, thay vì chỉ hiển thị message lỗi chung mỗi lần bấm thử.

**Đồng thời xử lý 409** (mục "Checklist BE" — chuyển status không hợp lệ, vd đã `approved`): `handleApprove`/nút
"Đánh dấu đã xem" cần catch riêng và hiện message rõ ("Transcript đã ở trạng thái cuối, không thể chuyển tiếp")
thay vì toast lỗi chung chung hiện tại.

---

## FE-5 · Progress bar khi upload là animation giả *(nhẹ, optional — polish)*

**Vấn đề:** `AudioUploader.jsx:184-189` (comment `// Fake progress`) chạy animation 0%→100% cố định 2s, không
phản ánh % upload thật.

**Cách sửa (optional):** `fetch` không hỗ trợ progress event; muốn progress thật cần đổi sang `XMLHttpRequest`
hoặc `axios` với `onUploadProgress` riêng cho request này. Không bắt buộc — audio meeting thường ngắn.

---

## Không nằm trong việc của FE đợt này (đã xác nhận với BE, BE-3/BE-4)

- **`note` optional trong PATCH status** — đã có sẵn phía BE, FE chỉ cần dùng (xem FE-3), không cần thêm gì phía BE.
- **Chế độ multi-track (`channel_zone`)** — BE xác nhận Phase 2 (AI Worker riêng từng channel) đang hoàn thiện,
  không dựng UI upload nhiều track lúc này; BE sẽ báo lại khi sẵn sàng.
- **AI tóm tắt biên bản (`minutes/ai-draft-jobs`)** — nút "Tóm tắt bằng AI" đã tự ẩn đúng khi
  `getAiDraftConfig(meetingId)` trả `enabled: false` — không cần sửa gì thêm ở FE.

## Checklist đối chiếu với mục 8 tài liệu BE (đầy đủ)

| Mục checklist BE | Trạng thái FE | Việc còn lại |
|---|---|---|
| UI ghi âm/chọn file ≤50MB | ✅ Đã có | — |
| Upload multipart → audio-upload | ✅ Đã có | — |
| Tạo transcription job | ✅ Đã có | — |
| Polling tới khi hết `processing` | ✅ Đã có (3s/lần) | — |
| Hiển thị `cleanedText`/`segments[]` | ✅ Đã có | — |
| Highlight `lowConfidence`/`manualReviewRequired` | ✅ Đã có | — |
| Sửa tay segments (mảng, đúng contract) | ❌ Sai contract | FE-1 |
| Sửa toàn văn `PATCH .../content` | ✅ Đã có, đúng contract | — |
| Chuyển trạng thái `reviewed`/`approved` | 🟡 Chỉ có approved | FE-3 |
| Check quyền Admin đúng field `roles[].roleCode` | ❌ Chưa check role nào | FE-2 |
| Xử lý 403 `TRANSCRIPTION_DISABLED` | 🟡 Hiện message chung, chưa dùng `error.code` | FE-4 |
| Xử lý 409 chuyển status không hợp lệ | ❌ Chưa xử lý riêng | FE-4 |
