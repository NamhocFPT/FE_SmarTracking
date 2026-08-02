# Context: Nhóm màn hình xác thực (Login / Quên mật khẩu / Xác thực OTP / Đặt lại mật khẩu) — chuẩn bị mở rộng & thiết kế lại UI

**Phạm vi:** 4 màn hình tạo thành 1 luồng liên tục, cần xem xét thiết kế **đồng bộ với nhau**, không tách rời:

| # | Trang | File | Route |
|---|---|---|---|
| 1 | Đăng nhập | [src/pages/auth/login/login.jsx](../src/pages/auth/login/login.jsx) | `/login` |
| 2 | Quên mật khẩu (nhập email) | [src/pages/auth/forgotpassword/forgotpassword.jsx](../src/pages/auth/forgotpassword/forgotpassword.jsx) | `/forgot-password` |
| 3 | Xác thực OTP | [src/pages/auth/forgotpassword/vertifyOTP.jsx](../src/pages/auth/forgotpassword/vertifyOTP.jsx) | `/verify-otp` |
| 4 | Đặt lại mật khẩu mới | [src/pages/auth/forgotpassword/changePass.jsx](../src/pages/auth/forgotpassword/changePass.jsx) | `/change-password` |

> Bạn chỉ nêu 3 màn (đăng nhập, quên mật khẩu, verify OTP), nhưng màn **Đặt lại mật khẩu (#4)** là bước kế tiếp bắt buộc trong cùng luồng, dùng chung hệ thống thiết kế với #2 và #3 (cùng bố cục, cùng bảng màu, cùng skeleton loading). Nên đưa cả #4 vào phạm vi redesign để tránh 1 màn bị lệch tông so với 3 màn còn lại sau khi bạn chỉnh sửa.

---

## 1. Luồng nghiệp vụ và cách 4 màn truyền dữ liệu cho nhau

```
/login ──(quên mật khẩu?)──▶ /forgot-password ──(gửi OTP thành công)──▶ /verify-otp ──(đủ 6 số)──▶ /change-password ──(đổi thành công)──▶ /login
```

- Dữ liệu được truyền giữa các trang qua **React Router `location.state`**, không qua URL param hay context toàn cục:
  - `/forgot-password` → điều hướng `navigate('/verify-otp', { state: { email } })`
  - `/verify-otp` → điều hướng `navigate('/change-password', { state: { email, otp: otpCode } })`
  - Cả `/verify-otp` và `/change-password` đều có **guard**: nếu vào thẳng URL mà không có `location.state.email` (hoặc thiếu `otp` ở màn 4) thì tự động đá về bước trước đó (`/forgot-password`) hoặc báo lỗi yêu cầu làm lại từ đầu.

- **Điểm quan trọng cần biết trước khi redesign màn Verify OTP**: màn `/verify-otp` **không gọi API nào để kiểm tra mã OTP đúng/sai**. `handleSubmit` của nó chỉ validate phía client (đủ 6 chữ số + chưa hết hạn đếm ngược 10 phút), rồi điều hướng thẳng sang `/change-password` kèm theo mã đã nhập. **Việc xác minh OTP thật sự chỉ xảy ra ở bước cuối** khi gọi `confirmPasswordReset(email, otp, newPassword, confirmPassword)` (API `POST /auth/password-reset/confirm`) tại màn Đặt lại mật khẩu — nếu OTP sai/hết hạn, lỗi sẽ hiện ra ở màn #4 chứ không phải màn #3. Nếu redesign muốn thay đổi UX (ví dụ: báo sai OTP ngay tại màn Verify), sẽ cần **thêm 1 API xác thực OTP riêng ở BE** — hiện chưa có, đây là quyết định phạm vi cần cân nhắc, không chỉ là việc đổi giao diện.

- Không có API "resend/gửi lại OTP" riêng — nút "Gửi lại mã" ở màn Verify OTP thực chất gọi lại đúng `requestPasswordResetOtp(email)` (cùng API với màn #2), chỉ reset lại 2 bộ đếm cục bộ (cooldown 60s trước khi được bấm lại, và hiệu lực OTP 10 phút).

---

## 2. API/service dùng bởi từng màn (giữ nguyên khi redesign — chỉ đổi UI, không đổi hợp đồng)

File: [src/service/authService.js](../src/service/authService.js)

| Màn | Hàm service | Endpoint | Request | Response dùng |
|---|---|---|---|---|
| Login | `login(email, password)` | `POST /auth/login` (public) | `{email, password}` | `{accessToken, refreshToken, user}` — `user.roles` quyết định trang điều hướng sau đăng nhập |
| Quên mật khẩu | `requestPasswordResetOtp(email)` | `POST /auth/password-reset/request` (public) | `{email}` | chỉ cần `success` |
| Verify OTP (nút resend) | `requestPasswordResetOtp(email)` | (như trên) | `{email}` | như trên |
| Đặt lại mật khẩu | `confirmPasswordReset(email, otp, newPassword, confirmPassword)` | `POST /auth/password-reset/confirm` (public) | `{email, otp, newPassword, confirmPassword}` | `success` → điều hướng về `/login` |

**Điều hướng sau đăng nhập theo vai trò** (`getRedirectPathByRoles`, trong `login.jsx`, dòng 100-115): đọc `user.roles[]`, ưu tiên `SYSTEM_ADMIN/ADMIN → /system-admin`, `BUSINESS_ADMIN → /business-admin`, `MANAGER → /manager`, mặc định `→ /employee`. Đây là logic nghiệp vụ, **không đụng vào khi chỉ redesign giao diện**.

**Ghi nhớ đăng nhập**: Login lưu `rememberedEmail` vào `localStorage` khi tick checkbox, tự điền lại email ở lần load trang sau — hành vi này gắn với checkbox "Ghi nhớ đăng nhập", cần giữ nếu redesign vẫn có checkbox này.

---

## 3. Vấn đề thiết kế hiện tại — lý do cần "mở rộng scope cho phù hợp"

Đây là phần quan trọng nhất cho việc redesign: **hiện 4 màn đang dùng 2 hệ ngôn ngữ thị giác khác nhau**, và cả 2 đều không map theo design token đã khai báo sẵn trong dự án.

### 3.1 Token màu đã có sẵn nhưng không được dùng nhất quán

`tailwind.config.js` đã định nghĩa sẵn bảng màu thương hiệu:

```js
'midnight-indigo': '#0B3558',
'action-blue':     '#006BFF',
'lavender-glow':   '#e55cff',
'royal-amethyst':  '#8247f5',
'sunset-gold':     '#ffa600',
'skybound-blue':   '#0099ff',
'glacier-blue':    '#004EBA',
'cloud-mist':      '#F8F9FB',
'slate-blue':      '#476788',
'platinum-tint':   '#D4E0ED',
```

Nhưng cả 4 màn auth đều **không import các token này** — toàn bộ màu được viết tay bằng arbitrary value Tailwind (`bg-[#006bff]`, `text-[#0059bb]`, `border-[#d4e0ed]`...). Hệ quả:

- **Login** dùng `#006bff` làm màu chính — trùng khớp `action-blue`, nhưng vẫn viết tay thay vì dùng token.
- **ForgotPassword / VerifyOTP / ChangePass** dùng `#0059bb` làm màu chính — **một xanh khác, không khớp bất kỳ token nào trong bảng màu**, hơi tối hơn `action-blue`.

Nghĩa là chỉ riêng nút "Đăng nhập" và nút "Gửi mã xác thực" ở 2 màn kế tiếp nhau trong cùng 1 luồng đã **lệch tông xanh**, mắt thường có thể nhận ra khi chuyển màn.

### 3.2 Font chữ không đồng nhất

- **Login**: heading dùng `Montserrat-SemiBold`, body dùng `Montserrat-Regular`.
- **3 màn còn lại**: heading dùng `Plus_Jakarta_Sans-Bold`, label/body dùng `Inter-Regular`/`Inter-SemiBold`.

→ 2 font-family khác nhau cho heading, chưa kể `tailwind.config.js` đã khai báo sẵn `fontFamily.sans = ['Montserrat', 'Inter', ...]` và `fontFamily.gilroy` — tức là dự án có sẵn hệ thống font nhưng các trang auth đang tự ý chỉ định font theo từng dòng chữ bằng arbitrary class thay vì dùng class `font-sans`/`font-gilroy`.

### 3.3 Bố cục thẻ (card) và nền khác nhau

| | Login | Forgot/OTP/ChangePass |
|---|---|---|
| Bo góc card | `rounded-2xl` | `rounded-3xl` |
| Nền trang | `bg-white` phẳng + ảnh SVG trang trí góc trên | Gradient `linear-gradient` xanh nhạt + nhiều khối blur màu hồng/tím rải rác |
| Cột phải (marketing) | Tag "CAMPUS OPERATIONS PLATFORM" + tiêu đề "Số hóa khuôn viên..." + 1 ảnh + 3 feature card ngang hàng dưới | ForgotPassword giống Login; **VerifyOTP & ChangePass lại đổi hẳn nội dung**: tag "REAL-TIME PRESENCE TRACKING" + tiêu đề "Giám sát phòng họp thông minh" + ảnh có thêm 2 badge nổi ("Tỷ lệ sử dụng 84.5%", "Phòng Apollo đang họp") + feature card xếp theo `absolute` toạ độ tuyệt đối thay vì flex layout như Login/Forgot |

→ Ngay trong cụm 3 màn "cùng 1 luồng quên mật khẩu", nội dung cột phải (hero/marketing) đã **đổi giữa chừng** (Forgot khác OTP/ChangePass), dù về mặt UX đây vẫn là cùng 1 hành trình liên tục của người dùng.

### 3.4 Code trùng lặp — nên trở thành component dùng chung khi redesign

Những khối sau **lặp lại y hệt hoặc gần y hệt bằng copy-paste** ở 3-4 file khác nhau, là ứng viên tốt để tách thành component chung trong lần thiết kế lại:

- **Nút toggle hiện/ẩn mật khẩu** (icon con mắt SVG inline) — lặp lại nguyên vẹn ở Login (1 lần) và ChangePass (2 lần, cho cả 2 ô mật khẩu).
- **Link "Quay lại Đăng nhập"** kèm icon mũi tên trái SVG inline — lặp lại y hệt ở cả 3 màn Forgot/OTP/ChangePass.
- **Mảng `featureCards`** — định nghĩa lại gần như trùng lặp ở cả 4 file (khác nhau chút ít về icon/label).
- **Error alert box / Success alert box** — mỗi màn tự viết lại markup gần giống nhau (khung đỏ có `requestId` debug, khung xanh lá cho thành công), style hơi khác nhau giữa Login (có icon SVG cảnh báo, box bo `rounded-xl`) và 3 màn còn lại (không icon, bo `rounded-lg`).
- **Skeleton loading khi mount** — Login dùng `LoginSkeleton` riêng, 3 màn kia dùng chung `AuthFormSkeleton` với prop `variant` (`'forgot' | 'otp' | 'changepass'`). Nếu gộp cả 4 màn về 1 hệ thiết kế, nên cân nhắc gộp luôn skeleton thành 1 component có variant cho cả Login.

---

## 4. Hành vi/logic UI cần giữ nguyên khi chỉ đổi phần nhìn

Đây là các quy tắc tương tác đã cài đặt kỹ, không nên vô tình làm mất khi vẽ lại UI:

- **Login**: validate email theo regex, validate password không rỗng; khi gõ lại vào ô đang báo lỗi thì lỗi tự biến mất (`if (emailError) setEmailError(null)` mỗi lần `onChange`) — mẫu hình này lặp lại ở tất cả các ô input của cả 4 màn, nên giữ nguyên hành vi "gõ là hết lỗi" khi thiết kế lại input.
- **Login**: sau đăng nhập thành công, có màn hình **loading toàn màn hình 1.2s** ("Đăng nhập thành công! Đang chuyển hướng...") trước khi điều hướng — không redirect ngay lập tức.
- **Verify OTP**:
  - 6 ô input riêng biệt, hỗ trợ gõ tuần tự tự nhảy ô kế, `Backspace` xoá lùi về ô trước, phím mũi tên trái/phải di chuyển focus, và **paste nguyên chuỗi 6 số** tự động điền vào đủ 6 ô (`handlePaste`).
  - Bộ đếm ngược kép độc lập: **cooldown gửi lại (60s)** và **hiệu lực mã OTP (10 phút)** — 2 con số khác nhau, hiển thị riêng, không được gộp làm 1.
  - Đồng hồ hiệu lực chuyển sang màu đỏ + nhấp nháy khi còn dưới 60 giây (`expiryTime < 60`).
- **Change Password**:
  - Thanh đo độ mạnh mật khẩu 3 vạch (yếu/trung bình/mạnh), tính điểm dựa trên độ dài ≥8, có cả hoa+thường, có cả số+ký tự đặc biệt.
  - Validate chi tiết từng quy tắc mật khẩu bằng thông báo lỗi cụ thể (thiếu hoa, thiếu số, thiếu ký tự đặc biệt...) chứ không chỉ 1 câu chung chung.
  - Nút submit chỉ bật (`disabled`) khi cả mật khẩu đủ mạnh và 2 ô khớp nhau (`isFormValid`).
- **Cả 4 màn**: input `disabled={loading}` trong lúc gọi API, nút submit đổi label sang trạng thái "Đang xử lý.../Đang gửi.../Đang xác thực.../Đang cập nhật..." — mẫu hình loading-label nhất quán, nên giữ.
- **Mapping lỗi từ BE sang thông điệp tiếng Việt thân thiện** — mỗi màn có 1 khối `try/catch` tự dịch mã lỗi BE (`EMAIL_NOT_FOUND`, `TOO_MANY_REQUESTS`, `INVALID_OTP`, `OTP_EXPIRED`, `WEAK_PASSWORD`...) sang câu tiếng Việt cụ thể — đây là logic nghiệp vụ hiển thị lỗi, tách biệt với phần trình bày UI, redesign chỉ nên đổi *cách hiển thị* khối lỗi (màu, icon, vị trí) chứ không đổi nội dung/logic chọn thông điệp.

---

## 5. Responsive hiện tại

Cả 4 màn dùng chung 1 kiểu: layout 2 cột (`flex-col lg:flex-row`), cột phải (marketing/hero) bị **ẩn hoàn toàn** dưới breakpoint `lg` (`hidden lg:flex`) — trên mobile/tablet chỉ còn form card căn giữa màn hình, không có gì thay thế cho phần nội dung marketing đã ẩn đi. Đây là điểm cần quyết định khi redesign: giữ nguyên cách ẩn hẳn, hay thiết kế 1 phiên bản rút gọn của phần hero cho mobile.

---

## 6. Gợi ý phạm vi cần quyết định trước khi bắt tay vẽ lại (không bắt buộc, chỉ để tham khảo)

1. **Chọn 1 hệ màu duy nhất** cho cả 4 màn — khuyến nghị dùng thẳng token đã có (`action-blue`, `midnight-indigo`, `slate-blue`, `platinum-tint`...) thay vì thêm hex mới, để đồng bộ với phần còn lại của ứng dụng (các trang dashboard nội bộ đã dùng đúng các token này).
2. **Chọn 1 font-family** cho heading và 1 cho body, áp dụng xuyên suốt 4 màn thay vì Montserrat riêng cho Login và Inter/Plus Jakarta Sans riêng cho 3 màn kia.
3. **Thống nhất nội dung cột marketing bên phải** — quyết định giữ 1 bộ nội dung xuyên suốt cả hành trình (không đổi tag/tiêu đề/feature card giữa chừng như hiện tại giữa Forgot và OTP/ChangePass), hoặc nếu vẫn muốn đổi nội dung theo ngữ cảnh từng bước thì nên có chủ đích rõ ràng thay vì ngẫu nhiên như hiện tại.
4. **Tách các phần lặp lại thành component dùng chung**: `PasswordInput` (có toggle mắt), `BackToLoginLink`, `AuthErrorAlert`/`AuthSuccessAlert`, `AuthCard` (khung trắng bo góc + shadow bao ngoài form), `AuthHeroPanel` (cột phải). Việc này giúp sau khi redesign, sửa 1 nơi là đồng bộ cả 4 màn thay vào phải sửa lặp lại 4 lần như hiện tại.
5. **Quyết định UX cho bước Verify OTP**: giữ nguyên cách hiện tại (chỉ validate độ dài, để BE báo sai OTP ở bước đổi mật khẩu), hay bổ sung API xác thực OTP riêng để báo lỗi ngay tại màn Verify — đây là quyết định ảnh hưởng cả BE, cần cân nhắc trước khi cam kết thiết kế UI có ô báo lỗi "OTP sai" ngay tại màn 3.
6. **Quyết định trải nghiệm mobile** cho phần nội dung marketing hiện đang bị ẩn hoàn toàn dưới `lg` breakpoint.
