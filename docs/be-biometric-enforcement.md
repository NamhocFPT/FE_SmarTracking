# Tài liệu yêu cầu BE — Cơ chế bắt buộc nộp sinh trắc học (Biometric Enforcement)

> **Ngày tạo:** 2026-08-08  
> **Người yêu cầu:** FE Team  
> **Mức độ ưu tiên:** 🔴 Cao — ảnh hưởng trực tiếp đến luồng onboarding bắt buộc của Employee và Manager

---

## Bối cảnh

FE hiện đã implement cơ chế chặn toàn bộ UI khi Employee/Manager chưa nộp ảnh sinh trắc học (`avatarReviewStatus = not_uploaded` hoặc `rejected`). Modal bắt buộc sẽ hiện lên và không thể đóng cho đến khi user nộp ảnh thành công.

**Tuy nhiên toàn bộ enforcement này là phía FE.** Nếu user bypass FE (DevTools, Postman, client tự build), họ vẫn gọi được API. BE cần validate lại để enforcement có ý nghĩa thực sự.

---

## 1. Xác nhận endpoint cần làm rõ

### 1.1 Endpoint lấy trạng thái sinh trắc học

| | Giá trị |
|---|---|
| **FE đang gọi** | `GET /api/v1/me/biometric-status` |
| **Comment cũ trong code** | `GET /api/v1/me/avatar-status` |

**❓ Yêu cầu BE:** Xác nhận endpoint đúng là `/me/biometric-status` hay `/me/avatar-status`? Nếu đã đổi tên, cần thông báo để FE cập nhật comment và có thể đã dẫn đến lỗi nếu một trong hai không tồn tại.

---

### 1.2 Response shape — `GET /me/biometric-status`

FE đang parse response theo cấu trúc sau. BE cần đảm bảo trả về **đúng tất cả các field** này:

```json
{
  "success": true,
  "data": {
    "avatarReviewStatus": "not_uploaded" | "pending_review" | "approved" | "rejected",
    "shouldShowAvatarPopup": true | false,
    "biometricRequired": true | false
  }
}
```

**Chi tiết từng field:**

| Field | Kiểu | Mô tả | FE dùng để |
|---|---|---|---|
| `avatarReviewStatus` | `string enum` | Trạng thái ảnh hiện tại của user | Quyết định có force modal không (`not_uploaded` hoặc `rejected` → bắt buộc) |
| `shouldShowAvatarPopup` | `boolean` | BE gợi ý có nên hiện popup không | Hiện modal nhắc nhở dạng non-blocking (khi status là `pending_review`) |
| `biometricRequired` | `boolean` | Cờ bắt buộc nộp | FE hiện dùng làm fallback nhưng logic thực tế đã chuyển sang `avatarReviewStatus` |

**❓ Yêu cầu BE:**
- Xác nhận `biometricRequired` có còn được BE trả về không? Nếu đã deprecated, FE sẽ loại bỏ field này khỏi logic.
- Xác nhận logic `shouldShowAvatarPopup = true` khi nào (chỉ `pending_review`? hay cả `not_uploaded`?).

---

### 1.3 Hai endpoint submit — cần làm rõ sự khác biệt

FE đang gọi hai endpoint khác nhau cho hai mục đích khác nhau:

| Hành động | Endpoint | Payload |
|---|---|---|
| Nộp ảnh sinh trắc học | `POST /me/biometric-submission` | `multipart/form-data: file, consentAccepted=true` |
| Cập nhật avatar hiển thị | `POST /me/avatar-submission` | `multipart/form-data: file, consentAccepted=true` |

**❓ Yêu cầu BE:**
- Đây có thực sự là **2 endpoint riêng biệt** không?
- Hay chỉ là **1 endpoint** `/me/avatar-submission` (alias `/me/biometric-submission`)?
- Nếu là 2 endpoint: POST `/me/biometric-submission` có **chỉ** lưu ảnh cho FaceID mà **không cập nhật avatar** hiển thị không?
- Nếu là 1 endpoint: FE cần cập nhật `submitBiometric` để dùng đúng path.

---

## 2. Yêu cầu server-side enforcement (quan trọng nhất)

Hiện tại enforcement **chỉ ở phía FE**. Bất kỳ HTTP client nào cũng có thể gọi trực tiếp API mà không bị chặn. BE cần bổ sung:

### 2.1 Middleware kiểm tra trạng thái sinh trắc học

**Đề xuất:** Thêm guard/middleware cho các route thuộc Employee và Manager, trả về lỗi nếu `avatarReviewStatus` là `not_uploaded` hoặc `rejected`.

```
HTTP 403 Forbidden
{
  "success": false,
  "error": {
    "code": "BIOMETRIC_REQUIRED",
    "message": "Tài khoản cần hoàn tất nộp ảnh sinh trắc học trước khi sử dụng hệ thống."
  }
}
```

**Các route nên được bảo vệ:**
- Tất cả route thuộc `Employee` và `Manager` role, **ngoại trừ:**
  - `GET /me/biometric-status` (cần thiết để FE biết trạng thái)
  - `POST /me/biometric-submission` (để user có thể nộp ảnh)
  - `POST /auth/refresh` (để duy trì session)
  - `POST /auth/logout` (để user có thể đăng xuất)

**Các role được miễn:**
- `SYSTEM_ADMIN`
- `BUSINESS_ADMIN`
- Bất kỳ role admin nào khác (BE cần liệt kê đầy đủ)

**❓ Yêu cầu BE:** Xác nhận danh sách role exempt đầy đủ. FE hiện đang exempt: `['SYSTEM_ADMIN', 'BUSINESS_ADMIN', 'ADMIN']` — có thiếu role nào không?

---

### 2.2 Trạng thái `pending_review` — không nên bị block

Khi user đã nộp ảnh (`pending_review`), họ đang chờ Admin duyệt. **Không nên block API** cho trạng thái này. User cần được sử dụng hệ thống bình thường trong thời gian chờ.

**Logic enforce nên là:**
```
block nếu avatarReviewStatus IN ('not_uploaded', 'rejected')
KHÔNG block nếu avatarReviewStatus IN ('pending_review', 'approved')
```

---

## 3. Luồng re-submission sau khi bị reject

### 3.1 Vấn đề hiện tại

FE có error code `BIOMETRIC_ALREADY_PENDING_REVIEW` trong `ERROR_MAP`. Nghĩa là BE đang chặn re-submit khi đã có ảnh `pending_review`.

Tuy nhiên với trạng thái `rejected`: user **bắt buộc** phải nộp lại. FE sẽ hiện modal bắt buộc và cho phép submit.

**❓ Yêu cầu BE xác nhận:**
- `POST /me/biometric-submission` có cho phép submit khi `avatarReviewStatus = rejected` không?
- Hay BE vẫn trả về `BIOMETRIC_ALREADY_PENDING_REVIEW` cho cả trường hợp `rejected`?
- Nếu BE block, FE đang bị kẹt: user bị force nhưng không nộp được.

**Đề xuất logic BE:**
```
- status = not_uploaded   → cho phép submit ✅
- status = pending_review → block với BIOMETRIC_ALREADY_PENDING_REVIEW ✅
- status = rejected       → cho phép submit lại (override ảnh cũ) ✅
- status = approved       → block với BIOMETRIC_ALREADY_APPROVED ✅
```

---

### 3.2 Thông báo khi bị reject

Khi Admin reject ảnh sinh trắc học, user **phải biết** để nộp lại. BE cần:

- [ ] Gửi notification qua hệ thống thông báo hiện có (nếu có) khi Admin reject
- [ ] Notification body nên bao gồm lý do reject (field `reason` từ `POST /admin/biometric-submissions/:id/reject`)

FE đang đọc lý do reject từ `biometricStatus.message` tại trang Profile. BE cần đảm bảo field `message` (hoặc `reason`) được trả về trong response của `GET /me/biometric-status` khi status là `rejected`.

**Response đề xuất khi rejected:**
```json
{
  "success": true,
  "data": {
    "avatarReviewStatus": "rejected",
    "message": "Ảnh không đủ độ rõ nét, vui lòng chụp lại trong điều kiện ánh sáng tốt hơn.",
    "shouldShowAvatarPopup": true,
    "biometricRequired": true
  }
}
```

---

## 4. Trường `biometricRequired` trong Login Response

### Vấn đề hiện tại

`login.jsx` đang **tự set** `user.biometricRequired = true` chỉ cho MANAGER role (hardcode phía FE):

```js
// login.jsx:128-135
const isManager = user?.roles?.some(r => roleCode === 'MANAGER');
if (isManager) {
    user.biometricRequired = true; // ← FE tự thêm field này
}
```

**Vấn đề:**
1. EMPLOYEE không được set field này qua login — FE dựa vào `getBiometricStatus()` để enforce.
2. Nếu BE login response đã trả về `biometricRequired`, FE đang override mất giá trị của BE.
3. Logic không nhất quán giữa 2 roles.

**❓ Yêu cầu BE:**
- Login response (`POST /auth/login`) có trả về `biometricRequired` trong object `user` không?
- Nếu có: FE sẽ xoá đoạn hardcode và dùng giá trị từ BE.
- Nếu không: BE nên bổ sung field này vào login response để thống nhất.

**Đề xuất chuẩn:** BE trả về `biometricRequired: true` trong login response cho tất cả role cần enforce (EMPLOYEE, MANAGER). Admin roles trả về `biometricRequired: false`.

---

## 5. Tóm tắt action items cho BE

| # | Hạng mục | Mức độ | Action |
|---|---|---|---|
| 1 | Xác nhận endpoint đúng: `/me/biometric-status` hay `/me/avatar-status` | 🔴 Cao | Confirm + sửa nếu sai |
| 2 | Xác nhận response shape đầy đủ của `GET /me/biometric-status` (đặc biệt field `message` khi rejected) | 🔴 Cao | Confirm + bổ sung nếu thiếu |
| 3 | Phân biệt `/me/biometric-submission` vs `/me/avatar-submission` — là 1 hay 2 endpoint? | 🔴 Cao | Confirm + document |
| 4 | **Server-side enforcement**: Thêm guard block API cho EMPLOYEE/MANAGER khi `not_uploaded` hoặc `rejected` | 🔴 Cao | Implement |
| 5 | Cho phép re-submit khi `avatarReviewStatus = rejected` | 🔴 Cao | Confirm/Fix logic |
| 6 | Login response nên trả về `biometricRequired` field thống nhất cho tất cả role | 🟡 Trung bình | Implement |
| 7 | Gửi notification khi Admin reject ảnh sinh trắc học | 🟡 Trung bình | Implement |
| 8 | Xác nhận danh sách role exempt đầy đủ (ngoài SYSTEM_ADMIN, BUSINESS_ADMIN) | 🟡 Trung bình | Confirm |

---

## 6. Luồng tổng thể (để tham chiếu)

```
[User đăng nhập]
       │
       ▼
[Login API trả về user + biometricRequired]
       │
       ▼
[FE gọi GET /me/biometric-status]
       │
       ├── avatarReviewStatus = 'approved'    → Sử dụng bình thường ✅
       │
       ├── avatarReviewStatus = 'pending_review' → Hiện popup nhắc nhở (có thể đóng) ⏳
       │
       ├── avatarReviewStatus = 'not_uploaded'  ┐
       │                                        ├→ Modal BLOCK bắt buộc, không thể đóng 🔴
       └── avatarReviewStatus = 'rejected'      ┘  FE + BE cùng enforce
                    │
                    ▼
          [User nộp ảnh — POST /me/biometric-submission]
                    │
                    ▼
          [status → pending_review — được dùng web bình thường]
                    │
                    ▼
          [Admin duyệt — POST /admin/biometric-submissions/:id/approve]
                    │
                    ▼
          [status → approved — FaceID active ✅]
```
