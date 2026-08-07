# WORKSPACE RULES

- **BẮT BUỘC ĐỐI VỚI FRONTEND**: Trước khi thực hiện bất kỳ thay đổi nào liên quan đến code Frontend, AI Agent BẮT BUỘC phải đọc và tuân thủ toàn bộ các quy tắc được định nghĩa trong file `src/docs/AGENTS.md` (`C:\Users\ASUS\Documents\ĐỒ ÁN SUMMER 2026\fe_smartracking\src\docs\AGENTS.md`). Đây là bộ rule cố định và cao nhất dành cho Frontend.
- **BẮT BUỘC GHI LOG THAY ĐỔI**: AI Agent phải BẮT BUỘC tự động ghi log mọi thay đổi (kèm tên plan thực hiện nếu có) vào file `docs/ai_agents_changelog.md` sau khi hoàn thành một yêu cầu có sửa đổi code hoặc tài liệu, mà không cần người dùng nhắc nhở. Xem chi tiết tại `src/docs/AGENTS.md`.
