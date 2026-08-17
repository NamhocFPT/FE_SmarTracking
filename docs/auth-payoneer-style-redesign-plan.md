# Kế hoạch: Áp dụng phong cách thiết kế Payoneer-reference cho nhóm màn hình Auth

**Ngày lập:** 2026-08-02
**Ảnh tham chiếu:** Payoneer Sign In (split-screen: panel trái tối màu + tagline + ảnh sản phẩm; panel phải trắng, input dạng pill, nút CTA gradient, top bar logo + Sign Up, bottom bar copyright + Contact Us + ngôn ngữ).
**Phạm vi:** 4 màn `/login`, `/forgot-password`, `/verify-otp`, `/change-password`.

---

## 1. Hiện trạng — quan trọng: KHÁC với lần audit trước

Lần trước tôi viết context ([auth-screens-redesign-context.md](./auth-screens-redesign-context.md)) dựa trên bản code cũ (4 file tự viết riêng lẻ, 2 hệ màu khác nhau). **Từ đó đến nay code đã được viết lại đáng kể** (có vẻ đang được một phiên làm việc khác song song thực hiện dựa trên chính context đó). Hiện trạng thực tế bây giờ:

- Đã có **5 component dùng chung** tại `src/component/Auth/`:
  - [`AuthLayout.jsx`](../src/component/Auth/AuthLayout.jsx) — khung split-screen chuẩn: trái `bg-midnight-indigo` chứa `AuthHeroPanel`, phải card trắng bo góc `rounded-[40px]` nổi trên nền tối, dùng chung cho cả 4 màn qua prop `variant`.
  - [`AuthHeroPanel.jsx`](../src/component/Auth/AuthHeroPanel.jsx) — hero bên trái, **mỗi variant có hiệu ứng hình ảnh riêng, khá phức tạp**: login = collage 4 ảnh cuộn 3D liên tục, forgot = 1 ảnh nổi bồng bềnh, otp = 3 thẻ xoè hình quạt, changepass = ảnh giữa vòng tròn xoay + hiệu ứng glow. Tất cả dùng ảnh thật trong `src/assets/images/Slideauth/Slide1-4.png`.
  - [`PasswordInput.jsx`](../src/component/Auth/PasswordInput.jsx) — input mật khẩu dùng chung, có nút hiện/ẩn.
  - [`BackToLoginLink.jsx`](../src/component/Auth/BackToLoginLink.jsx) — link quay lại đăng nhập dùng chung.
  - [`AuthAlert.jsx`](../src/component/Auth/AuthAlert.jsx) — khối thông báo lỗi/thành công dùng chung.
- Cả 4 trang (`login.jsx`, `forgotpassword.jsx`, `vertifyOTP.jsx`, `changePass.jsx`) đã **import và dùng đúng** 5 component trên, dùng font `font-gilroy` cho heading và token `midnight-indigo`/`action-blue`/`slate-blue`/`platinum-tint` khá nhất quán.

→ Phần lớn vấn đề "2 hệ ngôn ngữ thị giác khác nhau" tôi nêu trong context trước **đã được giải quyết**. Việc redesign lần này **không phải làm lại từ đầu**, mà là **tinh chỉnh theo phong cách ảnh Payoneer** trên nền code đã thống nhất sẵn có.

---

## 2. Pattern cụ thể rút ra từ ảnh tham chiếu

| Vùng | Đặc điểm trong ảnh |
|---|---|
| Tỉ lệ 2 cột | Trái ~50%, phải ~50% (không lệch 60/40 như hiện tại) |
| Panel trái | Nền tối trơn (không hiệu ứng động), tagline nhỏ góc trên-trái, headline lớn 2 dòng góc dưới-trái (không phải giữa/trên như hiện tại), 1 ảnh sản phẩm (điện thoại) đặt lệch dưới, có 1 vòng tròn mảnh trang trí phía sau chữ |
| Top bar phải | Logo trái, link "Sign Up" phải (icon người + chữ) |
| Tiêu đề form | "Sign In" — to, đậm, không kèm mô tả phụ |
| Input | **Dạng pill bo tròn hoàn toàn** (`rounded-full`), nền xám nhạt phẳng, **không có `<label>` riêng phía trên** — placeholder đóng vai trò nhãn |
| Password | Icon con mắt ẩn/hiện bên phải, cùng hàng pill |
| Forgot password | Nằm ngay dưới ô mật khẩu, căn trái, màu accent |
| Nút CTA | Pill tròn hoàn toàn, gradient màu thương hiệu, icon mũi tên + chữ, căn giữa |
| Bottom bar | Copyright trái, "Contact Us" + chọn ngôn ngữ (dropdown) phải |
| Góc dưới-trái | Icon accessibility nhỏ |

---

## 3. ⚠️ Điểm KHÔNG nên copy nguyên — sai với chức năng BE thực tế

**"Sign Up" ở top-right của ảnh KHÔNG áp dụng được cho hệ thống này.** Theo audit BE trước đó ([fe-be-api-audit.md](./fe-be-api-audit.md)): tài khoản chỉ được tạo bởi SysAdmin/BusinessAdmin qua `POST /users` (yêu cầu quyền `accounts.user.create`), **hệ thống không có API đăng ký tự phục vụ** (`/auth/register` không tồn tại). Nếu thêm link "Sign Up" dẫn tới 1 trang đăng ký công khai, tính năng đó sẽ **không có API nào để gọi** — tạo ra 1 nút chết hoặc phải tự chế logic sai với mô hình nghiệp vụ (tài khoản do quản trị viên cấp phát, không tự đăng ký).

**Phương án đúng:** giữ dòng chữ hiện có ở Login ("Bạn chưa có tài khoản? Liên hệ quản trị viên") nhưng đưa lên vị trí top-right giống bố cục ảnh, đổi nhãn thành ví dụ "Cần tài khoản? Liên hệ quản trị viên" — **không dùng chữ "Sign Up"/"Đăng ký"** vì gây hiểu lầm là có thể tự tạo tài khoản.

---

## 4. Rule FE cần tuân thủ khi chỉnh — vấn đề còn tồn tại cần dọn luôn

Dù đã thống nhất component, code hiện tại **vẫn còn dùng màu hex viết tay thay vì token** ở đúng những chỗ sắp phải sửa lại (input, vốn nằm trong phạm vi đổi sang dạng pill lần này):

- `PasswordInput.jsx` dòng 16: `bg-[#f6faff]`, `border-[#c1c6d7]`, `focus-within:border-[#0059bb]`, `focus-within:ring-[#0059bb]`
- `PasswordInput.jsx` dòng 26: `text-[#414754]`
- `login.jsx` dòng 214, `forgotpassword.jsx` dòng 120: input email dùng cùng bộ hex y hệt (bị copy-paste giữa các file thay vì tách thành component input dùng chung)
- `#0059bb` **không khớp token `action-blue` (`#006BFF`)** đã khai báo trong `tailwind.config.js` — đúng vấn đề đã nêu ở context trước, vẫn chưa được dọn dù phần lớn chỗ khác đã đổi sang token.

→ **Nhân tiện đang sửa lại input sang dạng pill, phải dọn luôn phần này**: tách 1 component `AuthTextInput` dùng chung (giống `PasswordInput` nhưng cho text/email), toàn bộ màu dùng token (`cloud-mist`/`platinum-tint`/`action-blue`/`slate-blue`), xoá hoàn toàn hex viết tay khỏi các file trên.

---

## 5. Kế hoạch thay đổi cụ thể theo từng file

### 5.1 `AuthLayout.jsx`
- Đổi tỉ lệ cột: `lg:flex-[0_0_45%] xl:flex-[0_0_40%]` → về gần 50/50 (`lg:flex-[0_0_50%]`) để khớp tỉ lệ ảnh.
- Thêm **top bar cho panel phải**: logo (dùng text/logo hiện có của SmartTracking) bên trái, link liên hệ quản trị viên bên phải (thay cho "Sign Up", xem Mục 3) — hiện top bar chỉ có logo ẩn trên mobile (dòng 14-17), cần thêm bản desktop.
- Thêm **bottom bar**: copyright (`© 2025 SmartTracking`) trái, "Liên hệ hỗ trợ" + chọn ngôn ngữ phải — hiện chưa có bottom bar nào.
- Icon accessibility góc dưới-trái panel tối: có thể bỏ qua nếu dự án chưa có accessibility toolkit tương ứng — không bắt buộc, không ảnh hưởng chức năng.

### 5.2 `AuthHeroPanel.jsx` — quyết định cần chốt trước khi sửa (xem Mục 6, câu hỏi 1)
- Nếu chọn "đơn giản hoá theo ảnh": bỏ hiệu ứng cuộn 3D/xoay/fan-out hiện tại, thay bằng 1 bố cục cố định: tagline nhỏ góc trên, headline lớn góc dưới, 1 ảnh tĩnh (có thể vẫn dùng `Slide*.png` hiện có nhưng chỉ hiển thị 1 ảnh, bỏ animation), thêm vòng tròn viền mảnh trang trí phía sau chữ (đơn giản, 1 `border rounded-full` absolute).
- Nếu chọn "giữ hiệu ứng động, chỉ chỉnh bố cục chữ": di chuyển khối `headerContent` từ căn giữa-trên (dòng 133 `items-center text-center`) xuống góc dưới-trái (`items-start text-left`, đặt cuối flex thay vì đầu), giữ nguyên phần `renderVisuals()`.

### 5.3 `PasswordInput.jsx` + `AuthTextInput.jsx` (mới)
- Bo góc: `rounded-xl` → `rounded-full` (pill).
- Màu: thay toàn bộ hex bằng token (`bg-cloud-mist`, `border-platinum-tint`, `focus-within:border-action-blue`, `focus-within:ring-action-blue`, `text-midnight-indigo`).
- Tăng padding ngang cho phù hợp hình pill (`px-5` hoặc `px-6` thay vì `px-4`).
- Tạo `AuthTextInput.jsx` mới cùng style, dùng chung cho ô email/username ở cả 4 màn (hiện đang copy-paste markup input y hệt ở `login.jsx` và `forgotpassword.jsx`) — vá luôn phần trùng lặp code đã nêu ở Mục 4.
- **Bỏ `<label>` phía trên mỗi input**, chuyển nhãn thành `placeholder` (ví dụ "Email hoặc Tên đăng nhập") — nhưng **vẫn phải giữ `aria-label` hoặc `<label className="sr-only">`** để không phá accessibility (ảnh chỉ ẩn nhãn về mặt hình ảnh, không phải bỏ hẳn cho screen reader).

### 5.4 Nút CTA (submit) — cả 4 form
- Bo `rounded-xl` → `rounded-full`.
- Style hiện tại phẳng 1 màu `bg-action-blue` → gradient nhẹ theo đúng bảng màu dự án (ví dụ `from-action-blue to-glacier-blue`), giữ đúng 2 token đã có, **không dùng gradient cam như Payoneer** (đó là màu thương hiệu của họ).
- Thêm icon mũi tên bên trái chữ như ảnh (component `forgotpassword.jsx` đã có icon mũi tên bên phải — đổi vị trí sang trái + đồng bộ cho cả 4 nút submit).

### 5.5 Tiêu đề form
- `login.jsx`: đổi heading + mô tả phụ (dòng 192-197) → theo mẫu ảnh có thể bỏ dòng mô tả phụ, chỉ giữ heading to, đậm — **nhưng cân nhắc giữ mô tả phụ vì đây là hệ thống nội bộ doanh nghiệp, không phải app tiêu dùng**, bớt mô tả có thể giảm rõ ràng cho người dùng lần đầu. Đề xuất: giữ nhưng rút gọn còn 1 dòng ngắn.

### 5.6 Các màn còn lại (Forgot/OTP/ChangePass)
- Áp dụng đồng bộ input pill + nút CTA gradient + bỏ label thừa giống Login.
- `vertifyOTP.jsx`: 6 ô OTP hiện đang `rounded-xl` vuông — theo tinh thần "pill" của ảnh có thể đổi sang `rounded-2xl` tròn hơn nhưng **không nên làm tròn hoàn toàn `rounded-full`** vì 6 ô vuông liền nhau dễ đọc hơn 6 hình tròn — đây là ngoại lệ hợp lý, không bắt buộc rập khuôn 100% theo ảnh.

---

## 6. Câu hỏi cần chốt trước khi code (đề xuất hướng đi kèm)

1. **Hero panel bên trái**: đơn giản hoá tĩnh theo đúng ảnh, hay giữ hiệu ứng động hiện có và chỉ chỉnh vị trí chữ? *(Đề xuất: giữ hiệu ứng động — vì đã đầu tư công sức làm khá kỹ cho từng variant, tháo bỏ sẽ lãng phí; chỉ cần chỉnh bố cục chữ theo ảnh.)*
2. **Tỉ lệ cột 50/50 hay giữ 45/40 hiện tại**: đổi tỉ lệ ảnh hưởng cả 4 màn cùng lúc vì dùng chung `AuthLayout`. *(Đề xuất: đổi, vì đây đúng là điểm nhận diện rõ nhất của phong cách tham chiếu.)*
3. **Ngôn ngữ dropdown ở bottom bar**: dự án hiện có đa ngôn ngữ chưa, hay chỉ hiển thị tĩnh "Tiếng Việt"? Cần xác nhận trước vì nếu chưa có i18n thật thì chỉ nên làm placeholder tĩnh, tránh tạo cảm giác tính năng đã hoạt động trong khi chưa có.

---

## 7. Không đổi (giữ nguyên logic nghiệp vụ)

- Toàn bộ luồng gọi API, validate, mapping lỗi theo mã lỗi BE (đã audit chi tiết ở [auth-screens-redesign-context.md](./auth-screens-redesign-context.md) mục 2 — vẫn đúng nguyên trạng, không bị ảnh hưởng bởi việc đổi giao diện).
- Cơ chế truyền `email`/`otp` qua `location.state` giữa các bước.
- Việc Verify OTP chỉ validate độ dài/hết hạn phía client, xác thực thật ở bước Change Password — không đổi trong lần này (đổi cái này cần thêm API BE mới, ngoài phạm vi 1 lần chỉnh giao diện).

---

## 8. Kiểm thử sau khi implement

- Chạy dev server, so sánh trực quan cả 4 màn với ảnh tham chiếu (tỉ lệ cột, hình dạng input/nút, vị trí top/bottom bar).
- Test tab qua các input bằng bàn phím + screen reader label (đảm bảo bỏ `<label>` hiển thị không làm mất `aria-label`).
- Test toàn bộ luồng thật: login sai/đúng mật khẩu, forgot-password → verify-otp (resend, hết hạn) → change-password, đảm bảo không có gì trong bước đổi UI làm hỏng handler/logic hiện có.
- Kiểm tra route `/verify-otp`, `/change-password` vẫn chặn truy cập trực tiếp khi thiếu `location.state` (guard hiện có, không được xoá khi refactor).
