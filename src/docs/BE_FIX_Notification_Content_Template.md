# Yêu cầu BE — Sửa template nội dung thông báo (Notification Content)

> **Ngày tạo:** 2026-08-11  
> **Người yêu cầu:** FE Team  
> **Mức độ:** 🟡 Trung bình — ảnh hưởng trực tiếp đến trải nghiệm người dùng tại màn Thông báo

---

## 1. Vấn đề hiện tại

Tại trang `/manager/notifications` (và tất cả role khác dùng chung component), nội dung thông báo (`content`) do BE tạo ra đang có **hai lỗi**:

### 1.1 — Hiển thị UUID thay vì tên người dùng

**Ví dụ thực tế từ production:**
```
Người dùng 54a9cbd3-77a3-445f-ad22-adf741693d0c đã tạo yêu cầu cuộc họp "test" chờ phê duyệt.
```

**Kỳ vọng:**
```
Nguyễn Văn A đã tạo yêu cầu cuộc họp "test" chờ phê duyệt.
```

Template thông báo đang truyền `userId` (UUID) vào nội dung thay vì `fullName` của người dùng.

---

### 1.2 — Thẻ HTML hiển thị thô thay vì được render

**Ví dụ thực tế:**
```
Biên bản cuộc họp <b>Test luồng</b> đã được ban hành.<br/>Tiêu đề biên bản: Biên bản họp: Test luồng<br/>
```

Thẻ `<b>` và `<br/>` đang xuất hiện nguyên văn trong UI thay vì được render.

> **FE đã xử lý phía client:** FE hiện dùng `dangerouslySetInnerHTML` để render HTML trong `content`. Các thẻ `<b>`, `<br/>`, `<i>`, `<strong>`, `<em>` sẽ được render đúng. Tuy nhiên **vấn đề UUID (1.1) phải sửa ở BE** vì FE không có khả năng tra cứu tên người dùng từ UUID một cách inline.

---

## 2. Yêu cầu sửa đổi phía BE

### 2.1 — Sửa template thông báo dùng `fullName` thay vì `userId`

Với mọi loại thông báo có nhắc đến actor (người thực hiện hành động), template cần dùng `fullName` (hoặc `displayName`) của người đó, **không dùng UUID**.

**Ví dụ template cần sửa:**

| Loại thông báo | Template hiện tại (sai) | Template đúng |
|---|---|---|
| Tạo yêu cầu họp | `Người dùng {userId} đã tạo yêu cầu...` | `{actorFullName} đã tạo yêu cầu...` |
| Phê duyệt / từ chối | `User {userId} đã phê duyệt...` | `{actorFullName} đã phê duyệt...` |
| Bất kỳ hành động nào | `...{userId}...` | `...{actorFullName}...` |

**Nguồn dữ liệu đề xuất:** Khi tạo notification event, lookup `user.fullName` từ `userId` của actor rồi embed vào `content`. Không lưu UUID vào chuỗi nội dung.

---

### 2.2 — Quy ước về HTML trong `content`

FE đã hỗ trợ render HTML trong `content`. BE **được phép và nên** dùng các thẻ sau để định dạng:

| Thẻ | Dùng khi nào |
|---|---|
| `<b>` hoặc `<strong>` | Tên cuộc họp, tên phòng, tên người — những từ quan trọng cần nổi bật |
| `<br/>` | Xuống dòng giữa các thông tin |
| `<i>` hoặc `<em>` | Ghi chú phụ, nhãn phụ |

**Không dùng:** `<script>`, `<img>`, `<a>`, `<div>`, `<style>` — FE lọc bỏ script nhưng các thẻ cấu trúc sẽ phá layout.

**Ví dụ `content` chuẩn:**
```html
<b>Nguyễn Văn A</b> đã tạo yêu cầu cuộc họp <b>"Kick-off Q3"</b> chờ phê duyệt.<br/>Phòng: Apollo 101 · 09:00 ngày 15/08/2026
```

---

## 3. Danh sách loại thông báo cần kiểm tra lại template

Dưới đây là các `notificationType` FE đang nhận — BE cần rà soát template của từng loại:

| `notificationType` | Mô tả | Có nhắc actor? |
|---|---|---|
| `APPROVAL_REQUEST` | Yêu cầu đặt phòng / phê duyệt | ✅ Có (người tạo yêu cầu) |
| `APPROVAL_RESULT` | Kết quả phê duyệt | ✅ Có (người phê duyệt) |
| `NO_SHOW_ALERT` | Cảnh báo vắng mặt | ❌ Không cần actor |
| `DEVICE_FAULT` | Thiết bị lỗi | ❌ Không cần actor |
| `SECURITY_ALERT` | Cảnh báo bảo mật | ✅ Có thể có (tài khoản bị tác động) |
| `MEETING_MINUTES_PUBLISHED` | Ban hành biên bản | ✅ Có (người ban hành) |
| `SYSTEM_INFO` | Thông báo hệ thống | ❌ Không cần actor |

---

## 4. Action items

| # | Hạng mục | Phụ trách | Mức độ |
|---|---|---|---|
| 1 | Sửa tất cả notification template dùng `{actorFullName}` thay vì `{actorId}` / `{userId}` | BE | 🔴 Cao |
| 2 | Rà soát toàn bộ các `notificationType` trong bảng trên, đặc biệt `APPROVAL_REQUEST` và `MEETING_MINUTES_PUBLISHED` | BE | 🔴 Cao |
| 3 | Đảm bảo `content` dùng HTML hợp lệ theo quy ước mục 2.2 | BE | 🟡 Trung bình |
| 4 | Test lại sau khi sửa bằng cách trigger từng loại thông báo và kiểm tra `content` trả về | BE + FE | 🟡 Trung bình |
