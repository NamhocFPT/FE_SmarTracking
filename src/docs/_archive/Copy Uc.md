1. ## Authentication & Authorization

1. #### **UC-AUTH-01 Đăng nhập hệ thống** 

| UC ID and Name: | UC-AUTH-01 Đăng nhập hệ thống  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee,Manager , Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình người dùng đăng nhập vào hệ thống.  |  |  |
| Trigger: | Người dùng truy cập vào màn hình Đăng nhập của hệ thống và muốn truy cập vào không gian làm việc cá nhân.  |  |  |
| Preconditions: | **PRE-1.** Người dùng đã được cấp một tài khoản hợp lệ trên hệ thống.  **PRE-2.** Trạng thái tài khoản của người dùng đang ở trạng thái kích hoạt (Active).  |  |  |
| Postconditions: | **POST-1.** Hệ thống thiết lập phiên làm việc (Session/Token) thành công cho người dùng.  **POST-2.** Người dùng được chuyển hướng đến Trang chủ (Dashboard) với giao diện hiển thị đúng cấu trúc menu theo quyền hạn được phân bổ.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào màn hình đăng nhập của hệ thống. 2\. Hệ thống hiển thị biểu mẫu yêu cầu nhập thông tin, bao gồm hai trường dữ liệu: "Email" và "Mật khẩu". 3\. Người dùng nhập địa chỉ Email, Mật khẩu cá nhân và nhấn nút "Đăng nhập". 4\. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 5\. Hệ thống đối chiếu thông tin xác thực với dữ liệu được lưu trữ trong cơ sở dữ liệu. 6\. Hệ thống kiểm tra tình trạng hoạt động hiện tại của tài khoản 7\. Hệ thống thiết lập phiên đăng nhập mới và tải cấu hình quyền hạn (Role/Permission) của người dùng. 8\. Hệ thống chuyển hướng người dùng đến Trang chủ (Dashboard) và hiển thị thông báo: "Đăng nhập thành công". |  |  |
| Alternative Flow: | **AF1: Quên mật khẩu** 1\. Người dùng chọn "Quên mật khẩu?". 2\. Chuyển hướng người dùng sang màn hình Yêu cầu đặt lại mật khẩu (Reset Password). **AF2: Hiển thị mật khẩu khi nhập** 1\. Tại bước 3, người dùng nhấp chọn vào biểu tượng "con mắt" bên cạnh trường Mật khẩu. 2\. Hệ thống thực hiện chuyển đổi định dạng ký tự từ dạng ẩn (\*\*\*) sang dạng văn bản thuần (Plain text) giúp người dùng kiểm tra lỗi chính tả trước khi nhấn Đăng nhập. |  |  |
| Exceptions: | **EX1:** Nếu người dùng bỏ trống trường thông tin hoặc nhập sai định dạng cấu trúc email, hệ thống bôi đỏ trường tương ứng và hiển thị cảnh báo lỗi trực tiếp ("Email không đúng định dạng" hoặc "Vui lòng nhập mật khẩu"). **EX2:** Nếu email không tồn tại trên hệ thống hoặc mật khẩu nhập vào không trùng khớp, hệ thống từ chối cấp quyền và hiển thị thông báo lỗi chung: "Email hoặc mật khẩu không chính xác. Vui lòng thử lại." **EX3:** Nếu tài khoản của người dùng đang bị khóa, hệ thống chặn tiến trình và hiển thị thông báo: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với Quản trị viên để được hỗ trợ." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất cao  |  |  |
| Business Rules: | **BR1:** Nền tảng sử dụng duy nhất tài khoản Email làm định danh tài khoản đăng nhập, cho phép liên kết với bất kỳ nhà cung cấp email hợp lệ nào và hoàn toàn loại bỏ trường Tên đăng nhập (Username) ra khỏi luồng xác thực hệ thống.  |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

1. #### **UC-AUTH-02 Đăng xuất khỏi hệ thống**


| UC ID and Name: | UC-AUTH-02 Đăng xuất khỏi hệ thống  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager, Business Admin, System Admin  | Secondary Actors: |  |
| Description | Use case mô tả quá trình người dùng đăng xuất khỏi hệ thống.  |  |  |
| Trigger: | Người dùng truy cập vào màn hình và chủ động muốn kết thúc phiên làm việc hiện tại trên phần mềm.  |  |  |
| Preconditions: | **PRE-1.** Người dùng đang trong trạng thái đăng nhập hợp lệ trên hệ thống.  **PRE-2.** Người dùng đang truy cập vào giao diện làm việc của hệ thống.  |  |  |
| Postconditions: | **POST-1.** Phiên làm việc (Session/Token) hiện tại của người dùng bị chấm dứt và hủy bỏ hoàn toàn.  **POST-2**. Người dùng được chuyển hướng quay trở lại màn hình Đăng nhập và không còn quyền truy cập các trang nội bộ.  |  |  |
| Normal Flow: | 1\. Người dùng nhấn vào biểu tượng đại diện (Avatar) hoặc khu vực quản lý tài khoản ở góc trên cùng bên phải giao diện hệ thống. 2\. Hệ thống hiển thị một menu danh sách các tùy chọn mở rộng của tài khoản. 3\. Người dùng chọn chức năng "Đăng xuất". 4\. Hệ thống thực hiện lệnh hủy phiên làm việc đang hoạt động của tài khoản này trên thiết bị hiện tại. 5\. Hệ thống tiến hành xóa sạch các thông tin ghi nhớ trạng thái đăng nhập tạm thời lưu trên trình duyệt web của người dùng. 6\. Hệ thống chuyển hướng giao diện về màn hình Đăng nhập và hiển thị thông báo: "Đăng xuất thành công". |  |  |
| Alternative Flow: | **N/A**  |  |  |
| Exceptions: | N/A  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1**: Ngay sau khi lệnh đăng xuất được thực hiện thành công, mọi yêu cầu truy cập tiếp theo vào các đường dẫn nội bộ (URL) của hệ thống từ thiết bị đó mà không có thông tin xác thực mới đều sẽ bị hệ thống chặn lại và tự động ép chuyển hướng về trang đăng nhập.  **BR2:** Hành động đăng xuất trên trình duyệt/thiết bị hiện tại chỉ chấm dứt duy nhất phiên làm việc của thiết bị đó, không làm ảnh hưởng đến các phiên đăng nhập hợp lệ khác của cùng một tài khoản đang hoạt động trên các thiết bị hoặc trình duyệt khác.  |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

1. #### **UC-AUTH-03 Tạo yêu cầu đặt lại mật khẩu bằng OTP** 

| UC ID and Name: | UC-AUTH-03 Tạo yêu cầu đặt lại mật khẩu bằng OTP  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager, Business Admin, System Admin  | Secondary Actors: | Hệ thống Email  |
| Description | Use case mô tả quá trình người dùng yêu cầu đặt lại mật khẩu thông qua mã xác thực OTP gửi về Email.  |  |  |
| Trigger: | Người dùng quên mật khẩu và nhấn vào liên kết "Quên mật khẩu?" tại màn hình đăng nhập của hệ thống.  |  |  |
| Preconditions: | **PRE-1.** Người dùng đang truy cập tại màn hình Đăng nhập của hệ thống web.  **PRE-2.** Người dùng sở hữu một tài khoản email đang hoạt động và đã được đăng ký trên hệ thống.  |  |  |
| Postconditions: | **POST-1.** Mật khẩu cũ của người dùng bị hủy bỏ và mật khẩu mới được cập nhật thành công vào hệ thống.  **POST-2.** Hệ thống tự động chuyển hướng người dùng quay lại màn hình Đăng nhập để sử dụng mật khẩu mới.  |  |  |
| Normal Flow: | 1\. Người dùng nhấn vào tùy chọn "Quên mật khẩu?" tại màn hình đăng nhập. 2\. Hệ thống hiển thị giao diện yêu cầu khôi phục mật khẩu, yêu cầu người dùng nhập địa chỉ Email. 3\. Người dùng nhập địa chỉ Email và nhấn nút "Gửi mã xác nhận". 4\. Hệ thống kiểm tra tính hợp lệ, sự tồn tại và trạng thái hoạt động của địa chỉ email này trong cơ sở dữ liệu. 5\. Hệ thống khởi tạo một mã xác thực (OTP) ngẫu nhiên gồm 6 chữ số và gửi đến địa chỉ email của người dùng. 6\. Hệ thống chuyển hướng người dùng sang màn hình "Xác thực & Đặt lại mật khẩu" và bắt đầu đếm ngược thời gian hiệu lực của mã. 7\. Người dùng lấy mã OTP từ email, nhập mã cùng với mật khẩu mới (và xác nhận mật khẩu mới) vào biểu mẫu rồi nhấn nút "Xác nhận". 8\. Hệ thống kiểm tra tính hợp lệ của mã OTP và kiểm tra độ an toàn của mật khẩu mới. 9\. Hệ thống lưu lại mật khẩu mới, hiển thị thông báo "Đổi mật khẩu thành công" và tự động chuyển người dùng quay lại màn hình Đăng nhập. |  |  |
| Alternative Flow: | **AF1: Yêu cầu gửi lại mã (Resend OTP)** 1\. Tại màn hình nhập mã OTP (bước 6), nếu người dùng không nhận được email hoặc mã OTP đã hết hạn, người dùng nhấn nút "Gửi lại mã". 2\. Hệ thống thực hiện hủy mã OTP cũ, tạo một mã OTP mới gồm 6 chữ số, gửi lại vào email và đặt lại đồng hồ đếm ngược thời gian hiệu lực. |  |  |
| Exceptions: | **EX1:** Nếu email không tồn tại trên hệ thống hoặc tài khoản đang bị khóa, hệ thống chặn thao tác và hiển thị cảnh báo: "Email không tồn tại hoặc tài khoản đã bị khóa. Vui lòng kiểm tra lại."  **EX2:** Nếu người dùng nhập sai mã OTP hoặc mã đã quá thời gian hiệu lực, hệ thống hiển thị thông báo lỗi: "Mã xác nhận không hợp lệ hoặc đã hết hạn" và yêu cầu nhập lại hoặc lấy mã mới.  **EX3:** Nếu mật khẩu mới không đáp ứng quy tắc bảo mật hoặc phần xác nhận mật khẩu không khớp, hệ thống bôi đỏ trường tương ứng và hiển thị thông báo yêu cầu người dùng điều chỉnh lại.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Mã OTP bắt buộc phải là chuỗi 6 chữ số ngẫu nhiên và chỉ có hiệu lực trong vòng 10 phút. Quá thời gian này, mã sẽ tự động bị vô hiệu hóa trên hệ thống.  **BR2:** Mật khẩu mới thiết lập phải tuân thủ các quy tắc bảo mật của tổ chức (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, kí tự đặc biệt và số).  **BR3:** Ngay sau khi người dùng sử dụng đổi mật khẩu thành công, mã OTP đó lập tức hết giá trị sử dụng.  |  |  |
| Other Information: | Tiêu đề và nội dung Email gửi mã OTP cần rõ ràng, kèm theo ghi chú cảnh báo bảo mật không chia sẻ mã này cho bất kỳ ai.  |  |  |
| Assumptions: | N/A  |  |  |

1. #### **UC-AUTH-04 Thay đổi mật khẩu đăng nhập** 

| UC ID and Name: | UC-AUTH-04 Thay đổi mật khẩu đăng nhập  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager, Business Admin, System Admin  | Secondary Actors: |  |
| Description | Use case mô tả quá trình người dùng thay đổi mật khẩu đăng nhập hệ thống.  |  |  |
| Trigger: | Người dùng chủ động muốn nâng cao tính bảo mật cho cá nhân hoặc thay đổi mật khẩu định kỳ theo quy định.  |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập thành công vào hệ thống.  **PRE-2.** Người dùng đã truy cập vào giao diện Cấu hình tài khoản hoặc mục Thay đổi mật khẩu.  |  |  |
| Postconditions: | **POST-1.** Mật khẩu cũ bị hủy bỏ hoàn toàn và không còn hiệu lực trên hệ thống.  **POST-2.** Mật khẩu mới được áp dụng và kích hoạt ngay lập tức cho các lần xác thực tiếp theo.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phần cài đặt tài khoản cá nhân và chọn tính năng "Thay đổi mật khẩu". 2\. Hệ thống hiển thị biểu mẫu yêu cầu nhập thông tin bao gồm ba trường: "Mật khẩu hiện tại" (Mật khẩu cũ), "Mật khẩu mới", và "Xác nhận mật khẩu mới". 3\. Người dùng nhập đầy đủ các thông tin vào các trường tương ứng và nhấn nút "Cập nhật". 4\. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 5\. Hệ thống đối chiếu mật khẩu hiện tại do người dùng nhập với thông tin xác thực lưu trữ trong cơ sở dữ liệu. 6\. Hệ thống xác nhận thông tin trùng khớp, ghi nhận mật khẩu mới và chấm dứt hiệu lực của mật khẩu cũ. 7\. Hệ thống hiển thị thông báo: "Thay đổi mật khẩu thành công". |  |  |
| Alternative Flow: | **AF1: Hiển thị/Ẩn ký tự mật khẩu** 1\. Người dùng click vào biểu tượng ẩn/hiển thị (hình con mắt) ở cuối trường nhập liệu. 2\. Hệ thống thực hiện chuyển đổi định dạng ký tự từ dạng ẩn (\*\*\*) sang dạng văn bản thuần hoặc ngược lại để người dùng kiểm tra thông tin. |  |  |
| Exceptions: | **EX1:** Nếu người dùng để trống một hoặc nhiều trường thông tin, hệ thống bôi đỏ trường thiếu và hiển thị cảnh báo yêu cầu nhập đầy đủ thông tin.  **EX2:** Nếu người dùng nhập sai mật khẩu hiện tại, hệ thống từ chối cập nhật và hiển thị lỗi: "Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại."  **EX3:** Nếu mật khẩu mới do người dùng đặt không đáp ứng quy tắc bảo mật, hệ thống sẽ hiển thị thông báo lỗi và gợi ý các quy tắc đặt mật khẩu an toàn.  **EX4:** Nếu nội dung nhập ở trường "Mật khẩu mới" và "Xác nhận mật khẩu mới" không giống nhau, hệ thống sẽ cảnh báo: "Mật khẩu xác nhận không trùng khớp."  **EX5:** Nếu người dùng nhập mật khẩu mới giống hệt với mật khẩu hiện tại, hệ thống sẽ từ chối và hiển thị thông báo: "Mật khẩu mới không được trùng với mật khẩu hiện tại."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Mật khẩu mới bắt buộc phải tuân thủ độ dài tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

## 2\. Account Management

1. #### **UC-AM-01 Tạo tài khoản nhân viên thủ công** 

| UC ID and Name: | UC-AM-01 Tạo tài khoản nhân viên thủ công  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: | Hệ thống Email  |
| Description | Use case mô tả quá trình quản trị viên tạo tài khoản nhân viên mới một cách thủ công. |  |  |
| Trigger: | Cấp quản lý hoặc quản trị viên cần cấp tài khoản truy cập hệ thống cho một nhân sự mới một cách đơn lẻ. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập vào hệ thống và có quyền quản lý tài khoản. **PRE-2.** Hệ thống đã có sẵn danh mục các phòng ban và phân quyền (Vai trò) để lựa chọn. |  |  |
| Postconditions: | **POST-1.** Một tài khoản mới được khởi tạo thành công trên hệ thống và ở trạng thái hoạt động (Active). **POST-2.** Email chứa thông tin tài khoản (Email đăng nhập và mật khẩu ngẫu nhiên) được gửi thành công đến hộp thư của nhân sự mới. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý tài khoản" và chọn "Tạo tài khoản mới". 2\. Hệ thống hiển thị biểu mẫu nhập liệu với các thông tin yêu cầu: Họ và tên, Địa chỉ Email, Vai trò, và Phòng ban. 3\. Người dùng điền đầy đủ các thông tin của nhân viên mới vào biểu mẫu và nhấn nút "Tạo tài khoản". 4\. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 5\. Hệ thống kiểm tra sự tồn tại của địa chỉ email để đảm bảo tính duy nhất trên toàn hệ thống. 6\. Hệ thống ghi nhận thông tin, khởi tạo không gian làm việc cho nhân viên và tự động sinh ra một mật khẩu ngẫu nhiên đạt chuẩn bảo mật. 7\. Hệ thống tự động kích hoạt tiến trình gửi email thông báo chứa Email đăng nhập và Mật khẩu tạm thời đến địa chỉ email vừa đăng ký. 8\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Tạo tài khoản thành công" và làm mới danh sách tài khoản hiển thị. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **EX1:** Nếu người dùng bỏ trống các trường bắt buộc hoặc nhập sai định dạng email, hệ thống bôi đỏ các khu vực bị lỗi và hiển thị thông báo yêu cầu người dùng điền đầy đủ và chính xác thông tin. **EX2:** Nếu email được nhập đã tồn tại trong hệ thống, hệ thống từ chối tạo mới và hiển thị cảnh báo: "Địa chỉ email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Địa chỉ Email là định danh duy nhất của mỗi tài khoản và tuyệt đối không được phép trùng lặp. **BR2:** Mật khẩu ngẫu nhiên do hệ thống tự sinh phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. **BR3:** Bất kỳ tài khoản nào được tạo mới thông qua chức năng này đều mặc định bị gắn cờ yêu cầu bắt buộc đổi mật khẩu ngay trong lần đăng nhập thành công đầu tiên. |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

2. #### **UC-AM-02 Tạo tài khoản nhân viên bằng import Excel** 

| UC ID and Name: | UC-AM-02 Tạo tài khoản nhân viên bằng import Excel  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên tạo tài khoản nhân viên bằng cách nhập danh sách từ tệp Excel. |  |  |
| Trigger: | Cấp quản lý có một danh sách nhân sự mới cần cấp tài khoản đồng loạt và muốn tải tệp danh sách này lên hệ thống để tiết kiệm thời gian thay vì tạo từng người. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập vào hệ thống và được phân quyền sử dụng chức năng quản lý tài khoản. **PRE-2.** Người dùng đã chuẩn bị sẵn tệp danh sách nhân viên theo đúng cấu trúc mẫu mà hệ thống quy định. |  |  |
| Postconditions: | **POST-1.** Các tài khoản hợp lệ có trong tệp được khởi tạo thành công trên hệ thống và ở trạng thái sẵn sàng hoạt động. **POST-2**. Hệ thống đã phát lệnh gửi email chứa thông tin xác thực ban đầu (Email đăng nhập và Mật khẩu) cho toàn bộ các tài khoản vừa được tạo mới. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý tài khoản" và chọn tính năng "Nhập danh sách từ Excel". 2\. Hệ thống hiển thị giao diện tải tệp lên và cung cấp một tùy chọn tải về tệp cấu trúc mẫu chuẩn. 3\. Người dùng chọn tệp Excel danh sách nhân viên từ thiết bị của mình và nhấn nút "Tải lên & Kiểm tra". 4\. Hệ thống đọc nội dung tệp và thực hiện kiểm tra tính hợp lệ của toàn bộ dữ liệu. 5\. Hệ thống hiển thị bản xem trước (preview) kết quả kiểm tra, báo cáo tổng số lượng tài khoản hợp lệ đủ điều kiện tạo mới và danh sách các dòng dữ liệu bị lỗi. 6\. Người dùng kiểm tra báo cáo, xác nhận và nhấn nút "Tiến hành tạo tài khoản" đối với các dòng hợp lệ. 7\. Hệ thống tự động xử lý, khởi tạo không gian làm việc cho từng nhân viên, đồng thời sinh ra một mật khẩu ngẫu nhiên đạt chuẩn an toàn cho mỗi tài khoản. 8\. Hệ thống tự động kích hoạt tiến trình gửi email thông báo chứa email đăng nhập và mật khẩu tạm thời đến từng cá nhân. 9\. Hệ thống hiển thị thông báo tổng kết quá trình nhập dữ liệu thành công và làm mới lại danh sách tài khoản hiện có. |  |  |
| Alternative Flow: | **AF1: Tải tệp cấu trúc mẫu** 1\. Tại bước 2, người dùng nhấn vào nút "Tải tệp mẫu". 2\. Hệ thống thực hiện tải về tệp Excel có định dạng chuẩn (chứa sẵn các tiêu đề thông tin cần thiết) về máy tính để người dùng điền dữ liệu cho chính xác. |  |  |
| Exceptions: | **EX1:** Nếu tệp tải lên không phải là định dạng tệp bảng tính hợp lệ (ví dụ không phải .xlsx, .xls) hoặc dung lượng vượt quá giới hạn hệ thống cho phép, hệ thống từ chối nhận tệp và hiển thị thông báo lỗi: "Tệp không đúng định dạng hoặc vượt quá dung lượng cho phép. Vui lòng thử lại." **EX2:** Đối với các dòng dữ liệu bị thiếu thông tin bắt buộc, sai cấu trúc hoặc có email đã tồn tại từ trước trên hệ thống, hệ thống sẽ bôi đỏ các dòng đó trên bản xem trước, nêu rõ nguyên nhân lỗi, và tự động loại bỏ những dòng này ra khỏi luồng xử lý tạo mới. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | BR1: Mật khẩu ngẫu nhiên do hệ thống tự sinh phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. BR2: Hệ thống vẫn sẽ tiếp tục tạo tài khoản cho những dòng dữ liệu hoàn toàn hợp lệ, các dòng lỗi sẽ bị bỏ qua và không làm gián đoạn việc tạo các tài khoản khác trong cùng một tệp. BR3: Các tài khoản mới được tạo thông qua hình thức nhập liệu hàng loạt này đều được gán cờ yêu cầu bắt buộc phải đổi mật khẩu trong lần đăng nhập đầu tiên. BR4: Hệ thống sử dụng duy nhất tài khoản Email làm định danh tài khoản đăng nhập, hoàn toàn không sử dụng trường Username (Tên đăng nhập). |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A |  |  |

3. #### **UC-AM-03 Khởi tạo phòng ban mới** 

| UC ID and Name: | UC-AM-03 Khởi tạo phòng ban mới  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên khởi tạo một phòng ban mới trên hệ thống. |  |  |
| Trigger: | Cấp quản lý cần thiết lập một đơn vị, bộ phận hoặc nhóm làm việc mới vào cơ cấu tổ chức trên hệ thống để bắt đầu phân bổ nhân sự. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập vào hệ thống với phân quyền Quản lý hoặc Quản trị viên. **PRE-2.** Người dùng đang truy cập vào module Quản lý cơ cấu tổ chức/Quản lý phòng ban**.** |  |  |
| Postconditions: | **POST-1.** Một đơn vị phòng ban mới được khởi tạo và ghi nhận thành công vào hệ thống. **POST-2.** Phòng ban mới lập tức xuất hiện trong các danh sách lựa chọn (dropdown) khi tiến hành tạo mới hoặc cập nhật tài khoản nhân viên. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào màn hình danh sách phòng ban và chọn chức năng "Thêm phòng ban mới". 2\. Hệ thống hiển thị biểu mẫu nhập liệu bao gồm các thông tin: Tên phòng ban, Mã phòng ban. 3\. Người dùng nhập đầy đủ Tên, Mã phòng ban và thiết lập thông tin quản lý liên quan, sau đó nhấn nút "Lưu". 4\. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 5\. Hệ thống kiểm tra sự tồn tại của Mã phòng ban và Tên phòng ban để đảm bảo tính duy nhất trên toàn tổ chức. 6\. Hệ thống ghi nhận thông tin cấu trúc phòng ban mới vào dữ liệu hệ thống. 7\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Khởi tạo phòng ban thành công" và làm mới lại giao diện danh sách sơ đồ tổ chức. |  |  |
| Alternative Flow: | **AF1: Hủy bỏ thao tác** 1\. Tại bước 3, người dùng nhấn nút "Hủy bỏ". 2\. Hệ thống sẽ đóng biểu mẫu nhập liệu, xóa các thông tin đang nhập dở và quay trở về màn hình trước đó mà không lưu lại dữ liệu. |  |  |
| Exceptions: | **EX1:** Nếu người dùng không nhập Tên hoặc Mã phòng ban, hệ thống sẽ chặn thao tác lưu, bôi đỏ các trường bị thiếu và yêu cầu người dùng bổ sung đầy đủ. **EX2:** Nếu hệ thống phát hiện Mã hoặc Tên phòng ban vừa nhập đã tồn tại trong một đơn vị khác, hệ thống sẽ từ chối tạo mới và hiển thị cảnh báo lỗi: "Mã phòng ban hoặc Tên phòng ban này đã được sử dụng. Vui lòng chọn một định danh khác." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Mã phòng ban bắt buộc phải là một chuỗi định danh duy nhất trên toàn hệ thống để phục vụ việc đồng bộ và chuẩn hóa dữ liệu nội bộ. **BR2:** Tên phòng ban phải là duy nhất để tránh gây nhầm lẫn trong quá trình hiển thị hoặc phân công nhân sự sau này. |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A |  |  |

4. #### **UC-AM-04 Cập nhật vai trò và quyền tài khoản** 

| UC ID and Name: | UC-AM-04 Cập nhật vai trò và quyền tài khoản  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên cập nhật vai trò và quyền hạn của một tài khoản trên hệ thống. |  |  |
| Trigger: | Có sự thay đổi về vị trí công tác, chức vụ của nhân viên (thăng tiến, luân chuyển công tác) đòi hỏi điều chỉnh lại mức độ truy cập các tính năng trên hệ thống cho phù hợp. |  |  |
| Preconditions: | **PRE-1.** Người dùng thực hiện thao tác đã đăng nhập thành công và được cấp thẩm quyền quản lý tài khoản/phân quyền. **PRE-2.** Tài khoản mục tiêu cần thay đổi quyền đang tồn tại và hoạt động bình thường trên hệ thống. |  |  |
| Postconditions: | **POST-1.** Vai trò và nhóm quyền hạn mới của tài khoản mục tiêu được cập nhật thành công vào cơ sở dữ liệu. **POST-2.** Các quyền hạn mới có hiệu lực ngay lập tức (hoặc trong phiên đăng nhập tiếp theo), cho phép hoặc ngăn chặn người dùng đó truy cập vào các chức năng tương ứng. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý tài khoản" và sử dụng thanh tìm kiếm để tìm tài khoản nhân viên cần điều chỉnh. 2\. Người dùng nhấn vào nút "Cập nhật" hoặc "Phân quyền" tương ứng với tài khoản đó. 3\. Hệ thống hiển thị biểu mẫu cập nhật, trong đó có danh sách thả xuống (dropdown) chứa các vai trò khả dụng của hệ thống (ví dụ: Nhân viên, Quản lý, Quản trị viên). 4\. Người dùng lựa chọn một vai trò mới thay thế cho vai trò hiện tại và nhấn nút "Lưu thay đổi". 5\. Hệ thống tiếp nhận yêu cầu và kiểm tra tính hợp lệ của thao tác (đảm bảo người dùng có đủ thẩm quyền để cấp vai trò này). 6\. Hệ thống tiến chỉnh ghi nhận và áp dụng bộ quyền hạn mới cho tài khoản mục tiêu. 7\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Cập nhật vai trò và quyền thành công" và làm mới lại giao diện. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Một tài khoản bắt buộc phải được gắn ít nhất một vai trò (Role) hợp lệ để có thể sử dụng hệ thống, tuyệt đối không được phép để trống vai trò. **BR2:** Hệ thống phải luôn có cơ chế kiểm tra để đảm bảo toàn hệ thống lúc nào cũng có ít nhất một Quản trị viên (Administrator) hoạt động. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-AM-05 Cập nhật thông tin tài khoản nhân sự** 

| UC ID and Name: | UC-AM-05 Cập nhật thông tin tài khoản nhân sự |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên cập nhật thông tin tài khoản nhân sự. |  |  |
| Trigger: | Có sự thay đổi về thông tin cá nhân hoặc thông tin công tác của nhân viên và cấp quản lý cần ghi nhận sự thay đổi này lên hệ thống. |  |  |
| Preconditions: | **PRE-1.** Người dùng thực hiện thao tác đã đăng nhập thành công và được phân quyền truy cập chức năng Quản lý tài khoản. **PRE-2.** Tài khoản nhân sự cần cập nhật đang tồn tại và hiển thị trên hệ thống. |  |  |
| Postconditions: | **POST-1.** Các thông tin mới của nhân sự được hệ thống lưu trữ và cập nhật thành công vào cơ sở dữ liệu. **POST-2**. Các thay đổi này lập tức được phản ánh đồng bộ trên toàn bộ nền tảng. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý tài khoản" và sử dụng thanh tìm kiếm hoặc bộ lọc để tìm đến tài khoản nhân sự cần thay đổi thông tin. 2\. Người dùng nhấn vào tùy chọn "Chỉnh sửa" hoặc "Cập nhật thông tin" tại dòng dữ liệu của nhân sự đó. 3\. Hệ thống hiển thị biểu mẫu cập nhật chứa sẵn các thông tin hiện tại của nhân sự. 4\. Người dùng tiến hành thay đổi các thông tin cần thiết (mã nhân viên, số điện thoại, email, phòng ban, chức danh). 5\. Người dùng nhấn nút "Lưu thay đổi". 6\. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào. 7\. Hệ thống kiểm tra tính duy nhất của các thông tin định danh nội bộ trong cơ sở dữ liệu. 8\. Hệ thống ghi nhận các thông tin mới, đóng biểu mẫu và hiển thị thông báo: "Cập nhật thông tin nhân sự thành công". |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **EX1:** Nếu người dùng để trống các trường thông tin cốt lõi (Họ tên, Mã nhân viên, Email), hệ thống sẽ chặn thao tác lưu, bôi đỏ các trường tương ứng và hiển thị cảnh báo yêu cầu điền đầy đủ thông tin. **EX2:** Nếu người dùng nhập số điện thoại hoặc email sai định dạng chuẩn, hệ thống sẽ báo lỗi trực tiếp ngay tại trường dữ liệu đó. **EX3:** Nếu mã nhân viên hoặc địa chỉ email mới vừa nhập đã tồn tại trên hệ thống, hệ thống từ chối lưu và hiển thị cảnh báo: "Mã nhân viên (hoặc Email) này đã được sử dụng cho một tài khoản khác. Vui lòng kiểm tra lại." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Việc thay đổi Email đồng nghĩa với việc thay đổi tài khoản đăng nhập của nhân viên đó, do hệ thống sử dụng duy nhất Email làm định danh tài khoản đăng nhập và hoàn toàn loại bỏ trường Username (Tên đăng nhập). Hệ thống sẽ sử dụng Email mới này cho các phiên xác thực tiếp theo. **BR2:** Các thông tin mang tính chất cấu trúc tổ chức (Phòng ban, Quản lý trực tiếp) khi thay đổi bắt buộc phải được chọn từ danh mục đã được thiết lập sẵn trên hệ thống, không được phép nhập tự do bằng văn bản. |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | Các quyết định thay đổi thông tin công tác (điều chuyển, thăng chức) đã được ban lãnh đạo phê duyệt bên ngoài thực tế trước khi tiến hành thao tác cập nhật số hóa trên hệ thống phần mềm.  |  |  |

6. #### **UC-AM-06 Xóa tài khoản người dùng** 

| UC ID and Name: | UC-AM-06 Xóa tài khoản người dùng |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên xóa hoàn toàn một tài khoản người dùng ra khỏi hệ thống. |  |  |
| Trigger: | Quản trị viên muốn xóa một tài khoản do tạo sai hoặc tạo thừa |  |  |
| Preconditions: | **PRE-1.** Người dùng thực hiện thao tác đã đăng nhập và được cấp quyền Quản lý tài khoản. **PRE-2.** Tài khoản mục tiêu cần xóa đang tồn tại trên hệ thống. |  |  |
| Postconditions: | **POST-1.** Tài khoản mục tiêu và các thông tin hồ sơ cá nhân liên quan bị gỡ bỏ vĩnh viễn khỏi cơ sở dữ liệu hệ thống. **POST-2.** Người dùng sở hữu tài khoản này không thể đăng nhập hoặc truy cập vào hệ thống được nữa. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý tài khoản" và sử dụng thanh tìm kiếm để tìm đến tài khoản cần xử lý. 2\. Người dùng nhấn vào tùy chọn "Xóa tài khoản" tại dòng dữ liệu của nhân sự đó. 3\. Hệ thống thực hiện rà soát lịch sử hoạt động của tài khoản mục tiêu (đảm bảo tài khoản này chưa từng sở hữu hoặc tham gia vào bất kỳ dữ liệu cuộc họp nào). 4\. Hệ thống hiển thị hộp thoại xác nhận với thông điệp cảnh báo: "Hành động này sẽ gỡ bỏ hoàn toàn tài khoản khỏi hệ thống và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?". 5\. Người dùng xác nhận bằng cách nhấn nút "Đồng ý xóa". 6\. Hệ thống tiến hành gỡ bỏ tài khoản và dọn dẹp các thông tin hồ sơ liên quan. 7\. Hệ thống đóng hộp thoại, hiển thị thông báo "Xóa tài khoản thành công" và làm mới danh sách tài khoản hiện tại. |  |  |
| Alternative Flow: | **N/A**  |  |  |
| Exceptions: | **EX1:** Nếu hệ thống phát hiện tài khoản đã từng được sử dụng để tổ chức họp, tham gia họp hoặc được gán tên vào các biên bản/danh sách công việc, hệ thống sẽ chặn thao tác xóa và hiển thị cảnh báo. |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Hiếm khi |  |  |
| Business Rules: | BR1: Hệ thống từ chối lệnh xóa đối với bất kỳ tài khoản nào đã gắn liền với các hồ sơ tài sản của công ty (như bản ghi âm, biên bản cuộc họp, tác vụ phân công).  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

7. #### **UC-AM-07 Cập nhật trạng thái tài khoản** 

| UC ID and Name: | UC-AM-07 Cập nhật trạng thái tài khoản  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên cập nhật trạng thái hoạt động của tài khoản người dùng. |  |  |
| Trigger: | Quản lý cần đình chỉ quyền truy cập của một nhân viên hoặc muốn mở khóa lại quyền truy cập cho một nhân viên đã quay trở lại làm việc. |  |  |
| Preconditions: | **PRE-1.** Người dùng thực hiện thao tác đã đăng nhập thành công và được phân quyền truy cập chức năng Quản lý tài khoản. **PRE-2.** Tài khoản nhân sự cần cập nhật trạng thái đang tồn tại trên hệ thống. |  |  |
| Postconditions: | **POST-1.** Trạng thái của tài khoản mục tiêu được cập nhật thành công (từ Hoạt động sang Vô hiệu hóa, hoặc ngược lại) trong cơ sở dữ liệu. **POST-2.** Nếu tài khoản bị chuyển sang trạng thái Vô hiệu hóa, toàn bộ phiên làm việc (Session/Token) hiện tại của tài khoản đó sẽ bị ép buộc chấm dứt ngay lập tức. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý tài khoản" và sử dụng thanh tìm kiếm để tìm đến tài khoản cần xử lý. 2\. Người dùng nhấn vào nút chức năng chuyển đổi trạng thái tại dòng thông tin của nhân sự đó. 3\. Hệ thống hiển thị một hộp thoại xác nhận yêu cầu người dùng chắc chắn về hành động thay đổi trạng thái này. 4\. Người dùng nhấn nút "Đồng ý" để xác nhận. 5\. Hệ thống kiểm tra các ràng buộc. 6\. Hệ thống thực hiện lưu lại trạng thái mới của tài khoản. 7\. Trong trường hợp tài khoản bị chuyển sang trạng thái Vô hiệu hóa, hệ thống tự động phát lệnh thu hồi toàn bộ các phiên làm việc hiện tại của tài khoản đó. 8\. Hệ thống đóng hộp thoại, hiển thị thông báo "Cập nhật trạng thái tài khoản thành công" và làm mới lại danh sách. |  |  |
| Alternative Flow: | **N/A**  |  |  |
| Exceptions: | **EX1:** Nếu người dùng cố tình thực hiện thao tác vô hiệu hóa chính tài khoản mình đang sử dụng để đăng nhập, hệ thống sẽ chặn tiến trình ở bước 5 và hiển thị thông báo lỗi: "Không thể tự vô hiệu hóa tài khoản của chính mình." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Một tài khoản đang ở trạng thái bị vô hiệu hóa (INACTIVE) tuyệt đối không được phép thực hiện thao tác Đăng nhập hoặc Yêu cầu khôi phục mật khẩu trên hệ thống. **BR2:** Các tài khoản bị Vô hiệu hóa (INACTIVE) vẫn sẽ được giữ lại tên hiển thị trong các báo cáo lịch sử, biên bản họp cũ để đảm bảo tính toàn vẹn thông tin, nhưng hệ thống phải tự động ẩn tài khoản này khỏi các danh sách chọn để mời họp hoặc giao tác vụ công việc mới. |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

8. #### **UC-AM-08 Tìm kiếm tài khoản** 

| UC ID and Name: | UC-AM-08 Tìm kiếm tài khoản  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên tìm kiếm tài khoản người dùng trên hệ thống.  |  |  |
| Trigger: | Quản lý cần tìm nhanh một hoặc một nhóm nhân sự cụ thể trong danh sách tài khoản của công ty để xem chi tiết, cập nhật thông tin hoặc thay đổi trạng thái. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập thành công và được phân quyền truy cập vào chức năng Quản lý tài khoản. **PRE-2.** Hệ thống đang hiển thị giao diện danh sách tài khoản nhân viên. |  |  |
| Postconditions: | **POST-1.** Danh sách trên màn hình được làm mới, chỉ hiển thị các tài khoản thỏa mãn điều kiện tìm kiếm. **POST-2.** Từ khóa tìm kiếm được giữ nguyên trên thanh công cụ để người dùng nhận biết trạng thái lọc. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý tài khoản". 2\. Tại thanh tìm kiếm, người dùng nhập từ khóa cần tra cứu (Họ tên, Email, hoặc Mã nhân viên). 3\. Người dùng nhấn phím "Enter" trên bàn phím hoặc click vào biểu tượng kính lúp. 4\. Hệ thống tiếp nhận từ khóa, tiến hành rà soát và đối chiếu với cơ sở dữ liệu hồ sơ nhân sự. 5\. Hệ thống thu hẹp danh sách và hiển thị lên màn hình những tài khoản có chứa thông tin trùng khớp với từ khóa. |  |  |
| Alternative Flow: | **AF1: Tìm kiếm tự động (Live Search)** 1\. Tại bước 2, thay vì phải nhấn "Enter", ngay khi người dùng nhập từng ký tự vào thanh tìm kiếm, hệ thống tự động lọc và cập nhật kết quả hiển thị liên tục bên dưới sau một độ trễ ngắn. **AF2: Hủy tìm kiếm và quay lại danh sách gốc** 1\. Tại bước 5, người dùng xóa trắng thanh tìm kiếm hoặc nhấn vào biểu tượng "X" . 2\. Hệ thống tự động xóa bộ lọc và tải lại toàn bộ danh sách tài khoản đầy đủ của công ty. |  |  |
| Exceptions: | **EX1:** Nếu từ khóa nhập vào không khớp với bất kỳ Email, Mã nhân viên hay Họ tên nào trong hệ thống, danh sách sẽ hiển thị trống kèm theo thông báo: "Không tìm thấy tài khoản nào phù hợp với từ khóa tìm kiếm." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Việc tra cứu từ khóa hoàn toàn không phân biệt chữ hoa và chữ thường. **BR2:** Hệ thống thực hiện quét dữ liệu và áp dụng tìm kiếm trên cả những tài khoản đang ở trạng thái Hoạt động (ACTIVE) lẫn Vô hiệu hóa (INACTIVE). **BR3:** Hệ thống chỉ hỗ trợ tìm kiếm theo các trường thông tin: Họ tên, Email và Mã nhân viên; |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

9. #### **UC-AM-09 Lọc danh sách tài khoản** 

| UC ID and Name: | UC-AM-09 Lọc danh sách tài khoản |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên lọc danh sách tài khoản người dùng theo các tiêu chí khác nhau. |  |  |
| Trigger: | Quản lý cần thu hẹp danh sách nhân sự để xem xét, thống kê hoặc thao tác đồng loạt trên một nhóm đối tượng cụ thể có chung đặc điểm. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập thành công và có quyền truy cập vào giao diện Quản lý danh sách tài khoản. **PRE-2.** Hệ thống đã có sẵn các danh mục phân loại chuẩn (Danh sách phòng ban, Các nhóm quyền, Trạng thái) để làm cơ sở tạo các bộ lọc. |  |  |
| Postconditions: | **POST-1.** Giao diện danh sách tài khoản được làm mới, hiển thị chính xác tập hợp các kết quả đáp ứng đúng các tiêu chí lọc được áp dụng. **POST-2.** Các tiêu chí lọc đang được chọn vẫn hiển thị trên màn hình để người dùng nhận biết trạng thái dữ liệu. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào màn hình "Quản lý tài khoản", nơi đang hiển thị danh sách toàn bộ nhân sự của tổ chức. 2\. Tại khu vực công cụ lọc, người dùng nhấp vào các hộp thoại thả xuống tương ứng với các tiêu chí cần lọc: Phòng ban, Vai trò, hoặc Trạng thái. 3\. Người dùng chọn một hoặc nhiều giá trị cho mỗi tiêu chí. 4\. Hệ thống tiếp nhận các tiêu chí này, tự động xử lý và truy xuất tập hợp hồ sơ nhân sự phù hợp từ cơ sở dữ liệu. 5\. Hệ thống làm mới giao diện, thu hẹp danh sách và chỉ hiển thị lên màn hình những tài khoản thỏa mãn đồng thời tất cả các điều kiện lọc vừa chọn. |  |  |
| Alternative Flow: | **AF1: Xóa bộ lọc (Clear Filters)** 1\. Người dùng muốn xem lại toàn bộ nhân sự, người dùng nhấn vào nút "Xóa tất cả bộ lọc" hoặc bỏ đánh dấu ở từng tiêu chí. 2\. Hệ thống thực hiện gỡ bỏ các điều kiện giới hạn và tải lại danh sách đầy đủ ban đầu. **AF2: Kết hợp với Tìm kiếm từ khóa** 1\. Người dùng có thể vừa chọn bộ lọc vừa nhập thêm từ khóa vào thanh tìm kiếm. 2\. Hệ thống thực hiện kết hợp song song cả hai điều kiện này để trả về kết quả thu hẹp chính xác nhất. |  |  |
| Exceptions: | **EX1:** Nếu lọc không khớp với bất kỳ nhân sự nào trong hệ thống, danh sách sẽ hiển thị trống kèm theo thông báo: "Không có tài khoản nào phù hợp với bộ lọc hiện tại." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

10. #### **UC-AM-10 Xem chi tiết hồ sơ tài khoản** 

| UC ID and Name: | UC-AM-10 Xem chi tiết hồ sơ tài khoản |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên xem chi tiết thông tin hồ sơ của một tài khoản nhân sự trên hệ thống. |  |  |
| Trigger: | Cấp quản lý cần tra cứu thông tin đầy đủ của một nhân sự cụ thể  |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập thành công và được cấp quyền quản lý nhân sự/tài khoản. **PRE-2.** Người dùng đang truy cập tại màn hình danh sách tài khoản hoặc giao diện tìm kiếm nhân sự. |  |  |
| Postconditions: | **POST-1.** Hệ thống hiển thị đầy đủ và chính xác thông tin chi tiết của hồ sơ nhân sự mục tiêu ở chế độ chỉ đọc . **POST-2.** Hệ thống không thực hiện bất kỳ thay đổi, thêm mới hay xóa bỏ nào đối với dữ liệu hiện tại trong phiên làm việc này. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý tài khoản", sử dụng tính năng tìm kiếm hoặc bộ lọc để xác định nhân viên cần tra cứu. 2\. Tại dòng thông tin của nhân viên mục tiêu, người dùng nhấp chuột vào Tên nhân viên hoặc nhấn chọn nút chức năng "Xem chi tiết". 3\. Hệ thống tiếp nhận yêu cầu và tổng hợp toàn bộ thông tin hồ sơ của nhân viên này từ cơ sở dữ liệu. 4\. Hệ thống mở ra một màn hình mới hiển thị chi tiết hồ sơ, được phân chia rõ ràng thành các khu vực: Thông tin cá nhân, Cấu trúc tổ chức, và Thông tin hệ thống. 5\. Người dùng xem xét các thông tin được cung cấp trên màn hình. 6\. Sau khi hoàn tất việc tra cứu, người dùng nhấn nút "Quay lại" để trở về giao diện danh sách tài khoản ban đầu. |  |  |
| Alternative Flow: | **AF1: Điều hướng nhanh sang các tác vụ khác** 1\. Ngay tại màn hình xem chi tiết hồ sơ, hệ thống cung cấp sẵn các nút lối tắt "Chỉnh sửa thông tin", "Khóa tài khoản" hoặc "Thay đổi vai trò". 2\. Người dùng nhấn trực tiếp vào các nút này để chuyển thẳng sang các luồng công việc nghiệp vụ tương ứng mà không cần phải quay lại màn hình danh sách bên ngoài. |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

11. #### **UC-AM-11 Xem lịch sử hoạt động tài khoản** 

| UC ID and Name: | UC-AM-11 Xem lịch sử hoạt động tài khoản  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình quản trị viên xem lịch sử hoạt động và nhật ký sự kiện (Audit log) của một tài khoản trên hệ thống. |  |  |
| Trigger: | Quản lý cần đối soát, kiểm toán hệ thống hoặc nghi ngờ có hoạt động bất thường xảy ra trên tài khoản của nhân viên.  |  |  |
| Preconditions: | **PRE-1.** Người dùng thực hiện thao tác đã đăng nhập thành công và được phân quyền truy cập chức năng Quản lý tài khoản. **PRE-2.** Tài khoản nhân sự cần tra cứu đang tồn tại trên hệ thống. |  |  |
| Postconditions: | **POST-1**. Danh sách lịch sử hoạt động của tài khoản mục tiêu được hệ thống hiển thị chi tiết và chính xác theo trình tự thời gian ở chế độ chỉ đọc. **POST-2.** Hệ thống bảo toàn dữ liệu, không làm thay đổi, ảnh hưởng hay làm gián đoạn đến các dữ liệu hoạt động hiện tại. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý tài khoản" và tìm đến tài khoản nhân sự cần kiểm tra. 2\. Tại dòng thông tin tài khoản hoặc bên trong màn hình chi tiết hồ sơ, người dùng nhấn chọn tính năng "Xem lịch sử hoạt động". 3\. Hệ thống tiếp nhận yêu cầu và trích xuất dữ liệu nhật ký sự kiện liên quan đến tài khoản này từ hệ thống lưu trữ an toàn. 4\. Hệ thống hiển thị danh sách các hoạt động theo thứ tự thời gian giảm dần (từ mới nhất đến cũ nhất). Mỗi dòng sự kiện bao gồm: Mốc thời gian thực hiện, Tên hành động (Ví dụ: "Đăng nhập thành công", "Hủy cuộc họp"), Trạng thái (Thành công/Thất bại), và Địa chỉ truy cập. 5\. Người dùng có thể sử dụng bộ lọc thời gian (Từ ngày... Đến ngày...) hoặc bộ lọc loại hành động (Chỉ xem Đăng nhập, Chỉ xem Thao tác họp) để thu hẹp phạm vi tra cứu. 6\. Sau khi xem xét xong, người dùng nhấn "Đóng" để thoát khỏi giao diện nhật ký. |  |  |
| Alternative Flow: | **AF1: Xuất dữ liệu nhật ký** 1\. Tại màn hình hiển thị danh sách lịch sử hoạt động (bước 4 hoặc bước 5), người dùng nhấn nút "Xuất dữ liệu". 2\. Hệ thống kết xuất và tải về thiết bị dưới dạng tệp tài liệu tiêu chuẩn (.csv hoặc .xlsx)  |  |  |
| Exceptions: | EX1: Nếu tài khoản chưa từng phát sinh bất kỳ tương tác nào với hệ thống, hệ thống hiển thị danh sách trống kèm theo thông báo: "Tài khoản này chưa phát sinh bất kỳ lịch sử hoạt động nào." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

12. #### **UC-AM-12 Cập nhật thông tin cá nhân** 

| UC ID and Name: | UC-AM-12 Cập nhật thông tin cá nhân |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager | Secondary Actors: |  |
| Description | Use case mô tả quá trình người dùng chủ động cập nhật thông tin hồ sơ cá nhân (Profile) của mình trên hệ thống. |  |  |
| Trigger: | Người dùng có nhu cầu cập nhật lại hình ảnh đại diện, thay đổi số điện thoại liên lạc mới hoặc sửa lại lỗi chính tả trong họ tên của mình trên hệ thống. |  |  |
| Preconditions: | **PRE-1.** Người dùng đã đăng nhập thành công vào hệ thống. **PRE-2.** Hệ thống đang hoạt động bình thường. |  |  |
| Postconditions: | **POST-1.** Dữ liệu cá nhân được cập nhật thành công vào cơ sở dữ liệu. **POST-2.** Toàn bộ giao diện phần mềm tự động đồng bộ và hiển thị thông tin mới nhất của người dùng. |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào biểu tượng tài khoản cá nhân ở góc giao diện và chọn menu "Hồ sơ cá nhân" (My Profile). 2\. Hệ thống hiển thị trang thông tin chi tiết của người dùng. Người dùng nhấn nút "Chỉnh sửa". 3\. Hệ thống chuyển đổi giao diện sang màn hình chỉnh sửa, riêng các trường "Email" và "Mã nhân viên" bị đổ nền xám và khóa thao tác . 4\. Người dùng thực hiện thao tác chỉnh sửa thông tin hoặc tải lên một hình ảnh từ thiết bị để làm Ảnh đại diện. 5\. Người dùng nhấn nút "Lưu thay đổi". 6\. Hệ thống rà soát tính hợp lệ của các dữ liệu vừa nhập. 7\. Hệ thống tiến hành ghi nhận dữ liệu mới, làm mới màn hình hồ sơ cá nhân và hiển thị thông báo: "Cập nhật thông tin cá nhân thành công." |  |  |
| Alternative Flow: | N/A |  |  |
| Exceptions: | **EX1:** Nếu người dùng tải lên một tệp tin không phải là hình ảnh hoặc hình ảnh có dung lượng vượt quá giới hạn cho phép (\> 5MB), hệ thống sẽ chặn tiến trình lưu, bôi đỏ khu vực tải ảnh và hiển thị cảnh báo: "Định dạng tệp không được hỗ trợ hoặc dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh khác." **EX2:** Nếu người dùng nhập số điện thoại chứa các ký tự chữ cái, ký tự đặc biệt hoặc không đủ số lượng chữ số tiêu chuẩn, hệ thống chặn tiến trình lưu và cảnh báo: "Số điện thoại không hợp lệ. Vui lòng chỉ nhập các chữ số." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Địa chỉ Email và Mã nhân viên không được thay đổi bởi người dùng **BR2:** Khi người dùng tải ảnh lên, hệ thống phải cung cấp công cụ tự động cắt cúp (Crop) theo tỷ lệ khung hình vuông (1:1) để đảm bảo mọi ảnh đại diện trên hệ thống đều hiển thị đồng nhất.  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

13. #### **UC-AM-13 Đăng ký và liên kết dữ liệu khuôn mặt** 

| UC ID and Name: | UC-AM-13 Đăng ký và liên kết dữ liệu khuôn mặt |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager, Business Admin, System Admin | Secondary Actors: | Hệ thống Camera |
| Description | Use case mô tả quá trình nhân sự đăng ký và liên kết dữ liệu sinh trắc học khuôn mặt vào hệ thống tài khoản thông qua thiết bị máy điểm danh chuyên dụng. |  |  |
| Trigger: | Nhân viên kích hoạt chế độ đăng ký khuôn mặt trên thiết bị máy điểm danh tại khu vực chung của tổ chức để khởi tạo hồ sơ sinh trắc. |  |  |
| Preconditions: | **PRE-1.** Tài khoản của nhân viên đã được tạo thành công trên hệ thống phần mềm và đang ở trạng thái hoạt động (Active). **PRE-2.** Thiết bị máy điểm danh (phần cứng) đang hoạt động ổn định và duy trì kết nối mạng với máy chủ trung tâm. |  |  |
| Postconditions: | **POST-1.** Dữ liệu sinh trắc học (Face Vector) được trích xuất thành công và lưu trữ mã hóa an toàn trong cơ sở dữ liệu. **POST-2.** Dữ liệu khuôn mặt được liên kết 1:1 với tài khoản nhân sự tương ứng và trạng thái hồ sơ sinh trắc chuyển sang "Đã hợp lệ". |  |  |
| Normal Flow: | 1\. Quản lý (hoặc nhân sự được cấp quyền) thao tác trên màn hình của máy điểm danh, truy cập vào menu và chọn chức năng "Đăng ký khuôn mặt mới". 2\. Thiết bị yêu cầu nhập thông tin, người dùng nhập mã định danh cá nhân (Mã nhân viên) để hệ thống thiết bị đối chiếu và xác nhận tài khoản tồn tại trên máy chủ trung tâm. 3\. Thiết bị hiển thị khung hướng dẫn trên màn hình, yêu cầu nhân sự cần đăng ký đứng vào vùng nhận diện và căn chỉnh khuôn mặt khớp với khung viền. 4\. Camera của thiết bị tiến hành quét , chụp nhiều góc độ của khuôn mặt dưới điều kiện ánh sáng chuẩn. 5\. Thuật toán phân tích tại thiết bị xử lý hình ảnh, bóc tách các điểm đặc trưng sinh trắc học và mã hóa chúng thành một chuỗi nhận diện (Face Vector/Hash). 6\. Thiết bị truyền chuỗi mã hóa này cùng định danh tài khoản vừa nhập về hệ thống máy chủ trung tâm qua giao thức bảo mật. 7\. Máy chủ trung tâm tiếp nhận, xác nhận tính hợp lệ, tiến hành lưu trữ và liên kết chặt chẽ (mapping) chuỗi mã hóa này vào hồ sơ tài khoản tương ứng của nhân viên. 8\. Máy chủ phản hồi kết quả về thiết bị. Màn hình máy điểm danh hiển thị thông báo "Đăng ký hoàn tất" kèm theo âm báo thành công. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **EX1:** Nếu mã nhân viên nhập vào không khớp với bất kỳ tài khoản nào trên hệ thống, thiết bị sẽ chặn luồng, hiển thị thông báo lỗi "Tài khoản không tồn tại" và yêu cầu nhập lại mã chính xác. **EX2:** Nếu cảm biến chống giả mạo (Anti-spoofing) phát hiện người dùng đang đưa ảnh giấy, video hoặc màn hình thiết bị khác vào để quét thay vì người thật, thiết bị lập tức từ chối thu thập và hủy bỏ quá trình đăng ký. **EX3:** Nếu máy chủ trung tâm đối chiếu phát hiện khuôn mặt này trùng khớp ở mức độ cao với một tài khoản nhân sự khác đã đăng ký từ trước, hệ thống từ chối thao tác liên kết và trả báo lỗi về thiết bị: "Khuôn mặt đã được sử dụng cho một tài khoản khác." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Một tài khoản nhân sự chỉ được phép liên kết với một bộ dữ liệu Face Vector duy nhất tại một thời điểm, không cho phép ghép nhiều khuôn mặt vào cùng một tài khoản. |  |  |
| Other Information: | N/A  |  |  |
| Assumptions: | N/A  |  |  |

## 3\. Meeting Transcription Management

1. #### **UC-MTM-01 Chuyển đổi giọng nói thành văn bản** 

| UC ID and Name: | UC-MTM-01 Chuyển đổi giọng nói thành văn bản  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), System (automated)  | Secondary Actors: | Dịch vụ nhận diện giọng nói (Speech-to-Text Engine)  |
| Trigger: | Cuộc họp kết thúc và bản ghi âm (audio segment) được lưu trữ thành công, hoặc người dùng (quản lý/người tổ chức) chủ động truy cập vào chi tiết cuộc họp và nhấn nút yêu cầu xuất biên bản cuộc họp bằng văn bản.  |  |  |
| Description: | Chức năng này tiếp nhận tệp âm thanh hoặc các đoạn âm thanh từ cuộc họp, tiến hành kiểm duyệt quyền truy cập và trạng thái hợp lệ, sau đó tự động chạy tiến trình bóc băng (Speech-to-Text) để tạo ra bản ghi chú văn bản (Transcript). Hệ thống có khả năng nhận diện âm thanh theo từng kênh hoặc vị trí ngồi (channel/seat) và gán định danh người nói tự động nếu cuộc họp đã được thiết lập sơ đồ chỗ ngồi từ trước. Kết quả trả về là một bản ghi chép chi tiết theo tiến trình thời gian, hoặc một thông báo lỗi cụ thể nếu hệ thống không thể xử lý.  |  |  |
| Preconditions: | \- Cuộc họp đã diễn ra và được hệ thống ghi nhận ở trạng thái "Đã kết thúc". \- File âm thanh của cuộc họp tồn tại trên hệ thống lưu trữ và không bị hỏng hóc. \- (Nếu kích hoạt thủ công) Người dùng thực hiện thao tác phải có quyền truy cập và trích xuất dữ liệu của cuộc họp này. |  |  |
| Postconditions: | \- Một bản Transcript hoàn chỉnh được tạo ra, phân tách rõ ràng nội dung theo từng người nói và mốc thời gian. \- Tiến trình xử lý (Job) được hệ thống đánh dấu "Hoàn tất". \- (Trường hợp lỗi) Tiến trình bị đánh dấu "Thất bại" và hệ thống ghi nhận rõ nguyên nhân lỗi để người dùng nắm bắt. |  |  |
| Normal Flow: | 1\. Hệ thống tự động bắt đầu luồng công việc (hoặc Người dùng truy cập vào cuộc họp và nhấn "Trích xuất văn bản"). 2\. Hệ thống kiểm tra điều kiện đầu vào: rà soát quyền hạn của người dùng, xác nhận tình trạng cuộc họp đã kết thúc và tính hợp lệ của file âm thanh (định dạng, thời lượng). 3\. Hệ thống khởi tạo một tiến trình xử lý (Job) và đánh dấu trạng thái hiển thị trên giao diện là "Đang bóc băng/Đang xử lý". 4\. Dịch vụ phân tích AI tiếp nhận file âm thanh, tiến hành bóc tách các đoạn hội thoại dựa trên luồng âm thanh đầu vào. 5\. Dịch vụ phân tích đối chiếu luồng âm thanh với sơ đồ cấu hình chỗ ngồi (Seat assignment) của phòng họp để nhận diện vị trí âm thanh phát ra. 6\. Hệ thống tự động gán nhãn định danh tên thật của người tham dự tương ứng với từng đoạn văn bản được dịch ra. 7\. Tiến trình hoàn tất, hệ thống lưu lại bản Transcript hoàn chỉnh theo dạng hội thoại (timeline). 8\. Hệ thống kết thúc tiến trình, hiển thị trạng thái "Hoàn tất" và thông báo "Bản ghi chú cuộc họp đã sẵn sàng" đến người dùng. |  |  |
| Alternative Flows: | **A1. Không có cấu hình chỗ ngồi trước:** Tại bước 5 và 6, nếu cuộc họp diễn ra tại phòng không có cấu hình vị trí ngồi hoặc không sử dụng camera nhận diện, hệ thống sẽ sử dụng thuật toán phân tách giọng nói độc lập. Thay vì gán tên thật, hệ thống sẽ gán nhãn ẩn danh như "Người nói 1", "Người nói 2", "Người nói 3" cho bản Transcript.  |  |  |
| Exceptions: | **E1. Không đủ quyền truy cập:** Tại bước 2, nếu một nhân viên không được mời họp nhưng cố tình tìm cách truy cập và yêu cầu bóc băng, hệ thống sẽ chặn thao tác và báo lỗi: "Bạn không có quyền trích xuất dữ liệu của cuộc họp này." **E2. File âm thanh không hợp lệ:** Tại bước 2, nếu file âm thanh bị lỗi định dạng hoặc quá dung lượng cho phép, tiến trình bị chặn ngay lập tức kèm thông báo: "Định dạng hoặc dung lượng tệp âm thanh không hợp lệ." **E3. Tiến trình thất bại do chất lượng dữ liệu:** Tại bước 4, nếu dịch vụ AI nhận thấy file âm thanh quá nhiều tạp âm, âm lượng quá nhỏ hoặc ngôn ngữ không được hỗ trợ, tiến trình sẽ bị hủy bỏ. Hệ thống chuyển sang trạng thái "Thất bại" và trả về cảnh báo: "Bóc băng thất bại: Chất lượng âm thanh quá thấp để nhận diện." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Phân quyền theo người nói):** Bản ghi chú văn bản bắt buộc phải được ngắt dòng, phân đoạn rõ ràng theo sự kiện thay đổi người nói (Speaker change). **BR2 (Bảo mật biên bản):** Khi bản Transcript được tạo ra, hệ thống tự động kế thừa các thiết lập bảo mật của cuộc họp. Chỉ những người tham gia họp hoặc quản lý cấp cao mới được quyền xem và tải xuống văn bản này. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

2. #### **UC-MTM-02 Xem transcript cuộc họp** 

| UC ID and Name: | UC-MTM-02 Xem transcript cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng muốn xem lại toàn bộ nội dung chi tiết biên bản cuộc họp dưới dạng văn bản sau khi cuộc họp kết thúc để kiểm tra thông tin, rà soát kết luận hoặc phục vụ công tác báo cáo.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền truy cập và đọc bản ghi chữ (Transcript) của cuộc họp sau khi tiến trình chuyển đổi giọng nói thành văn bản (STT) hoàn tất. Bản Transcript sẽ được hiển thị một cách trực quan theo tiến trình thời gian (Timeline), đi kèm mốc thời gian chi tiết (Timestamp), thông tin vị trí ghế ngồi hoặc kênh âm thanh (Channel/Seat), và định danh chính xác tên của người phát biểu nếu cuộc họp trước đó có cấu hình sơ đồ chỗ ngồi.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và có quyền xem dữ liệu của cuộc họp này (là người tổ chức, khách mời có trong danh sách, hoặc cấp quản lý có thẩm quyền). \- Tiến trình chuyển đổi giọng nói thành văn bản (UC-MTM-01) của cuộc họp mục tiêu đã thực hiện hoàn tất thành công. |  |  |
| Postconditions: | \- Giao diện hiển thị đầy đủ, chính xác nội dung cuộc họp dưới dạng văn bản hội thoại mà không làm thay đổi dữ liệu gốc. \- Người dùng có thể tra cứu, theo dõi dòng sự kiện của cuộc họp một cách trực quan. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào danh sách cuộc họp đã diễn ra và chọn cuộc họp cần xem lại. 2\. Tại màn hình chi tiết cuộc họp, người dùng chọn thẻ (tab) "Biên bản văn bản" hoặc "Transcript". 3\. Hệ thống tiếp nhận yêu cầu, thực hiện đối chiếu quyền hạn của tài khoản người dùng và kiểm tra trạng thái của tiến trình STT liên quan. 4\. Sau khi xác minh hợp lệ, hệ thống tải nội dung biên bản văn bản và hiển thị lên giao diện dưới dạng một dòng thời gian (Timeline) cuộn dọc từ trên xuống dưới. 5\. Mỗi phân đoạn hội thoại hiển thị đầy đủ các thông tin thành phần bao gồm: Mốc thời gian bắt đầu phân đoạn lời nói (Timestamp \- ví dụ: 00:05:23). Định danh người nói: Tên đầy đủ của nhân sự (nếu vị trí ghế ngồi/kênh âm thanh đã gán với người tham dự trước đó). Thông tin vị trí/kênh thiết bị (Ví dụ: Ghế số 3 / Kênh âm thanh số 2). Nội dung văn bản lời nói chi tiết đã được chuyển đổi. 6\. Người dùng cuộn trang để đọc thông tin và theo dõi toàn bộ diễn biến cuộc họp. |  |  |
| Alternative Flows: | **A1. Hiển thị nhãn ẩn danh khi chưa gán chỗ ngồi:** Tại bước 5, nếu cuộc họp diễn ra tại không gian không cấu hình sơ đồ vị trí (Seat assignment), hệ thống sẽ sử dụng thuật toán tách kênh độc lập và hiển thị tên người nói dưới dạng nhãn ẩn danh như "Người nói 1 (Vị trí 1)", "Người nói 2 (Vị trí 2)" giúp người đọc vẫn phân biệt được mạch đối thoại. **A2. Nghe lại đoạn âm thanh tương ứng (Audio Playback Sync):** Tại giao diện xem Timeline ở bước 5, người dùng có thể nhấp chọn trực tiếp vào một câu văn bản bất kỳ. Hệ thống sẽ tự động điều hướng thanh phát âm thanh (audio player) của tệp ghi âm đến đúng mốc thời gian (Timestamp) của câu nói đó và phát đoạn âm thanh thực tế để người dùng đối chiếu chéo thông tin. |  |  |
| Exceptions: | **E1. Tiến trình bóc băng chưa hoàn tất hoặc bị lỗi:** Tại bước 3, nếu tiến trình STT vẫn đang trong hàng đợi xử lý hoặc gặp sự cố thất bại, hệ thống sẽ chặn hiển thị dòng lịch sử Timeline và thông báo trạng thái trực quan cho người dùng: "Biên bản văn bản đang được xử lý, vui lòng quay lại sau" hoặc "Không thể hiển thị văn bản do tệp ghi âm cuộc họp gặp sự cố kỹ thuật". **E2. Không có quyền truy cập biên bản:** Tại bước 3, nếu người dùng cố tình thay đổi đường dẫn (URL) để xem biên bản của một cuộc họp bảo mật mà họ không được mời, hệ thống sẽ lập tức chặn quyền hiển thị và đưa ra cảnh báo: "Bạn không có quyền truy cập dữ liệu văn bản của cuộc họp này." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Kế thừa quyền bảo mật nghiêm ngặt):** Quyền tiếp cận bản Transcript bắt buộc phải đồng bộ và thừa kế hoàn toàn từ thiết lập bảo mật của cuộc họp gốc. Chỉ người tổ chức, danh sách khách mời chính thức và cấp quản lý trực tiếp được phê duyệt mới có quyền đọc văn bản bóc băng này. **BR2 (Tính toàn vẹn của nội dung):** Giao diện xem Transcript của người dùng thông thường tuân thủ nguyên tắc "Chỉ đọc" (Read-only), tuyệt đối không được tự ý chỉnh sửa văn bản gốc do AI trích xuất để đảm bảo tính minh bạch, khách quan của cuộc họp. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Dữ liệu cấu hình danh sách người tham gia (Participants) và sơ đồ vị trí ngồi (Seat assignment) của cuộc họp đó được bảo toàn chính xác từ thời điểm cuộc họp diễn ra cho đến lúc người dùng tra cứu.  |  |  |

3. #### **UC-MTM-03 Chỉnh sửa transcript thủ công** 

| UC ID and Name: | UC-MTM-03 Chỉnh sửa transcript thủ công  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng phát hiện bản bóc băng tự động (Transcript) do hệ thống Speech to Text trích xuất có sai lệch về mặt chính tả, thiếu hoặc sai dấu câu, nhận diện sai tên riêng của người tham dự hoặc các thuật ngữ chuyên ngành và cần điều chỉnh lại cho chính xác.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền can thiệp trực tiếp để hiệu chỉnh thủ công nội dung văn bản của bản Transcript cuộc họp. Sau khi người dùng thực hiện thay đổi và xác nhận, hệ thống sẽ cập nhật nội dung văn bản mới nhất để hiển thị cho toàn bộ người xem, đồng thời tự động lưu lại lịch sử phiên bản thay đổi (Revision History) nhằm đảm bảo tính minh bạch và khả năng đối soát thông tin khi cần thiết.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được cấp quyền chỉnh sửa đối với cuộc họp này (Ví dụ: Người tổ chức, Trưởng phòng, hoặc được chỉ định làm Thư ký cuộc họp). \- Bản Transcript tự động đã được khởi tạo hoàn tất thành công. \- Người dùng đang ở giao diện xem nội dung Transcript. |  |  |
| Postconditions: | \- Nội dung văn bản của bản Transcript được cập nhật chính xác theo các chỉnh sửa của người dùng. \- Một phiên bản chỉnh sửa mới được ghi nhận thành công vào nhật ký lịch sử thay đổi (Revision History). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào giao diện xem Transcript của cuộc họp đã hoàn tất bóc băng. 2\. Người dùng nhấn chọn nút "Chế độ chỉnh sửa" (hoặc biểu tượng cây bút biên tập hiển thị tại dòng hội thoại cần sửa). 3\. Hệ thống kiểm tra quyền hạn của tài khoản; sau khi xác nhận hợp lệ, hệ thống chuyển giao diện dòng thời gian (Timeline) sang trạng thái cho phép biên tập, các đoạn văn bản hội thoại lúc này biến thành các ô nhập liệu văn bản (Text box). 4\. Người dùng nhấp chuột vào phân đoạn chữ cần sửa, thực hiện thay đổi nội dung (sửa lại từ ngữ nhận diện sai, thêm/bớt dấu câu, điều chỉnh tên riêng hoặc thuật ngữ chuyên ngành). 5\. (Tùy chọn) Người dùng có thể nhấn vào nút phát âm thanh ngay cạnh phân đoạn đó để nghe lại đoạn ghi âm thực tế nhằm đối chiếu thông tin trước khi sửa. 6\. Người dùng kiểm tra lại toàn bộ các nội dung đã điều chỉnh và nhấn nút "Lưu thay đổi". 7\. Hệ thống tiếp nhận tập hợp các nội dung mới, đối chiếu sự khác biệt so với phiên bản trước đó để chuẩn bị dữ liệu ghi vết. 8\. Hệ thống cập nhật nội dung hiển thị mới nhất cho toàn bộ người dùng, đồng thời tự động tạo một bản ghi phiên bản mới lưu vào mục "Lịch sử thay đổi". 9\. Hệ thống đóng chế độ biên tập, hiển thị thông báo "Cập nhật nội dung transcript thành công" và đưa giao diện về trạng thái xem bình thường. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Không có quyền chỉnh sửa:** Tại bước 3, nếu một nhân sự chỉ có quyền xem (Read-only) cố tình sử dụng các thủ thuật can thiệp giao diện để kích hoạt luồng chỉnh sửa, hệ thống sẽ chặn lệnh gửi dữ liệu, từ chối lưu và hiển thị thông báo lỗi: "Bạn không có thẩm quyền chỉnh sửa biên bản văn bản của cuộc họp này."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 (Nguyên tắc bắt buộc lưu vết \- Audit Trail):** Hệ thống tuyệt đối không được ghi đè xóa sạch dữ liệu cũ một cách ẩn danh. Mỗi lần người dùng xác nhận lưu chỉnh sửa, hệ thống bắt buộc phải ghi nhận lại một bản ghi lịch sử phiên bản (Revision Log) nêu rõ: Người thực hiện chỉnh sửa, Mốc thời gian sửa, Nội dung văn bản gốc trước khi sửa và Nội dung văn bản mới sau khi sửa. **BR2 (Đồng bộ hiển thị tức thời):** Nội dung Transcript sau khi sửa đổi và lưu thành công phải được tự động đồng bộ theo thời gian thực (Real-time) lên màn hình của tất cả các nhân sự khác đang mở xem biên bản cuộc họp đó mà không yêu cầu họ phải tải lại trang. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-MTM-04 Bảo mật quá trình xử lý dữ liệu Speech-to-Text** 

| UC ID and Name: | UC-MTM-04 Bảo mật quá trình xử lý dữ liệu Speech-to-Text  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin, System (automated)  | Secondary Actors: | Dịch vụ nhận diện giọng nói đám mây (Cloud Speech-to-Text Engine) |
| Trigger: | Một tiến trình chuyển đổi giọng nói thành văn bản (STT) được kích hoạt, đòi hỏi hệ thống phải gửi tệp âm thanh gốc ra môi trường xử lý bên ngoài (đám mây) và sau đó lưu trữ lại kết quả văn bản trả về.  |  |  |
| Description: | Đây là một luồng nghiệp vụ chạy ngầm mang tính chất bảo vệ, nhằm đảm bảo an toàn thông tin tuyệt đối cho dữ liệu âm thanh và biên bản cuộc họp trong suốt vòng đời của chúng. Hệ thống tự động thiết lập các giao thức mã hóa khi gửi dữ liệu đến đối tác thứ ba (Google Cloud), đồng thời thực thi nghiêm ngặt các bộ quy tắc bảo mật do Quản trị viên cài đặt. Quá trình này đảm bảo không một ai (kể cả nhân viên kỹ thuật không có thẩm quyền) có thể nghe lén, đánh cắp hay đọc được các thông tin nhạy cảm mang tính bí mật kinh doanh của công ty.  |  |  |
| Preconditions: | \- Quản trị viên đã thiết lập, cấu hình các chính sách và bộ quy tắc bảo mật dữ liệu trên phân hệ Quản trị hệ thống. \- Hệ thống đã thiết lập kết nối an toàn, đã xác thực chứng chỉ với dịch vụ AI đám mây. |  |  |
| Postconditions: | \- File âm thanh và bản Transcript được truyền tải, phân tích và trả về thành công mà không bị rò rỉ hay can thiệp trên đường truyền. \- Các tệp tin được lưu trữ nội bộ ở trạng thái đã mã hóa và được áp dụng đúng các quy tắc giới hạn quyền truy cập do Quản trị viên ban hành. |  |  |
| Normal Flow: | 1\. Quản trị viên truy cập phân hệ Cài đặt hệ thống, định nghĩa các bộ quy tắc bảo mật liên quan đến dữ liệu STT (Ví dụ: "Tự động xóa file âm thanh gốc sau khi bóc băng xong", "Mã hóa văn bản khi lưu trữ", "Giới hạn quyền chia sẻ biên bản"). 2\. Khi hệ thống tiếp nhận một yêu cầu xử lý bóc băng cuộc họp, hệ thống tự động kích hoạt luồng bảo mật song song với luồng phân tích. 3\. Trước khi dữ liệu rời khỏi ranh giới mạng nội bộ, hệ thống thực hiện đóng gói và áp dụng thuật toán mã hóa trên đường truyền cho tệp âm thanh gốc. 4\. Hệ thống gửi gói dữ liệu đã mã hóa qua kênh truyền an toàn đến dịch vụ AI đám mây (Google Cloud). 5\. Dịch vụ AI tiến hành xử lý, sau đó trả về kết quả Transcript đã được mã hóa theo chiều ngược lại. 6\. Hệ thống nội bộ tiếp nhận, tiến hành giải mã kết quả để xử lý, sau đó ngay lập tức áp dụng thuật toán mã hóa tĩnh (mã hóa lưu trữ) trước khi đưa Transcript vào kho tài liệu. 7\. Hệ thống tự động rà soát và thực thi các bộ quy tắc bảo mật của Quản trị viên đã thiết lập ở bước 1 lên các tài nguyên vừa tạo ra (Ví dụ: gán nhãn tài liệu mật, khóa quyền chia sẻ công khai). 8\. Tiến trình hoàn tất, hệ thống ghi nhận một bản log lưu vết bảo mật vào nhật ký kiểm toán hệ thống. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Liên tục và tự động |  |  |
| Business Rules: | **BR1 (Mã hóa toàn vẹn \- End-to-end Encryption):** Dữ liệu âm thanh và văn bản bắt buộc phải được mã hóa cả khi đang truyền tải qua internet (Data In-transit) và khi nằm im trên máy chủ nội bộ (Data At-rest). **BR2 (Bảo vệ tính ẩn danh của nhật ký):** Nhật ký kiểm toán hệ thống (Audit Logs) chỉ được phép ghi nhận các "sự kiện" (ví dụ: "Đã gửi file mã hóa", "Đã nhận transcript lúc 14:00") chứ tuyệt đối không được phép ghi lại "nội dung" của văn bản hay âm thanh vào log để tránh tạo ra lỗ hổng rò rỉ dữ liệu.. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 4\. Room Management

#### 

1. #### **UC-RM-01 Tạo thủ công phòng họp mới** 

| UC ID and Name: | UC-RM-01 Tạo thủ công phòng họp mới  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Công ty có thêm phòng họp mới hoặc tái cấu trúc lại không gian văn phòng, cấp quản lý cần đưa không gian này lên hệ thống để nhân viên có thể bắt đầu tìm kiếm và đặt lịch sử dụng.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền thêm một không gian phòng họp mới vào danh mục tài sản nội bộ của hệ thống. Người dùng sẽ cung cấp các thông tin định danh và năng lực của phòng (như tên phòng, vị trí, sức chứa, các trang thiết bị đi kèm). Sau khi khởi tạo hoàn tất, phòng họp sẽ tự động được đưa vào danh sách không gian chung và lập tức sẵn sàng tiếp nhận các yêu cầu đặt lịch từ toàn bộ nhân sự.  |  |  |
| Preconditions: | \- Người dùng thực hiện thao tác đã đăng nhập thành công và được phân quyền Quản lý cơ sở vật chất/phòng họp. \- Người dùng đang truy cập vào phân hệ Quản lý phòng họp. |  |  |
| Postconditions: | \- Thông tin  của phòng họp mới được hệ thống ghi nhận thành công. \- Phòng họp xuất hiện trên danh sách tìm kiếm và màn hình đặt lịch chung của toàn công ty với trạng thái mặc định ban đầu là "Khả dụng" (Available). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý phòng họp" và nhấn chọn nút "Thêm phòng họp mới". 2\. Hệ thống hiển thị biểu mẫu khởi tạo thông tin không gian họp. 3\. Người dùng điền các thông tin chi tiết bao gồm: Tên phòng họp, Vị trí (Tầng/Tòa nhà), Sức chứa tối đa (số lượng người), và tích chọn các trang thiết bị tiện ích có sẵn tại phòng (ví dụ: Máy chiếu,TV, …). 4\. Người dùng kiểm tra lại các thông tin đã nhập và nhấn nút "Lưu". 5\. Hệ thống kiểm tra tính hợp lệ cơ bản của dữ liệu (đảm bảo tên phòng và vị trí không bị bỏ trống, sức chứa là một con số hợp lệ). 6\. Hệ thống đối chiếu danh mục để đảm bảo Tên phòng họp không bị trùng lặp với bất kỳ phòng nào đang tồn tại. 7\. Hệ thống ghi nhận không gian phòng họp mới và tự động thiết lập trạng thái hoạt động là "Khả dụng". 8\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Tạo phòng họp thành công" và làm mới lại giao diện danh sách phòng. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Bỏ trống thông tin bắt buộc:** Tại bước 5, nếu người dùng không nhập Tên phòng hoặc Vị trí, hệ thống sẽ chặn thao tác lưu, bôi đỏ các khu vực bị thiếu và yêu cầu người dùng điền đầy đủ thông tin. **E2. Sức chứa không hợp lệ:** Tại bước 5, nếu người dùng nhập chữ cái hoặc số âm vào mục Sức chứa, hệ thống sẽ báo lỗi định dạng ngay tại trường dữ liệu và yêu cầu nhập một con số thực tế, lớn hơn không. **E3. Trùng lặp tên phòng họp:** Tại bước 6, nếu Tên phòng họp vừa nhập đã được sử dụng cho một căn phòng khác trong tổ chức, hệ thống từ chối lệnh tạo mới và hiển thị cảnh báo: "Tên phòng họp này đã tồn tại trong hệ thống. Vui lòng chọn một định danh khác để tránh nhầm lẫn khi đặt lịch." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Tên phòng họp bắt buộc phải là duy nhất trên toàn hệ thống để tránh tình trạng nhân viên đặt nhầm phòng hoặc trùng lặp dữ liệu không gian. **BR2:** Bất kỳ phòng họp nào ngay sau khi được tạo mới thành công cũng sẽ được hệ thống gán mặc định trạng thái "Khả dụng" (Available) để có thể phục vụ ngay lập tức. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Không gian văn phòng vật lý đã được thiết lập, thi công xong ngoài thực tế và sẵn sàng đưa vào sử dụng trước khi người Quản lý tiến hành khai báo thông tin kỹ thuật lên phần mềm.  |  |  |

2. #### **UC-RM-02 Cập nhật thủ công thông tin phòng họp** 

| UC ID and Name: | UC-RM-02 Cập nhật thủ công thông tin phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Cấp quản lý cần thay đổi các thông tin thực tế của phòng họp (như điều chỉnh lại sức chứa khi thêm ghế, đổi tên phòng, hoặc thay đổi vị trí tầng làm việc) để đồng bộ thông tin chính xác lên hệ thống.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền chỉnh sửa các thông tin hiện tại của một phòng họp bao gồm Tên phòng, Sức chứa, Vị trí và trạng thái các trang thiết bị tiện ích đi kèm. Sau khi lưu lại các chỉnh sửa, thông tin mới sẽ lập tức được ghi nhận và đồng bộ trực tuyến lên giao diện lưới lịch phòng của toàn bộ nhân viên trong công ty.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền Quản lý cơ sở vật chất/phòng họp. \- Phòng họp cần chỉnh sửa đã được khởi tạo và đang hiện diện trong danh sách hệ thống. \- Người dùng đang truy cập tại giao diện Quản lý phòng họp. |  |  |
| Postconditions: | \- Các thông tin thay đổi của phòng họp được hệ thống ghi nhận và áp dụng thành công. \- Giao diện lưới lịch phòng họp của toàn bộ người dùng đang đăng nhập được làm mới và hiển thị thông tin thay đổi ngay lập tức mà không cần tải lại trang. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý phòng họp". 2\. Người dùng sử dụng bộ lọc hoặc tìm kiếm để chọn phòng họp cần điều chỉnh, sau đó nhấn nút "Chỉnh sửa". 3\. Hệ thống hiển thị biểu mẫu cập nhật chứa sẵn các thông tin hiện hành của phòng họp đó. 4\. Người dùng tiến hành thay đổi các thông tin cần thiết tại các mục: Tên phòng họp, Vị trí, Sức chứa tối đa, hoặc cập nhật lại danh mục thiết bị tiện ích. 5\. Người dùng nhấn nút "Lưu thay đổi". 6\. Hệ thống thực hiện kiểm tra tính hợp lệ cơ bản của thông tin vừa nhập (đảm bảo các mục bắt buộc không bị bỏ trống, số lượng sức chứa là số hợp lệ). 7\. Hệ thống đối chiếu danh mục không gian để đảm bảo Tên phòng họp sau khi sửa đổi không bị trùng lặp với bất kỳ phòng họp nào khác. 8\. Hệ thống ghi nhận thông tin mới, đóng biểu mẫu và phát lệnh đồng bộ trạng thái thông tin theo thời gian thực lên giao diện hiển thị của toàn bộ người dùng. 9\. Hệ thống hiển thị thông báo: "Cập nhật thông tin phòng họp thành công". |  |  |
| Alternative Flows: | **E1. Bỏ trống thông tin bắt buộc:** Tại bước 6, nếu người dùng xóa trắng mục Tên phòng hoặc Vị trí, hệ thống sẽ chặn thao tác lưu, bôi đỏ mục tương ứng và cảnh báo: "Vui lòng nhập đầy đủ thông tin bắt buộc." **E2. Số lượng sức chứa không hợp lệ:** Tại bước 6, nếu người dùng nhập ký tự chữ hoặc số âm vào mục Sức chứa, hệ thống sẽ chặn tiến trình và yêu cầu nhập lại một con số nguyên dương thích hợp. **E3. Trùng tên với phòng họp khác:** Tại bước 7, nếu người dùng thay đổi tên phòng trùng khớp với tên của một phòng họp khác đã có sẵn trên hệ thống, hệ thống từ chối lưu và hiển thị cảnh báo: "Tên phòng họp này đã tồn tại. Vui lòng chọn một tên gọi khác." |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Tên phòng họp sau khi chỉnh sửa bắt buộc phải duy trì tính duy nhất trên toàn hệ thống để tránh nhầm lẫn cho người đặt lịch. **BR2:** Thao tác cập nhật thông tin phòng họp (như sửa tên, sửa sức chứa) không làm ảnh hưởng hoặc làm hủy bỏ các lịch họp đã được người dùng đặt thành công trong căn phòng đó trước thời điểm chỉnh sửa. **BR3:** Sự thay đổi thông tin phải tuân thủ cơ chế cập nhật tức thời (Real-time update). Nghĩa là màn hình xem lịch phòng của nhân viên khác phải tự động cập nhật thông tin phòng họp mới mà không yêu cầu nhân viên phải bấm nút F5 hay tải lại trình duyệt. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-RM-03 Xóa phòng họp** 

| UC ID and Name: | UC-RM-03 Xóa phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: | Hệ thống Thông báo/Email  |
| Trigger: | Công ty trả lại mặt bằng, đập bỏ phòng hoặc chuyển đổi mục đích sử dụng không gian khiến phòng họp này không còn tồn tại hoặc không còn phục vụ cho việc họp hành nữa.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền loại bỏ vĩnh viễn một phòng họp khỏi danh mục không gian có thể đặt lịch của tổ chức. Điểm đặc biệt của tính năng này là khả năng xử lý các xung đột tương lai: nếu phòng họp bị xóa trong khi vẫn còn các cuộc họp đã được lên lịch từ trước chưa diễn ra, hệ thống sẽ tự động gỡ địa điểm của các cuộc họp đó và lập tức gửi cảnh báo yêu cầu người tổ chức phải nhanh chóng chọn một phòng khác thay thế.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền chức năng Quản lý phòng họp. \- Phòng họp mục tiêu đang tồn tại trên hệ thống và hiển thị trong danh sách quản lý. |  |  |
| Postconditions: | \- Phòng họp bị gỡ bỏ hoàn toàn khỏi màn hình tìm kiếm và giao diện lưới lịch phòng của tất cả nhân viên; không ai có thể đặt lịch mới tại phòng này nữa. \- Các cuộc họp đã lên lịch trong tương lai tại phòng này bị đánh dấu trạng thái "Thiếu địa điểm/Cần đổi phòng". \- Người tổ chức của các cuộc họp bị ảnh hưởng nhận được thông báo yêu cầu cập nhật địa điểm. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý phòng họp" và tìm đến phòng họp cần gỡ bỏ. 2\. Người dùng nhấn chọn chức năng "Xóa" tại dòng thông tin của phòng họp đó. 3\. Hệ thống thực hiện rà soát lịch đặt phòng hiện tại để kiểm tra xem có bao nhiêu cuộc họp trong tương lai đang dự kiến diễn ra tại phòng này. 4\. Hệ thống hiển thị hộp thoại cảnh báo xác nhận: "Hành động này sẽ gỡ bỏ phòng họp khỏi hệ thống. Có \[X\] cuộc họp trong tương lai sẽ bị ảnh hưởng và cần đổi phòng. Bạn có chắc chắn muốn tiếp tục?". 5\. Người dùng xác nhận bằng cách nhấn nút "Đồng ý xóa". 6\. Hệ thống tiến hành loại bỏ phòng họp khỏi danh mục không gian khả dụng. 7\. Hệ thống tự động chuyển trạng thái địa điểm của các cuộc họp tương lai liên quan thành "Cần cập nhật", đồng thời kích hoạt tiến trình gửi email/thông báo hệ thống đến những người tổ chức các cuộc họp đó với nội dung yêu cầu chọn lại phòng. 8\. Hệ thống đóng hộp thoại, hiển thị thông báo "Xóa phòng họp thành công" và tải lại danh sách. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Xóa phòng đang diễn ra cuộc họp:** Tại bước 3, nếu hệ thống phát hiện phòng họp này đang có một cuộc họp "Đang diễn ra" (tại thời điểm thực tại), hệ thống sẽ cảnh báo: "Phòng họp đang được sử dụng ở thời điểm hiện tại. Vui lòng chờ cuộc họp kết thúc trước khi thực hiện thao tác xóa." và chặn hành động gỡ bỏ.  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Hiếm khi  |  |  |
| Business Rules: | **BR1:** Nguyên tắc toàn vẹn dữ liệu lịch sử: Việc xóa phòng họp chỉ làm phòng này biến mất khỏi các danh sách đặt lịch trong tương lai. Đối với các cuộc họp đã diễn ra và kết thúc trong quá khứ, tên của phòng họp này vẫn phải được hiển thị chính xác trong các báo cáo và biên bản để đảm bảo tính minh bạch của thông tin lịch sử. **BR2:** Các cuộc họp trong tương lai bị ảnh hưởng bởi việc xóa phòng sẽ KHÔNG bị hệ thống tự động hủy bỏ. Cuộc họp vẫn tồn tại trên lịch của những người tham gia, chỉ có trường thông tin "Địa điểm" bị xóa rỗng và có kèm cờ cảnh báo bắt buộc cập nhật. |  |  |
| Other Information: | Trong nội dung Email gửi đi cho những người tổ chức bị ảnh hưởng (ở bước 7), hệ thống nên tự động gợi ý 2-3 phòng họp khác đang còn trống trong cùng khung giờ đó và có sức chứa tương đương để người tổ chức dễ dàng bấm đổi phòng ngay lập tức.  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-RM-04 Tìm kiếm phòng họp** 

| UC ID and Name: | UC-RM-04 Tìm kiếm phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng cần tìm một không gian phù hợp với nhu cầu cụ thể (như số lượng người tham gia đông, vị trí tầng thuận tiện, hoặc đang cần tìm phòng trống gấp) để tiến hành đặt lịch họp.  |  |  |
| Description: | Chức năng này cho phép mọi người dùng trong hệ thống tra cứu và sàng lọc danh sách phòng họp bằng cách áp dụng kết hợp nhiều tiêu chí khác nhau. Người dùng có thể tìm kiếm theo từ khóa (tên phòng) hoặc sử dụng các bộ lọc chuyên sâu như mức sức chứa, vị trí cụ thể (tầng/khu vực), và trạng thái hiện tại (đang trống, đang bảo trì). Hệ thống sẽ tự động đối chiếu và trả về danh sách các phòng họp đáp ứng chính xác mọi điều kiện đã thiết lập.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Người dùng đang truy cập vào giao diện Danh sách phòng họp hoặc phân hệ Đặt lịch họp. \- Hệ thống đã có sẵn danh mục các phòng họp được khởi tạo. |  |  |
| Postconditions: | \- Giao diện làm mới và chỉ hiển thị danh sách các phòng họp thỏa mãn toàn bộ các điều kiện tìm kiếm/lọc. \- Trạng thái của các bộ lọc đang được sử dụng vẫn hiển thị trên màn hình để người dùng biết họ đang xem dữ liệu trong phạm vi nào. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Phòng họp" hoặc "Đặt lịch". 2\. Tại khu vực thanh tìm kiếm và công cụ lọc, người dùng thiết lập một hoặc nhiều tiêu chí như: Sức chứa (chọn khoảng số lượng người), Vị trí (chọn tầng làm việc từ danh sách thả xuống), hoặc Trạng thái (chọn Khả dụng). 3\. Người dùng nhấn nút "Tìm kiếm" (hoặc hệ thống tự động kích hoạt quá trình lọc ngay khi người dùng chọn xong tiêu chí). 4\. Hệ thống tiếp nhận các điều kiện lọc, tiến hành rà soát không gian vật lý trong hệ thống lưu trữ. 5\. Hệ thống thu hẹp danh sách kết quả, hiển thị lên màn hình thông tin các phòng họp đáp ứng đồng thời tất cả các tiêu chí người dùng đã nhập. |  |  |
| Alternative Flows: | **A1. Xóa điều kiện tìm kiếm (Clear Filters):** Tại bước 5, người dùng có thể nhấn nút "Xóa bộ lọc". Hệ thống sẽ gỡ bỏ tất cả các tiêu chí giới hạn đang áp dụng và tải lại danh sách hiển thị toàn bộ phòng họp của công ty.  |  |  |
| Exceptions: | **E1. Không tìm thấy phòng họp phù hợp:** Tại bước 5, nếu tổ hợp các điều kiện lọc quá khắt khe và không có phòng họp nào ngoài thực tế đáp ứng được (Ví dụ: tìm phòng trống có sức chứa trên 100 người ở Tầng 1, nhưng tầng 1 chỉ có phòng nhỏ), hệ thống sẽ hiển thị một danh sách trống kèm thông báo: "Không tìm thấy phòng họp nào phù hợp với các tiêu chí hiện tại. Vui lòng điều chỉnh lại bộ lọc."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1:** Khi người dùng áp dụng nhiều bộ lọc khác loại cùng lúc, hệ thống bắt buộc phải sử dụng logic "Đồng thời" (AND). Nghĩa là phòng họp phải thỏa mãn TẤT CẢ các tiêu chí mới được hiển thị. **BR2:** Tiêu chí lọc theo "Trạng thái" (Đang trống/Đang bận) phải được hệ thống tính toán và phản ánh theo thời gian thực (Real-time) ngay tại đúng thời điểm người dùng thực hiện thao tác tra cứu. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-RM-05 Gán thủ công camera nhận diện vào phòng họp** 

| UC ID and Name: | UC-RM-05 Gán thủ công camera nhận diện vào phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin  | Secondary Actors: |  |
| Trigger: | Công ty hoàn tất việc lắp đặt thiết bị camera thông minh tại một phòng họp vật lý và quản lý cần đồng bộ thiết bị này lên phần mềm để kích hoạt khả năng điểm danh khuôn mặt và phân tích cuộc họp.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền khai báo và liên kết một thiết bị camera nhận diện với một không gian phòng họp cụ thể. Khi quá trình ghép nối hoàn tất, luồng dữ liệu hình ảnh (video stream) từ camera này sẽ được hệ thống tiếp nhận để phục vụ thuật toán nhận diện danh tính người tham dự và theo dõi hành vi, tương tác của họ trong suốt thời gian diễn ra cuộc họp.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập với phân quyền Quản lý cơ sở vật chất hoặc Quản trị viên. \- Phòng họp mục tiêu đã được khởi tạo trên hệ thống. \- Thiết bị camera đã được cấp điện, kết nối mạng nội bộ và người Quản lý đã nắm được thông tin định danh của camera (ví dụ: Địa chỉ IP, Mã thiết bị/Serial Number). |  |  |
| Postconditions: | \- Thiết bị camera được ghép nối thành công và gắn chặt với không gian phòng họp mục tiêu. \- Hệ thống sẵn sàng kích hoạt thu nhận luồng hình ảnh từ camera này để chạy thuật toán nhận diện ngay khi có một cuộc họp bắt đầu tại phòng. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý phòng họp" và nhấn vào phòng họp cần lắp đặt camera. 2\. Tại màn hình chi tiết phòng, người dùng chọn mục "Quản lý thiết bị/Camera" và nhấn nút "Thêm camera mới". 3\. Hệ thống hiển thị biểu mẫu yêu cầu nhập thông tin, bao gồm: Tên thiết bị (để dễ nhớ), Địa chỉ luồng dữ liệu (IP/URL luồng stream), và Mã thiết bị. 4\. Người dùng điền đầy đủ các thông số kỹ thuật của camera và nhấn nút "Kiểm tra kết nối". 5\. Hệ thống gửi tín hiệu để xác minh thiết bị camera đang hoạt động và đảm bảo luồng dữ liệu hình ảnh có thể truy cập được. 6\. Khi xác minh kết nối thành công, người dùng nhấn nút "Lưu và Gán thiết bị". 7\. Hệ thống ghi nhận sự liên kết giữa thiết bị camera này và phòng họp. 8\. Hệ thống hiển thị thông báo "Gán camera vào phòng họp thành công" và cập nhật thiết bị vào danh mục quản lý của phòng. |  |  |
| Alternative Flows: | **A1. Xem trước góc quay (Preview):** Tại bước 5, sau khi kiểm tra kết nối thành công, hệ thống hiển thị một khung hình nhỏ trích xuất trực tiếp từ camera. Người dùng có thể xem trước để đảm bảo góc quay của camera bao quát đủ toàn bộ bàn họp trước khi lưu. **A2. Gỡ bỏ camera (Unpair):** Nếu camera bị hỏng hoặc cần tháo dỡ, người dùng có thể truy cập danh sách thiết bị của phòng, chọn camera tương ứng và nhấn "Gỡ bỏ kết nối" để ngắt hoàn toàn thiết bị này khỏi phòng họp. |  |  |
| Exceptions: | **E1. Mất kết nối camera:** Tại bước 5, nếu hệ thống không thể nhận tín hiệu (do sai địa chỉ, camera mất điện, hoặc tường lửa chặn mạng), hệ thống sẽ cảnh báo: "Không thể kết nối đến thiết bị. Vui lòng kiểm tra lại thông tin cấu hình và đường truyền mạng." **E2. Camera đã bị gán cho phòng khác:** Tại bước 7, nếu thông tin định danh của camera này đã được sử dụng và liên kết với một phòng họp khác trong công ty, hệ thống sẽ chặn thao tác và thông báo: "Thiết bị camera này đang được gán cho một phòng họp khác. Vui lòng gỡ bỏ ở phòng cũ trước khi thực hiện." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Một phòng họp diện tích lớn có thể được gán nhiều thiết bị camera cùng lúc để đảm bảo góc nhìn, nhưng một thiết bị camera tại một thời điểm chỉ được phép liên kết duy nhất với một phòng họp.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 5\. Equipment Management

1. #### **UC-EM-01 Đăng ký thủ công thiết bị họp mới** 

| UC ID and Name: | UC-EM-01 Đăng ký thủ công thiết bị họp mới  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Công ty mua sắm thêm các trang thiết bị mới phục vụ cho việc họp hành (như màn hình tương tác, máy chiếu, micro, loa) và Quản lý cần đưa thông tin các tài sản này lên phần mềm để quản lý và phân bổ vào các không gian họp.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền thêm mới một tài sản hoặc trang thiết bị vào kho tài nguyên chung của tổ chức trên hệ thống. Người dùng sẽ khai báo các thông tin nhận diện cơ bản như tên gọi, chủng loại và mã tài sản nội bộ. Sau khi khởi tạo thành công, thiết bị này sẽ nằm trong danh mục tài nguyên chung, sẵn sàng để được gán vào các phòng họp cụ thể với trạng thái mặc định ban đầu là "Đang hoạt động tốt".  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền chức năng Quản lý cơ sở vật chất/Quản lý thiết bị. \- Người dùng đang truy cập vào phân hệ Quản lý thiết bị (Equipment Management). |  |  |
| Postconditions: | \- Thông tin thiết bị mới được lưu trữ thành công vào danh mục tài sản của hệ thống. \- Thiết bị tự động được gán trạng thái khả dụng ("Đang hoạt động tốt") và sẵn sàng để tích hợp vào các phòng họp. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào chức năng "Quản lý thiết bị" và nhấn chọn nút "Thêm thiết bị mới". 2\. Hệ thống hiển thị biểu mẫu khởi tạo thiết bị. 3\. Người dùng điền các thông tin chi tiết bao gồm: Tên thiết bị (Ví dụ: Màn hình Samsung 65 inch), Loại thiết bị (chọn từ danh sách thả xuống như Máy chiếu, Loa, Màn hình hiển thị), Mã tài sản (mã kiểm kê nội bộ), và Mô tả thêm (nếu có). 4\. Người dùng kiểm tra lại thông tin và nhấn nút "Lưu". 5\. Hệ thống kiểm tra tính hợp lệ của dữ liệu (đảm bảo các trường bắt buộc như Tên thiết bị và Loại thiết bị không bị bỏ trống). 6\. Hệ thống đối chiếu thông tin để đảm bảo Mã tài sản vừa nhập không bị trùng lặp với bất kỳ thiết bị nào đang có trên hệ thống. 7\. Hệ thống ghi nhận thông tin thiết bị vào kho tài nguyên và tự động thiết lập trạng thái hoạt động ban đầu là "Đang hoạt động tốt". 8\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Đăng ký thiết bị thành công" và làm mới lại giao diện danh mục thiết bị. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Bỏ trống thông tin bắt buộc:** Tại bước 5, nếu người dùng không nhập Tên thiết bị hoặc không chọn Loại thiết bị, hệ thống sẽ chặn thao tác lưu, bôi đỏ khu vực bị thiếu và yêu cầu bổ sung thông tin. **E2. Trùng lặp định danh tài sản:** Tại bước 6, nếu hệ thống phát hiện Mã tài sản (mã kiểm kê) vừa nhập đã tồn tại trên một thiết bị khác, hệ thống sẽ từ chối tạo mới và hiển thị cảnh báo: "Mã tài sản này đã tồn tại trên hệ thống. Vui lòng kiểm tra lại để tránh nhầm lẫn thiết bị." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Mã tài sản bắt buộc phải là chuỗi định danh duy nhất cho từng món đồ vật lý để phục vụ công tác kiểm kê sau này. **BR2:** Mọi thiết bị mới khi đưa lên hệ thống thông qua luồng này đều được ngầm định là tài sản mới/đang sử dụng tốt. Trạng thái hỏng hóc hoặc bảo trì chỉ được ghi nhận thông qua một quy trình cập nhật trạng thái riêng biệt sau này. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

2. #### **UC-EM-02 Cập nhật trạng thái lỗi thiết bị** 

| UC ID and Name: | UC-EM-02 Cập nhật trạng thái lỗi thiết bị  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee, Business Admin  | Secondary Actors: |  |
| Trigger: | Có sự cố phát sinh với thiết bị (người dùng phát hiện lỗi) hoặc Quản lý đã hoàn tất việc kiểm tra/sửa chữa và cần thay đổi tình trạng hoạt động của tài sản trên hệ thống.  |  |  |
| Description: | Chức năng này quản lý vòng đời trạng thái của một thiết bị. Tùy thuộc vào vai trò của người thao tác, hệ thống sẽ đưa ra hướng xử lý khác nhau: \- Đối với **Người dùng (User)**: Chức năng đóng vai trò như một kênh "Báo cáo sự cố", ghi nhận tình trạng bất thường và chuyển thiết bị sang trạng thái "Chờ kiểm tra" để thông báo cho đội kỹ thuật. \- Đối với **Quản lý (Manager)**: Chức năng cho phép chốt lại trạng thái chính thức (chuyển sang "Bảo trì/Hư hỏng" hoặc trả về "Hoạt động tốt"). Nếu thiết bị bị đánh dấu hỏng, hệ thống sẽ tự động gỡ bỏ nó khỏi các tiện ích phòng họp để tránh người khác đặt nhầm. |  |  |
| Preconditions: | \- Người dùng đã đăng nhập vào hệ thống. \- Thiết bị cần báo lỗi đang tồn tại trên hệ thống, đã được gán vào một phòng họp và đang ở trạng thái hoạt động bình thường. |  |  |
| Postconditions: | \- Trạng thái của thiết bị được cập nhật tương ứng với thao tác (Chờ kiểm tra, Bảo trì/Hư hỏng, hoặc Hoạt động bình thường). \- Nếu trạng thái chính thức là "Bảo trì/Hư hỏng", hệ thống tự động điều chỉnh thuật toán: loại trừ phòng họp này khỏi kết quả tìm kiếm nếu người đặt lịch yêu cầu đích danh loại thiết bị đang bị hỏng đó. |  |  |
| Normal Flow: | 1\. Người thao tác truy cập vào chi tiết phòng họp đang sử dụng hoặc phân hệ "Quản lý thiết bị" để tìm đến thiết bị cần xử lý. 2\. Hệ thống kiểm tra vai trò của tài khoản đang đăng nhập để hiển thị luồng chức năng tương ứng: **\- Hướng xử lý A (Dành cho Người dùng \- Báo cáo sự cố):** Bước 1: Người dùng nhấn nút "Báo cáo sự cố" tại thiết bị lỗi. Bước 2 : Hệ thống hiển thị biểu mẫu yêu cầu mô tả tình trạng. Bước 3 : Người dùng nhập nội dung (ví dụ: "Máy chiếu mờ") và nhấn "Gửi báo cáo". Bước 4 : Hệ thống tiếp nhận, chuyển trạng thái thiết bị thành "Chờ kiểm tra" (vẫn giữ thiết bị hiển thị trong phòng nhưng có gắn nhãn cảnh báo) và phát lệnh gửi thông báo nội bộ đến bộ phận Quản lý. **\- Hướng xử lý B (Dành cho Quản lý \- Cập nhật trạng thái chính thức):** Bước 1 : Quản lý nhấn chọn nút "Cập nhật trạng thái" tại thiết bị (có thể đang ở trạng thái "Chờ kiểm tra" hoặc "Hoạt động tốt"). Bước 2 : Hệ thống hiển thị biểu mẫu chọn trạng thái mới. Bước 3 : Quản lý chọn trạng thái "Bảo trì/Hư hỏng" (đã xác nhận hỏng) hoặc "Đang hoạt động tốt" (bác bỏ lỗi hoặc đã sửa xong), sau đó nhấn "Lưu thay đổi". Bước 4 :  Hệ thống ghi nhận trạng thái chính thức. Nếu là "Bảo trì/Hư hỏng", hệ thống lập tức ngắt liên kết thiết bị này khỏi danh sách tiện ích khả dụng của phòng họp để bộ lọc đặt lịch nhận diện. 3\. Hệ thống đóng biểu mẫu, hiển thị thông báo thao tác thành công và làm mới lại giao diện. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Bỏ trống mô tả sự cố:** Tại bước 5, nếu hệ thống quy định bắt buộc phải có thông tin để đội bảo trì xử lý mà người dùng lại để trống ô mô tả lỗi, hệ thống sẽ chặn thao tác lưu, bôi đỏ trường nhập liệu và yêu cầu người dùng điền thông tin chi tiết.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Trạng thái "Chờ kiểm tra" (do User báo cáo) **không** làm thiết bị biến mất khỏi hệ thống lọc phòng họp, nhằm tránh trường hợp nhân viên cố tình báo cáo hỏng ảo để chiếm dụng phòng. Chỉ có quyết định "Bảo trì/Hư hỏng" của Quản lý mới kích hoạt cơ chế ẩn thiết bị. **BR2:** Loại trừ thông minh (Smart Exclusion): Khi Quản lý đã chốt thiết bị hỏng, phòng họp đó sẽ không hiện lên nếu nhân viên khác tìm kiếm với bộ lọc yêu cầu có thiết bị đó. (Ví dụ: Tìm "Phòng họp trống" thì phòng đó vẫn hiện; nhưng tìm "Phòng có máy chiếu" thì phòng đó bị ẩn đi do máy chiếu đã hỏng). **BR3:** Việc báo lỗi hoặc chốt trạng thái hỏng không làm hủy bỏ các cuộc họp đã lên lịch từ trước trong tương lai tại phòng đó, nhưng hệ thống sẽ tự động hiển thị thêm nhãn cảnh báo (Ví dụ: "Thiết bị X đang bảo trì") trên lịch để những người tổ chức chủ động nắm thông tin. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-EM-03 Xóa thiết bị** 

| UC ID and Name: | UC-EM-03 Xóa thiết bị  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Thiết bị vật lý bị hỏng hóc hoàn toàn không thể sửa chữa, hoặc đã hết hạn khấu hao và được thanh lý, khiến Quản lý cần loại bỏ tài sản này khỏi hệ thống quản lý chung của công ty  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền gỡ bỏ vĩnh viễn một trang thiết bị ra khỏi danh mục tài sản của hệ thống. Khi thao tác được thực hiện thành công, thiết bị này sẽ không còn tồn tại trong kho tài nguyên và tự động bị gỡ khỏi bất kỳ phòng họp nào mà nó đang được phân bổ.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với quyền Quản lý thiết bị/Quản lý tài sản. \- Thiết bị mục tiêu đang tồn tại trong danh mục quản lý của hệ thống. |  |  |
| Postconditions: | \- Thông tin thiết bị bị loại bỏ hoàn toàn khỏi danh mục tài sản chung. \- Không gian phòng họp (nếu trước đó đang chứa thiết bị này) sẽ tự động cập nhật giảm đi tiện ích tương ứng trên giao diện tìm kiếm của người dùng. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý thiết bị" và sử dụng thanh tìm kiếm để tìm đến thiết bị cần loại bỏ. 2\. Người dùng nhấn chọn chức năng "Xóa" (hoặc biểu tượng thùng rác) tại dòng thông tin của thiết bị đó. 3\. Hệ thống rà soát trạng thái hiện tại của thiết bị để kiểm tra xem tài sản này có đang được đặt tại phòng họp nào không. 4\. Hệ thống hiển thị hộp thoại cảnh báo: "Hành động này sẽ gỡ bỏ thiết bị vĩnh viễn khỏi danh mục tài sản chung. Nếu thiết bị đang nằm trong phòng họp, nó cũng sẽ bị thu hồi khỏi không gian đó. Bạn có chắc chắn muốn tiếp tục?". 5\. Người dùng xác nhận bằng cách nhấn nút "Đồng ý xóa". 6\. Hệ thống tiến hành loại bỏ thông tin thiết bị khỏi kho tài nguyên chung. 7\. Hệ thống tự động gỡ bỏ liên kết tiện ích của thiết bị này tại không gian phòng họp (nếu có). 8\. Hệ thống đóng hộp thoại, hiển thị thông báo "Xóa thiết bị thành công" và làm mới lại danh sách tài sản. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Thiết bị đang được sử dụng trong cuộc họp diễn ra:** Tại bước 3, nếu hệ thống phát hiện thiết bị này đang nằm trong một phòng họp có cuộc họp đang *trực tiếp diễn ra* ở thời điểm thực tại, hệ thống sẽ chặn thao tác xóa và hiển thị cảnh báo: "Thiết bị này đang nằm trong phòng họp có cuộc họp đang diễn ra. Vui lòng đợi cuộc họp kết thúc trước khi thực hiện thanh lý hoặc xóa tài sản."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Hiếm khi  |  |  |
| Business Rules: | **BR1:** Hành động xóa thiết bị là hành động vĩnh viễn và không thể hoàn tác (Undo). **BR2:** Nguyên tắc toàn vẹn dữ liệu lịch sử: Việc gỡ bỏ thiết bị ở hiện tại không làm mất đi thông tin về thiết bị đó trong các báo cáo, thống kê hay biên bản của các cuộc họp đã diễn ra thành công trong quá khứ. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-EM-04 Tìm kiếm kho thiết bị** 

| UC ID and Name: | UC-EM-04 Tìm kiếm kho thiết bị  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Quản lý cần tra cứu, kiểm kê số lượng tài sản thiết bị hiện có, hoặc muốn rà soát danh sách các thiết bị đang bị hỏng để lên kế hoạch sửa chữa và mua sắm bổ sung.  |  |  |
| Description: | Chức năng này cung cấp một giao diện tổng hợp hiển thị toàn bộ danh sách trang thiết bị thuộc sở hữu của tổ chức. Người dùng có thể nhanh chóng tra cứu tài sản thông qua thanh tìm kiếm từ khóa (như Tên thiết bị, Mã tài sản) và sử dụng các bộ lọc chuyên sâu để phân loại danh sách theo "Loại tài sản" (Máy chiếu, Màn hình, Loa...) hoặc theo "Trạng thái hoạt động" (Đang hoạt động tốt, Chờ kiểm tra, Bảo trì/Hư hỏng).  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền chức năng Quản lý cơ sở vật chất/Quản lý thiết bị. \- Kho tài nguyên hệ thống đã có sẵn dữ liệu về các trang thiết bị. \- Người dùng đang truy cập tại giao diện danh sách thiết bị. |  |  |
| Postconditions: | \- Giao diện được làm mới và chỉ hiển thị tập hợp các thiết bị đáp ứng chính xác các điều kiện tra cứu/bộ lọc mà người dùng đã thiết lập. \- Các tiêu chí lọc đang được sử dụng vẫn hiển thị nổi bật trên thanh công cụ để người dùng dễ dàng nhận biết phạm vi dữ liệu đang xem. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý thiết bị". Màn hình mặc định hiển thị danh sách toàn bộ thiết bị đang có trong công ty. 2\. Tại khu vực công cụ tìm kiếm và lọc, người dùng nhập từ khóa (Tên hoặc Mã tài sản) vào thanh tìm kiếm hoặc nhấp vào các hộp thoại thả xuống của bộ lọc. 3\. Người dùng chọn một hoặc nhiều tiêu chí lọc như: Lọc theo Loại thiết bị (Ví dụ: Máy chiếu) hoặc Lọc theo Trạng thái (Ví dụ: Bảo trì/Hư hỏng). 4\. Hệ thống tiếp nhận các điều kiện này và tiến hành rà soát, đối chiếu với danh mục tài sản nội bộ. 5\. Hệ thống thu hẹp danh sách kết quả, hiển thị lên màn hình các thiết bị thỏa mãn đồng thời tất cả các tiêu chí người dùng đã thiết lập. |  |  |
| Alternative Flows: | **A1. Xóa điều kiện tìm kiếm/lọc:** Tại bước 5, người dùng muốn xem lại toàn bộ kho tài sản nên nhấn nút "Xóa bộ lọc" (Clear Filters) hoặc xóa nội dung trong thanh tìm kiếm. Hệ thống lập tức gỡ bỏ các giới hạn và tải lại danh sách hiển thị đầy đủ ban đầu.  |  |  |
| Exceptions: | **E1. Không tìm thấy thiết bị phù hợp:** Tại bước 5, nếu tổ hợp các điều kiện lọc không khớp với bất kỳ thiết bị nào hiện có (Ví dụ: Tìm "Máy chiếu" có trạng thái "Bảo trì/Hư hỏng", nhưng thực tế tất cả máy chiếu đều đang hoạt động tốt), hệ thống sẽ hiển thị một danh sách trống kèm theo thông báo: "Không tìm thấy thiết bị nào phù hợp với các tiêu chí tìm kiếm hiện tại."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Khi người dùng áp dụng nhiều bộ lọc khác loại cùng lúc (Ví dụ: Loại thiết bị VÀ Trạng thái hoạt động), hệ thống bắt buộc áp dụng thuật toán logic đồng thời (AND), nghĩa là thiết bị phải thỏa mãn TẤT CẢ các điều kiện đó mới được hiển thị. **BR2:** Tra cứu bằng thanh tìm kiếm từ khóa không phân biệt chữ hoa, chữ thường (case-insensitive) và hỗ trợ tìm kiếm tương đối (khớp một phần từ khóa). |  |  |
| Other Information: | Giao diện quản lý tích hợp thêm nút "Xuất dữ liệu" (Export) ngay cạnh thanh tìm kiếm để Quản lý có thể tải danh sách thiết bị (sau khi đã áp dụng bộ lọc) về máy tính cá nhân dưới dạng tệp tài liệu, phục vụ trực tiếp cho công tác in ấn, báo cáo hoặc kiểm kê tài sản định kỳ.  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-EM-05 Phân bổ thủ công thiết bị vào phòng họp** 

| UC ID and Name: | UC-EM-05 Phân bổ thủ công thiết bị vào phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Công ty tiến hành lắp đặt, điều chuyển một trang thiết bị vật lý từ kho vào một phòng họp cụ thể, hoặc luân chuyển thiết bị giữa các phòng họp với nhau, và Quản lý cần cập nhật vị trí mới này lên phần mềm để đồng bộ thông tin.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền thiết lập hoặc thay đổi vị trí cố định của một trang thiết bị (như máy chiếu, tivi, loa, bảng trắng) vào một phòng họp xác định. Việc phân bổ này giúp hệ thống ghi nhận chính xác danh mục tiện ích công nghệ mà phòng họp đó đang sở hữu, làm cơ sở cung cấp dữ liệu cho bộ lọc tìm kiếm phòng họp thông minh của nhân viên.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền chức năng Quản lý thiết bị hoặc Quản lý cơ sở vật chất. \- Thiết bị và phòng họp mục tiêu đều phải tồn tại sẵn trên hệ thống. |  |  |
| Postconditions: | \- Hệ thống ghi nhận vị trí cố định hiện tại của thiết bị là đang nằm tại phòng họp mục tiêu. \- Danh mục tiện ích đi kèm của phòng họp được cập nhật tự động (thêm thiết bị mới vào). \- Thay đổi này lập tức phản ánh lên giao diện lưới lịch phòng và bộ lọc đặt lịch của toàn bộ người dùng. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý thiết bị" và tìm đến thiết bị cần phân bổ (hoặc truy cập phân hệ "Quản lý phòng họp" và chọn phòng họp cần tiếp nhận thiết bị). 2\. Người dùng nhấn chọn chức năng "Phân bổ vị trí" hoặc "Gán vào phòng". 3\. Hệ thống hiển thị biểu mẫu phân bổ, bao gồm thông tin thiết bị và một danh sách thả xuống (dropdown) chứa tất cả các phòng họp đang khả dụng trong công ty. 4\. Người dùng chọn phòng họp mục tiêu từ danh sách và nhấn nút "Xác nhận gán". 5\. Hệ thống tiếp nhận yêu cầu, kiểm tra trạng thái hoạt động của phòng họp mục tiêu để đảm bảo tính hợp lệ. 6\. Hệ thống ghi nhận vị trí cố định mới của thiết bị tại phòng họp đã chọn. 7\. Hệ thống tự động cập nhật danh sách tiện ích của phòng họp đó, giúp bộ lọc tìm kiếm phòng họp của toàn bộ nhân viên ghi nhận chính xác tiện ích mới bổ sung này. 8\. Hệ thống đóng biểu mẫu, hiển thị thông báo "Phân bổ thiết bị vào phòng họp thành công" và làm mới giao diện. |  |  |
| Alternative Flows: | **A1. Hủy bỏ thao tác:** Tại bước 4, người dùng nhấn nút "Hủy bỏ". Hệ thống đóng biểu mẫu, không thay đổi vị trí của thiết bị và giữ nguyên trạng dữ liệu cũ. **A2. Điều chuyển thiết bị giữa các phòng (Re-allocation):** Tại bước 3, nếu thiết bị đang thuộc một phòng họp cũ, hệ thống sẽ hiển thị dòng ghi chú vị trí hiện tại của nó. Khi Quản lý chọn phòng họp mới và xác nhận, hệ thống sẽ tự động gỡ tiện ích này khỏi phòng họp cũ và cập nhật sang phòng họp mới trong một tiến trình duy nhất. |  |  |
| Exceptions: | **E1. Phòng họp tạm ngừng hoạt động:** Tại bước 5, nếu phòng họp được chọn đang ở trạng thái ngừng hoạt động (INACTIVE) hoặc đang đóng cửa bảo trì, hệ thống sẽ ngăn chặn việc gán và thông báo lỗi: "Không thể phân bổ thiết bị vào phòng họp đang tạm ngừng hoạt động."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Nguyên tắc độc nhất vị trí: Một thiết bị vật lý tại một thời điểm chỉ được phép ghi nhận nằm tại một vị trí duy nhất (hoặc ở Kho tài sản, hoặc ở một Phòng họp cụ thể), hệ thống tuyệt đối không cho phép gán một thiết bị cho nhiều phòng họp cùng lúc. **BR2:** Phân bổ thiết bị lỗi: Việc phân bổ một thiết bị đang ở trạng thái lỗi ("Bảo trì/Hư hỏng") vào phòng họp vẫn được hệ thống chấp nhận để quản lý vị trí vật lý. Tuy nhiên, thiết bị đó sẽ không được tính là tiện ích sẵn sàng phục vụ của phòng (bộ lọc tìm kiếm của User sẽ tự động bỏ qua tiện ích này) cho đến khi trạng thái lỗi được Quản lý gỡ bỏ. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Trang thiết bị công nghệ đã được bộ phận kỹ thuật vận chuyển, lắp đặt và kiểm tra tín hiệu hoạt động ổn định ngoài đời thực tại phòng họp trước khi Quản lý thực hiện thao tác cập nhật số hóa trên phần mềm.  |  |  |

6. #### **UC-EM-06 Xem / Kiểm tra trạng thái khả dụng của thiết bị** 

| UC ID and Name: | UC-EM-06 Xem / Kiểm tra trạng thái khả dụng của thiết bị  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Cấp quản lý cần rà soát nhanh tình trạng hiện hành của một thiết bị cụ thể để quyết định việc phân bổ cho phòng họp mới, luân chuyển công tác, hoặc theo dõi tiến độ đem đi bảo trì.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền xem xét chi tiết "bức tranh toàn cảnh" về trạng thái hiện tại của một thiết bị trong kho tài sản. Hệ thống sẽ cung cấp thông tin chính xác và trực quan nhất về việc thiết bị đang ở trạng thái rảnh rỗi (nằm trong kho dự trữ), đang được lắp đặt cố định tại một phòng họp cụ thể nào đó, hay đang trong tình trạng hư hỏng và được mang đi sửa chữa  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và được phân quyền chức năng Quản lý thiết bị. \- Thiết bị cần kiểm tra đang tồn tại trên hệ thống. |  |  |
| Postconditions: | \- Hệ thống hiển thị chính xác trạng thái hoạt động và vị trí hiện tại của thiết bị. \- Không có bất kỳ dữ liệu nào bị thay đổi sau thao tác này (thao tác chỉ đọc \- Read Only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý thiết bị" và sử dụng các công cụ tìm kiếm/lọc để tìm đến thiết bị cần kiểm tra. 2\. Người dùng nhấn chọn vào Tên thiết bị hoặc nút "Xem chi tiết" tại dòng thông tin tương ứng của thiết bị đó. 3\. Hệ thống tiếp nhận yêu cầu và trích xuất dữ liệu tổng hợp mới nhất về thiết bị từ hệ thống lưu trữ tài sản. 4\. Hệ thống mở ra màn hình chi tiết thiết bị, trình bày rõ ràng các thông tin trọng yếu được phân nhóm, bao gồm: **Thông tin cơ bản:** Tên thiết bị, Mã tài sản, Chủng loại. **Trạng thái hoạt động:** Đang hoạt động tốt, Chờ kiểm tra, hoặc Bảo trì/Hư hỏng. **Trạng thái khả dụng & Vị trí:** Nằm trong kho (Rảnh rỗi) hoặc Tên phòng họp đang được lắp đặt (Đã phân bổ). 5\. Người dùng xem xét các thông tin được cung cấp để nắm bắt tình hình. 6\. Sau khi kiểm tra xong, người dùng nhấn nút "Đóng" hoặc "Quay lại" để thoát khỏi giao diện chi tiết và trở về danh sách. |  |  |
| Alternative Flows: | **A1. Điều hướng nhanh đến không gian phòng họp:** Tại bước 4, nếu thiết bị đang được ghi nhận là lắp đặt tại một phòng họp cụ thể, tên phòng họp đó sẽ được hiển thị dưới dạng một liên kết (Hyperlink). Người dùng có thể nhấp trực tiếp vào liên kết này để chuyển thẳng sang giao diện xem chi tiết của phòng họp đó mà không cần thoát ra ngoài.  |  |  |
| Exceptions: | **E1. Thiết bị không còn tồn tại:** Nếu thiết bị mục tiêu vừa bị một Quản trị viên khác xóa khỏi hệ thống ngay trước đó (nhưng màn hình danh sách của người dùng hiện tại chưa kịp tải lại), khi nhấn xem chi tiết, hệ thống sẽ chặn thao tác và báo lỗi: "Tài sản này không còn tồn tại trên hệ thống. Vui lòng làm mới trang."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Dữ liệu về trạng thái khả dụng của thiết bị phải được truy xuất và hiển thị theo thời gian thực (Real-time). Bất kỳ sự thay đổi nào về vị trí hoặc trạng thái hỏng hóc phát sinh trước đó phải lập tức được phản ánh vào màn hình chi tiết này. **BR2:** Thao tác tra cứu này tuyệt đối tuân thủ nguyên tắc "Chỉ đọc". Mọi nỗ lực thay đổi thông tin đều phải được thực hiện thông qua các Use Case chuyên trách khác (như Cập nhật trạng thái hoặc Phân bổ thiết bị). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 6\. Scheduling Management

1. #### **UC-SM-01 Xem danh sách phòng họp đề xuất** 

| UC ID and Name: | UC-SM-01 Xem danh sách phòng họp đề xuất  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee  | Secondary Actors: |  |
| Trigger: | Người dùng bắt đầu quy trình lên lịch cho một cuộc họp mới và cần hệ thống tìm kiếm, gợi ý các không gian họp phù hợp nhất với các điều kiện tổ chức của mình.  |  |  |
| Description: | Chức năng này cung cấp một cơ chế gợi ý thông minh, tự động rà soát toàn bộ tài nguyên không gian của công ty để trả về danh sách các phòng họp đang trống (không bị trùng lịch với bất kỳ cuộc họp nào khác) trong khung giờ dự kiến. Các phòng được đề xuất bắt buộc phải đáp ứng hoặc vượt mức yêu cầu về sức chứa tối thiểu cùng các trang thiết bị phần cứng đặc thù (như camera nhận diện khuôn mặt, máy chiếu, loa hội nghị) mà người tổ chức đã thiết lập.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Người dùng đang ở giao diện "Tạo cuộc họp mới" hoặc "Đặt lịch phòng". |  |  |
| Postconditions: | \- Hệ thống hiển thị danh sách các lựa chọn phòng họp đề xuất tối ưu nhất dựa trên thuật toán lọc điều kiện. \- Người dùng có thể chọn một phòng họp cụ thể từ danh sách để tiếp tục hoàn thiện luồng đặt lịch. |  |  |
| Normal Flow: | 1\. Người dùng nhập các thông số yêu cầu cho cuộc họp tương lai bao gồm: Ngày họp, Khung thời gian bắt đầu và kết thúc, Số lượng người tham gia dự kiến. 2\. Người dùng tích chọn thêm các yêu cầu về trang thiết bị phần cứng bắt buộc phải có để phục vụ cuộc họp (Ví dụ: Bắt buộc có camera nhận diện để điểm danh, cần có máy chiếu để thuyết trình). 3\. Người dùng nhấn nút "Tìm phòng phù hợp". 4\. Hệ thống tiếp nhận các tham số yêu cầu, thực hiện tính toán và rà soát trạng thái lịch phòng theo thời gian thực. 5\. Hệ thống áp dụng bộ lọc thông minh theo ba cấp độ logic: Loại bỏ toàn bộ các phòng đã bị chiếm chỗ (đang có cuộc họp khác diễn ra) trong khung giờ được chọn. Loại bỏ các phòng có sức chứa tối đa nhỏ hơn số lượng nhân sự dự kiến tham gia. Loại bỏ các phòng không được trang bị đầy đủ các thiết bị phần cứng bắt buộc mà người dùng đã tích chọn ở bước 2 (hoặc thiết bị đó đang ở trạng thái lỗi/bảo trì). 6\. Hệ thống hiển thị danh sách các phòng họp thỏa mãn lên màn hình dưới dạng các thẻ thông tin trực quan, sắp xếp theo thứ tự ưu tiên (phòng có sức chứa vừa vặn nhất xếp lên đầu). Mỗi thẻ hiển thị rõ: Tên phòng, Vị trí, Sức chứa, Danh sách thiết bị và nhãn "Sẵn sàng đặt". |  |  |
| Alternative Flows: | **A1. Tìm kiếm không yêu cầu phần cứng:** Tại bước 2, người dùng không chọn bất kỳ tiêu chí thiết bị nào. Hệ thống sẽ bỏ qua bước lọc phần cứng và đề xuất tất cả các phòng trống có sức chứa phù hợp với số lượng người tham gia.  |  |  |
| Exceptions: | **E1. Không có phòng họp nào đáp ứng (Danh sách trống):** Tại bước 5, nếu tổ hợp các điều kiện lọc quá khắt khe khiến không có căn phòng nào ngoài thực tế đáp ứng được (Ví dụ: Khung giờ cao điểm đã hết sạch phòng lớn), hệ thống sẽ trả về danh sách trống kèm thông báo: "Không tìm thấy phòng họp nào đáp ứng đủ các tiêu chí của bạn trong khung giờ này." Đồng thời, hệ thống sẽ đưa ra tính năng "Gợi ý thay thế" bằng cách hiển thị các khung giờ trống gần nhất của các phòng họp có sức chứa tương đương để người dùng cân nhắc đổi giờ họp. **E2. Thời gian họp dự kiến không hợp lệ:** Tại bước 4, nếu người dùng nhập giờ kết thúc trước giờ bắt đầu, hoặc chọn một khung giờ đã qua trong quá khứ, hệ thống sẽ chặn thao tác, bôi đỏ trường thời gian và hiển thị lỗi: "Thời gian họp dự kiến không hợp lệ. Vui lòng kiểm tra lại." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Nguyên tắc sức chứa):** Sức chứa tối đa của phòng họp được đề xuất phải LỚN HƠN HOẶC BẰNG số lượng người tham gia dự kiến do người dùng khai báo. **BR2 (Nguyên tắc phần cứng sẵn sàng):** Hệ thống tuyệt đối không được đề xuất phòng họp có chứa thiết bị phần cứng mà người dùng yêu cầu nếu thiết bị đó đang bị chốt trạng thái là "Bảo trì/Hư hỏng" bởi cấp Quản lý (thuộc Module Equipment Management). **BR3 (Xử lý tranh chấp đồng thời):** Trạng thái trống/bận của phòng họp phải được tính toán tại thời gian thực (Real-time). Trong trường hợp hai người dùng cùng mở danh sách đề xuất và chọn chung một phòng họp tại một thời điểm, hệ thống sẽ áp dụng nguyên tắc "Ai nhấn xác nhận đặt phòng trước sẽ giữ chỗ thành công", người nhấn sau sẽ nhận được thông báo phòng vừa bị đặt và yêu cầu chọn lại phòng khác. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Kho dữ liệu về lịch đặt phòng của toàn công ty luôn được cập nhật đồng bộ tức thời, đảm bảo không có độ trễ thông tin giữa các tài khoản người dùng khác nhau.  |  |  |

2. #### **UC-SM-02 Chọn khung giờ họp tối ưu** 

| UC ID and Name: | UC-SM-02 Chọn khung giờ họp tối ưu  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee  | Secondary Actors: |  |
| Trigger: | Người tổ chức muốn lên lịch một cuộc họp đông người, liên phòng ban hoặc có sự tham gia của cấp quản lý bận rộn, và cần hỗ trợ tìm ra một khoảng thời gian chung mà tất cả các nhân sự quan trọng đều có thể tham dự.  |  |  |
| Description: | Chức năng này hoạt động như một trợ lý lịch trình thông minh, tự động rà soát và đối chiếu lịch làm việc cá nhân của toàn bộ những người được mời. Thay vì phải nhắn tin hỏi từng người, hệ thống sẽ phân tích các khoảng thời gian trống và đề xuất ra những khung giờ lý tưởng nhất mà 100% khách mời đều rảnh rỗi. Trong trường hợp không có khung giờ hoàn hảo, hệ thống sẽ gợi ý các lựa chọn tốt nhất tiếp theo (phần lớn mọi người đều rảnh) và chỉ rõ ai là người bị trùng lịch để người tổ chức cân nhắc quyết định.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập vào hệ thống và đang thao tác trên biểu mẫu "Tạo cuộc họp mới". \- Người dùng đã thêm ít nhất hai người tham gia (khách mời) vào danh sách cuộc họp. |  |  |
| Postconditions: | \- Hệ thống hiển thị danh sách các khung giờ tối ưu đã qua phân tích. \- Mốc thời gian do người dùng nhấp chọn từ danh sách đề xuất sẽ tự động được điền vào biểu mẫu đặt lịch, thay thế cho việc nhập liệu thủ công. |  |  |
| Normal Flow: | 1\. Tại biểu mẫu tạo cuộc họp, người dùng hoàn thiện danh sách người tham dự (phân loại rõ ai là Khách mời bắt buộc, ai là Khách mời tùy chọn). 2\. Người dùng chỉ định khoảng thời gian mong muốn tổ chức (ví dụ: "Trong tuần này" hoặc "Từ ngày 15 đến ngày 18") và thời lượng dự kiến của cuộc họp (ví dụ: 60 phút). 3\. Người dùng nhấn chọn tính năng "Đề xuất thời gian" (hoặc "Tìm giờ tối ưu"). 4\. Hệ thống tiếp nhận danh sách khách mời, rà soát lịch trình cá nhân của từng người trong khoảng thời gian đã được khoanh vùng. 5\. Hệ thống tính toán, tìm ra các khoảng thời gian trống chung và ưu tiên xếp hạng các khung giờ mà tất cả mọi người đều không có lịch bận. 6\. Hệ thống hiển thị các khung giờ đề xuất lên màn hình theo thứ tự ưu tiên (Ví dụ: "Thứ Ba, 10:00 \- 11:00 (Đạt 10/10 người rảnh)"). 7\. Người dùng chọn một khung giờ phù hợp nhất. 8\. Hệ thống ghi nhận lựa chọn, đóng giao diện đề xuất và tự động điền chính xác thời gian Bắt đầu \- Kết thúc vào biểu mẫu đặt lịch. |  |  |
| Alternative Flows: | **A1. Chấp nhận khung giờ có người bận:** Tại bước 6, nếu lịch trình của nhóm quá kín, hệ thống sẽ đề xuất các khung giờ tốt nhất kế tiếp (ví dụ: "Đạt 8/10 người rảnh"). Nếu người dùng click chọn khung giờ này, hệ thống sẽ hiển thị một thông báo nhỏ làm rõ tên của 2 người đang bị trùng lịch. Người tổ chức có thể chấp nhận sự vắng mặt của họ hoặc chủ động liên hệ riêng để sắp xếp.  |  |  |
| Exceptions: | **E1. Không tìm thấy khung giờ phù hợp:** Tại bước 5, nếu trong suốt khoảng thời gian kỳ vọng không có bất kỳ một khe hở thời gian nào đáp ứng đủ thời lượng họp (do lịch của các thành viên đều đã kín đặc), hệ thống sẽ hiển thị thông báo: "Không tìm thấy khung giờ chung nào phù hợp. Vui lòng thử mở rộng khoảng thời gian tìm kiếm hoặc giảm bớt số lượng khách mời."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 (Bảo mật lịch trình cá nhân):** Thuật toán đối chiếu chỉ trả về kết quả nhị phân "Rảnh" hoặc "Bận". Hệ thống tuyệt đối không hiển thị chi tiết nội dung công việc hay tên các sự kiện bận của khách mời cho người tổ chức xem nhằm đảm bảo quyền riêng tư. **BR2 (Quy tắc trọng số khách mời):** Thuật toán tìm giờ tối ưu sẽ ưu tiên trọng số cao nhất (Must-have) cho nhóm "Khách mời bắt buộc" (Required). Tình trạng rảnh/bận của nhóm "Khách mời tùy chọn" (Optional) sẽ chỉ được hệ thống dùng làm tiêu chí phụ để so sánh và xếp hạng mức độ hoàn hảo của các khung giờ. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-SM-03 Xử lý tự động xung đột đặt phòng** 

| UC ID and Name: | UC-SM-03 Xử lý tự động xung đột đặt phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System (automated)  | Secondary Actors: |  |
| Trigger: | Người dùng hoàn tất việc nhập thông tin và nhấn nút "Đặt phòng", nhưng tại đúng thời điểm đó, khung giờ trống của phòng họp này vừa bị một nhân sự khác thao tác nhanh hơn và xác nhận chiếm chỗ thành công.  |  |  |
| Description: | Chức năng này hoạt động như một "người gác cổng" theo thời gian thực nhằm giải quyết triệt để vấn đề đặt trùng phòng (Double-booking) trong môi trường nhiều người cùng sử dụng. Khi người dùng gửi yêu cầu lưu cuộc họp, hệ thống sẽ thực hiện một bước kiểm tra chéo cuối cùng để đối soát trạng thái không gian. Nếu phát hiện phòng đã mất trạng thái trống, hệ thống sẽ lập tức chặn lệnh đặt phòng, bảo toàn các thông tin người dùng đã nhập và hiển thị cảnh báo để họ chọn một giải pháp thay thế.  |  |  |
| Preconditions: | \- Người dùng đang thao tác trên biểu mẫu tạo cuộc họp mới và đã chọn một phòng họp cụ thể. \- Phòng họp đó hiển thị là "Trống" tại thời điểm người dùng bắt đầu mở biểu mẫu đặt lịch. |  |  |
| Postconditions: | \- Lệnh đặt phòng bị từ chối, đảm bảo không có bất kỳ lịch họp trùng lặp nào được tạo ra trên hệ thống. \- Giao diện biểu mẫu đặt lịch vẫn giữ nguyên toàn bộ nội dung người dùng đã nhập (Tiêu đề, danh sách khách mời, nội dung họp) để tránh việc phải thao tác lại từ đầu. |  |  |
| Normal Flow: | 1\. Người dùng điền đầy đủ các thông tin vào biểu mẫu tổ chức cuộc họp (bao gồm thời gian, người tham gia và phòng họp đang chọn). 2\. Người dùng nhấn nút "Lưu" hoặc "Đặt phòng". 3\. Hệ thống tiếp nhận yêu cầu và lập tức tiến hành bước đối soát tức thời (Real-time check) về trạng thái của phòng họp mục tiêu trong đúng khung giờ đó. 4\. Hệ thống phát hiện khung giờ này vừa bị một cuộc họp khác xác nhận đặt thành công (do một người dùng khác thao tác nhanh hơn tính bằng giây). 5\. Hệ thống lập tức chặn đứng tiến trình lưu dữ liệu của người dùng hiện tại. 6\. Hệ thống hiển thị một hộp thoại cảnh báo nổi bật: "Rất tiếc, phòng họp này vừa được một người khác đặt trước. Vui lòng chọn một phòng khác hoặc thay đổi khung giờ." 7\. Bên dưới cảnh báo, hệ thống tự động làm mới danh sách không gian, gợi ý các phòng họp khác có sức chứa tương đương đang còn trống trong cùng khung giờ để người dùng có thể nhấp chọn thay thế ngay lập tức. 8\. Người dùng chọn phòng thay thế và nhấn "Lưu" lại để hoàn tất. |  |  |
| Alternative Flows: | **A1. Đổi giờ thay vì đổi phòng:** Tại bước 7, thay vì chọn một phòng khác do hệ thống gợi ý, người dùng quyết định vẫn muốn dùng phòng họp cũ nhưng thay đổi sang một khung giờ khác đang trống. Người dùng cập nhật lại thời gian, nhấn "Lưu" và hệ thống tiến hành kiểm tra lại từ bước 3\.  |  |  |
| Exceptions: | **E1. Lỗi gián đoạn đồng bộ:** Tại bước 3, nếu đường truyền mạng nội bộ bị gián đoạn khiến hệ thống không thể đối soát được trạng thái phòng họp theo thời gian thực, hệ thống sẽ tạm dừng thao tác và hiển thị thông báo: "Không thể xác minh trạng thái phòng họp lúc này. Vui lòng kiểm tra kết nối và thử lại."  |  |  |
| Priority: | Very high |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Nguyên tắc ưu tiên đến trước \- First come, first served):** Hệ thống chỉ cấp quyền sử dụng phòng cho yêu cầu đặt lịch nào vượt qua được cổng xác nhận của hệ thống đầu tiên. Các yêu cầu đến sau, dù chỉ chậm hơn một phần tư giây, đều bị tính là xung đột và bị từ chối. **BR2 (Bảo toàn công sức nhập liệu):** Khi xảy ra tình huống xung đột và bị từ chối lưu, hệ thống tuyệt đối không được tải lại trang, không xóa trắng biểu mẫu hay đẩy người dùng văng ra màn hình ngoài. Toàn bộ option người dùng đã nhập (nội dung, mô tả, danh sách hàng chục khách mời) phải được giữ nguyên vẹn trên màn hình. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Kiến trúc xử lý đồng thời (Concurrency) của nền tảng phần mềm đủ mạnh và có độ trễ cực thấp để phát hiện và ngăn chặn chính xác các luồng yêu cầu song song mà không bị quá tải.  |  |  |

4. #### **UC-SM-04 Xử lý tự động xung đột lịch người tham gia** 

| UC ID and Name: | UC-SM-04 Xử lý tự động xung đột lịch người tham gia  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System (automated)  | Secondary Actors: |  |
| Trigger: | Người dùng tiến hành thêm một nhân sự vào danh sách khách mời hoặc thay đổi khung giờ của một cuộc họp, và khung giờ này trùng với một lịch trình bận khác đã có sẵn của nhân sự đó.  |  |  |
| Description: | Chức năng này cung cấp cơ chế giám sát và cảnh báo xung đột lịch trình của những người tham gia theo thời gian thực. Khi người tổ chức cuộc họp thiết lập thời gian và danh sách khách mời, hệ thống sẽ tự động rà soát trạng thái rảnh/bận trên lịch cá nhân của từng người. Nếu phát hiện có nhân sự bị trùng lịch, hệ thống sẽ lập tức đưa ra cảnh báo trực quan trên giao diện (bằng cách bôi đỏ tên khách mời hoặc gắn biểu tượng chú ý) giúp người tổ chức nhận biết ngay và chủ động điều chỉnh danh sách hoặc thời gian cho phù hợp.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập vào hệ thống và đang thao tác trên giao diện tạo mới hoặc chỉnh sửa cuộc họp. \- Hệ thống có quyền truy cập vào dữ liệu trạng thái lịch làm việc (rảnh/bận) của các nhân sự nội bộ. |  |  |
| Postconditions: | \- Các nhân sự bị xung đột lịch trình được làm nổi bật rõ ràng trên giao diện để người tổ chức dễ dàng nhận diện. \- Hệ thống ghi nhận trạng thái cảnh báo nhưng không chặn quyền lưu cuộc họp của người dùng (cảnh báo mềm). |  |  |
| Normal Flow: | 1\. Tại biểu mẫu thiết lập cuộc họp, người dùng chọn khung thời gian tổ chức và bắt đầu nhập thông tin để thêm các khách mời vào danh sách tham dự. 2\. Mỗi khi một khách mời được thêm vào, hệ thống lập tức tiếp nhận thông tin định danh của nhân sự đó và thực hiện bước đối chiếu chéo với lịch trình làm việc cá nhân của họ trong khung giờ đã chọn. 3\. Hệ thống phát hiện khách mời vừa được thêm đã có một lịch họp khác hoặc một sự kiện bận được ghi nhận từ trước trên lịch của họ. 4\. Hệ thống lập tức thay đổi trạng thái hiển thị của khách mời này trên danh sách giao diện sang chế độ cảnh báo trực quan (Ví dụ: bôi đỏ toàn bộ tên khách mời, hiển thị biểu tượng dấu chấm than kèm dòng chữ nhỏ "Trùng lịch"). 5\. Người dùng nhìn thấy cảnh báo trực quan và nhận diện được nhân sự nào đang bị kẹt lịch không thể tham gia. 6\. Người dùng xem xét và đưa ra quyết định: chấp nhận sự trùng lịch này (nếu nhân sự đó không quá quan trọng) hoặc tiến hành điều chỉnh để tối ưu hóa buổi họp. |  |  |
| Alternative Flows: | **A1. Thay đổi khung giờ họp làm thay đổi trạng thái xung đột:** Tại bước 5, người dùng giữ nguyên danh sách người tham gia nhưng quyết định thay đổi khung giờ họp sang một buổi khác. Ngay khi thời gian mới được chọn, hệ thống tự động kích hoạt lại luồng đối chiếu lịch cho toàn bộ danh sách khách mời. Những người không còn bị trùng lịch ở khung giờ mới sẽ được trả về trạng thái hiển thị bình thường, và những người mới bị kẹt lịch (nếu có) sẽ tiếp tục bị bôi đỏ tên.  |  |  |
| Exceptions: | **E1. Khách mời thuộc tổ chức bên ngoài:** Tại bước 2, nếu người dùng thêm một địa chỉ email của đối tác bên ngoài công ty (không thuộc hệ thống quản lý nội bộ), hệ thống sẽ không thể truy cập lịch trình cá nhân của họ để đối chiếu. Hệ thống sẽ hiển thị trạng thái ngầm định là "Không rõ lịch trình" (gắn nhãn màu xám) thay vì bôi đỏ hay báo xanh, và luồng công việc vẫn tiếp tục bình thường.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1 (Nguyên tắc bảo mật quyền riêng tư):** Thuật toán đối chiếu chỉ được phép trả về trạng thái nhị phân là "Rảnh" hay "Bận" và mốc thời gian bị kẹt. Hệ thống tuyệt đối không được hiển thị tiêu đề, nội dung chi tiết, hay tên của các cuộc họp/sự kiện riêng tư khác mà khách mời đó đang tham gia cho người tổ chức thấy. **BR2 (Quy tắc cảnh báo mềm):** Xung đột lịch của người tham gia là một cảnh báo mềm (Soft warning), khác hoàn toàn với xung đột phòng họp (chặn lưu cứng). Hệ thống vẫn phải cho phép người dùng nhấn "Lưu" để gửi lời mời họp đi kể cả khi danh sách đang có nhiều tên bị bôi đỏ, quyết định cuối cùng phụ thuộc hoàn toàn vào nghiệp vụ điều hành của người tổ chức. |  |  |
| Other Information: | Khi người dùng di chuột (Hover) hoặc chạm vào tên khách mời đang bị bôi đỏ, giao diện nên hiển thị một ô thông tin nhỏ (Tooltip) mô tả chi tiết khoảng thời gian kẹt của người đó (Ví dụ: "Bận từ 14:00 \- 15:30") để người tổ chức dễ dàng tính toán dịch chuyển giờ họp sang khe thời gian trống gần nhất.  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-SM-05 Phê duyệt thủ công yêu cầu đặt phòng** 

| UC ID and Name: | UC-SM-05 Phê duyệt thủ công yêu cầu đặt phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver  | Secondary Actors: | Hệ thống Thông báo/Email  |
| Trigger: | Một nhân viên (cấp dưới) gửi yêu cầu đặt lịch phòng họp, hệ thống kích hoạt luồng kiểm duyệt và chuyển tiếp yêu cầu này đến tài khoản của người quản lý trực tiếp hoặc Trưởng phòng để chờ xử lý.  |  |  |
| Description: | Chức năng này cho phép cấp quản lý hoặc trưởng phòng kiểm duyệt và ra quyết định chấp thuận đối với các yêu cầu sử dụng không gian họp từ nhân sự cấp dưới. Hệ thống áp dụng cơ chế quản lý phân cấp: mọi yêu cầu đặt phòng từ cấp nhân viên bắt buộc phải trải qua bước phê duyệt này mới có hiệu lực; trong khi đó, nếu người đặt phòng là Quản lý hoặc Trưởng phòng, hệ thống sẽ tự động chấp thuận (Auto-approve) và bỏ qua hoàn toàn quy trình này. Khi quản lý phê duyệt yêu cầu của nhân viên, hệ thống sẽ chính thức chốt lịch, thay đổi trạng thái cuộc họp thành "Đã lên lịch" và gửi thông báo xác nhận.  |  |  |
| Preconditions: | \- Người dùng thực hiện thao tác duyệt đã đăng nhập thành công và có chức danh là Quản lý, Trưởng phòng hoặc cao hơn. \- Tồn tại ít nhất một yêu cầu đặt phòng từ nhân viên cấp dưới đang ở trạng thái "Chờ phê duyệt" trên hệ thống. |  |  |
| Postconditions: | \- Yêu cầu đặt phòng của nhân viên được đánh dấu "Đã phê duyệt". \- Cuộc họp và phòng họp được chuyển sang trạng thái "Đã lên lịch", chính thức chặn khung giờ này đối với các người dùng khác. \- Nhân viên tổ chức cuộc họp nhận được email hoặc thông báo xác nhận thành công từ hệ thống. |  |  |
| Normal Flow: | 1\. Quản lý/Trưởng phòng truy cập vào phân hệ "Quản lý lịch họp" hoặc mở màn hình "Danh sách chờ phê duyệt" (có thể thông qua thông báo đẩy). 2\. Hệ thống hiển thị danh sách các yêu cầu đang chờ xử lý từ nhân viên cấp dưới. 3\. Quản lý nhấn xem chi tiết một yêu cầu để rà soát các thông tin: Tên nhân viên đặt, Mục đích cuộc họp, Thời gian diễn ra và Số lượng khách mời. 4\. Sau khi đánh giá tính hợp lý và sự cần thiết, Quản lý nhấn chọn chức năng "Phê duyệt". 5\. Hệ thống ghi nhận quyết định ủy quyền từ cấp quản lý. 6\. Hệ thống thực hiện thay đổi trạng thái của yêu cầu và cuộc họp tương ứng thành "Đã lên lịch". 7\. Hệ thống chính thức đánh dấu "Bận" cho không gian phòng họp tại khung thời gian đó trên giao diện lịch chung của toàn công ty. 8\. Hệ thống tự động kích hoạt luồng thông báo, gửi xác nhận thành công tới tài khoản và email của nhân viên tổ chức. 9\. Hệ thống đóng biểu mẫu chi tiết, hiển thị thông báo "Phê duyệt yêu cầu thành công" cho Quản lý và làm mới lại danh sách chờ. |  |  |
| Alternative Flows: | **A1. Thêm ghi chú khi phê duyệt:** Tại bước 4, trước khi nhấn "Phê duyệt", Quản lý có thể nhập thêm một đoạn ghi chú ngắn vào ô văn bản để nhắc nhở nhân viên (Ví dụ: "Chỉ được họp tối đa 1 tiếng nhé", "Nhớ dọn dẹp phòng sau khi dùng"). Ghi chú này sẽ được đính kèm trực tiếp vào nội dung email thông báo gửi cho nhân viên.  |  |  |
| Exceptions: | **E1. Từ chối yêu cầu đặt phòng:** Tại bước 4, nếu Quản lý nhận thấy yêu cầu không hợp lý (ví dụ: nhân viên đặt phòng quá lớn cho cuộc họp ít người, hoặc mục đích họp không quan trọng), Quản lý nhấn nút "Từ chối". Hệ thống yêu cầu nhập lý do từ chối (bắt buộc). Sau khi xác nhận, hệ thống hủy bỏ yêu cầu, giải phóng khung giờ đang tạm giữ của phòng họp và gửi thông báo từ chối kèm lý do chi tiết cho nhân viên. **E2. Yêu cầu đã bị hủy bởi nhân viên:** Tại bước 5, nếu trong lúc Quản lý đang đọc thông tin mà nhân viên tổ chức lại chủ động thao tác hủy yêu cầu đặt phòng từ phía họ (do đổi lịch), hệ thống sẽ chặn lệnh phê duyệt và hiển thị thông báo: "Yêu cầu đặt phòng này vừa bị nhân viên hủy bỏ. Không thể thực hiện phê duyệt." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 (Đặc quyền phân cấp \- Hierarchical Privilege):** Quyền tự động duyệt (Auto-approval) chỉ áp dụng cho tài khoản có Role từ "Manager/Head of Department" trở lên. Khi nhóm này đặt phòng, trạng thái lập tức chuyển thành "Đã lên lịch". Tài khoản Role "Employee" luôn tạo ra yêu cầu ở trạng thái "Chờ phê duyệt". **BR2 (Nguyên tắc tạm giữ tài nguyên):** Trong suốt khoảng thời gian yêu cầu của nhân viên ở trạng thái "Chờ phê duyệt", khung giờ của phòng họp mục tiêu phải được hệ thống tạm giữ (Hold). Các nhân viên khác khi tìm kiếm sẽ không thấy phòng họp này trống trong khung giờ đó, nhằm đảm bảo không xảy ra xung đột nếu yêu cầu được Trưởng phòng duyệt. **BR3 (Thời hạn chờ duyệt):** Nếu một yêu cầu đặt phòng chờ quá hạn (ví dụ: sát đến giờ họp chỉ còn 15 phút) mà Quản lý chưa có thao tác Duyệt/Từ chối, hệ thống có thể tự động gửi thông báo nhắc nhở khẩn (Remind) đến cấp Quản lý. |  |  |
| Other Information: | Có thể bổ sung tính năng "Phê duyệt hàng loạt" (Bulk Approve) giúp Trưởng phòng có thể đánh dấu chọn nhiều yêu cầu hợp lệ của nhân viên và duyệt cùng một lúc để tiết kiệm thao tác.  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-SM-06 Từ chối thủ công yêu cầu đặt phòng** 

| UC ID and Name: | UC-SM-06 Từ chối thủ công yêu cầu đặt phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver  | Secondary Actors: | Hệ thống Thông báo/Email  |
| Trigger: | Cấp quản lý nhận thấy yêu cầu sử dụng phòng họp của nhân viên cấp dưới không hợp lý, sai mục đích, hoặc không gian đó cần được ưu tiên cho một sự kiện khẩn cấp khác nên quyết định không chấp thuận.  |  |  |
| Description: | Chức năng này cho phép người có thẩm quyền (Quản lý/Trưởng phòng) từ chối một yêu cầu sử dụng phòng họp đang chờ duyệt. Hệ thống bắt buộc người quản lý phải nhập lý do từ chối rõ ràng để giải thích cho nhân viên. Sau khi xác nhận, cuộc họp liên quan sẽ lập tức bị chuyển sang trạng thái "Đã hủy", không gian phòng họp được giải phóng hoàn toàn và hệ thống sẽ tự động gửi thông báo chi tiết đến nhân viên tổ chức.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Quản lý hoặc Trưởng phòng. \- Tồn tại ít nhất một yêu cầu đặt phòng họp của nhân viên cấp dưới đang ở trạng thái "Chờ phê duyệt" trên hệ thống. |  |  |
| Postconditions: | \- Yêu cầu đặt phòng bị chuyển sang trạng thái "Bị từ chối". \- Cuộc họp liên quan chuyển sang trạng thái "Đã hủy", toàn bộ lịch trình dự kiến bị xóa bỏ. \- Khung giờ của phòng họp được giải phóng hoàn toàn, hiển thị trạng thái trống và sẵn sàng tiếp nhận các yêu cầu khác. \- Nhân viên tổ chức nhận được thông báo/email giải thích chi tiết lý do từ chối từ cấp trên. |  |  |
| Normal Flow: | 1\. Quản lý/Trưởng phòng truy cập vào phân hệ "Quản lý lịch họp" hoặc mở màn hình "Danh sách chờ phê duyệt". 2\. Quản lý nhấn xem chi tiết yêu cầu đặt phòng họp của nhân viên để xem xét thông tin. 3\. Sau khi cân nhắc, Quản lý nhấn chọn chức năng "Từ chối". 4\. Hệ thống hiển thị một hộp thoại yêu cầu nhập lý do từ chối. 5\. Quản lý nhập lý do cụ thể (Ví dụ: "Ưu tiên phòng hội đồng cho cuộc họp với đối tác VIP", "Số lượng người tham gia quá ít, vui lòng chuyển sang phòng nhỏ hơn") và nhấn nút "Xác nhận từ chối". 6\. Hệ thống tiếp nhận lệnh, cập nhật trạng thái yêu cầu thành "Bị từ chối" và chuyển cuộc họp liên quan sang trạng thái "Đã hủy". 7\. Hệ thống lập tức giải phóng khung giờ đã tạm giữ của phòng họp đó, đưa không gian này trở lại trạng thái khả dụng trên lịch chung của công ty. 8\. Hệ thống tự động kích hoạt luồng thông báo, gửi nội dung giải thích chi tiết (bao gồm lý do Quản lý đã nhập ở bước 5\) tới tài khoản và email của nhân viên tổ chức. 9\. Hệ thống đóng hộp thoại, hiển thị thông báo "Đã từ chối yêu cầu đặt phòng" và làm mới lại danh sách chờ. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Bỏ trống lý do từ chối:** Tại bước 5, nếu Quản lý để trống ô nhập văn bản và cố tình nhấn nút "Xác nhận từ chối", hệ thống sẽ chặn thao tác lưu, bôi đỏ trường nhập liệu và hiển thị cảnh báo: "Lý do từ chối là bắt buộc. Vui lòng nhập lý do giải thích cho nhân viên."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Nguyên tắc bắt buộc giải trình):** Hệ thống tuyệt đối không cho phép phê duyệt lệnh từ chối nếu trường lý do bị bỏ trống, nhằm đảm bảo nhân viên luôn biết rõ nguyên nhân bị từ chối để có phương án điều chỉnh lịch họp phù hợp. **BR2 (Giải phóng tài nguyên tức thì):** Ngay khi lệnh từ chối được xác nhận thành công, trạng thái tạm giữ (Hold) của phòng họp phải được gỡ bỏ ngay lập tức theo thời gian thực (Real-time). Phòng họp phải hiển thị là "Trống" trên bộ lọc tìm kiếm của toàn bộ nhân sự khác mà không có độ trễ. **BR3 (Hủy bỏ lời mời liên quan):** Khi cuộc họp chuyển sang trạng thái "Đã hủy", hệ thống phải tự động thu hồi các lời mời lịch họp đã gửi đến danh sách khách mời (nếu có) để giải phóng thời gian biểu cá nhân của họ. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

7. #### **1**

| UC ID and Name: |  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: |  | Secondary Actors: |  |
| Trigger: |  |  |  |
| Description: |  |  |  |
| Preconditions: |  |  |  |
| Postconditions: |  |  |  |
| Normal Flow: |  |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: |  |  |  |
| Frequency of Use: |  |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

8. #### **1**

| UC ID and Name: |  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: |  | Secondary Actors: |  |
| Trigger: |  |  |  |
| Description: |  |  |  |
| Preconditions: |  |  |  |
| Postconditions: |  |  |  |
| Normal Flow: |  |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: |  |  |  |
| Frequency of Use: |  |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

9. #### **1**

| UC ID and Name: |  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: |  | Secondary Actors: |  |
| Trigger: |  |  |  |
| Description: |  |  |  |
| Preconditions: |  |  |  |
| Postconditions: |  |  |  |
| Normal Flow: |  |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: |  |  |  |
| Frequency of Use: |  |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

10. #### **1**

| UC ID and Name: |  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: |  | Secondary Actors: |  |
| Trigger: |  |  |  |
| Description: |  |  |  |
| Preconditions: |  |  |  |
| Postconditions: |  |  |  |
| Normal Flow: |  |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: |  |  |  |
| Frequency of Use: |  |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 7\. Notification and Reporting

1. #### **UC-NRM-01 Phát hành thư mời họp** 

| UC ID and Name: | UC-NRM-01 Phát hành thư mời họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | User |
| Trigger: | Một cuộc họp mới được khởi tạo thành công bởi cấp quản lý (đối với các tài khoản có đặc quyền tự động duyệt) hoặc một yêu cầu đặt phòng của nhân viên được cấp trên phê duyệt thông qua hệ thống  |  |  |
| Description: | Ngay sau khi một cuộc họp chính thức được chốt lịch trên hệ thống, hệ thống sẽ tự động biên soạn và gửi email thư mời họp (Calendar Invite) đến toàn bộ danh sách người tham dự. Thư mời cung cấp đầy đủ thông tin bối cảnh chi tiết bao gồm: tiêu đề cuộc họp, thời gian diễn ra, phòng họp vật lý được phân bổ và định danh người đứng ra tổ chức, giúp khách mời nắm bắt thông tin nhanh chóng và chuẩn bị tham gia.  |  |  |
| Preconditions: | \- Cuộc họp đã được hệ thống xác nhận và chuyển sang trạng thái "Đã lên lịch" (Scheduled). \- Danh sách người tham dự đã có đầy đủ thông tin địa chỉ email hợp lệ. |  |  |
| Postconditions: | \- Thư mời điện tử được phát hành và gửi đi thành công tới toàn bộ danh sách khách mời. \- Sự kiện cuộc họp tự động xuất hiện trên lịch làm việc cá nhân của các khách mời. |  |  |
| Normal Flow: | 1\. Hệ thống phát hiện sự kiện một cuộc họp chuyển sang trạng thái "Đã lên lịch" thành công trên phần mềm. 2\. Hệ thống tự động thu thập các thông tin cốt lõi của cuộc họp vừa được duyệt bao gồm: Tiêu đề cuộc họp, Khung thời gian chính xác (Ngày, Giờ bắt đầu \- Giờ kết thúc), Địa điểm phòng họp (Tên phòng, Vị trí tầng), Họ tên người tổ chức, và nội dung tóm tắt/chương trình họp (nếu có). 3\. Hệ thống trích xuất toàn bộ danh sách địa chỉ email của những người tham dự đã được người tổ chức chỉ định. 4\. Hệ thống tự động chèn các thông tin cốt lõi vào biểu mẫu (Template) email thư mời tiêu chuẩn của tổ chức. 5\. Hệ thống đóng gói email kèm theo một tệp đính kèm lịch thông minh (định dạng lịch tiêu chuẩn). 6\. Hệ thống thực hiện lệnh phát hành và gửi email đồng loạt đến hộp thư của tất cả các khách mời trong danh sách. 7\. Hệ thống ghi nhận trạng thái "Đã gửi thư mời" vào nhật ký hành trình của cuộc họp. |  |  |
| Alternative Flows: | **A1. Gửi thư mời bổ sung cho khách mời mới:** Sau khi cuộc họp đã được lên lịch và gửi thư mời, nếu người tổ chức chủ động vào chỉnh sửa để thêm một vài nhân sự mới vào danh sách. Hệ thống sẽ kích hoạt luồng này, nhưng thông minh phân loại để **chỉ gửi email thư mời cho riêng các nhân sự mới bổ sung**, tránh gửi lặp lại gây phiền hà cho những người cũ.  |  |  |
| Exceptions: | **E1. Địa chỉ email không hợp lệ:** Tại bước 6, nếu hệ thống không thể gửi email tới một hoặc một vài địa chỉ cụ thể (do sai định dạng email đối tác bên ngoài), hệ thống sẽ không chặn toàn bộ tiến trình. Hệ thống vẫn gửi cho những người còn lại, đồng thời ghi vết lỗi "Gửi thư mời thất bại" bên cạnh tên của khách mời bị lỗi trên giao diện quản lý để người tổ chức chủ động xử lý lại.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên |  |  |
| Business Rules: | **BR1 (Nội dung bắt buộc):** Email thư mời phát hành ra bắt buộc phải hiển thị tường minh tối thiểu 4 thông tin: Tiêu đề cuộc họp, Thời gian diễn ra, Tên phòng họp cụ thể, và Họ tên người tổ chức. Thiếu một trong các thông tin này, hệ thống sẽ chặn tiến trình gửi để tránh làm phiền người nhận bằng thông tin rác.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

2. #### **UC-NRM-02 Gửi nhắc nhở lịch họp** 

| UC ID and Name: | UC-NRM-02 Gửi nhắc nhở lịch họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | User |
| Trigger: | Thời gian thực tế chạm đến mốc thời gian cấu hình nhắc nhở trước khi cuộc họp chính thức bắt đầu (ví dụ: 1 ngày trước giờ họp)  |  |  |
| Description: | Luồng này hoàn toàn tự động chạy ngầm nhằm gửi thông báo đẩy trên ứng dụng hoặc email nhắc nhở đến toàn bộ những người tham dự cuộc họp. Khoảng thời gian nhắc nhở sẽ dựa theo cấu hình lựa chọn của người tổ chức lúc tạo lịch hoặc theo quy chuẩn mặc định của tổ chức. Chức năng này giúp nhân sự chủ động chuẩn bị tài liệu, sắp xếp công việc và di chuyển đến phòng họp đúng giờ, giảm thiểu tối đa tỷ lệ trễ giờ hoặc vắng mặt.  |  |  |
| Preconditions: | \- Cuộc họp liên quan đang ở trạng thái "Đã lên lịch" (Scheduled). \- Người tổ chức hoặc hệ thống đã thiết lập cấu hình khoảng thời gian nhắc nhở trước giờ họp. \- Khách mời có thông tin tài khoản hoặc email hợp lệ trên hệ thống. |  |  |
| Postconditions: | \- Email hoặc thông báo nhắc nhở được phát hành và chuyển đến thiết bị của người nhận thành công trước khi cuộc họp diễn ra. \- Giao diện lịch cá nhân của người dùng hiển thị biểu tượng nhắc nhở tương ứng. |  |  |
| Normal Flow: | 1\. Hệ thống liên tục quét và giám sát mốc thời gian bắt đầu của toàn bộ các cuộc họp đã lên lịch trong doanh nghiệp. 2\. Hệ thống phát hiện một cuộc họp sắp diễn ra và mốc thời gian hiện tại trùng khớp với khoảng thời gian nhắc nhở trước giờ họp đã được cấu hình (Ví dụ: còn 1 ngày nữa là đến cuộc  họp … ). 3\. Hệ thống tự động thu thập các thông tin bối cảnh của cuộc họp bao gồm: Tiêu đề cuộc họp, Khung thời gian chính xác, Địa điểm phòng họp vật lý, Tên người tổ chức và danh sách khách mời. 4\. Hệ thống trích xuất toàn bộ danh sách khách mời đã được người tổ chức chỉ định cho cuộc họp này.  5\. Hệ thống chèn dữ liệu vào biểu mẫu (Template) nhắc nhở ngắn gọn và phát hành thông báo đồng thời qua hai kênh: Thông báo đẩy (Push Notification) trên ứng dụng và Thư điện tử (Email). 6\. Nhân sự nhận được nhắc nhở trực quan trên màn hình thiết bị, nắm được vị trí phòng họp và chủ động di chuyển tham gia. 7\. Hệ thống ghi nhận sự kiện gửi nhắc nhở thành công vào nhật ký tiến trình của cuộc họp. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Cuộc họp bị hủy hoặc dời lịch đột xuất:** Tại bước 2, nếu cuộc họp đã bị người tổ chức hủy bỏ hoặc dịch chuyển sang một ngày khác trước khi mốc nhắc nhở kịp kích hoạt, hệ thống sẽ tự động hủy bỏ tiến trình nhắc nhở cũ và thiết lập lại mốc nhắc nhở mới theo thời gian vừa cập nhật.   |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Quy tắc gửi đồng loạt):** Do hệ thống không áp dụng cơ chế yêu cầu phản hồi từ người tham dự, thông báo nhắc nhở bắt buộc phải được gửi mặc định đến 100% nhân sự có tên trong danh sách khách mời của cuộc họp đó mà không cần qua bất kỳ bước lọc trạng thái nào.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-NRM-03 Phát thông báo hủy cuộc họp** 

| UC ID and Name: | UC-NRM-03 Phát thông báo hủy cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | User |
| Trigger: | Một cuộc họp đã được lên lịch trước đó bị hủy bỏ bởi người tổ chức, hoặc một yêu cầu đặt phòng của nhân viên bị cấp quản lý từ chối phê duyệt  |  |  |
| Description: | Luồng này hoàn toàn tự động chạy ngầm ngay khi một cuộc họp chính thức bị chuyển sang trạng thái "Đã hủy". Hệ thống sẽ tự động biên soạn và gửi email thông báo hủy lịch đến toàn bộ những người có tên trong danh sách tham dự. Nội dung email cung cấp chi tiết thông tin cuộc họp bị hủy, thời gian dự kiến ban đầu và lý do hủy cụ thể (nếu có), giúp nhân sự kịp thời giải phóng thời gian biểu cá nhân để sắp xếp các công việc khác.  |  |  |
| Preconditions: | \- Cuộc họp liên quan chuyển sang trạng thái "Đã hủy" (Cancelled) trên phần mềm. \- Danh sách người tham dự đã có đầy đủ thông tin địa chỉ email hợp lệ. |  |  |
| Postconditions: | \- Email thông báo hủy lịch được phát hành và gửi đi thành công tới toàn bộ khách mời. \- Sự kiện cuộc họp tự động bị xóa bỏ khỏi giao diện lịch làm việc cá nhân của người tổ chức lẫn các khách mời, giải phóng khung thời gian đó về trạng thái trống. |  |  |
| Normal Flow: | 1\. Hệ thống phát hiện sự kiện một cuộc họp bị chuyển sang trạng thái "Đã hủy" trên phần mềm. 2\. Hệ thống tự động thu thập các thông tin bối cảnh ban đầu của cuộc họp bao gồm: Tiêu đề cuộc họp, Khung thời gian dự kiến ban đầu (Ngày, Giờ bắt đầu \- Giờ kết thúc), Tên phòng họp vật lý bị hủy, và lý do hủy họp (nếu người thực hiện thao tác hủy có nhập liệu). 3\. Hệ thống trích xuất toàn bộ danh sách địa chỉ email của những người tham dự đã được chỉ định cho cuộc họp này. 4\. Hệ thống tự động chèn các thông tin thu thập được vào biểu mẫu (Template) email thông báo hủy cuộc họp tiêu chuẩn của tổ chức. 5\. Hệ thống thực hiện lệnh phát hành và gửi email đồng loạt đến hộp thư của tất cả các khách mời trong danh sách. 6\. Hệ thống tự động gỡ bỏ hoàn toàn sự kiện họp này khỏi giao diện hiển thị lịch cá nhân của toàn bộ nhân sự liên quan. 7\. Hệ thống ghi nhận trạng thái "Đã phát thông báo hủy" vào nhật ký hành trình của cuộc họp. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Thông tin bắt buộc):** Email thông báo hủy cuộc họp phát hành ra bắt buộc phải chứa các thông tin cốt lõi: Tiêu đề cuộc họp và thời gian dự kiến ban đầu. Trường "Lý do hủy" là thông tin bổ trợ không bắt buộc, nếu người hủy để trống thì hệ thống sẽ ẩn mục này trong nội dung email gửi đi (không hiển thị dòng trống). **BR2 (Giải phóng lịch tức thì):** Hành động gỡ bỏ sự kiện trên lịch cá nhân của toàn bộ khách mời phải diễn ra đồng thời với việc gửi email theo thời gian thực (Real-time), đảm bảo quỹ thời gian của nhân sự được trả về trạng thái rảnh ngay lập tức để phục vụ cho các lịch trình khác. **BR3 (Gửi mặc định đồng loạt):** Thông báo hủy lịch được gửi mặc định đến 100% nhân sự có tên trong danh sách khách mời của cuộc họp đó mà không qua bất kỳ bước lọc hay phân loại trạng thái nào. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-NRM-04 Phân phối biên bản cuộc họp** 

| UC ID and Name: | UC-NRM-04 Phân phối biên bản cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | User |
| Trigger: | Biên bản cuộc họp hoặc bản ghi chữ (Transcript) được cấp quản lý hoặc người chủ trì xác nhận hoàn tất và nhấn nút "Phát hành/Phân phối biên bản"  |  |  |
| Description: | Chức năng này tự động hóa quy trình chia sẻ kết quả cuộc họp sau khi nội dung biên bản đã được chuẩn hóa và phê duyệt. Hệ thống sẽ tự động biên soạn và gửi email đính kèm tệp tài liệu biên bản hoặc đường dẫn (link) truy cập an toàn đến toàn bộ danh sách người tham dự cuộc họp cùng các bên liên quan được chỉ định. Người nhận có thể mở xem trực tiếp nội dung biên bản để nắm bắt các kết luận, chỉ thị và kế hoạch hành động mà không gặp rào cản về thủ tục cấp quyền. |  |  |
| Preconditions: | \- Cuộc họp đã kết thúc và bản ghi chú/biên bản văn bản đã được hoàn thiện. \- Cấp quản lý hoặc người có thẩm quyền đã duyệt xác nhận tính chính xác của nội dung biên bản. \- Danh sách người tham dự và các bên liên quan có thông tin định danh hoặc địa chỉ email hợp lệ trên hệ thống. |  |  |
| Postconditions: | \- Biên bản cuộc họp được chuyển sang trạng thái "Đã phát hành" và khóa chức năng chỉnh sửa thông thường. \- Email chứa liên kết truy cập hoặc tệp đính kèm được gửi đi thành công tới tất cả các nhân sự có trong danh sách phân phối. \- Quyền xem biên bản được tự động kích hoạt cho các tài khoản nhận được thông báo. |  |  |
| Normal Flow: | 1\. Quản lý hoặc người chủ trì cuộc họp hoàn tất việc rà soát biên bản văn bản và nhấn nút "Xác nhận và Phân phối". 2\. Hệ thống tiếp nhận lệnh, chuyển trạng thái của biên bản cuộc họp thành "Đã phát hành chính thức". 3\. Hệ thống tự động thu thập thông tin bối cảnh bao gồm: Tiêu đề cuộc họp, Ngày giờ diễn ra, Họ tên người chủ trì và nội dung tóm tắt các kết luận chính (nếu có). 4\. Hệ thống tổng hợp danh sách người nhận bao gồm: 100% khách mời tham dự cuộc họp và danh sách các nhân sự thuộc diện "Bên liên quan" (Stakeholders) do người chủ trì bổ sung thêm (ví dụ: cấp trên hoặc thành viên dự án không tham gia họp trực tiếp). 5\. Hệ thống chèn dữ liệu vào biểu mẫu (Template) email phân phối tiêu chuẩn, tự động đính kèm tệp biên bản văn bản (định dạng tài liệu phổ biến) hoặc nhúng một đường dẫn truy cập trực tiếp. 6\. Hệ thống thực hiện phát hành email đồng loạt đến toàn bộ danh sách nhân sự đã tổng hợp. 7\. Người nhận mở email trên thiết bị cá nhân, nhấp vào đường dẫn hoặc tệp đính kèm để xem trực tiếp nội dung biên bản mà không cần qua các bước yêu cầu cấp quyền thủ công. 8\. Hệ thống ghi nhận sự kiện phân phối thành công vào nhật ký hành trình của cuộc họp. |  |  |
| Alternative Flows: | **A1. Phân phối tới đối tác bên ngoài (External Stakeholders):** Tại bước 4, nếu danh sách có chứa địa chỉ email của đối tác ngoài công ty, hệ thống sẽ tự động tạo một đường dẫn truy cập bảo mật có thời hạn (ví dụ: chỉ xem được trong 30 ngày) và gửi đi, đảm bảo đối tác vẫn đọc được nội dung mà không làm ảnh hưởng đến an ninh hệ thống nội bộ.  |  |  |
| Exceptions: | **E1. Biên bản chưa được xác nhận:** Nếu một nhân sự thông thường cố tình kích hoạt luồng phân phối khi biên bản vẫn đang ở trạng thái "Bản nháp" hoặc chưa có sự phê duyệt của Quản lý, hệ thống sẽ chặn thao tác và hiển thị thông báo: "Không thể phân phối biên bản họp chưa được xác nhận. Vui lòng đợi cấp quản lý phê duyệt."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên |  |  |
| Business Rules: | **BR1 (Nguyên tắc xem trực tiếp):** Đường dẫn truy cập gửi trong email nội bộ bắt buộc phải tích hợp cơ chế tự động nhận diện tài khoản (SSO). Khi nhân sự trong công ty nhấp vào link, hệ thống phải điều hướng thẳng tới nội dung biên bản dưới chế độ "Chỉ đọc", tuyệt đối không bắt người dùng phải gửi thêm yêu cầu xin quyền xem (Request Access). **BR2 (Đóng băng dữ liệu):** Ngay sau khi lệnh phân phối được thực hiện thành công, bản biên bản cuộc họp đó phải bị khóa cứng hoàn toàn. Không một ai (kể cả người chủ trì) được quyền tự ý chỉnh sửa văn bản này nữa nhằm bảo toàn tính pháp lý và tính đồng bộ của thông tin đã phát hành ra toàn công ty. **BR3 (Gửi mặc định đồng loạt):** Thông báo phân phối biên bản được gửi mặc định đến toàn bộ nhân sự có tên trong danh sách mà không qua bất kỳ bước lọc trạng thái nào. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-NRM-05 Xuất biên bản cuộc họp** 

| UC ID and Name: | UC-NRM-05 Xuất biên bản cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Employee, Manager, Business Admin | Secondary Actors: |  |
| Trigger: | Người dùng muốn lưu trữ biên bản cuộc họp ngoại tuyến trên máy tính cá nhân, in ấn ra văn bản giấy để ký đóng dấu, hoặc chia sẻ tệp tài liệu qua các kênh liên lạc ngoài hệ thống nên nhấn chọn chức năng xuất file. |  |  |
| Description: | Chức năng này cho phép người dùng có thẩm quyền tải toàn bộ nội dung biên bản cuộc họp về thiết bị dưới dạng tệp văn bản PDF hoặc Word (.docx). Hệ thống sẽ tự động tổng hợp, sắp xếp bố cục và dàn trang một cách chuyên nghiệp theo biểu mẫu quy chuẩn. Tài liệu xuất bản đảm bảo chứa đầy đủ và toàn vẹn các thông tin: tiêu đề, thời gian, danh sách nhân sự tham dự, chi tiết nội dung thảo luận (transcript), các quyết định đã chốt và bảng danh sách tác vụ hành động.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công và có quyền truy cập/xem nội dung của cuộc họp này. \- Nội dung biên bản văn bản hoặc bản bóc băng chữ (Transcript) đã được khởi tạo hoàn tất trên hệ thống. |  |  |
| Postconditions: | \- Tệp tin định dạng PDF hoặc Word (.docx) được khởi tạo thành công và tự động tải xuống thiết bị cá nhân của người dùng. \- Toàn bộ dữ liệu gốc lưu trữ trên hệ thống phần mềm được giữ nguyên vẹn, không bị ảnh hưởng (thao tác chỉ đọc \- Read-only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý lịch họp", tìm đến cuộc họp cần xuất dữ liệu và mở màn hình xem biên bản văn bản. 2\. Tại thanh công cụ của biên bản, người dùng nhấn chọn chức năng "Xuất tài liệu" (hoặc "Tải file biên bản"). 3\. Hệ thống hiển thị một hộp thoại tùy chọn, yêu cầu người dùng lựa chọn định dạng tệp tin mong muốn (PDF hoặc Word .docx). 4\. Người dùng nhấp chọn định dạng tệp (Ví dụ: chọn định dạng PDF) và nhấn nút "Xác nhận tải xuống". 5\. Hệ thống tiếp nhận lệnh, kiểm tra quyền hạn truy cập của tài khoản để đảm bảo tính hợp lệ. 6\. Hệ thống tự động thu thập và biên dịch toàn bộ kho dữ liệu thuộc cuộc họp này, sắp xếp cấu trúc nội dung văn bản theo các phần quy chuẩn bao gồm: **Phần 1: Thông tin chung:** Tiêu đề cuộc họp, Khung thời gian, Địa điểm phòng họp vật lý, Họ tên người chủ trì/tổ chức. **Phần 2: Thành phần tham dự:** Danh sách đầy đủ họ tên và phòng ban của các nhân sự có mặt. **Phần 3: Nội dung chi tiết:** Dòng lịch sử thảo luận (Transcript) đi kèm mốc thời gian và định danh người nói. **Phần 4: Quyết định cốt lõi:** Tổng hợp các kết luận quan trọng đã được thông qua trong buổi họp. **Phần 5: Danh sách tác vụ hành động:** Bảng phân công công việc (nêu rõ Tên tác vụ, Nhân sự chịu trách nhiệm triển khai và Hạn chốt hoàn thành). 7\. Hệ thống tiến hành đóng gói dữ liệu và chuyển đổi thành tệp tin theo đúng định dạng người dùng đã yêu cầu ở bước 4\. 8\. Hệ thống kích hoạt trình tải xuống tự động của trình duyệt để lưu tệp tin về máy tính của người dùng, đóng hộp thoại và hiển thị thông báo "Xuất biên bản cuộc họp thành công". |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Không có quyền truy xuất tài liệu:** Tại bước 5, nếu hệ thống phát hiện tài khoản người dùng không nằm trong danh sách được phép tiếp cận biên bản cuộc họp này, hệ thống sẽ lập tức chặn lệnh chuyển đổi dữ liệu và thông báo lỗi: "Bạn không có quyền xuất dữ liệu của cuộc họp này."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Kế thừa quyền bảo mật nghiêm ngặt):** Nút chức năng "Xuất tài liệu" chỉ hiển thị và hoạt động đối với những tài khoản có quyền xem cuộc họp. Hệ thống tuyệt đối không cho phép xuất file ẩn danh hoặc xuất file từ các đường dẫn chia sẻ trái phép. **BR2 (Quy chuẩn phông chữ và định dạng):** Tất cả các tệp văn bản xuất ra bắt buộc phải sử dụng chung một phông chữ tiêu chuẩn của tổ chức, có phần tiêu đề đầu trang (Header) hiển thị tên công ty/dự án và chân trang (Footer) tự động đánh số trang theo dạng "Trang X / Y" để phục vụ mục đích in ấn không bị xáo trộn. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 8\. Analytics & Administration

#### 

1. #### **UC-AA-01 Xem dashboard tổng quan hệ thống** 

| UC ID and Name: | UC-AA-01 Xem dashboard tổng quan hệ thống  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin, System Admin  | Secondary Actors: |  |
| Trigger: | Người dùng đăng nhập thành công vào hệ thống với quyền Quản trị hoặc Quản lý cấp cao và truy cập vào phân hệ "Báo cáo & Thống kê" (Dashboard).  |  |  |
| Description: | Chức năng này cung cấp một trung tâm điều khiển trực quan (Dashboard) hiển thị bức tranh toàn cảnh về hiệu suất vận hành của hệ thống quản lý phòng họp. Thông qua các thẻ chỉ số (KPI cards) và biểu đồ xu hướng, người dùng có thể dễ dàng theo dõi các thông số quan trọng như: tổng số cuộc họp đã diễn ra, tỷ lệ lấp đầy phòng họp, tỷ lệ nhân sự tham dự đúng giờ, tỷ lệ vắng mặt không phép (no-show), và tổng số tài khoản đang hoạt động. Tính năng này cho phép tùy chỉnh mốc thời gian lọc dữ liệu để phục vụ công tác phân tích chiến lược và tối ưu hóa tài nguyên.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã có sẵn dữ liệu lịch sử về quá trình sử dụng phòng họp, điểm danh và hoạt động của người dùng. |  |  |
| Postconditions: | \- Giao diện Dashboard hiển thị chính xác các số liệu thống kê dựa trên bộ lọc thời gian người dùng thiết lập. \- Không có bất kỳ dữ liệu hệ thống nào bị thay đổi sau thao tác này (thao tác chỉ đọc \- Read Only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Báo cáo & Thống kê". 2\. Hệ thống mặc định thiết lập bộ lọc thời gian là "30 ngày gần nhất" (hoặc "Tháng này"). 3\. Hệ thống truy xuất dữ liệu từ toàn bộ các phân hệ liên quan và tiến hành tổng hợp, tính toán các chỉ số thống kê. 4\. Hệ thống hiển thị các thẻ chỉ số trọng yếu (KPI Cards) ở vị trí trên cùng của màn hình, bao gồm: Tổng số cuộc họp, Tỷ lệ sử dụng phòng, Tỷ lệ điểm danh đúng giờ, Tỷ lệ no-show, và Số lượng người dùng hoạt động. 5\. Bên dưới các thẻ KPI, hệ thống hiển thị các biểu đồ trực quan (biểu đồ đường, biểu đồ cột) thể hiện sự biến động và xu hướng của các chỉ số này theo dòng sự kiện thời gian. 6\. Người dùng thay đổi khoảng thời gian cần thống kê thông qua bộ lọc (Ví dụ: chọn "Tuần này", "Quý 1", hoặc tùy chỉnh "Từ ngày... Đến ngày..."). 7\. Hệ thống tiếp nhận bộ lọc mới, lập tức tính toán lại và làm mới toàn bộ giao diện thẻ KPI cùng biểu đồ để phản ánh chính xác dữ liệu của khoảng thời gian vừa chọn. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Không có dữ liệu phát sinh:** Tại bước 7, nếu khoảng thời gian người dùng thiết lập rơi vào thời điểm không phát sinh bất kỳ hoạt động tổ chức họp nào, hệ thống sẽ hiển thị giá trị "0" trên các thẻ KPI. Khu vực biểu đồ sẽ hiển thị trạng thái rỗng kèm thông báo: "Không có dữ liệu hoạt động trong khoảng thời gian này." **E2. Lỗi quá tải xử lý dữ liệu:** Nếu khoảng thời gian người dùng chọn quá lớn (ví dụ: quét dữ liệu của toàn bộ 5 năm qua) khiến hệ thống mất quá nhiều thời gian tổng hợp, hệ thống sẽ hiển thị biểu tượng tải dữ liệu (Loading). Nếu vượt quá thời gian chờ cho phép (Time-out), hệ thống sẽ ngắt kết nối biểu đồ và hiển thị thông báo: "Khối lượng dữ liệu quá lớn không thể tải ngay lập tức. Vui lòng thu hẹp khoảng thời gian tìm kiếm." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Phân quyền dữ liệu \- Data Visibility):** Mặc dù cùng truy cập màn hình Dashboard, tài khoản có Role "Manager" chỉ được phép nhìn thấy số liệu thống kê liên quan đến các phòng ban hoặc chi nhánh mà họ đang trực tiếp quản lý. Ngược lại, tài khoản "Admin" có đặc quyền cao nhất, được nhìn thấy số liệu tổng hợp của toàn bộ doanh nghiệp. **BR2 (Đồng bộ thời gian thực):** Các số liệu thống kê trên Dashboard phải được cập nhật tự động theo thời gian thực (Real-time). Bất kỳ cuộc họp nào vừa kết thúc và chốt điểm danh xong đều lập tức làm thay đổi chỉ số trên biểu đồ. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Toàn bộ dữ liệu về điểm danh (Smart Check-in), trạng thái hủy họp và thiết bị được các phân hệ vận hành cập nhật liên tục, chính xác nhằm đảm bảo biểu đồ báo cáo phản ánh đúng 100% tình hình thực tế ngoài đời.  |  |  |

2. #### **UC-AA-02 Xem dashboard sử dụng phòng họp** 

| UC ID and Name: | UC-AA-02 Xem dashboard sử dụng phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin, System Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Hiệu suất sử dụng phòng họp".  |  |  |
| Description: | Chức năng này cung cấp một giao diện báo cáo và phân tích chuyên sâu về tần suất cũng như hiệu quả khai thác của từng không gian phòng họp trong tổ chức. Hệ thống hỗ trợ hiển thị dữ liệu linh hoạt theo các tùy chọn khoảng thời gian (ngày, tuần, tháng) và tự động tính toán các chỉ số đo lường nâng cao bao gồm: tổng số giờ được đặt lịch, tổng số giờ có người sử dụng thực tế, Tỷ lệ khai thác đặt phòng (Reservation Utilization Rate) và Tỷ lệ lấp đầy phòng thực tế (Room Occupancy Rate). Tính năng này cũng hỗ trợ công cụ trực quan để so sánh hiệu suất giữa các phòng họp với nhau và cho phép nhấp chuột chuyên sâu (drill-down) vào từng phòng để phân tích chi tiết.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã ghi nhận đầy đủ lịch sử đặt phòng (Reservation) và dữ liệu phản ánh thời gian sử dụng phòng thực tế (qua thiết bị cảm biến hiện diện hoặc tính năng Smart Check-in tại phòng). |  |  |
| Postconditions: | \- Giao diện hiển thị trực quan biểu đồ so sánh hiệu suất và bảng dữ liệu thống kê của các phòng họp theo đúng khoảng thời gian được chọn. \- Không có bất kỳ dữ liệu gốc nào bị thay đổi sau thao tác này (thao tác chỉ đọc \- Read Only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Hiệu suất sử dụng phòng họp". 2\. Hệ thống mặc định hiển thị biểu đồ so sánh tổng quan giữa tất cả các phòng họp trong công ty với khoảng thời gian lọc mặc định là "Tháng hiện tại". 3\. Trên biểu đồ so sánh hoặc bảng dữ liệu đi kèm, hệ thống trình bày chi tiết 4 chỉ số cốt lõi của từng phòng: **Tổng số giờ được đặt:** Quỹ thời gian phòng được đăng ký thành công trên lịch. **Tổng số giờ sử dụng thực tế:** Quỹ thời gian thực tế có người ngồi họp trong phòng. **Reservation Utilization Rate (Tỷ lệ khai thác đặt phòng):** Mức độ phòng được tận dụng dựa trên lịch trình mở cửa. **Room Occupancy Rate (Tỷ lệ lấp đầy phòng):** Mức độ sử dụng thực tế so với thời gian đã đăng ký giữ chỗ. 4\. Người dùng có thể thay đổi khoảng thời gian cần phân tích bằng cách chọn bộ lọc theo Ngày, Tuần, Tháng hoặc thiết lập một khoảng thời gian tùy chỉnh. 5\. Hệ thống tiếp nhận điều kiện lọc mới, lập tức tính toán lại số liệu và cập nhật lại biểu đồ so sánh xu hướng giữa các phòng trên giao diện. 6\. Người dùng muốn phân tích chuyên sâu về một phòng họp cụ thể sẽ nhấp chuột trực tiếp vào tên phòng họp đó trên biểu đồ/danh sách (Thao tác Drill-down). 7\. Hệ thống chuyển hướng giao diện, mở ra màn hình chi tiết riêng của phòng họp được chọn. Tại đây hiển thị một bản đồ nhiệt (Heatmap) thể hiện các khung giờ cao điểm được sử dụng nhiều nhất trong ngày và danh sách chi tiết các cuộc họp đã diễn ra cấu thành nên chỉ số của phòng đó. 8\. Người dùng xem xong nhấn nút "Quay lại" để đóng màn hình chi tiết và trở về giao diện so sánh tổng quan ban đầu. |  |  |
| Alternative Flows: | **A1. Xuất báo cáo hiệu suất phòng họp:** Tại bước 3 hoặc bước 7, người dùng có thể nhấn nút "Xuất dữ liệu". Hệ thống sẽ đóng gói toàn bộ các chỉ số hiệu suất của các phòng họp trong khoảng thời gian đã chọn thành một tệp bảng tính (Excel) để người dùng tải về máy tính phục vụ cho công tác in ấn hoặc báo cáo nội bộ.  |  |  |
| Exceptions: | **E1. Phòng họp thiếu dữ liệu ghi nhận thực tế:** Tại bước 3, nếu một phòng họp mới thiết lập chưa được đồng bộ với hệ thống cảm biến hiện diện hoặc chưa áp dụng check-in, hệ thống sẽ chỉ hiển thị dữ liệu về "Tổng số giờ được đặt" và "Reservation Utilization Rate", còn các chỉ số liên quan đến thời gian thực tế sẽ hiển thị nhãn "Chưa có dữ liệu thực tế" thay vì hiển thị lỗi.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 (Công thức tính Reservation Utilization Rate):** Chỉ số này được tính bằng: (Tổng số giờ phòng họp được người dùng đặt trước thành công trong kỳ / Tổng số giờ mở cửa hoạt động tiêu chuẩn của phòng đó trong cùng kỳ) x 100\. **BR2 (Công thức tính Room Occupancy Rate):** Chỉ số này phản ánh mức độ "lãng phí" không gian, được tính bằng: (Tổng số giờ có người sử dụng phòng thực tế được hệ thống ghi nhận / Tổng số giờ phòng đó bị đăng ký chiếm chỗ trên lịch) x 100\. (Ví dụ: Một phòng bị đặt lịch giữ chỗ 10 tiếng, nhưng thực tế người ta chỉ vào họp 6 tiếng rồi về sớm hoặc bỏ trống phòng, thì tỷ lệ lấp đầy thực tế chỉ đạt 60%). **BR3 (Quy tắc phân tầng dữ liệu):** Người dùng có Role "Manager" chỉ được phép so sánh và xem chi tiết hiệu suất của các phòng họp thuộc phòng ban hoặc chi nhánh văn phòng do mình quản lý. Role "Admin" hệ thống có đặc quyền xem, so sánh chéo dữ liệu của tất cả các phòng họp trên toàn bộ tổng công ty. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Cơ chế ghi nhận thời gian sử dụng thực tế ngoài đời thực (thông qua cảm biến hoặc quét mã check-in) hoạt động chính xác và duy trì kết nối liên tục với hệ thống phần mềm.  |  |  |

3. #### **UC-AA-03 Xem dashboard điểm danh & hiện diện** 

| UC ID and Name: | UC-AA-03 Xem dashboard điểm danh & hiện diện  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Điểm danh & Hiện diện".  |  |  |
| Description: | Chức năng này cung cấp một trung tâm phân tích trực quan về kỷ luật tham gia các cuộc họp của nhân sự. Giao diện trình bày các chỉ số tổng hợp bao gồm tỷ lệ điểm danh đúng giờ, tỷ lệ vắng mặt không phép, cùng tỷ lệ đến muộn hoặc về sớm. Người dùng có thể linh hoạt lọc dữ liệu theo từng phòng ban (phục vụ đối soát chéo hiệu suất nhân sự) và theo các khoảng thời gian tùy chỉnh. Hệ thống cung cấp công cụ tương tác nhấp chuột chuyên sâu (Drill-down) cho phép người dùng từ một cái nhìn tổng thể có thể truy xuất ngược về danh sách điểm danh chi tiết của một cuộc họp cụ thể, hoặc theo dõi toàn bộ lịch sử tuân thủ thời gian của một cá nhân riêng biệt.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã có sẵn dữ liệu lịch sử ghi nhận từ phân hệ điểm danh (Check-in/Check-out) của các cuộc họp đã diễn ra. |  |  |
| Postconditions: | \- Giao diện Dashboard hiển thị chính xác các biểu đồ, số liệu điểm danh theo đúng phạm vi phòng ban và khoảng thời gian được chọn. \- Không có bất kỳ dữ liệu gốc nào bị thay đổi sau thao tác tra cứu này (thao tác chỉ đọc \- Read Only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê", sau đó nhấp chọn mục "Điểm danh & Hiện diện". 2\. Hệ thống mặc định tải dữ liệu thống kê tổng hợp của toàn bộ nhân sự (đối với Admin) hoặc của bộ phận trực thuộc (đối với Manager) trong khung thời gian "Tháng hiện tại". 3\. Hệ thống hiển thị các thẻ KPI và biểu đồ phân bổ hình tròn/cột, minh họa rõ nét các chỉ số: Tỷ lệ đúng giờ, Tỷ lệ vắng mặt, Tỷ lệ đến muộn, Tỷ lệ về sớm. 4\. Người dùng sử dụng thanh công cụ bộ lọc để tinh chỉnh phạm vi báo cáo (Ví dụ: Đổi sang xem "Quý 1" và chỉ chọn phòng "Marketing" và "Sales"). 5\. Hệ thống tiếp nhận bộ lọc, lập tức tính toán lại toàn bộ số liệu và cập nhật lại giao diện biểu đồ để phản ánh sự thay đổi. 6\. Để phân tích nguyên nhân cốt lõi (Drill-down), người dùng có thể nhấp chuột trực tiếp vào một vùng dữ liệu trên biểu đồ (ví dụ: nhấn vào cột cảnh báo "Vắng mặt" cao đột biến của một ngày cụ thể) hoặc nhấp vào tên một nhân sự trong bảng vinh danh/cảnh báo bên dưới. 7\. Hệ thống chuyển hướng giao diện, mở ra màn hình chi tiết thứ cấp: **Nếu xem theo cuộc họp:** Hiển thị danh sách khách mời của cuộc họp đó, kèm theo mốc thời gian điểm danh vào/ra thực tế của từng người và đánh dấu rõ ai vắng mặt. **Nếu xem theo nhân sự:** Hiển thị toàn bộ lịch sử tham dự các cuộc họp của cá nhân đó trong kỳ báo cáo (Tổng số lần được mời, số lần đúng giờ, muộn, vắng). 8\. Người dùng xem xong, nhấn nút "Quay lại" để đóng chế độ xem chi tiết và trở về màn hình Dashboard tổng quan. |  |  |
| Alternative Flows: | **A1. Xuất báo cáo điểm danh chi tiết:** Tại bước 5 hoặc bước 7, người dùng nhấn chọn "Xuất dữ liệu". Hệ thống tự động đóng gói các số liệu điểm danh đang hiển thị thành một tệp bảng tính theo chuẩn biểu mẫu nhân sự, hỗ trợ tải về máy tính để làm căn cứ đánh giá thi đua (KPI) hoặc tính lương thưởng.  |  |  |
| Exceptions: | **E1. Chưa phát sinh dữ liệu họp:** Tại bước 5, nếu phòng ban được chọn chưa tổ chức hoặc tham gia bất kỳ cuộc họp nào trong khoảng thời gian người dùng thiết lập, hệ thống sẽ hiển thị các thẻ KPI với giá trị "0" và một thông báo trực quan ở giữa màn hình: "Không có dữ liệu điểm danh nào được ghi nhận cho bộ lọc hiện tại."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 (Phân tầng hiển thị dữ liệu):** Người dùng có Role "Manager" chỉ được phép lọc và xem số liệu điểm danh của các nhân viên thuộc cơ cấu phòng ban mà mình quản lý trực tiếp. Tài khoản "Admin" hoặc Ban Giám đốc có quyền truy xuất xem số liệu tổng hợp và chi tiết của mọi phòng ban trên toàn công ty. **BR2 (Quy tắc định danh vi phạm thời gian):** Hệ thống tự động phân loại và dán nhãn trạng thái dựa trên mốc thời gian gốc của cuộc họp. "Đến muộn": Ghi nhận thời gian Check-in diễn ra sau khi cuộc họp đã bắt đầu. "Về sớm": Ghi nhận thời gian Check-out (rời phòng) trước mốc thời gian cuộc họp chính thức kết thúc theo lịch. "Vắng mặt": Không có bất kỳ dữ liệu Check-in nào được ghi nhận trong suốt thời gian diễn ra cuộc họp (đối với những người không nhấn Từ chối trước đó). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-AA-04 Xem thống kê số lượng cuộc họp theo khoảng thời gian** 

| UC ID and Name: | UC-AA-04 Xem thống kê số lượng cuộc họp theo khoảng thời gian  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Thống kê số lượng cuộc họp".  |  |  |
| Description: | Chức năng này cung cấp một biểu đồ xu hướng trực quan, minh họa sự biến động về số lượng các cuộc họp được tổ chức trong doanh nghiệp theo một trục thời gian nhất định (nhóm theo ngày, tuần hoặc tháng). Người dùng có thể sử dụng các bộ lọc đa chiều (theo phòng ban tổ chức, phòng họp cụ thể, hoặc loại hình cuộc họp) để phân tách dữ liệu. Biểu đồ giúp cấp quản lý dễ dàng nhận biết các chu kỳ biến động, xác định các khoảng thời gian cao điểm (Peak times) thường xuyên xảy ra tình trạng kẹt phòng, từ đó đưa ra quyết định điều phối tài nguyên không gian hợp lý.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã lưu trữ dữ liệu về các cuộc họp (bao gồm cả các cuộc họp đã diễn ra trong quá khứ và đã lên lịch trong tương lai). |  |  |
| Postconditions: | \- Giao diện hiển thị biểu đồ xu hướng và bảng thống kê số lượng cuộc họp đáp ứng chính xác các tiêu chí lọc. \- Thao tác tra cứu là chỉ đọc (Read-only), không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu gốc nào của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Thống kê số lượng cuộc họp". 2\. Hệ thống mặc định tải biểu đồ đường (Line chart) hoặc biểu đồ cột (Bar chart) thể hiện tổng số cuộc họp của toàn công ty, được nhóm theo từng tuần trong phạm vi "Tháng hiện tại". 3\. Người dùng sử dụng thanh công cụ để thay đổi khoảng thời gian tổng thể (Ví dụ: chọn khoảng thời gian 6 tháng) và cấu hình lại đơn vị nhóm trục hoành (Nhóm theo Tháng thay vì theo Tuần). 4\. Người dùng tiếp tục áp dụng các bộ lọc chuyên sâu, bao gồm: **Phòng ban:** Chọn một hoặc nhiều phòng ban cụ thể (Ví dụ: Chỉ xem số lượng họp của phòng Sales). **Phòng họp:** Chỉ định không gian (Ví dụ: Chỉ tính các cuộc họp diễn ra tại Phòng Hội đồng). **Loại cuộc họp:** Lọc theo tính chất (Ví dụ: Đào tạo, Phỏng vấn, Họp định kỳ). 5\. Hệ thống tiếp nhận tổ hợp các điều kiện lọc, tính toán lại số liệu và vẽ lại đường xu hướng trên biểu đồ. 6\. Người dùng quan sát biểu đồ để nhận định các đỉnh cao điểm (điểm dâng cao bất thường) hoặc các vùng trũng (ít họp). Khi di chuột vào một điểm trên biểu đồ, hệ thống hiển thị một khung thông tin (Tooltip) báo cáo con số chính xác tại mốc thời gian đó. |  |  |
| Alternative Flows: | **A1. Xem dữ liệu tương lai:** Tại bước 3, người dùng có thể chọn khoảng thời gian là một tháng trong tương lai (Ví dụ: Tháng tới). Hệ thống sẽ vẽ biểu đồ dự báo dựa trên số lượng các cuộc họp đã được đặt lịch (Scheduled) thành công, giúp Quản lý nắm bắt trước mật độ sử dụng phòng. **A2. Xuất dữ liệu biểu đồ:** Người dùng nhấn nút "Xuất dữ liệu" để tải toàn bộ bảng số liệu thô (tương ứng với các điểm trên biểu đồ) về máy tính dưới định dạng tệp bảng tính phục vụ báo cáo bên ngoài. |  |  |
| Exceptions: | **E1. Không có dữ liệu phù hợp:** Tại bước 5, nếu tổ hợp bộ lọc quá khắt khe hoặc khoảng thời gian chọn rơi vào kỳ nghỉ lễ không có cuộc họp nào diễn ra, biểu đồ sẽ hiển thị một đường thẳng ở mốc 0, kèm theo thông báo nổi trên màn hình: "Không tìm thấy dữ liệu cuộc họp nào thỏa mãn các tiêu chí lọc hiện tại."  |  |  |
| Priority: | Medium |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Quy tắc đếm số lượng):** Hệ thống chỉ đưa vào thống kê những cuộc họp có trạng thái là "Đã hoàn tất" (đối với quá khứ) hoặc "Đã lên lịch" (đối với tương lai). Bất kỳ cuộc họp nào có trạng thái "Đã hủy" (Cancelled) hoặc "Chờ phê duyệt" (Pending) đều bị loại trừ khỏi biểu đồ để đảm bảo tính phản ánh đúng thực tế tài nguyên bị chiếm dụng. **BR2 (Phân quyền dữ liệu theo vai trò):** Tài khoản Admin được quyền xem thống kê của toàn bộ công ty và có thể tùy ý chọn lọc bất kỳ phòng ban nào. Tài khoản Manager chỉ mặc định xem được biểu đồ thuộc phạm vi phòng ban mình quản lý, và danh sách lọc phòng ban (nếu có) sẽ bị khóa hoặc thu hẹp chỉ còn hiển thị các bộ phận cấp dưới trực thuộc quyền hạn của Manager đó. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-AA-05 Xem thống kê cuộc họp theo trạng thái** 

| UC ID and Name: | UC-AA-05 Xem thống kê cuộc họp theo trạng thái  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Thống kê theo trạng thái cuộc họp".  |  |  |
| Description: | Chức năng này cung cấp một biểu đồ trực quan (dạng hình tròn/donut hoặc hình cột) thể hiện tỷ lệ phân bổ các cuộc họp dựa trên trạng thái vận hành bao gồm: Đã lên lịch (Scheduled), Đã hoàn tất (Completed), Đã hủy (Cancelled), và Vắng mặt không lý do (No-show). Người dùng có thể áp dụng các bộ lọc theo khoảng thời gian và theo từng phòng ban để theo dõi, đánh giá mức độ nghiêm túc cũng như tính hiệu quả trong việc lên kế hoạch tổ chức cuộc họp của doanh nghiệp.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã tích lũy và lưu trữ dữ liệu lịch sử về toàn bộ các cuộc họp cùng trạng thái kết thúc tương ứng của chúng. |  |  |
| Postconditions: | \- Giao diện hiển thị chính xác tỷ lệ phân bổ và số lượng cuộc họp theo từng trạng thái dựa trên các tiêu chí lọc. \- Thao tác tra cứu là chỉ đọc (Read-only), không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu gốc nào của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Thống kê theo trạng thái cuộc họp". 2\. Hệ thống mặc định tải biểu đồ tròn dạng vòng nhẫn (Donut chart) phân bổ trạng thái cuộc họp của toàn công ty với khoảng thời gian lọc mặc định là "Tháng hiện tại". Biểu đồ được chia thành các phân đoạn màu sắc tương ứng với 4 trạng thái: Scheduled, Completed, Cancelled, No-show. 3\. Người dùng sử dụng thanh công cụ để thiết lập lại các tiêu chí tìm kiếm bao gồm: Khoảng thời gian cần thống kê (Ngày, Tuần, Tháng hoặc khoảng tùy chỉnh) và chọn một hoặc nhiều Phòng ban cần rà soát. 4\. Hệ thống tiếp nhận tổ hợp các điều kiện lọc, thực hiện tính toán lại tỷ lệ phần trăm đóng góp và số lượng tuyệt đối cho từng trạng thái. 5\. Hệ thống tái vẽ lại biểu đồ và cập nhật bảng số liệu tổng hợp đi kèm bên cạnh giao diện theo thời gian thực. 6\. Người dùng di chuột (Hover) vào từng phân đoạn màu trên biểu đồ để xem thông tin chi tiết (Ví dụ: "Cancelled: 15 cuộc họp \- Chiếm 12.5%"). |  |  |
| Alternative Flows: | **A1. Chuyển đổi loại biểu đồ hiển thị:** Tại bước 6, nếu người dùng muốn so sánh khối lượng cuộc họp tuyệt đối giữa các trạng thái một cách rõ ràng hơn thay vì xem tỷ lệ phần trăm, họ có thể nhấp chọn biểu tượng "Biểu đồ cột" (Bar chart) trên thanh công cụ. Hệ thống sẽ lập tức chuyển đổi cấu trúc hiển thị sang dạng cột đứng mà vẫn giữ nguyên các điều kiện lọc hiện hành.  |  |  |
| Exceptions: | **E1. Không có dữ liệu cuộc họp trong kỳ lọc:** Tại bước 4, nếu phòng ban hoặc khoảng thời gian được người dùng chọn không phát sinh bất kỳ cuộc họp nào, hệ thống sẽ hiển thị một biểu đồ xám rỗng kèm theo thông báo trực quan ở tâm: "Không có dữ liệu cuộc họp nào thỏa mãn bộ lọc hiện tại."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Định nghĩa logic trạng thái cuộc họp):** Số liệu cấu thành biểu đồ được hệ thống tự động phân loại theo các quy tắc nghiêm ngặt sau: *Scheduled (Đã lên lịch):* Các cuộc họp trong tương lai đã đặt phòng thành công và đang chờ diễn ra. *Completed (Đã hoàn tất):* Các cuộc họp trong quá khứ đã diễn ra thành công và có ghi nhận dữ liệu điểm danh thực tế.  *Cancelled (Đã hủy):* Các cuộc họp đã bị người tổ chức chủ động hủy bỏ hoặc bị cấp quản lý từ chối duyệt trước giờ khởi chạy. *No-show (Hủy lịch do vắng mặt):* Các cuộc họp đã được chốt lịch giữ phòng, nhưng quá thời hạn quy định (ví dụ: sau 15 phút từ giờ bắt đầu) hệ thống không ghi nhận bất kỳ lượt check-in nào tại phòng, dẫn đến việc tự động hủy lịch để giải phóng phòng họp. **BR2 (Phân quyền giới hạn dữ liệu):** Người dùng có vai trò "Manager" chỉ được phép tiếp cận và xem biểu đồ thống kê trạng thái cuộc họp của các nhân sự thuộc cơ cấu phòng ban do mình trực tiếp quản lý. Vai trò "Admin" có đặc quyền cao nhất, được quyền xem và lọc dữ liệu của tất cả các phòng ban trên toàn hệ thống tổng công ty. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-AA-06 Xem thống kê thời lượng trung bình cuộc họp** 

| UC ID and Name: | UC-AA-06 Xem thống kê thời lượng trung bình cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Thống kê thời lượng cuộc họp".  |  |  |
| Description: | Chức năng này cung cấp một giao diện phân tích đối chiếu trực quan giữa "Thời lượng họp dự kiến" (thời gian đăng ký giữ phòng ban đầu) và "Thời lượng họp thực tế" (thời gian có người sử dụng phòng thực tế). Dữ liệu được tính toán trung bình và hiển thị dưới dạng biểu đồ cột kép (Side-by-side bar chart). Người dùng có thể lọc báo cáo theo khoảng thời gian, phòng ban cụ thể hoặc từng phòng họp vật lý. Thông qua báo cáo này, ban quản lý dễ dàng phát hiện xu hướng văn hóa hội họp của tổ chức: liệu các phòng ban thường xuyên "họp vượt giờ" (gây kẹt lịch người sau) hay thường "kết thúc sớm" (gây lãng phí tài nguyên giữ chỗ rảnh rỗi).  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã tích lũy dữ liệu lịch sử về thời gian đặt lịch gốc và có cơ chế ghi nhận thời gian sử dụng phòng thực tế (thông qua cảm biến hiện diện hoặc hệ thống điểm danh vào/ra). |  |  |
| Postconditions: | \- Giao diện hiển thị chính xác biểu đồ đối chiếu thời lượng và bảng số liệu trung bình theo đúng các tiêu chí lọc được yêu cầu. \- Thao tác tra cứu là chỉ đọc (Read-only), tuyệt đối không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu gốc nào của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Thống kê thời lượng cuộc họp". 2\. Hệ thống mặc định tải biểu đồ thống kê tổng hợp của toàn công ty với khoảng thời gian lọc mặc định là "Tháng hiện tại". Biểu đồ hiển thị hai cột đối chiếu cạnh nhau cho mỗi đơn vị thời gian (Tuần/Tháng): Cột "Dự kiến trung bình" và cột "Thực tế trung bình". 3\. Người dùng sử dụng thanh công cụ để thiết lập lại các tiêu chí tìm kiếm chuyên sâu bao gồm: **Khoảng thời gian:** Chọn khoảng thời gian mong muốn (Ví dụ: Quý 1). **Phòng ban:** Chọn một hoặc nhiều phòng ban (Ví dụ: Đối chiếu thời lượng họp của phòng Nhân sự và Kế toán). **Phòng họp:** Chỉ định phân tích trên một không gian cụ thể (Ví dụ: Phòng họp VIP tầng 2). 4\. Hệ thống tiếp nhận bộ lọc, tiến hành rà soát dữ liệu lịch sử, tính toán trung bình cộng thời lượng dự kiến và thực tế của các cuộc họp thỏa mãn điều kiện. 5\. Hệ thống cập nhật lại biểu đồ và bảng chi tiết số liệu bên dưới để phản ánh chính xác kết quả phân tích. 6\. Người dùng quan sát biểu đồ để đánh giá xu hướng. Nếu cột "Thực tế" liên tục cao hơn cột "Dự kiến", quản lý nhận diện được tình trạng họp dây dưa, vượt giờ. Ngược lại, chỉ ra tình trạng lãng phí quỹ thời gian đặt phòng |  |  |
| Alternative Flows: | **A1. Cảnh báo các cuộc họp bất thường:** Tại bảng số liệu chi tiết bên dưới biểu đồ, hệ thống cung cấp thêm chức năng "Xem các cuộc họp vượt giờ/kết thúc sớm nhất". Người dùng nhấp vào, hệ thống sẽ lọc và liệt kê danh sách top 10 cuộc họp có độ chênh lệch thời gian giữa dự kiến và thực tế cao nhất, giúp quản lý có thể điều tra nguyên nhân sâu hơn. **A2. Xuất dữ liệu thống kê:** Tại bước 5, người dùng nhấn nút "Xuất dữ liệu" để tải bảng số liệu thô về máy tính dưới định dạng tệp bảng tính phục vụ cho báo cáo đánh giá KPI định kỳ của công ty. |  |  |
| Exceptions: | **E1. Thiếu dữ liệu thời gian thực tế:** Tại bước 4, đối với những cuộc họp trong quá khứ diễn ra tại các phòng không trang bị cảm biến hoặc không có ai thao tác điểm danh/kết thúc trên phần mềm, hệ thống sẽ loại bỏ các cuộc họp này khỏi công thức tính "Thời lượng trung bình thực tế" để đảm bảo tính khách quan của số liệu, đồng thời hiển thị một ghi chú nhỏ: "Đã loại trừ X cuộc họp không có dữ liệu đo lường thực tế". **E2. Không có dữ liệu trong kỳ báo cáo:** Nếu không có cuộc họp nào diễn ra thỏa mãn bộ lọc, hệ thống hiển thị biểu đồ rỗng và thông báo: "Không có dữ liệu thời lượng cuộc họp nào cho bộ lọc hiện tại." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Phân quyền giới hạn dữ liệu):** Người dùng có vai trò "Manager" chỉ được phép tiếp cận và xem báo cáo thống kê thời lượng của các nhân sự thuộc cơ cấu phòng ban do mình quản lý. Vai trò "Admin" có đặc quyền cao nhất, được quyền tra cứu chéo dữ liệu của tất cả các phòng ban và toàn bộ phòng họp trong công ty.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-AA-07 Xem thống kê tỷ lệ cuộc họp bị hủy** 

| UC ID and Name: | UC-AA-07 Xem thống kê tỷ lệ cuộc họp bị hủy  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Thống kê tỷ lệ hủy cuộc họp".  |  |  |
| Description: | Chức năng này cung cấp một công cụ giám sát trực quan nhằm đánh giá mức độ lãng phí tài nguyên và tính nghiêm túc trong khâu lên kế hoạch của nhân sự. Giao diện báo cáo hiển thị tỷ lệ phần trăm các cuộc họp bị hủy trên tổng số các cuộc họp đã được tạo lập thành công. Hệ thống cho phép bóc tách dữ liệu đa chiều theo khoảng thời gian, phòng ban, đích danh người tổ chức hoặc theo từng phòng họp cụ thể. Thông qua báo cáo này, ban quản lý có thể nhanh chóng phát hiện các cá nhân hoặc tập thể có hành vi "đặt phòng ảo" (giữ chỗ trước rồi hủy sát giờ) với tỷ lệ cao bất thường để có biện pháp nhắc nhở, chấn chỉnh kỷ luật kịp thời.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống có dữ liệu lịch sử ghi nhận toàn bộ vòng đời của các cuộc họp (bao gồm cả các lịch đã tạo và lịch bị hủy bỏ). |  |  |
| Postconditions: | \- Giao diện hiển thị biểu đồ thống kê và bảng xếp hạng tỷ lệ hủy phòng đáp ứng chính xác các bộ lọc người dùng yêu cầu. \- Thao tác tra cứu là chỉ đọc (Read-only), tuyệt đối không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu gốc nào trên hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Thống kê tỷ lệ hủy cuộc họp". 2\. Hệ thống mặc định tải biểu đồ đường (hoặc biểu đồ cột) thể hiện xu hướng tỷ lệ hủy lịch chung của toàn công ty theo từng tuần trong phạm vi "Tháng hiện tại". 3\. Người dùng sử dụng các bộ lọc chuyên sâu trên thanh công cụ để khoanh vùng dữ liệu phân tích, bao gồm: **Khoảng thời gian:** Chọn kỳ báo cáo (Ví dụ: Tháng trước, Quý 1). **Phòng ban:** Chọn đánh giá một phòng ban cụ thể (Ví dụ: Khối Kinh doanh). **Phòng họp:** Chọn xem tình trạng hủy của một không gian đặc thù (Ví dụ: Phòng VIP). **Người tổ chức:** Nhập tên một nhân sự cụ thể để kiểm tra lịch sử đặt/hủy của cá nhân đó. 4\. Hệ thống tiếp nhận bộ lọc, tiến hành rà soát dữ liệu, tính toán tỷ lệ hủy dựa trên tổng số lịch đã tạo của các đối tượng tương ứng. 5\. Hệ thống làm mới giao diện, cập nhật biểu đồ và hiển thị một "Bảng xếp hạng cảnh báo" ngay bên dưới. Bảng này liệt kê danh sách Top 10 nhân sự hoặc phòng ban có số lượng và tỷ lệ hủy lịch cao nhất trong kỳ. 6\. Người dùng quan sát báo cáo để nhận diện các bất thường (Ví dụ: Một nhân sự đặt 20 cuộc họp nhưng hủy tới 15 cuộc, chiếm tỷ lệ 75%). |  |  |
| Alternative Flows: | **A1. Xem chi tiết danh sách bị hủy (Drill-down):** Tại bảng xếp hạng cảnh báo ở bước 5, người dùng có thể nhấp trực tiếp vào tên của một nhân sự có tỷ lệ hủy cao. Hệ thống sẽ mở ra một bảng liệt kê chi tiết toàn bộ các cuộc họp mà người đó đã hủy trong kỳ, kèm theo mốc thời gian thao tác hủy (Ví dụ: hủy trước 1 ngày hay hủy sát giờ họp) và lý do hủy (nếu có) để quản lý có đầy đủ bằng chứng đối chất. **A2. Xuất báo cáo tỷ lệ hủy:** Người dùng nhấn nút "Xuất dữ liệu" để tải toàn bộ bảng thống kê này về máy tính cá nhân dưới định dạng tệp bảng tính phục vụ công tác báo cáo vi phạm nội bộ. |  |  |
| Exceptions: | **E1. Không phát sinh dữ liệu tạo/hủy họp:** Nếu trong khoảng thời gian hoặc tại phòng ban người dùng đang lọc hoàn toàn không có bất kỳ một lịch họp nào được tạo ra (tổng số bằng 0), hệ thống sẽ vô hiệu hóa công thức tính tỷ lệ để tránh lỗi chia cho 0, đồng thời hiển thị thông báo: "Không có dữ liệu thiết lập cuộc họp nào cho bộ lọc hiện tại."  |  |  |
| Priority: | Medium |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Công thức tính tỷ lệ hủy):** Tỷ lệ hủy (%) được tính bằng: (Tổng số cuộc họp có trạng thái "Đã hủy" / Tổng số cuộc họp được khởi tạo ban đầu) x 100\. Các cuộc họp ở trạng thái "Bản nháp" (Draft) hoặc "Chờ phê duyệt" (Pending) bị từ chối sẽ không được đưa vào mẫu số của công thức này để đảm bảo tính công bằng cho người đặt. **BR2 (Phân quyền dữ liệu theo vai trò):** Tài khoản "Manager" chỉ được phép rà soát tỷ lệ hủy lịch của các nhân viên trực thuộc phòng ban mình quản lý. Trái lại, "Admin" sở hữu đặc quyền bao quát, có thể xem báo cáo và bảng xếp hạng cảnh báo của tất cả các phòng ban, cá nhân trên toàn công ty. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Thao tác hủy lịch của người dùng trên hệ thống luôn được ghi nhận chính xác kèm theo định danh (ID) người thực hiện và mốc thời gian (Timestamp) thực tế.  |  |  |

8. #### **UC-AA-08 Xem thống kê tỷ lệ sử dụng phòng tổng hợp** 

| UC ID and Name: | UC-AA-08 Xem thống kê tỷ lệ sử dụng phòng tổng hợp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng "Tỷ lệ sử dụng phòng tổng hợp".  |  |  |
| Description: | Chức năng này cung cấp một cái nhìn toàn diện và mang tính chiến lược về hiệu quả khai thác tài nguyên không gian của doanh nghiệp. Hệ thống tổng hợp dữ liệu vĩ mô của toàn bộ hệ thống hoặc cho phép đi sâu vào từng phòng cụ thể thông qua các thẻ KPI trực quan. Báo cáo tập trung vào hai chỉ số cốt lõi: Tỷ lệ khai thác đặt phòng (Reservation Utilization Rate) và Tỷ lệ lấp đầy phòng thực tế (Room Occupancy Rate), kết hợp với biểu đồ xu hướng (Trend chart) theo thời gian. Tính năng này giúp người quản lý dễ dàng đối chiếu, so sánh hiệu quả vận hành giữa các chu kỳ khác nhau (tuần này với tuần trước, tháng này với tháng trước) để nhận diện xu hướng tăng trưởng hoặc suy giảm.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã ghi nhận và lưu trữ đầy đủ dữ liệu đặt phòng cùng dữ liệu hiện diện thực tế của các kỳ vận hành trong quá khứ. |  |  |
| Postconditions: | \- Giao diện hiển thị trực quan các thẻ KPI tổng hợp và biểu đồ đường xu hướng so sánh giữa các chu kỳ theo đúng bộ lọc được thiết lập. \- Thao tác tra cứu tuân thủ nguyên tắc chỉ đọc (Read-only), không làm thay đổi dữ liệu gốc của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Tỷ lệ sử dụng phòng tổng hợp". 2\. Hệ thống mặc định tải giao diện báo cáo tổng hợp của toàn bộ hệ thống phòng họp trong công ty với khung thời gian là "Tháng hiện tại", đồng thời lấy "Tháng trước" làm kỳ đối chiếu mặc định. 3\. Hệ thống hiển thị các thẻ KPI tổng hợp ở vị trí trên cùng của màn hình, bao gồm: Tỷ lệ khai thác đặt phòng tổng hợp và Tỷ lệ lấp đầy phòng thực tế tổng hợp. Mỗi thẻ hiển thị rõ tỷ lệ phần trăm tăng hoặc giảm trực quan so với kỳ đối chiếu. 4\. Ngay bên dưới các thẻ chỉ số, hệ thống hiển thị biểu đồ xu hướng đa đường (Multi-line trend chart) thể hiện sự biến động song song của hai chỉ số này theo từng mốc thời gian (ngày hoặc tuần). 5\. Người dùng sử dụng thanh công cụ để thay đổi các tham số phân tích: Chọn phạm vi: Xem "Toàn bộ hệ thống" hoặc chọn đích danh một "Phòng họp cụ thể" từ danh sách thả xuống. Chọn kỳ so sánh: Thiết lập chu kỳ hiện tại (Ví dụ: Quý này) và chu kỳ đối chiếu (Ví dụ: Quý này năm ngoái). 6\. Hệ thống tiếp nhận các điều kiện thay đổi, thực hiện tính toán lại số liệu trung bình và cập nhật lại giao diện các thẻ KPI cùng các đường chạy xu hướng trên biểu đồ theo thời gian thực. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Kỳ đối chiếu trong quá khứ không có dữ liệu:** Tại bước 5, nếu người dùng cấu hình chọn một mốc thời gian quá xa trong quá khứ (thời điểm doanh nghiệp chưa áp dụng phần mềm này vào vận hành), hệ thống sẽ vẽ đường xu hướng của kỳ đối chiếu nằm ngang ở mức 0 và hiển thị một ghi chú cảnh báo: "Không tìm thấy dữ liệu vận hành hợp lệ của chu kỳ đối chiếu được chọn."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Quy tắc tính toán tổng hợp):** Các chỉ số hiển thị trên thẻ KPI tổng hợp là kết quả trung bình cộng của chỉ số tương ứng từ tất cả các phòng họp thành phần (thuộc quyền quản lý của Actor) trong khoảng thời gian được chọn, giúp phản ánh chính xác hiệu suất chung của toàn công ty thay vì bị lệch bởi một phòng cá biệt. **BR2 (Phân quyền phạm vi hiển thị):** Người dùng có Role "Manager" chỉ được quyền tiếp cận và xem biểu đồ xu hướng tổng hợp của cụm phòng họp thuộc bộ phận hoặc chi nhánh văn phòng do mình quản lý trực tiếp. Role "Admin" có đặc quyền cao nhất, được quyền xem báo cáo tổng hợp và so sánh xu hướng của toàn bộ mọi không gian trên toàn hệ thống phần mềm. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

9. #### **UC-AA-09 Xem thống kê tỷ lệ no-show** 

| UC ID and Name: | UC-AA-09 Xem thống kê tỷ lệ no-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Phân tích tỷ lệ No-show".  |  |  |
| Description: | Chức năng này cung cấp giải pháp giám sát và phát hiện hành vi "đặt phòng ảo" (nhân sự đăng ký giữ chỗ phòng họp thành công nhưng thực tế không đến sử dụng và cũng không thao tác hủy lịch). Giao diện hiển thị chi tiết số lượng trường hợp vi phạm (No-show cases) và Tỷ lệ No-show được tính toán tự động dựa trên tổng số lịch đặt phòng. Hệ thống hỗ trợ bộ lọc đa chiều theo không gian phòng họp, theo cơ cấu phòng ban hoặc đích danh người tổ chức trong một khoảng thời gian được chọn, giúp cấp quản lý có cơ sở dữ liệu minh bạch để chấn chỉnh kỷ luật tối ưu hóa hiệu suất phòng.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã tích lũy dữ liệu về các lịch đặt phòng trong quá khứ và thông tin ghi nhận trạng thái tham dự thực tế (dữ liệu check-in/quá hạn tự động gỡ lịch). |  |  |
| Postconditions: | \- Giao diện hiển thị trực quan số lượng vi phạm và tỷ lệ phần trăm No-show chính xác theo tiêu chí lọc. \- Thao tác tra cứu hoàn toàn là chỉ đọc (Read-only), không làm xáo trộn dữ liệu gốc của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Phân tích tỷ lệ No-show". 2\. Hệ thống mặc định tải số liệu tổng hợp của toàn công ty trong khung thời gian "Tháng hiện tại". 3\. Trên màn hình hiển thị các thẻ KPI nổi bật biểu thị: Tổng số ca No-show (số lượng tuyệt đối) và Tỷ lệ No-show tổng hợp (số phần trăm tương đối). 4\. Ngay bên dưới các thẻ chỉ số, hệ thống cung cấp bảng danh sách thống kê xếp hạng (Ranking list). Người dùng có thể nhấp chọn phân loại sắp xếp bảng theo 3 tab tiêu chí: **Theo phòng họp:** Hiển thị phòng họp nào thường xuyên bị bỏ trống nhất. **Theo phòng ban:** Hiển thị bộ phận nào có tỷ lệ nhân viên lãng phí phòng cao nhất. **Theo người tổ chức:** Hiển thị danh sách các cá nhân có số lần vi phạm nhiều nhất. 5\. Người dùng sử dụng thanh công cụ để tinh chỉnh điều kiện lọc: chọn khoảng thời gian cụ thể, chọn một phòng ban nhất định, hoặc nhắm vào một phòng họp mục tiêu. 6\. Hệ thống tiếp nhận điều kiện, thực hiện tính toán lại theo công thức nghiệp vụ quy định và cập nhật lại số liệu trên các thẻ KPI cũng như thứ tự sắp xếp trong bảng xếp hạng theo thời gian thực. |  |  |
| Alternative Flows: | **A1. Truy xuất danh sách cuộc họp vi phạm (Drill-down):** Tại bảng thống kê theo người tổ chức ở bước 4, người dùng nhấp chọn vào tên một nhân viên cụ thể. Hệ thống sẽ mở ra giao diện màn hình chi tiết, liệt kê toàn bộ danh sách các cuộc họp mà cá nhân này đã đặt nhưng để xảy ra tình trạng No-show (bao gồm thông tin: Tên cuộc họp, phòng họp bị lãng phí, khung giờ dự kiến ban đầu) để quản lý có bằng chứng xử lý kỷ luật. **A2. Xuất dữ liệu báo cáo vi phạm:** Người dùng nhấn nút "Xuất báo cáo" để tải toàn bộ danh sách các phòng ban hoặc cá nhân vi phạm kèm chỉ số No-show về máy tính dưới định dạng tệp bảng tính phục vụ cho kỳ đánh giá thi đua. |  |  |
| Exceptions: | **E1. Không phát sinh ca vi phạm nào:** Tại bước 6, nếu bộ lọc trả về kết quả công ty tuân thủ kỷ luật 100% (không có ca No-show nào), thẻ KPI số lượng sẽ hiển thị "0", thẻ Tỷ lệ hiển thị "0%" và hệ thống xuất hiện thông báo xanh: "Tuyệt vời\! Không ghi nhận trường hợp lãng phí phòng họp nào trong khoảng thời gian này."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Định nghĩa trạng thái No-show):** Một cuộc họp được hệ thống tự động dán nhãn là "No-show" khi khung giờ bắt đầu họp theo lịch đã trôi qua một khoảng thời gian quy định (Ví dụ: sau 15 phút tính từ giờ bắt đầu) nhưng hệ thống không nhận được bất kỳ thao tác xác nhận hiện diện (Check-in) nào tại phòng họp đó. **BR2 (Giới hạn phân quyền):** Người dùng có vai trò "Manager" chỉ xem được chỉ số No-show của các nhân viên thuộc phòng ban mình quản lý và danh sách các phòng họp thuộc chi nhánh của mình. Vai trò "Admin" được quyền xem và so sánh chéo chỉ số No-show của tất cả các cá nhân, phòng ban và phòng họp trên toàn bộ hệ thống tổng công ty. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Hệ thống có tính năng tự động quét trạng thái cuộc họp theo thời gian thực để dán nhãn "No-show" chính xác ngay khi hết thời gian chờ check-in quy định ngoài thực tế.  |  |  |

10. #### **UC-AA-10 Xem thống kê tỷ lệ tham dự đúng giờ** 

| UC ID and Name: | UC-AA-10 Xem thống kê tỷ lệ tham dự đúng giờ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Báo cáo & Thống kê" và chọn thẻ tính năng chuyên sâu "Phân tích tỷ lệ đúng giờ".  |  |  |
| Description: | Chức năng này cung cấp các chỉ số và biểu đồ trực quan giúp theo dõi tình hình tuân thủ thời gian của nhân sự khi tham gia các cuộc họp. Hệ thống tự động tính toán Tỷ lệ đúng giờ dựa trên dữ liệu điểm danh thực tế, hỗ trợ bộ lọc đa chiều theo phòng ban, theo từng cuộc họp cụ thể hoặc theo đích danh cá nhân nhân sự trong một khoảng thời gian được chọn. Đặc biệt, cấu trúc báo cáo hỗ trợ phân tích chuyên sâu nhằm phát hiện các mô hình/xu hướng (patterns) đi muộn lặp lại gắn liền với một phòng ban nhất định hoặc một khung giờ đặc thù trong ngày .  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager. \- Hệ thống đã lưu trữ đầy đủ dữ liệu lịch sử ghi nhận từ phân hệ điểm danh (Check-in) của các cuộc họp đã diễn ra trong kỳ báo cáo. |  |  |
| Postconditions: | \- Giao diện hiển thị trực quan các biểu đồ phân tích xu hướng và danh sách tỷ lệ đúng giờ đáp ứng chính xác tiêu chí lọc được yêu cầu. \- Thao tác tra cứu tuân thủ nguyên tắc chỉ đọc (Read-only), tuyệt đối không làm thay đổi hay ảnh hưởng đến bất kỳ dữ liệu gốc nào của hệ thống. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Phân tích tỷ lệ đúng giờ". 2\. Hệ thống mặc định tải dữ liệu thống kê tổng hợp của toàn doanh nghiệp trong khung thời gian "Tháng hiện tại". 3\. Hệ thống hiển thị thẻ KPI "Tỷ lệ đúng giờ trung bình" nổi bật ở góc trên, kèm theo biểu đồ xu hướng (Line chart) thể hiện biến động chỉ số tuân thủ thời gian qua các tuần. 4\. Ngay bên dưới biểu đồ xu hướng, hệ thống hiển thị hai khu vực phân tích mô hình vi phạm chuyên sâu (Pattern Analytics): **Phân bổ theo khung giờ:** Biểu đồ cột thể hiện tỷ lệ đi muộn phân tách theo các khung thời gian trong ngày (Ví dụ: 08:00 \- 09:00, 13:30 \- 14:30) để làm nổi bật mốc giờ có tỷ lệ vi phạm cao nhất. **Xếp hạng theo phòng ban:** Biểu đồ thanh ngang so sánh chéo tỷ lệ đi muộn giữa các bộ phận trong tổ chức để nhận diện phòng ban có thói quen đi muộn lặp lại. 5\. Người dùng sử dụng các bộ lọc trên thanh công cụ để khoanh vùng đối tượng phân tích: Chọn khoảng thời gian cụ thể, chọn một phòng ban mục tiêu, chọn một cuộc họp cụ thể hoặc nhập tên tìm kiếm một cá nhân nhân sự. 6\. Hệ thống tiếp nhận tổ hợp các điều kiện lọc, thực hiện tính toán lại số liệu và cập nhật trực quan toàn bộ các thẻ KPI, biểu đồ xu hướng và biểu đồ mô hình vi phạm trên màn hình theo thời gian thực. |  |  |
| Alternative Flows: | **A1. Truy xuất ngược danh sách vi phạm của cá nhân (Drill-down):** Tại biểu đồ hoặc bảng danh sách chi tiết nhân sự bên dưới, người dùng nhấp chọn tên một nhân viên cụ thể. Hệ thống chuyển hướng mở màn hình chi tiết lịch sử cá nhân, liệt kê rõ các cuộc họp mà cá nhân này đã tham gia muộn trong kỳ (bao gồm: Tên cuộc họp, Thời gian bắt đầu lịch gốc, Thời gian check-in thực tế, số phút đi muộn) để Quản lý có cơ sở đối chất và nhắc nhở trực tiếp. **A2. Xuất dữ liệu báo cáo:** Người dùng nhấn nút "Xuất dữ liệu" để tải toàn bộ bảng thống kê tỷ lệ đúng giờ và danh sách chi tiết các trường hợp đi muộn về máy dưới định dạng tệp bảng tính (.xlsx) phục vụ cho công tác đánh giá thi đua khen thưởng của phòng Nhân sự. |  |  |
| Exceptions: | **E1. Không có dữ liệu điểm danh phù hợp:** Tại bước 6, nếu bộ lọc trả về một khoảng thời gian hoặc một cá nhân không phát sinh bất kỳ lượt tham gia họp thực tế nào, hệ thống sẽ hiển thị các biểu đồ ở trạng thái rỗng kèm thông báo trực quan: "Không tìm thấy dữ liệu điểm danh hợp lệ cho các điều kiện lọc được chọn."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 (Quy chuẩn xác định đi muộn):** Hệ thống thực hiện đối chiếu thời gian thực (Timestamp) của hành động Check-in thực tế ngoài cửa phòng với thời gian bắt đầu cuộc họp chốt trên lịch điện tử. Chỉ cần thời gian check-in trễ từ 1 giây trở lên so với giờ bắt đầu gốc, hệ thống sẽ tự động dán nhãn phân đoạn tham dự đó là "Đi muộn". **BR2 (Phân quyền bảo mật dữ liệu):** Tài khoản với vai trò "Manager" chỉ được quyền xem biểu đồ xu hướng và mô hình đi muộn của các nhân sự thuộc phòng ban mình quản lý trực tiếp. Tài khoản với vai trò "Admin" sở hữu đặc quyền bao quát, được quyền khai thác, xem báo cáo tổng hợp và chi tiết của mọi phòng ban và nhân sự trên toàn hệ thống tổng công ty. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Toàn bộ nhân sự tham gia họp đều thực hiện quẹt thẻ hoặc quét mã check-in đầy đủ qua thiết bị thông minh tại phòng họp để đảm bảo tính khách quan và chính xác cho dữ liệu đầu vào.  |  |  |

11. #### **UC-AA-11 Xem nhật ký kiểm tra hệ thống (Audit Logs)** 

| UC ID and Name: | UC-AA-11 Xem nhật ký kiểm tra hệ thống (Audit Logs)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào phân hệ "Quản trị hệ thống" (hoặc "Cài đặt & Bảo mật") và chọn thẻ tính năng "Nhật ký kiểm tra (Audit Logs)".  |  |  |
| Description: | Chức năng này cung cấp một trung tâm giám sát an ninh và lưu vết mọi hoạt động (Audit Trail) đã diễn ra trên hệ thống phần mềm. Giao diện trình bày một danh sách chi tiết các sự kiện, được sắp xếp mặc định theo thứ tự thời gian giảm dần (hành động mới nhất hiển thị trên cùng). Mỗi dòng lịch sử cung cấp đầy đủ thông tin truy xuất nguồn gốc bao gồm: mốc thời gian thực hiện, định danh người thao tác, loại hành động (Ví dụ: Thêm mới, Cập nhật, Xóa bỏ, Đăng nhập, Xuất dữ liệu), đối tượng bị tác động (Ví dụ: Cuộc họp A, Phòng họp B), trạng thái kết quả (Thành công hay Thất bại) và địa chỉ IP của thiết bị thực hiện. Chức năng bắt buộc áp dụng cơ chế phân trang để đảm bảo tốc độ tải giao diện khi xử lý khối lượng lịch sử khổng lồ.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Admin hoặc Manager (được phân quyền rà soát nhật ký). \- Hệ thống có cơ chế chạy ngầm liên tục ghi nhận các sự kiện hành vi của người dùng vào kho lưu trữ Audit Log. |  |  |
| Postconditions: | \- Giao diện hiển thị danh sách nhật ký hành động chính xác, sắp xếp đúng trình tự và phân trang hợp lệ. \- Thao tác tra cứu là tuyệt đối chỉ đọc (Read-only), không cho phép bất kỳ hành vi chỉnh sửa hay xóa bỏ nào đối với dữ liệu nhật ký. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản trị hệ thống" và nhấp chọn mục "Nhật ký kiểm tra (Audit Logs)". 2\. Hệ thống truy xuất kho dữ liệu lịch sử và tải danh sách các sự kiện mới nhất. 3\. Hệ thống hiển thị danh sách lên giao diện lưới (Grid/Table) ở "Trang 1" (với số lượng mặc định từ 20 đến 50 bản ghi trên mỗi trang). Các cột thông tin hiển thị rõ ràng bao gồm: Thời gian (Timestamp), Người thực hiện, Hành động, Đối tượng tác động, Trạng thái, và Địa chỉ IP. 4\. Người dùng cuộn xuống cuối danh sách và sử dụng thanh điều hướng phân trang (Pagination) để chuyển sang xem các trang tiếp theo (Ví dụ: nhấn "Trang 2", "Trang 3", "Tiếp theo" hoặc "Đến trang cuối"). 5\. Hệ thống tiếp nhận lệnh chuyển trang, tải gói dữ liệu tương ứng của trang đó và làm mới lại danh sách trên màn hình mà không làm gián đoạn trải nghiệm. 6\. (Tùy chọn) Người dùng có thể nhấp vào biểu tượng xem chi tiết (View Details) trên một dòng sự kiện để xem toàn bộ chuỗi siêu dữ liệu (Metadata) liên quan đến hành động đó. |  |  |
| Alternative Flows: | **A1. Áp dụng bộ lọc tìm kiếm:** Để tìm kiếm nhanh, người dùng sử dụng thanh công cụ để lọc nhật ký theo các tiêu chí như: Nhập tên một "Người thực hiện" cụ thể, chọn "Loại hành động" (Ví dụ: chỉ xem các hành động Xóa \- Delete), lọc theo "Trạng thái" (Ví dụ: chỉ xem các hành động Thất bại \- Failure), hoặc lọc theo một khoảng thời gian. Hệ thống sẽ lập tức cập nhật lại danh sách và phân trang lại dựa trên kết quả lọc. **A2. Tùy chỉnh số lượng bản ghi hiển thị:** Người dùng nhấn vào menu thả xuống ở góc thanh phân trang để đổi số lượng bản ghi hiển thị trên mỗi trang (Ví dụ: đổi từ 20 thành 100 bản ghi/trang). Hệ thống tự động dàn xếp lại lưới dữ liệu và tính toán lại tổng số trang. |  |  |
| Exceptions: | **E1. Không có dữ liệu trong khoảng thời gian lọc:** Tại luồng A1, nếu tổ hợp bộ lọc không khớp với bất kỳ sự kiện nào trong kho lưu trữ, hệ thống hiển thị danh sách rỗng kèm thông báo: "Không tìm thấy nhật ký kiểm tra nào khớp với điều kiện tìm kiếm."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Tính bất biến của Audit Log):** Dữ liệu trong phân hệ Audit Log được bảo vệ theo nguyên tắc "Ghi một lần, Không bao giờ xóa" (WORM \- Write Once, Read Many). Không một tài khoản nào (kể cả Admin cấp cao nhất) có nút chức năng Xóa (Delete) hoặc Sửa (Edit) các bản ghi này trên giao diện. **BR2 (Lưu vết hành động đăng nhập):** Bất kỳ nỗ lực đăng nhập nào vào hệ thống, dù "Thành công" hay "Thất bại" (do sai email/mật khẩu), đều phải được hệ thống ghi nhận thành một dòng Audit Log độc lập kèm theo địa chỉ IP để phát hiện các hành vi tấn công dò mật khẩu. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

12. #### **UC-AA-12 Xuất báo cáo tổng hợp hoạt động cuộc họp** 

| UC ID and Name: | UC-AA-12 Xuất báo cáo tổng hợp hoạt động cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin, System Admin  | Secondary Actors: |  |
| Trigger: | Người dùng muốn trích xuất số liệu vận hành ngoại tuyến để phục vụ các cuộc họp ban giám đốc, lưu trữ hồ sơ doanh nghiệp hoặc gửi báo cáo định kỳ cho các bên liên quan, nên nhấn chọn chức năng "Xuất báo cáo tổng hợp".  |  |  |
| Description: | Chức năng này cho phép Admin và Manager xuất toàn bộ dữ liệu hoạt động cuộc họp trong một khoảng thời gian tự chọn ra tệp tin ngoại tuyến định dạng PDF hoặc Excel. Nội dung báo cáo được tổng hợp toàn diện bao gồm các chỉ số vĩ mô: tổng số lượng cuộc họp, phân bổ chi tiết theo từng trạng thái vận hành, tỷ lệ sử dụng phòng họp, tỷ lệ No-show, tỷ lệ điểm danh đúng giờ của nhân sự, đi kèm một bảng danh sách chi tiết tất cả các cuộc họp cấu thành nên số liệu báo cáo để phục vụ mục đích đối soát chuyên sâu.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập hệ thống thành công với vai trò Admin hoặc Manager. \- Hệ thống đã tích lũy và ghi nhận đầy đủ dữ liệu lịch sử về quá trình tổ chức cuộc họp, điểm danh nhân sự và hiệu suất sử dụng phòng họp trong kỳ báo cáo. |  |  |
| Postconditions: | \- Tệp báo cáo quy chuẩn định dạng PDF hoặc Excel được kết xuất thành công và tự động tải xuống thiết bị cá nhân của người dùng. \- Toàn bộ dữ liệu gốc lưu trữ trên hệ thống phần mềm được giữ nguyên vẹn, không bị xáo trộn hay thay đổi. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Báo cáo & Thống kê" và nhấp chọn mục "Xuất báo cáo tổng hợp hoạt động". 2\. Hệ thống hiển thị biểu mẫu cấu hình yêu cầu xuất báo cáo trên giao diện. 3\. Người dùng tiến hành thiết lập các tham số đầu vào cho báo cáo bao gồm: **Khoảng thời gian:** Chọn ngày bắt đầu và ngày kết thúc cần kết xuất dữ liệu. **Phạm vi dữ liệu:** Chọn xuất dữ liệu của toàn bộ công ty hoặc lọc theo một phòng ban/phòng họp cụ thể. **Định dạng tệp tin:** Nhấp chọn định dạng mong muốn là PDF hoặc Excel. 4\. Người dùng nhấn nút "Bắt đầu xuất báo cáo". 5\. Hệ thống tiếp nhận lệnh, kiểm tra tính hợp pháp của tài khoản và rà soát quyền hạn tiếp cận kho dữ liệu. 6\. Hệ thống thực hiện quét tập dữ liệu lịch sử, tính toán tổng hợp các chỉ số nghiệp vụ vĩ mô thỏa mãn điều kiện lọc. 7\. Hệ thống tự động biên dịch và dàn dựng cấu trúc tệp báo cáo theo biểu mẫu quy chuẩn bao gồm đầy đủ các phần mục: **Phần 1: Thông tin chung:** Tên doanh nghiệp/bộ phận, khoảng thời gian báo cáo, họ tên người trích xuất, ngày giờ lập báo cáo. **Phần 2: Thống kê chỉ số cốt lõi (KPI):** Tổng số cuộc họp được tạo, Tỷ lệ khai thác phòng họp, Tỷ lệ No-show tổng hợp, Tỷ lệ điểm danh đúng giờ của nhân sự. **Phần 3: Phân bổ theo trạng thái:** Bảng thống kê số lượng tuyệt đối và tỷ lệ phần trăm tương đối của các cuộc họp theo 4 trạng thái (Scheduled, Completed, Cancelled, No-show). **Phần 4: Bảng danh sách chi tiết:** Danh sách liệt kê toàn bộ các cuộc họp diễn ra trong kỳ (hiển thị rõ: Mã cuộc họp, Tiêu đề, Người tổ chức, Phòng họp, Khung thời gian, Trạng thái và Tỷ lệ thành viên tham gia). 8\. Hệ thống đóng gói dữ liệu thành tệp tin theo đúng định dạng yêu cầu, kích hoạt trình tải xuống tự động của trình duyệt để lưu tệp về máy tính người dùng, đồng thời đóng hộp thoại và hiển thị thông báo "Xuất báo cáo hoạt động thành công". |  |  |
| Alternative Flows: | **A1. Xuất định dạng Excel để xử lý dữ liệu thô:** Tại bước 3, người dùng lựa chọn định dạng tệp là Excel. Hệ thống sẽ thiết lập cấu hình dữ liệu đầu ra theo dạng bảng phẳng (Flat grid tables). Các cột số liệu được phân tách rõ ràng và tự động tích hợp sẵn tính năng bộ lọc nhanh (Filters) tại dòng tiêu đề, giúp người dùng sau khi tải về có thể tự do dùng các hàm văn phòng để lọc dữ liệu, tính toán toán học hoặc vẽ biểu đồ độc lập ngoài hệ thống.  |  |  |
| Exceptions: | **E1. Khoảng thời gian trống dữ liệu:** Tại bước 6, nếu hệ thống rà soát và nhận thấy khoảng thời gian người dùng thiết lập hoàn toàn không phát sinh bất kỳ hoạt động cuộc họp nào (mẫu số bằng 0), hệ thống sẽ chặn tiến trình xuất file, giữ nguyên giao diện cấu hình và hiển thị cảnh báo đỏ: "Không thể kết xuất báo cáo do không có dữ liệu hoạt động trong khoảng thời gian được chọn. Vui lòng thay đổi lại bộ lọc thời gian." **E2. Xử lý hàng đợi khi khối lượng dữ liệu quá lớn:** Tại bước 6, nếu người dùng chọn khoảng thời gian quá rộng (ví dụ: quét dữ liệu của 3 năm) khiến số lượng cuộc họp vượt quá ngưỡng xử lý tức thì của hệ thống, màn hình sẽ hiển thị thông báo: "Khối lượng dữ liệu quá lớn để tải về ngay. Hệ thống đang tiến hành xử lý ngầm, tệp báo cáo tổng hợp sẽ được gửi trực tiếp vào hòm thư email của bạn trong vòng 5 phút. Bạn có thể tắt cửa sổ này và tiếp tục thao tác các tính năng khác." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Nguyên tắc bảo mật phân tầng dữ liệu):** Tệp báo cáo xuất ra bắt buộc phải tuân thủ nghiêm ngặt phạm vi quản lý của Actor thực hiện. Nếu một Manager thuộc phòng Marketing xuất báo cáo, hệ thống chỉ tổng hợp số liệu các cuộc họp do phòng Marketing đứng tên tổ chức và chỉ số đúng giờ của riêng nhân sự thuộc phòng ban đó. Chỉ có tài khoản Role "Admin" hoặc Ban Giám đốc mới có đặc quyền xuất báo cáo tổng hợp chứa toàn bộ dữ liệu của tất cả các phòng ban trên toàn hệ thống tổng công ty. **BR2 (Đồng bộ thuật toán chỉ số):** Toàn bộ các công thức toán học cấu thành nên Tỷ lệ sử dụng phòng, tỷ lệ No-show, tỷ lệ đúng giờ trong tệp văn bản PDF/Excel xuất ra bắt buộc phải đồng bộ 100% với thuật toán đang chạy trên các màn hình Dashboard trực tuyến , tuyệt đối không để xảy ra sai lệch số liệu giữa hai môi trường trực tuyến và ngoại tuyến. **BR3 (Tính toàn vẹn của định dạng PDF):** Khi người dùng chọn định dạng PDF, tài liệu xuất ra sẽ mặc định khóa ở chế độ "Chỉ đọc" (Read-only) nhằm ngăn chặn hành vi chỉnh sửa thủ công bóp méo số liệu, đồng thời chân trang (Footer) sẽ được hệ thống tự động dán nhãn đánh dấu bản quyền an ninh thông tin. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 9\. Attendance & Presence Management

#### 

1. #### **UC-APM-01 Tạo bản ghi điểm danh thủ công** 

| UC ID and Name: | UC-APM-01 Tạo bản ghi điểm danh thủ công  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin  | Secondary Actors: |  |
| Trigger: | Một nhân sự thực tế đã đến và đang ngồi trong phòng họp nhưng thiết bị camera tại phòng không nhận diện được khuôn mặt, nhận diện sai, hoặc hạ tầng phần cứng gặp sự cố khiến hệ thống ghi nhận sai trạng thái thành "Chưa có mặt/Vắng mặt".  |  |  |
| Description: | Đây là tính năng dự phòng an toàn (Fail-safe) cốt lõi cho quy trình điểm danh tự động. Chức năng này cho phép người chủ trì cuộc họp hoặc cấp quản lý can thiệp trực tiếp vào danh sách khách mời trên phần mềm để xác nhận trạng thái "Có mặt" (Check-in) cho một hoặc nhiều nhân sự. Việc điểm danh thủ công giúp bảo vệ quyền lợi và chỉ số kỷ luật của nhân viên khi công nghệ gặp trục trặc, đồng thời dữ liệu này sẽ được hệ thống gắn nhãn phân loại riêng biệt để phục vụ công tác kiểm toán tính minh bạch sau này.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò là Người tổ chức cuộc họp (Host) hoặc Quản lý (Manager). \- Cuộc họp mục tiêu đang trong trạng thái "Đang diễn ra" (In Progress) hoặc "Đã hoàn tất" nhưng chưa vượt quá thời hạn khóa sổ điểm danh theo quy định của công ty. |  |  |
| Postconditions: | \- Trạng thái tham dự của nhân sự mục tiêu được cập nhật thành "Có mặt". \- Nhật ký hệ thống (Audit Log) ghi nhận rõ mốc thời gian thực hiện thao tác thủ công, định danh người đã nhấn xác nhận và lý do can thiệp. |  |  |
| Normal Flow: | 1\. Người tổ chức/Quản lý truy cập vào chi tiết cuộc họp đang diễn ra và mở thẻ "Danh sách điểm danh" (Attendance List). 2\. Hệ thống hiển thị danh sách toàn bộ khách mời cùng trạng thái nhận diện tự động hiện tại (Ví dụ: "Đã có mặt", "Chưa có mặt"). 3\. Người tổ chức tìm kiếm tên của nhân sự đang ngồi trong phòng nhưng hệ thống báo "Chưa có mặt". 4\. Người tổ chức nhấn chọn nút chức năng "Điểm danh thủ công" (hoặc biểu tượng Check-in) nằm ngay cạnh tên của nhân sự đó. 5\. Hệ thống hiển thị một hộp thoại nhỏ yêu cầu xác nhận thao tác, cung cấp một ô nhập liệu để người tổ chức ghi nhanh lý do can thiệp (Ví dụ: "Camera bị khuất góc", "Hệ thống lỗi mạng"). 6\. Người tổ chức nhập lý do và nhấn nút "Xác nhận". 7\. Hệ thống cập nhật trạng thái của nhân sự đó thành "Có mặt", đồng thời lấy mốc thời gian thao tác hiện tại làm mốc "Giờ đến" (Check-in time). 8\. Hệ thống tự động gắn thêm một nhãn dán trực quan "Xác nhận thủ công" (Manual) bên cạnh tên của nhân sự để phân biệt với những người được camera nhận diện tự động, sau đó làm mới lại giao diện danh sách. |  |  |
| Alternative Flows: | **A1. Tùy chỉnh mốc thời gian thực tế:** Tại bước 5, nếu nhân sự đã đến đúng giờ từ lâu nhưng một lúc sau Người tổ chức mới rảnh tay để thao tác điểm danh bù, hệ thống cho phép Người tổ chức chỉnh sửa lại mốc "Giờ đến" lùi về quá khứ cho khớp với thực tế, thay vì bắt buộc phải lấy mốc giờ hiện tại của hệ thống nhằm tránh việc nhân sự bị hệ thống đánh lỗi "Đi muộn" một cách oan uổng.  |  |  |
| Exceptions: | **E1. Khóa sổ dữ liệu (Data Freeze):** Nếu Người tổ chức cố gắng thực hiện việc điểm danh bù khi cuộc họp đã kết thúc và trôi qua quá 24 giờ (hoặc mốc thời gian khóa sổ do Admin cấu hình), hệ thống sẽ làm mờ (Disable) toàn bộ các nút thao tác và hiển thị cảnh báo: "Đã quá thời hạn cho phép cập nhật điểm danh. Dữ liệu đã được khóa sổ. Vui lòng liên hệ Admin nếu có sai sót nghiêm trọng."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1 :** Nhằm ngăn chặn tuyệt đối rủi ro gian lận (nhân viên ngồi ở nhà nhưng tự bấm check-in có mặt), các tài khoản đóng vai trò là "Khách mời" (Participant) tuyệt đối không được nhìn thấy nút chức năng này. Việc xác nhận thủ công bắt buộc phải do một bên thứ ba có thẩm quyền (Người tổ chức hoặc Quản lý trực tiếp tại phòng) làm chứng và thực hiện. **BR2 :** Mọi bản ghi điểm danh thủ công phải được lưu vết rõ ràng. Trong các báo cáo xuất ra từ phân hệ Analytics, các lượt check-in này bắt buộc phải hiển thị kèm thông tin "Xác nhận bởi: \[Tên người tổ chức\]" thay vì để trống như các lượt nhận diện tự động bằng Camera. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Người tổ chức (Host) đảm bảo tính trung thực và khách quan khi thực hiện thao tác điểm danh thủ công, không tiếp tay cho các hành vi bao che đi muộn, về sớm của đồng nghiệp.  |  |  |

2. #### **UC-APM-02 Xem danh sách điểm danh của cuộc họp** 

| UC ID and Name: | UC-APM-02 Xem danh sách điểm danh của cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng truy cập vào trang chi tiết của một cuộc họp đang diễn ra hoặc đã kết thúc và nhấp chọn thẻ tính năng "Danh sách điểm danh" (Attendance List).  |  |  |
| Description: | Chức năng này cung cấp một giao diện trực quan cho phép người dùng theo dõi tình hình hiện diện thực tế của toàn bộ khách mời có trong danh sách thư mời. Hệ thống trình bày một bảng dữ liệu chi tiết bao gồm: họ tên và chức danh của người tham dự, trạng thái điểm danh hiện tại, mốc thời gian check-in chính xác, và trường thông tin "Nguồn điểm danh" nhằm minh bạch hóa phương thức ghi nhận (Ví dụ: Nhận diện qua Camera AI, Cảm biến cửa, hay do Host xác nhận thủ công). Chức năng này giúp người chủ trì dễ dàng kiểm soát số lượng người tham gia để quyết định bắt đầu cuộc họp, đồng thời cung cấp bằng chứng minh bạch cho công tác đối soát nhân sự.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Người dùng có quyền truy cập vào cuộc họp (là người tổ chức, khách mời có trong danh sách, hoặc cấp quản lý trực tiếp). \- Cuộc họp đã chính thức bắt đầu (đến giờ) hoặc đã kết thúc. |  |  |
| Postconditions: | \- Giao diện hiển thị danh sách điểm danh chính xác, phản ánh đúng thực tế ghi nhận của hệ thống tại thời điểm tra cứu. \- Thao tác hoàn toàn là chỉ đọc (Read-only), không làm xáo trộn hay thay đổi bất kỳ dữ liệu gốc nào. |  |  |
| Normal Flow: | 1\. Người dùng mở phần mềm, điều hướng đến phân hệ lịch họp cá nhân và chọn nhấp vào một cuộc họp mục tiêu. 2\. Tại màn hình chi tiết cuộc họp, người dùng chọn chuyển sang thẻ (tab) "Điểm danh". 3\. Hệ thống tiếp nhận yêu cầu, truy xuất kho dữ liệu hiện diện mới nhất từ máy chủ và tiến hành tải giao diện. 4\. Màn hình hiển thị danh sách khách mời dưới dạng lưới (Grid) hoặc danh sách cuộn dọc, mỗi dòng tương ứng với một nhân sự bao gồm các cột thông tin: **Thông tin cá nhân:** Ảnh đại diện (Avatar), Họ và tên, Phòng ban. **Trạng thái:** Tình trạng hiện diện (Ví dụ: Có mặt, Vắng mặt, Đến muộn). **Thời gian Check-in:** Mốc giờ, phút, giây cụ thể hệ thống ghi nhận được sự có mặt của nhân sự đó. **Nguồn điểm danh:** Chỉ báo phương thức ghi nhận (Ví dụ: "Hệ thống Camera phòng VIP 1", hoặc "Xác nhận thủ công bởi Host"). 5\. Người dùng có thể sử dụng thanh tìm kiếm nhanh để gõ tên một đồng nghiệp, hoặc dùng các thẻ lọc (Filter) bên trên để chỉ hiển thị nhóm người "Chưa có mặt" nhằm mục đích hối thúc, nhắc nhở. 6\. Người dùng xem xong thông tin và có thể đóng giao diện hoặc chuyển sang tính năng khác. |  |  |
| Alternative Flows: | **A1. Cập nhật dữ liệu theo thời gian thực (Real-time tracking):** Nếu người dùng đang mở thẻ "Danh sách điểm danh" trong lúc cuộc họp đang diễn ra. Bất cứ khi nào có một nhân sự mới bước vào phòng và được Camera nhận diện thành công, hệ thống sẽ tự động cập nhật (Push update) trạng thái của nhân sự đó từ "Vắng mặt" sang "Có mặt" ngay trên màn hình mà không yêu cầu người dùng phải tự tải lại trang (F5).  |  |  |
| Exceptions: | **E1. Chưa đến thời gian mở điểm danh:** Nếu người dùng cố tình truy cập vào danh sách điểm danh của một cuộc họp diễn ra trong tương lai (Ví dụ: cuộc họp của ngày mai), hệ thống sẽ vô hiệu hóa thẻ này hoặc hiển thị thông báo: "Danh sách điểm danh sẽ được mở khi cuộc họp chính thức bắt đầu. Vui lòng quay lại sau."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1:** Nhằm tránh những thắc mắc hoặc so bì không cần thiết giữa các nhân sự thông thường, cột thông tin "Nguồn điểm danh" chỉ hiển thị đối với tài khoản có vai trò Người tổ chức (Host), Quản lý (Manager) hoặc Admin. Tài khoản Khách mời (Participant) thông thường chỉ xem được trạng thái "Có mặt/Vắng mặt" của bản thân và người khác. **BR2 :** Hệ thống tự động phân tích mốc thời gian Check-in để dán nhãn trạng thái: Có mặt (Đúng giờ): Check-in trước hoặc đúng bằng mốc thời gian bắt đầu cuộc họp. Đến muộn: Check-in trễ hơn mốc thời gian bắt đầu (tính đến cấp độ giây). Vắng mặt: Ô thời gian Check-in bị trống, hiển thị gạch ngang (-). |  |  |
| Other Information: | Giao diện nên áp dụng triết lý màu sắc tín hiệu (Color Coding) để hỗ trợ phản xạ thị giác nhanh: Trạng thái "Có mặt" đi kèm chấm tròn màu Xanh lá, "Đến muộn" màu Cam, và "Vắng mặt" bôi màu Đỏ. Phần trên cùng của danh sách nên có một thanh tiến trình (Progress Bar) tổng hợp trực quan như "Đã điểm danh: 15/20 người (75%)".  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-APM-03 Tạo bản ghi điểm danh bằng camera điểm danh ở cửa** 

| UC ID and Name: | UC-APM-03 Tạo bản ghi điểm danh bằng camera điểm danh ở cửa  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Thiết bị Camera  |
| Trigger: | Nhân sự di chuyển vào tầm quét của Camera AI được lắp đặt tại cửa phòng họp trong khung thời gian cho phép điểm danh của một cuộc họp  |  |  |
| Description: | Đây là luồng nghiệp vụ tự động 100% ứng dụng công nghệ nhận diện khuôn mặt (Facial Recognition). Khi khách mời tiến đến cửa phòng họp, thiết bị Camera sẽ quét, trích xuất đặc điểm sinh trắc học và gửi về hệ thống trung tâm để đối chiếu với kho dữ liệu nhân sự. Nếu phát hiện sự trùng khớp hợp lệ với một cá nhân nằm trong danh sách khách mời của cuộc họp đang diễn ra tại phòng đó, hệ thống lập tức khởi tạo bản ghi điểm danh, tự động đánh dấu "Có mặt" và chốt mốc thời gian thực tế để làm cơ sở phân tích kỷ luật đúng giờ. Quy trình này diễn ra trong tích tắc, giúp người dùng không cần thao tác quẹt thẻ hay bấm điện thoại.  |  |  |
| Preconditions: | \- Nhân sự đã cập nhật dữ liệu khuôn mặt (Face ID) hợp lệ trên hồ sơ cá nhân của doanh nghiệp. \- Thiết bị Camera tại cửa phòng họp đang hoạt động ổn định và duy trì kết nối mạng với hệ thống phần mềm trung tâm. \- Cuộc họp tại không gian đó đã được kích hoạt trạng thái "Mở điểm danh". |  |  |
| Postconditions: | \- Bản ghi điểm danh của nhân sự được hệ thống tạo mới và xác nhận thành công. \- Trạng thái "Có mặt" của nhân sự được đồng bộ trực tiếp lên giao diện danh sách điểm danh  cho Người tổ chức và Quản lý theo dõi. |  |  |
| Normal Flow: | 1\. Nhân sự di chuyển đến khu vực cửa phòng họp, bước vào vùng không gian nhận diện của Camera AI. 2\. Camera bắt nét khuôn mặt, mã hóa hình ảnh thành luồng dữ liệu sinh trắc và đẩy về hệ thống xử lý trung tâm. 3\. Hệ thống đối chiếu luồng dữ liệu này với kho hồ sơ nhân sự để định danh chính xác (Ví dụ: Nhận diện thành công đây là nhân viên Nguyễn Văn A). 4\. Hệ thống kiểm tra lịch trình của phòng họp vật lý tương ứng, trích xuất danh sách khách mời chính thức của cuộc họp đang/sắp diễn ra. 5\. Hệ thống thực hiện rà soát chéo. Khi xác nhận nhân sự vừa định danh đúng là người có tên trong danh sách mời họp, hệ thống tự động khởi tạo lệnh điểm danh. 6\. Hệ thống đánh dấu trạng thái "Có mặt" cho nhân sự này, đồng thời lấy mốc thời gian hệ thống tại thời điểm đó làm "Giờ Check-in" và dán nhãn nguồn ghi nhận là "Camera tại cửa". 7\. Thiết bị phần cứng tại cửa (loa hoặc màn hình phụ) phát tín hiệu phản hồi xác nhận thành công (Ví dụ: Sáng đèn xanh lá, phát âm thanh "Ting" hoặc hiển thị "Xin chào, check-in thành công"). 8\. Hệ thống kết thúc tiến trình và tiếp tục trạng thái quét liên tục cho những người tiếp theo. |  |  |
| Alternative Flows: | **A1. Nhận diện nhiều người cùng lúc (Multi-face Tracking):** Tại bước 1, nếu có một nhóm 2-3 người cùng đi lướt qua cửa, thuật toán AI của Camera sẽ bóc tách từng khuôn mặt độc lập. Hệ thống sẽ tạo nhiều luồng xử lý song song, lặp lại từ bước 3 đến bước 7 cho từng cá nhân cùng một lúc để không gây tắc nghẽn ở cửa phòng. **A2. Chế độ ngoại tuyến tạm thời (Offline Caching):** Nếu kết nối mạng giữa Camera và Server trung tâm bị đứt tạm thời, thiết bị Camera sẽ tự động chuyển sang chế độ ngoại tuyến, lưu đệm (cache) hình ảnh khuôn mặt và mốc thời gian đóng gói. Ngay khi mạng khôi phục, thiết bị sẽ tự đẩy gói dữ liệu này lên hệ thống để đối chiếu định danh và tính đúng mốc giờ check-in thực tế trong quá khứ, đảm bảo không ai bị tính là đi muộn do lỗi mạng. |  |  |
| Exceptions: | **E1. Nhân sự không có tên trong danh sách họp:** Tại bước 5, nếu hệ thống nhận diện thành công nhân sự B, nhưng người này thuộc phòng ban khác, đi ngang qua hoặc vào nhầm phòng. Hệ thống sẽ không tạo bản ghi điểm danh. **E2. Khuôn mặt bị che khuất hoặc chưa đăng ký:** Tại bước 3, nếu người bước vào là đối tác bên ngoài (chưa đăng ký khuôn mặt) hoặc nhân viên đeo khẩu trang, đội mũ che kín mặt khiến Camera không thể trích xuất đặc điểm. Hệ thống từ chối định danh và đưa ra thông báo: "Không thể nhận diện, vui lòng tháo khẩu trang hoặc nhờ Host hỗ trợ." (Lúc này Host sẽ sử dụng UC-APM-01 để check-in bù). |  |  |
| Priority: | Very High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Thuật toán Camera bắt buộc phải kích hoạt tính năng phát hiện thực thể sống (Liveness Detection) trước khi định danh nhằm ngăn chặn hành vi sử dụng ảnh in trên giấy, ảnh trên điện thoại hoặc video để lừa camera điểm danh hộ người khác. **BR2 :** Hành vi của người dùng là có thể đi ra đi vào cửa phòng họp nhiều lần (đi lấy nước, nghe điện thoại). Hệ thống được cấu hình chỉ chấp nhận tạo bản ghi check-in cho lần nhận diện hợp lệ **đầu tiên** (First in). Các lần nhận diện sau đó trong cùng một khung giờ họp chỉ được ghi nhận ngầm là log hiện diện (Presence log), tuyệt đối không sinh ra các bản ghi điểm danh mới gây nhiễu dữ liệu trạng thái. **BR3 :** Hệ thống chỉ chấp nhận kích hoạt luồng điểm danh nếu nhân sự bước vào phòng trong khoảng thời gian cho phép (Ví dụ: 10 phút trước giờ họp). Nếu nhân sự đến trước 2 tiếng đồng hồ, hệ thống nhận diện ra người đó nhưng sẽ bỏ qua vì chưa đến phiên làm việc của cuộc họp. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-APM-04 Tạo sự kiện vào phòng bằng IP Camera góc phòng** 

| UC ID and Name: | UC-APM-04 Tạo sự kiện vào phòng bằng IP Camera góc phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Camera |
| Trigger: | Thuật toán phân tích hình ảnh từ hệ thống 2 IP Camera lắp đặt tại các góc phòng phát hiện sự xuất hiện và hiện diện của người tham dự bên trong không gian phòng họp.  |  |  |
| Description: | Khác với việc điểm danh tại cửa chỉ ghi nhận khoảnh khắc bước vào, chức năng này sử dụng mạng lưới 2 IP Camera góc để giám sát không gian toàn cảnh bên trong phòng. Khi nhân sự tiến vào và chọn chỗ ngồi, hệ thống sẽ phân tích luồng video, nhận diện khuôn mặt hoặc hình dáng để xác nhận sự hiện diện thực tế. Ngay sau khi định danh thành công, hệ thống tự động khởi tạo một sự kiện "Vào phòng" (Entry Event). Sự kiện này đóng vai trò củng cố dữ liệu điểm danh, cung cấp mốc thời gian nhân sự bắt đầu tham gia cuộc họp thực tế và làm cơ sở để đo lường tỷ lệ lấp đầy của phòng.  |  |  |
| Preconditions: | \- Phòng họp đã được trang bị hệ thống tối thiểu 2 IP Camera góc có khả năng quan sát bao quát không gian. \- Các camera đang hoạt động bình thường, duy trì kết nối mạng ổn định với máy chủ xử lý hình ảnh trung tâm. \- Cuộc họp tại không gian đó đã được kích hoạt trạng thái cho phép ghi nhận hiện diện. |  |  |
| Postconditions: | \- Một sự kiện "Vào phòng" (Entry Event) gắn liền với định danh của nhân sự được hệ thống tạo mới và lưu vết thành công. \- Trạng thái hiện diện của nhân sự được cập nhật trên giao diện quản lý (Ví dụ: Chuyển từ "Đang ở ngoài" sang "Đang trong phòng"). |  |  |
| Normal Flow: | 1\. Nhân sự di chuyển qua khu vực cửa và bước hẳn vào không gian chung của phòng họp, tiến đến các vị trí ghế ngồi. 2\. Hệ thống 2 IP Camera góc phòng liên tục quét và thu thập luồng hình ảnh toàn cảnh không gian dưới các góc độ khác nhau. 3\. Thuật toán phân tích thị giác máy tính (Computer Vision) phát hiện thực thể người xuất hiện trong khung hình và tiến hành trích xuất đặc điểm sinh trắc học (khuôn mặt/vóc dáng). 4\. Hệ thống xử lý trung tâm tiếp nhận luồng dữ liệu song song từ 2 camera, thực hiện đối chiếu chéo để tăng độ chính xác và loại bỏ các góc khuất ảo. 5\. Hệ thống đối chiếu dữ liệu đặc điểm vừa trích xuất với kho hồ sơ định danh nhân sự của tổ chức. 6\. Khi xác định được danh tính nhân sự (Ví dụ: Nhân viên C), hệ thống kiểm tra đối soát với danh sách khách mời của cuộc họp đang diễn ra. 7\. Hệ thống chính thức khởi tạo một sự kiện "Vào phòng" cho nhân viên C, đánh dấu mốc thời gian hệ thống tại thời điểm đó làm "Giờ vào phòng" (Entry time). 8\. Hệ thống kết thúc luồng xử lý cho nhân sự đó và tiếp tục giám sát các thực thể khác trong phòng. |  |  |
| Alternative Flows: | **A1. Bổ trợ điểm danh cho Camera cửa:** Trong trường hợp nhân sự đi vào phòng quá nhanh hoặc bị che khuất khiến Camera điểm danh tại cửa bị lỡ nhịp không nhận diện được, sự kiện "Vào phòng" sinh ra từ các IP Camera góc này sẽ đóng vai trò như một luồng điểm danh dự phòng tự động. Hệ thống sẽ sử dụng mốc thời gian của sự kiện "Vào phòng" này để ghi nhận trạng thái "Có mặt" cho nhân sự mà không cần người chủ trì phải điểm danh thủ công. **A2. Xử lý khi chỉ 1 Camera nhận diện được:** Tại bước 4, nếu nhân sự quay lưng lại với Camera 1 nhưng lại quay mặt về phía Camera 2, hệ thống vẫn chấp nhận luồng dữ liệu đơn lẻ từ Camera 2 để tiến hành định danh và tạo sự kiện bình thường, đảm bảo tính liên tục của hệ thống. |  |  |
| Exceptions: | **E1. Nhân sự không thuộc công ty (Khách vãng lai/Đối tác):** Tại bước 5, nếu thuật toán phân tích hình ảnh phát hiện một người trong phòng nhưng không thể định danh được với bất kỳ hồ sơ nào trong hệ thống (Unregistered User). Hệ thống sẽ tạo một sự kiện "Vào phòng ẩn danh" (Anonymous Entry Event) để phục vụ việc đếm số lượng người thực tế trong phòng (headcount), nhưng không cập nhật trạng thái điểm danh cho bất kỳ ai.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên |  |  |
| Business Rules: | **BR1 :** Do sử dụng 2 camera với góc nhìn đan chéo, một người có thể xuất hiện đồng thời trên cả 2 khung hình. Hệ thống bắt buộc phải áp dụng thuật toán lọc trùng lặp (Deduplication) theo thời gian thực để đảm bảo chỉ tạo ra **duy nhất một** sự kiện "Vào phòng" cho người đó tại một mốc thời gian, tránh việc ghi nhận sai lệch số lượng người. **BR2:** Luồng video thô (Raw video) từ IP Camera chỉ được sử dụng trong bộ nhớ tạm để phục vụ thuật toán trích xuất đặc điểm (metadata). Hệ thống tuyệt đối không lưu trữ các đoạn video giám sát này vào kho tài liệu của cuộc họp nếu không có cấu hình kích hoạt tính năng "Ghi hình an ninh" từ Quản trị viên, nhằm đảm bảo quyền riêng tư cho người tham gia họp. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-APM-05 Tạo sự kiện rời phòng bằng IP Camera góc phòng** 

| UC ID and Name: | UC-APM-05 Tạo sự kiện rời phòng bằng IP Camera góc phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Camera |
| Trigger: | Thuật toán phân tích hình ảnh từ hệ thống 2 IP Camera lắp đặt tại các góc phòng phát hiện một nhân sự (đã được định danh trước đó) không còn xuất hiện trong không gian phòng họp, hoặc di chuyển hướng ra phía cửa và bước hẳn ra ngoài khung hình giám sát.  |  |  |
| Description: | Chức năng này chạy ngầm hoàn toàn tự động dựa trên công nghệ thị giác máy tính (Computer Vision) từ 2 IP Camera góc phòng. Khi cuộc họp kết thúc hoặc khi một nhân sự chủ động rời phòng sớm, hệ thống sẽ phân tích biến động hình ảnh, nhận diện sự vắng mặt của đối tượng và tự động khởi tạo một sự kiện "Rời phòng" (Exit/Check-out Event). Việc ghi nhận mốc thời gian rời phòng thực tế giúp hệ thống đo lường chính xác thời lượng tham gia họp thực tế của nhân viên (phát hiện hành vi về sớm) và hỗ trợ tính toán thời lượng khai thác phòng thực tế cho phân hệ phân tích (Analytics).  |  |  |
| Preconditions: | \- Nhân sự mục tiêu trước đó đã được hệ thống ghi nhận sự kiện "Vào phòng"  hoặc được điểm danh thành công ở trạng thái "Có mặt". \- Hệ thống 2 IP Camera góc phòng hoạt động ổn định và duy trì kết nối mạng liên tục với máy chủ phân tích trung tâm. |  |  |
| Postconditions: | \- Một sự kiện "Rời phòng" (Exit Event) gắn liền với định danh của nhân sự được khởi tạo và lưu vết thành công. \- Mốc thời gian rời phòng thực tế được chốt làm "Giờ Check-out" chính thức của nhân sự trong cuộc họp đó. \- Trạng thái hiện diện của nhân sự được đồng bộ cập nhật trên giao diện theo dõi của Người tổ chức (Ví dụ: hiển thị trạng thái "Đã rời phòng"). |  |  |
| Normal Flow: | 1\. Nhân sự đứng dậy, di chuyển ra khỏi vị trí ghế ngồi và bước hẳn ra ngoài ranh giới không gian phòng họp. 2\. Luồng video từ 2 IP Camera góc liên tục phân tích biến động hình ảnh toàn cảnh và phát hiện sự thay đổi thực thể trong phòng. 3\. Thuật toán thị giác máy tính rà soát danh sách các nhân sự đang hiện diện tại phòng, nhận diện đối tượng vừa di chuyển khuất khỏi tầm quét dựa trên đặc điểm hình dáng và khuôn mặt tại vùng cửa ra vào. 4\. Hệ thống xử lý trung tâm thực hiện đối chiếu dữ liệu song song từ 2 góc camera để xác nhận đối tượng đã thực sự ra khỏi phòng (loại trừ trường hợp nhân sự chỉ chuyển sang điểm mù của một camera). 5\. Hệ thống định danh chính xác nhân sự vừa rời đi (Ví dụ: Nhân viên C). 6\. Hệ thống chính thức khởi tạo một sự kiện "Rời phòng" cho nhân viên C, chốt mốc thời gian thực tế tại thời điểm đó làm "Giờ Check-out". 7\. Hệ thống cập nhật trạng thái của nhân viên C trên giao diện hiển thị "Danh sách điểm danh" thành "Đã rời phòng" và dán nhãn nguồn ghi nhận là "Camera góc phòng". |  |  |
| Alternative Flows: | **A1. Cả phòng cùng rời đi khi kết thúc cuộc họp:** Khi cuộc họp khép lại, toàn bộ thành viên cùng đứng dậy ra về. Hệ thống camera góc phòng sẽ tự động bóc tách luồng chuyển động của đám đông, nhận diện và tạo hàng loạt sự kiện "Rời phòng" song song cho từng nhân sự một cách tuần tự theo mốc thời gian thực tế họ bước qua cửa, đảm bảo không bị nghẽn hay sót bản ghi check-out của bất kỳ ai.  |  |  |
| Exceptions: | **E1. Nhân sự rời phòng tạm thời (Ra ngoài có việc riêng):** Tại bước 1, nếu nhân sự chỉ tạm thời ra ngoài nghe điện thoại hoặc lấy tài liệu trong vài phút rồi quay lại, hệ thống vẫn sinh ra sự kiện rời phòng. Tuy nhiên, hệ thống sẽ áp dụng khoảng thời gian chờ dung sai (Buffer time) theo Quy tắc nghiệp vụ để xác định xem có chốt giờ check-out chính thức hay không .  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1 :** Sự kiện rời phòng chỉ được kích hoạt khi thuật toán từ hệ thống camera góc xác nhận thực thể không còn tồn tại ở vị trí ngồi và đã đi qua vùng biên giới cửa. Nếu một nhân sự chỉ di chuyển đến khu vực góc khuất của Camera 1 nhưng vẫn nằm trong tầm quan sát của Camera 2, hệ thống tuyệt đối không được sinh sự kiện rời phòng. **BR2 :** Nhằm tránh việc sinh chuỗi dữ liệu rác khi nhân viên ra vào phòng nhiều lần, hệ thống áp dụng biên độ chờ là 5 phút. Nếu nhân sự quay lại phòng trong vòng 5 phút (hệ thống ghi nhận sự kiện Vào phòng mới), mốc rời phòng trước đó sẽ bị coi là tạm thời và không tính vào thời gian về sớm. Nếu quá 5 phút nhân sự không quay lại, sự kiện rời phòng đầu tiên sẽ chính thức được chốt làm mốc thời gian kết thúc tham dự. **BR3 :** Nếu cuộc họp đã kết thúc (Người tổ chức bấm nút Kết thúc họp trên ứng dụng hoặc hết giờ lịch gốc) nhưng camera góc phòng vẫn quét thấy một vài nhân sự nán lại nói chuyện riêng trong phòng, hệ thống sẽ tự động sử dụng mốc thời gian kết thúc cuộc họp chính thức để làm mốc giờ rời phòng đại diện cho các nhân sự đó, tránh việc ghi nhận sai lệch thời lượng họp thực tế vào báo cáo. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-APM-06 Phát hiện khuôn mặt lạ trong quá trình điểm danh** 

| UC ID and Name: | UC-APM-06 Phát hiện khuôn mặt lạ trong quá trình điểm danh  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Camera |
| Trigger: | Thuật toán Camera phân tích hình ảnh (từ Camera cửa hoặc Camera góc phòng) trích xuất được đặc điểm sinh trắc học của một khuôn mặt nhưng không thể tìm thấy dữ liệu đối chiếu trùng khớp trong hệ thống, hoặc định danh được nhưng người này không có tên trong danh sách thư mời của cuộc họp.  |  |  |
| Description: | Tính năng này đóng vai trò như một lớp lá chắn an ninh mạng vật lý (Physical Security Shield) cho các cuộc họp nội bộ. Khi quét không gian, nếu hệ thống phát hiện một thực thể người tham dự rơi vào nhóm "Người vãng lai" (chưa từng đăng ký hồ sơ khuôn mặt như đối tác khách hàng) hoặc "Người không có thẩm quyền" (nhân sự công ty nhưng đi nhầm phòng/không được mời), hệ thống sẽ lập tức tạo ra một sự kiện cảnh báo "Khuôn mặt lạ". Tính năng này giúp bảo mật thông tin các cuộc họp quan trọng, đồng thời cung cấp công cụ để Người chủ trì (Host) chủ động kiểm duyệt, cấp quyền truy cập ngoại lệ cho đối tác hoặc yêu cầu người không liên quan rời khỏi phòng.  |  |  |
| Preconditions: | \- Cuộc họp đã được kích hoạt trạng thái mở điểm danh hoặc đang trong quá trình diễn ra. \- Hệ thống Camera AI đang hoạt động bình thường và duy trì kết nối với máy chủ định danh trung tâm. \- Cuộc họp được cấu hình ở mức "Bảo mật" hoặc "Chỉ người có giấy mời mới được tham gia". |  |  |
| Postconditions: | \- Một sự kiện cảnh báo "Khuôn mặt lạ" được ghi nhận ngầm vào nhật ký hệ thống. \- Thông báo cảnh báo được đẩy (Push Notification) đến thiết bị của Người chủ trì cuộc họp. \- Dữ liệu điểm danh của các nhân sự hợp lệ khác không bị ảnh hưởng. |  |  |
| Normal Flow: | 1\. Một thực thể (người) bước vào vùng nhận diện của hệ thống Camera AI tại phòng họp. 2\. Camera bắt nét khuôn mặt, mã hóa thành luồng dữ liệu sinh trắc và đẩy về hệ thống xử lý trung tâm. 3\. Hệ thống đối chiếu dữ liệu với kho hồ sơ nhân sự của toàn doanh nghiệp và danh sách khách mời của cuộc họp hiện tại. 4\. Hệ thống phát hiện sự bất thường ở một trong hai trường hợp: (A) Dữ liệu hoàn toàn mới, không khớp với bất kỳ ai trong công ty (Đối tác ngoài). (B) Định danh được nhân sự (Ví dụ: Nhân viên D), nhưng rà soát thấy D không nằm trong danh sách khách mời. 5\. Hệ thống kích hoạt trạng thái từ chối điểm danh tự động cho đối tượng này. 6\. Hệ thống tạo một sự kiện "Phát hiện khuôn mặt lạ" (Unknown/Unauthorized Face). 7\. Màn hình phụ tại cửa (nếu có) hiển thị thông báo trực quan bảo vệ quyền riêng tư (Ví dụ: "Không tìm thấy dữ liệu điểm danh hợp lệ"). 8\. Hệ thống lập tức gửi một thông báo cảnh báo ngầm (Silent Alert) đến giao diện phần mềm của Người chủ trì (Host) đang điều hành cuộc họp với nội dung: "Phát hiện có người ngoài danh sách tham dự", kèm theo hình ảnh khuôn mặt vừa được cắt cúp để Host nhận diện. 9\. Hệ thống lưu sự kiện cảnh báo này vào Nhật ký an ninh (Security Audit Log). |  |  |
| Alternative Flows: | **A1. Host phê duyệt ngoại lệ (Guest Approval):** Tại bước 8, sau khi nhận được cảnh báo, Host nhận ra đó là một đối tác khách hàng đến họp cùng hoặc một nhân sự cấp dưới được cử đi thay thế (Delegated). Host thao tác trên màn hình cảnh báo, nhấn nút "Phê duyệt tham gia". Hệ thống sẽ tự động khởi tạo một bản ghi điểm danh tạm thời với tư cách "Khách mời vãng lai" (Guest) cho đối tượng đó và cập nhật vào danh sách điểm danh chung để thuận tiện cho việc đo lường số lượng thực tế.  |  |  |
| Exceptions: | **E1. Khuôn mặt bị che lấp quá mức (Low Confidence Rate):** Tại bước 2, nếu người đi vào mang khẩu trang y tế che kín mũi miệng, đội mũ sụp và đeo kính đen, khiến thuật toán Camera không trích xuất đủ số điểm đặc trưng (Feature points) tối thiểu để kết luận đó là khuôn mặt người. Hệ thống sẽ bỏ qua luồng xử lý này để tránh tạo ra hàng loạt cảnh báo rác (False Alarm).  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Thông báo về "Khuôn mặt lạ" có tính nhạy cảm, do đó hệ thống chỉ được phép gửi đích danh đến tài khoản của Người tổ chức (Host) hoặc Quản lý cấp cao đang có mặt tại phòng. Tuyệt đối không gửi cảnh báo này (Broadcast) đến thiết bị của toàn bộ các khách mời tham dự khác để tránh gây hoang mang hoặc làm gián đoạn sự tập trung của buổi họp.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-APM-07 Xem lịch sử vào/ra của người tham dự** 

| UC ID and Name: | UC-APM-07 Xem lịch sử vào/ra của người tham dự  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin  | Secondary Actors: | Employee |
| Trigger: | Người dùng muốn kiểm tra chi tiết hành trình hiện diện, các mốc thời gian ra vào phòng hoặc đối soát tổng thời lượng tham gia thực tế của một nhân sự trong một cuộc họp cụ thể.  |  |  |
| Description: | Chức năng này cung cấp một giao diện dòng thời gian (Timeline) trực quan, ghi lại toàn bộ lịch sử biến động hiện diện của từng cá nhân trong suốt thời gian diễn ra cuộc họp. Hệ thống tổng hợp dữ liệu từ các thiết bị ngoại vi để hiển thị chính xác: mốc giờ Check-in đầu buổi, các mốc sự kiện "Vào phòng", "Rời phòng" (bao gồm cả các lần ra ngoài tạm thời) và tự động tính toán "Tổng thời gian có mặt thực tế" trong phòng họp. Tính năng này giúp minh bạch hóa dữ liệu kỷ luật, giải quyết các khiếu nại về điểm danh và giúp quản lý đánh giá mức độ tập trung của thành viên đối với nội dung cuộc họp.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công vào hệ thống. \- Người dùng có thẩm quyền truy cập (Người dùng tự xem lịch sử của mình, hoặc Quản lý/Host xem lịch sử của nhân sự thuộc quyền). \- Cuộc họp mục tiêu đang diễn ra hoặc đã kết thúc và đã ghi nhận ít nhất một sự kiện hiện diện từ phân hệ camera . |  |  |
| Postconditions: | \- Giao diện hiển thị chi tiết chuỗi sự kiện vào/ra theo trình tự thời gian và tổng thời lượng hiện diện chính xác của nhân sự được chọn. \- Thao tác hoàn toàn là chỉ đọc (Read-only), dữ liệu lịch sử gốc được bảo toàn tuyệt đối. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ lịch họp, tìm đến cuộc họp cần rà soát dữ liệu và mở thẻ "Điểm danh". 2\. Từ bảng danh sách tổng hợp khách mời (UC-APM-02), người dùng tìm đến tên của nhân sự cần kiểm tra và nhấp chọn chức năng "Xem lịch sử chi tiết" (hoặc biểu tượng Dòng thời gian). 3\. Hệ thống tiếp nhận yêu cầu, kiểm tra quyền hạn của tài khoản đối với việc khai thác lịch sử cá nhân này. 4\. Hệ thống truy xuất toàn bộ kho dữ liệu log hiện diện (Presence logs) liên quan đến nhân sự đó trong phạm vi khung giờ của cuộc họp được chọn. 5\. Hệ thống sắp xếp dữ liệu theo trình tự thời gian tuyến tính và hiển thị một giao diện pop-up dòng thời gian (Timeline view) chi tiết: **Mốc đầu tiên:** Thời gian và trạng thái Check-in (Đúng giờ/Đi muộn) kèm nguồn ghi nhận. **Các mốc trung gian:** Các cặp sự kiện \[Vào phòng\] và \[Rời phòng\] liên tiếp nhau kèm mốc giờ, phút, giây cụ thể. **Khối thông tin tổng hợp:** Hiển thị chỉ số "Tổng thời gian có mặt thực tế" (Ví dụ: 1 giờ 15 phút) và tỷ lệ phần trăm thời gian hiện diện trên tổng thời lượng cuộc họp. 6\. Người dùng theo dõi, rà soát lịch sử và nhấn nút "Đóng" để tắt giao diện dòng thời gian. |  |  |
| Alternative Flows: | **A1. Tra cứu khi cuộc họp đang diễn ra (Real-time Timeline):** Nếu cuộc họp chưa kết thúc, người dùng vẫn có thể mở xem dòng thời gian này. Hệ thống sẽ hiển thị mốc sự kiện cuối cùng là "Đang có mặt trong phòng" hoặc "Đang ở ngoài phòng" kèm theo thời gian tính toán cập nhật liên tục cho đến thời điểm hiện tại.  |  |  |
| Exceptions: | **E1. Nhân sự vắng mặt hoàn toàn (No-show):** Tại bước 4, nếu nhân sự được chọn hoàn toàn không có bất kỳ một bản ghi log hiện diện nào trong suốt cuộc họp (Vắng mặt), hệ thống sẽ không hiển thị giao diện dòng thời gian mà hiển thị thông báo ngay tại bảng tổng hợp: "Không có dữ liệu lịch sử ra vào. Nhân sự vắng mặt trong cuộc họp này."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 :** Người dùng thông thường (Role: User/Participant) chỉ có quyền xem duy nhất lịch sử dòng thời gian ra vào của chính bản thân mình, nút bấm xem chi tiết tại tên của đồng nghiệp khác sẽ bị ẩn. Người tổ chức cuộc họp (Host), Quản lý trực tiếp (Manager) và Admin hệ thống có đặc quyền xem dòng thời gian chi tiết của tất cả các thành viên tham gia cuộc họp. **BR2:** Chỉ số "Tổng thời gian có mặt thực tế" hiển thị trên dòng thời gian được hệ thống tự động tính toán dựa trên tổng thời lượng của các khoảng thời gian nhân sự ở TRONG phòng:Tổng thời gian có mặt \= tổng ( Giờ Rời phòng \- Giờ Vào phòng)Các khoảng thời gian nhân sự bước ra ngoài phòng vượt quá biên độ dung sai sẽ bị hệ thống trừ toán học ra khỏi tổng thời gian có mặt thực tế để đảm bảo tính khách quan (Ví dụ: Cuộc họp dài 2 tiếng, nhân sự ra ngoài nghe điện thoại 20 phút thì tổng thời gian có mặt chỉ ghi nhận là 1 tiếng 40 phút). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

8. #### **UC-APM-08 Tính tổng thời gian hiện diện thực tế** 

| UC ID and Name: | UC-APM-08 Tính tổng thời gian hiện diện thực tế  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: |  |
| Trigger: | Cuộc họp chính thức kết thúc trên phần mềm (do Người tổ chức chủ động bấm kết thúc hoặc thời gian thực tế đã vượt qua mốc lịch trình quy định), hoặc khi có lệnh truy vấn xem báo cáo điểm danh từ phía người dùng.  |  |  |
| Description: | Đây là một tiến trình xử lý ngầm (background logic) cốt lõi của hệ thống. Dựa trên chuỗi các sự kiện "Vào phòng" (Entry) và "Rời phòng" (Exit) đã được thu thập từ camera AI hoặc các thiết bị định danh trước đó, hệ thống thực hiện thuật toán bóc tách và cộng dồn để tính ra chính xác tổng thời lượng mà mỗi nhân sự thực sự có mặt bên trong không gian phòng họp. Số liệu đầu ra của tiến trình này là căn cứ quan trọng nhất để hệ thống tạo các báo cáo tuân thủ kỷ luật chuyên cần, đánh giá mức độ tập trung của nhân viên và đo lường độ lấp đầy thực tế của phòng họp.  |  |  |
| Preconditions: | \- Cuộc họp đã được khởi tạo và có danh sách khách mời tham dự hợp lệ. \- Hệ thống đã ghi nhận thành công các tập hợp sự kiện lịch sử Vào/Ra (hoặc điểm danh thủ công) của các nhân sự tham gia trong thời gian diễn ra cuộc họp. |  |  |
| Postconditions: | \- Thuộc tính "Tổng thời gian có mặt thực tế" của từng nhân sự tham gia cuộc họp được tính toán, cập nhật thành công vào hồ sơ quản lý. \- Dữ liệu sẵn sàng để kết xuất lên giao diện báo cáo (Dashboard) và luồng phân tích vĩ mô (Analytics). |  |  |
| Normal Flow: | 1\. Hệ thống tiếp nhận tín hiệu kích hoạt luồng tính toán (Ví dụ: Nhận cờ báo hiệu cuộc họp đã kết thúc). 2\. Hệ thống bắt đầu quét danh sách toàn bộ khách mời đã được đánh dấu trạng thái "Có mặt" hoặc có ghi nhận hoạt động tại phòng họp đó. 3\. Đối với từng nhân sự cụ thể, hệ thống trích xuất toàn bộ mảng dữ liệu lịch sử các sự kiện (Timeline events) trong phạm vi khung giờ liên quan đến cuộc họp. 4\. Hệ thống phân tích mảng sự kiện, tiến hành ghép nối chúng thành từng cặp sự kiện tuần tự: \[Giờ Vào phòng \- Giờ Rời phòng tương ứng\]. 5\. Thuật toán thực hiện tính toán độ dài khoảng thời gian (Duration) của từng cặp sự kiện hợp lệ đã được ghép. 6\. Hệ thống tiến hành cộng dồn toán học độ dài thời gian của tất cả các cặp lại với nhau để cho ra kết quả cuối cùng là "Tổng thời gian có mặt thực tế". 7\. Hệ thống gắn nhãn lưu trữ kết quả này cho nhân sự đang xét và tiến hành đồng bộ con số lên các giao diện quản lý liên quan. 8\. Hệ thống lặp lại vòng lặp phân tích cho đến khi hoàn tất tính toán cho người cuối cùng trong danh sách và tự động đóng tiến trình. |  |  |
| Alternative Flows: | **A1. Tính toán chủ động theo thời gian thực (Real-time Calculation):** Nếu cuộc họp đang diễn ra và Quản lý bấm xem "Lịch sử dòng thời gian" , tiến trình tính toán này sẽ được gọi tức thời. Tại bước 4, khi hệ thống đang ghép cặp sự kiện, nếu phát hiện một sự kiện "Vào phòng" là sự kiện cuối cùng (chưa có sự kiện "Rời phòng" đi kèm để đóng cặp), hệ thống sẽ tự động lấy mốc *Thời gian hiện tại (Current Time)* để làm vế đóng cặp giả định. Nhờ đó, tổng thời gian có mặt sẽ liên tục "nhảy số" tăng dần theo thời gian thực trên màn hình người xem.  |  |  |
| Exceptions: | **E1. Mất cân bằng sự kiện (Khuyết sự kiện rời phòng sau khi họp xong):** Tại bước 4, khi tiến trình quét toàn bộ sự kiện sau khi cuộc họp đã kết thúc, nếu phát hiện một cặp dữ liệu bị khuyết vế sau (Nhân sự có sự kiện Vào nhưng không có sự kiện Rời phòng, có thể do thiết bị camera tại cửa ra bị che khuất hoặc lỗi mạng cục bộ). Hệ thống sẽ tự động lấy mốc *Thời gian kết thúc cuộc họp* theo lịch trình để chốt làm mốc "Rời phòng" cuối cùng, đảm bảo luồng thuật toán cộng dồn không bị sụp đổ do thiếu biến số.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1 :** Hệ thống chỉ cộng dồn các khoảng thời gian nhân sự ở trong phòng. Các khoảng thời gian "Trống" xen kẽ giữa các cặp sự kiện (Ví dụ: Nhân sự đi ra khỏi phòng 15 phút để nghe điện thoại rồi mới vào lại) bắt buộc phải bị loại bỏ hoàn toàn khỏi phương trình tổng. **BR2 :** Tổng thời gian có mặt thực tế được tính toán *bắt buộc phải nằm trong giới hạn khung giờ của cuộc họp*. Nếu cuộc họp có lịch từ 09:00 đến 10:00, nhưng nhân sự vào phòng họp sớm từ 08:30 để làm việc riêng, khoảng thời gian 30 phút dư thừa đó sẽ không được đưa vào phương trình tính thời lượng họp thực tế để tránh làm sai lệch báo cáo (trừ khi hệ thống có cấu hình "Cho phép ghi nhận thời gian chuẩn bị"). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

9. #### **UC-APM-09 Xem timeline hiện diện của cuộc họp** 

| UC ID and Name: | UC-APM-09 Xem timeline hiện diện của cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Quản lý hoặc Người tổ chức cuộc họp muốn có cái nhìn toàn cảnh mang tính đối chiếu về hành trình ra/vào và sự tương quan hiện diện của toàn bộ các thành viên tham gia trên cùng một dòng thời gian duy nhất.  |  |  |
| Description: | Chức năng này cung cấp một giao diện biểu đồ dòng thời gian tổng hợp (Gantt-style Timeline Chart) trực quan cho toàn bộ cuộc họp. Thay vì tra cứu lịch sử đơn lẻ của từng cá nhân, hệ thống cho phép xếp song song chuỗi thanh hiện diện của tất cả khách mời trên cùng một trục thời gian tuyến tính. Thông qua biểu đồ này, người quản lý dễ dàng nhận diện bức tranh tổng thể về văn hóa hội họp: ai là người vào phòng đầu tiên, ai vào sau, các khoảng thời gian gián đoạn (ra ngoài), và đặc biệt là xác định được khung giờ cao điểm có mật độ tập trung nhân sự đầy đủ nhất hoặc thời điểm phòng họp bị bỏ trống.  |  |  |
| Preconditions: | \- Người dùng đã đăng nhập thành công với vai trò Manager hoặc Host của cuộc họp. \- Cuộc họp mục tiêu đang diễn ra hoặc đã kết thúc. \- Hệ thống đã ghi nhận và tổng hợp thành công các chuỗi sự kiện Vào/Rời phòng từ phân hệ camera thông minh . |  |  |
| Postconditions: | \- Giao diện biểu đồ Timeline tổng thể hiển thị chính xác tương quan dữ liệu hiện diện của toàn bộ thành viên theo trục thời gian thực tế. \- Thao tác hoàn toàn là chỉ đọc (Read-only), không làm thay đổi các bản ghi log sự kiện gốc của hệ thống. |  |  |
| Normal Flow: | 1\. Quản lý truy cập vào phân hệ "Báo cáo & Thống kê" hoặc mở màn hình chi tiết của một cuộc họp cụ thể, nhấp chọn mục "Timeline hiện diện tổng thể". 2\. Hệ thống tiếp nhận lệnh, kiểm tra quyền hạn của tài khoản để đảm bảo tính hợp lệ. 3\. Hệ thống truy xuất toàn bộ danh sách khách mời chính thức và kho dữ liệu log sự kiện Vào/Ra của tất cả mọi người gắn liền với khung giờ diễn ra cuộc họp đó. 4\. Hệ thống dàn dựng giao diện đồ thị hai trục quy chuẩn: **Trục dọc (Y-axis):** Danh sách họ tên và ảnh đại diện của từng người tham dự, xếp chồng lên nhau. **Trục ngang (X-axis):** Thước đo thời gian của cuộc họp chạy từ mốc mở cửa điểm danh cho đến khi kết thúc (tính theo đơn vị Giờ : Phút). 5\. Hệ thống vẽ các "Thanh trạng thái hiện diện" song song chạy dọc theo trục ngang cho từng nhân sự: Khoảng thời gian nhân sự ngồi TRONG phòng họp được tô bằng khối màu sắc đậm (Ví dụ: Màu Xanh dương). Khoảng thời gian nhân sự ở NGOÀI phòng họp (chưa đến hoặc ra ngoài giữa chừng) được để trống hoặc hiển thị bằng dải màu xám nhạt đứt nét. Các mốc Check-in đầu buổi hoặc thao tác điểm danh thủ công được đóng dấu bằng một biểu tượng (Icon) ký hiệu đặc trưng ngay tại thời điểm phát sinh. 6\. Hệ thống tích hợp một đường đồ thị tổng hợp số lượng (Headcount Trendline) chạy song song ở phần biên trên của biểu đồ, thể hiện biến động tổng số người thực tế có mặt tại phòng theo từng phút. 7\. Quản lý di chuyển con trỏ chuột (Hover) vào một vị trí thời gian bất kỳ trên biểu đồ, hệ thống sẽ hiển thị một khung thông tin nhanh (Tooltip) báo cáo trạng thái chi tiết của phòng họp tại đúng thời điểm đó (Ví dụ: "Lúc 10:15: Có 12/15 người tại phòng. 3 người vắng mặt tạm thời bao gồm..."). 8\. Quản lý quan sát phân tích xong và nhấn nút đóng màn hình biểu đồ. |  |  |
| Alternative Flows: | **A1. Lọc dữ liệu hiển thị trên Timeline:** Tại giao diện hiển thị biểu đồ, Quản lý có thể sử dụng bộ lọc nhanh để thu hẹp phạm vi rà soát: chọn lọc chỉ hiển thị timeline của một "Phòng ban" cụ thể (để xem mức độ chuyên cần của riêng đội nhóm đó) hoặc lọc theo "Trạng thái kỷ luật" (chỉ hiển thị những thành viên có nhãn đi muộn hoặc về sớm). Hệ thống sẽ ngay lập tức ẩn các dòng dữ liệu không liên quan và tái cấu trúc lại biểu đồ trực quan.  |  |  |
| Exceptions: | **E1. Cuộc họp vắng mặt 100% (No-show toàn bộ):** Tại bước 3, nếu hệ thống rà soát thấy cuộc họp đã kết thúc nhưng hoàn toàn không ghi nhận được bất kỳ một lượt hiện diện của một nhân sự nào (cuộc họp ảo bị bỏ trống), hệ thống sẽ chặn luồng vẽ biểu đồ và hiển thị thông báo: "Không thể khởi tạo timeline do cuộc họp không phát sinh bất kỳ hoạt động hiện diện nào thực tế."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 :** Biểu đồ timeline hiện diện tổng thể chứa thông tin lịch sử di chuyển và hành vi chi tiết của nhiều nhân sự trong tập thể. Do đó, hệ thống tuyệt đối khóa chức năng này đối với tài khoản vai trò Khách mời thông thường (Participant) để bảo vệ quyền riêng tư nội bộ. Chỉ có Quản lý trực tiếp (Manager), Người tổ chức (Host) hoặc Admin hệ thống mới được cấp quyền khai thác màn hình này. **BR2 :** Trục hoành thời gian bắt buộc phải tự động co giãn cấu hình dựa trên thời lượng thực tế của buổi họp. Nếu cuộc họp kéo dài quá 3 tiếng, hệ thống phải tự động kích hoạt tính năng cuộn ngang hoặc cung cấp công cụ phóng to/thu nhỏ (Zoom in/Zoom out) để người quản lý có thể soi kỹ các chi tiết vi phạm nhỏ ở cấp độ phút mà không bị tràn màn hình. |  |  |
| Other Information: | Thiết kế màu sắc của các thanh hiện diện nên có độ tương phản tốt trên nền giao diện (áp dụng cả chế độ sáng và tối). Đường đồ thị tổng hợp số lượng người (Headcount Trendline) có thể tự động đổi sang màu đỏ cảnh báo nếu số lượng người trong phòng vượt quá "Sức chứa tiêu chuẩn" được cấu hình của phòng họp đó (phát hiện tình trạng quá tải phòng).  |  |  |
| Assumptions: | Toàn bộ chuỗi sự kiện vào/ra đã được xử lý chuẩn hóa và kiểm tra tính hợp lệ bởi tiến trình chạy nền , đảm bảo các thanh trạng thái vẽ ra không bị chồng chéo mốc thời gian của cùng một nhân sự.  |  |  |

10. #### **UC-APM-10 Gửi cảnh báo người tham dự chưa check-in** 

| UC ID and Name: | UC-APM-10 Gửi cảnh báo người tham dự chưa check-in  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Participant, Host |
| Trigger: | Mốc thời gian thực tế của hệ thống vượt quá giờ bắt đầu cuộc họp một khoảng thời gian dung sai cấu hình quy định (Ví dụ: quá giờ bắt đầu 5 phút) nhưng trạng thái của khách mời bắt buộc vẫn là "Chưa check-in/Vắng mặt".  |  |  |
| Description: | Chức năng này là một tiến trình tự động chạy nền (cron job) nhằm thúc đốc, nhắc nhở nhân sự tuân thủ kỷ luật giờ giấc. Khi cuộc họp chính thức bắt đầu, hệ thống sẽ liên tục rà soát dữ liệu hiện diện thực tế. Nếu phát hiện các thành viên có vai trò tham dự bắt buộc vẫn chưa thực hiện quét mã hoặc chưa được camera ghi nhận tại phòng họp, hệ thống sẽ lập tức gửi một thông báo nhắc nhở khẩn cấp (qua email). Điều này giúp giảm thiểu tỷ lệ đi muộn, nhắc nhở nhân sự khẩn trương di chuyển và giúp Người tổ chức nắm được lý do chậm trễ để điều hành buổi họp hiệu quả.  |  |  |
| Preconditions: | \- Cuộc họp đã được chuyển sang trạng thái "Đang diễn ra" (In Progress) trên lịch hệ thống. \- Danh sách khách mời có chứa các nhân sự được thiết lập ở chế độ tham gia "Bắt buộc" (Required). \- Phân hệ gửi thông báo trung tâm (Notification Service) của ứng dụng hoạt động bình thường. |  |  |
| Postconditions: | \- Thông báo nhắc nhở được biên soạn và gửi đi thành công tới đúng thiết bị hoặc hòm thư cá nhân của các nhân sự vi phạm. \- Tiến trình lưu lại nhật ký sự kiện đã gửi cảnh báo vào lịch sử cuộc họp để phục vụ công tác kiểm toán hậu kỳ. |  |  |
| Normal Flow: | 1\. Hệ thống liên tục quét danh sách các cuộc họp đang diễn ra trên toàn doanh nghiệp. 2\. Khi một cuộc họp đạt tới mốc thời gian kiểm tra quy định (Ví dụ: đúng 5 phút sau giờ bắt đầu họp), hệ thống kích hoạt luồng xử lý cảnh báo của cuộc họp đó. 3\. Hệ thống truy xuất danh sách khách mời, thực hiện lọc và trích xuất ra những nhân sự có đồng thời 2 điều kiện: Có nhãn tham dự là "Bắt buộc" và thuộc trạng thái "Chưa check-in". 4\. Hệ thống thu thập thông tin định danh liên lạc (ID tài khoản app, địa chỉ Email công việc) của nhóm nhân sự vi phạm này. 5\. Hệ thống chèn dữ liệu bối cảnh vào biểu mẫu (Template) nhắc nhở tiêu chuẩn của doanh nghiệp, tự động cấu hình nội dung (Ví dụ: *"Thông báo: Cuộc họp '\[Tên cuộc họp\]' đã bắt đầu được 5 phút tại \[Phòng họp X\]. Vui lòng khẩn trương di chuyển vào phòng và thực hiện check-in để hệ thống ghi nhận hiện diện."*). 6\. Hệ thống thực hiện phát lệnh gửi thông báo trực tiếp (Push Notification) đồng loạt đến thiết bị di động cá nhân của các nhân sự có trong danh sách vừa lọc. 7\. Hệ thống ghi nhận sự kiện gửi nhắc nhở thành công và khép lại tiến trình rà soát đợt 1\. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

11. #### **UC-APM-11 Gửi cảnh báo khuôn mặt lạ** 

| UC ID and Name: | UC-APM-11 Gửi cảnh báo khuôn mặt lạ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Camera |
| Trigger: | Chức năng nhận diện hình ảnh phát hiện và ghi nhận một sự kiện "Khuôn mặt lạ" (thực thể người không có trong cơ sở dữ liệu hoặc không thuộc danh sách khách mời) xuất hiện trong ranh giới khu vực phòng họp.  |  |  |
| Description: | Chức năng này đóng vai trò là một luồng thông báo an ninh tự động (Automated Security Alert). Ngay khi có dấu hiệu xâm nhập từ một nhân sự không xác định danh tính tại khu vực phòng họp (nơi có thể đang diễn ra các cuộc trao đổi chiến lược bảo mật), hệ thống sẽ lập tức đóng gói thông tin bối cảnh và gửi cảnh báo khẩn cấp theo thời gian thực đến thiết bị của Quản trị viên và Quản lý phụ trách. Cảnh báo cung cấp đầy đủ thông tin về thời gian, địa điểm và hình ảnh trích xuất, giúp cấp quản lý hoặc đội an ninh tòa nhà có thể nhanh chóng đánh giá tình hình và đưa ra biện pháp can thiệp vật lý kịp thời.  |  |  |
| Preconditions: | \- Chức năng phân tích khuôn mặt của thiết bị Camera tại phòng họp đang hoạt động bình thường và kết nối liên tục với máy chủ. \- Tài khoản của Quản trị viên (Admin) và Quản lý (Manager) đã được cấp quyền nhận thông báo an ninh và thiết bị của họ có kết nối mạng. |  |  |
| Postconditions: | \- Thông báo cảnh báo an ninh được gửi thành công đến đúng đối tượng theo phân quyền. \- Toàn bộ tiến trình phát lệnh cảnh báo được lưu vết vào Nhật ký kiểm tra (Audit Log) để phục vụ tra cứu hậu kỳ. |  |  |
| Normal Flow: | 1\. Hệ thống phân tích trung tâm tiếp nhận tín hiệu từ Camera về việc phát hiện một khuôn mặt không hợp lệ tại một không gian phòng họp cụ thể. 2\. Hệ thống tiến hành thu thập và đóng gói các siêu dữ liệu (Metadata) liên quan đến sự kiện, bao gồm: Tên và vị trí phòng họp vật lý (Ví dụ: Phòng họp VIP \- Tầng 3). Mốc thời gian phát hiện chuẩn xác tới cấp độ giây. Hình ảnh (Snapshot) cắt cúp rõ nét khuôn mặt của đối tượng khả nghi. 3\. Hệ thống quét danh sách phân quyền để xác định các tài khoản nhận thông báo. Tập đối tượng nhận mặc định bao gồm: Quản trị viên hệ thống (Admin) và Quản lý (Manager) trực tiếp quản lý cơ sở vật chất của khu vực/tầng lầu đó. 4\. Hệ thống biên soạn nội dung thông báo theo biểu mẫu khẩn cấp, ví dụ: *"Cảnh báo An ninh: Phát hiện khuôn mặt không xác định tại \[Tên phòng họp\] vào lúc \[Thời gian\]. Vui lòng kiểm tra ngay."* 5\. Hệ thống thực hiện phát lệnh gửi thông báo đẩy (Push Notification) lên ứng dụng di động/nền tảng web của các tài khoản đã lọc, đồng thời gửi một email đính kèm hình ảnh vào hòm thư công việc của họ. 6\. Admin hoặc Manager nhận được cảnh báo, nhấp vào thông báo để mở màn hình chi tiết, xem xét hình ảnh và quyết định các bước xử lý tiếp theo (Ví dụ: gọi điện cho người chủ trì cuộc họp hoặc điều động bảo vệ). 7\. Hệ thống tự động ghi nhận trạng thái "Đã gửi cảnh báo thành công" vào hồ sơ an ninh của hệ thống. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Để tránh tình trạng nhiễu loạn thông báo (Spam), hệ thống không gửi cảnh báo này cho toàn bộ nhân sự hay tất cả các Manager. Cảnh báo chỉ được định tuyến đích danh đến Quản lý phụ trách trực tiếp chi nhánh/khu vực có phòng họp đó, và tài khoản Admin cấp cao nhất.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 10\. Meeting Management

#### 

1. #### **UC-MM-01 Tạo cuộc họp mới thủ công** 

| UC ID and Name: | UC-MM-01 Tạo cuộc họp mới thủ công  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee,Manager   | Secondary Actors: |  |
| Trigger: | Người dùng có nhu cầu tổ chức một buổi trao đổi, làm việc nhóm hoặc gặp gỡ đối tác và cần thiết lập lịch, đặt phòng họp cũng như gửi lời mời đến các thành viên liên quan.  |  |  |
| Description: | Đây là một trong những tính năng cốt lõi của giai đoạn Tiền cuộc họp (Pre-meeting). Use Case này cho phép người dùng khai báo và khởi tạo một sự kiện cuộc họp trên phần mềm. Người dùng sẽ cung cấp các thông tin nền tảng như: Tiêu đề cuộc họp, người chủ trì (Host), khung thời gian dự kiến, lựa chọn không gian phòng họp vật lý và chỉ định danh sách người tham dự. Hệ thống sẽ đóng vai trò kiểm soát xung đột tài nguyên, ghi nhận lịch trình, "giữ chỗ" phòng họp và tự động hóa việc phát hành thư mời. Sự kiện được tạo ra từ chức năng này sẽ là cơ sở dữ liệu gốc để các thiết bị camera/IoT đối chiếu điểm danh và giám sát không gian trong giai đoạn In-meeting sau này.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống ứng dụng Web với tài khoản hợp lệ (không bị khóa). **PRE2:** Kho dữ liệu của hệ thống đã có sẵn danh mục các phòng họp và danh bạ tài khoản nhân sự nội bộ để người dùng có thể tìm kiếm và lựa chọn. |  |  |
| Postconditions: | **POST1:** Một hồ sơ cuộc họp mới được tạo thành công trên hệ thống với trạng thái mặc định là "Đã lên lịch" (Scheduled). **POST2:** Tài nguyên phòng họp được chọn sẽ bị "khóa" (giữ chỗ) trong khung thời gian tương ứng, những người dùng khác không thể đặt trùng lịch vào phòng này. **POST3:** Một luồng thông báo/email tự động (Thư mời họp) được kích hoạt và đưa vào hàng đợi để gửi đến toàn bộ danh sách người tham gia (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Quản lý Cuộc họp" hoặc màn hình Lịch tổng quan và nhấn nút "Tạo cuộc họp mới". 2\. Hệ thống hiển thị biểu mẫu (form) khởi tạo cuộc họp. 3\. Người dùng nhập các thông tin chung bắt buộc: Tiêu đề cuộc họp, Mô tả nội dung (Agenda sơ bộ), và lựa chọn Người chủ trì (Host \- mặc định là chính người tạo). 4\. Người dùng thiết lập Khung thời gian: Chọn Ngày họp, Giờ bắt đầu và Giờ kết thúc. 5\. Người dùng tìm kiếm và chọn Phòng họp: Hệ thống dựa vào thời gian ở bước 4 để lọc và chỉ hiển thị danh sách các phòng họp đang còn khả dụng (Available). 6\. Người dùng tìm kiếm và thêm Người tham dự (Participants) từ danh bạ nội bộ hoặc nhập email khách mời bên ngoài. 7\. Người dùng kiểm tra lại toàn bộ thông tin và nhấn nút "Tạo cuộc họp". 8\. Hệ thống tiến hành xác thực dữ liệu đầu vào (Validation) và rà soát các xung đột về tài nguyên phòng họp hoặc lịch cá nhân. 9\. Hệ thống lưu trữ hồ sơ cuộc họp, cập nhật trạng thái giữ chỗ của phòng họp trên lưới lịch chung. 10\. Hệ thống hiển thị thông báo "Tạo cuộc họp thành công", điều hướng người dùng về màn hình Chi tiết cuộc họp vừa tạo và kích hoạt tiến trình gửi email thư mời ở chế độ chạy ngầm. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Xung đột phòng họp (Room Conflict):** Tại bước 8, do độ trễ thao tác, nếu hệ thống phát hiện phòng họp người dùng chọn vừa bị một người khác đặt trước đó vài giây trong cùng khung giờ, hệ thống sẽ chặn thao tác lưu, hiển thị cảnh báo: "Phòng họp này vừa được đặt. Vui lòng chọn một phòng khác hoặc đổi khung giờ." **E2. Lỗi thời gian phi logic:** Tại bước 8, nếu Giờ kết thúc được thiết lập nhỏ hơn hoặc bằng Giờ bắt đầu, hoặc thời gian được chọn nằm ở trong quá khứ, hệ thống sẽ bôi đỏ trường nhập liệu và yêu cầu người dùng điều chỉnh lại. **E3. Cảnh báo quá tải sức chứa (Capacity Warning):** Tại bước 8, nếu tổng số lượng người tham dự được mời vượt quá sức chứa tối đa (Capacity) đã được cấu hình của phòng họp đó, hệ thống sẽ hiển thị một pop-up cảnh báo mềm: "Số lượng người tham dự đang vượt quá sức chứa của phòng. Bạn có chắc chắn muốn tiếp tục?". Người dùng có thể nhấn "Tiếp tục" để bỏ qua hoặc "Hủy" để đổi phòng rộng hơn. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1 :** Không cho phép thao tác "Double-booking" (Đặt phòng trùng lặp). Một phòng họp vật lý tại một thời điểm (phút) chỉ được phép gắn với duy nhất một cuộc họp ở trạng thái "Đã lên lịch" hoặc "Đang diễn ra". **BR2 :** Người khởi tạo cuộc họp (Creator) và Người chủ trì (Host) mặc định có toàn quyền chỉnh sửa, hủy bỏ cuộc họp và quản lý danh sách khách mời. Những người tham dự (Participants) thông thường chỉ có quyền xem thông tin và phản hồi tham gia (Accept/Decline). |  |  |
| Other Information: | Giao diện thêm người tham dự nên có tính năng báo đỏ (hoặc hiển thị nhãn "Bận") ngay bên cạnh tên của nhân sự nếu hệ thống phát hiện nhân sự đó đã có lịch họp khác trùng với khung giờ đang thiết lập, giúp người tổ chức chủ động nắm bắt thông tin.  |  |  |
| Assumptions: |  |  |  |

   #### 

2. #### **UC-MM-02 Cập nhật thời gian họp** 

| UC ID and Name: | UC-MM-02 Cập nhật thời gian họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee,Manager  | Secondary Actors: |  |
| Trigger: | Kế hoạch làm việc thay đổi (ví dụ: người chủ trì bận đột xuất, đối tác đến muộn), dẫn đến việc Người tổ chức hoặc Chủ trì cuộc họp (Host) cần phải dời lịch hoặc thay đổi khung thời gian của một cuộc họp đã được lên lịch từ trước.  |  |  |
| Description: | Tính năng này cho phép người dùng có quyền quản lý cuộc họp tiến hành thay đổi Giờ bắt đầu, Giờ kết thúc hoặc Ngày diễn ra của một cuộc họp sắp tới. Khi có sự thay đổi về thời gian, hệ thống sẽ đóng vai trò như một trợ lý thông minh: tự động rà soát lại xem phòng họp hiện tại có còn trống trong khung giờ mới hay không, giải phóng quỹ thời gian cũ, chốt giữ quỹ thời gian mới và tự động phát hành thông báo cập nhật lịch trình đến toàn bộ danh sách những người tham gia. Tính năng này giúp tổ chức quản lý sự thay đổi một cách mượt mà, đảm bảo mọi thành viên luôn nắm được lịch trình mới nhất.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập vào hệ thống và là Người tạo (Creator) hoặc Người chủ trì (Host) của cuộc họp cần chỉnh sửa, hoặc là Quản trị viên (Admin) có quyền can thiệp lịch. **PRE2:** Cuộc họp mục tiêu đang ở trạng thái "Đã lên lịch" (Scheduled) – tức là cuộc họp chưa diễn ra hoặc chưa bị hủy bỏ. |  |  |
| Postconditions: | **POST1:** Khung thời gian mới của cuộc họp được cập nhật thành công trên hệ thống và hiển thị đồng bộ trên lưới lịch chung. **POST2:** Thời gian giữ phòng họp vật lý (nếu có) được dịch chuyển tương ứng khớp với khung giờ mới. Khung giờ cũ của phòng họp được giải phóng để người khác có thể đặt. **POST3:** Hệ thống đưa một sự kiện "Gửi thông báo cập nhật lịch họp" vào hàng đợi để tự động gửi email/thông báo đến toàn bộ danh sách khách mời (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phần "Lịch của tôi" hoặc danh sách cuộc họp, tìm và chọn cuộc họp cần thay đổi thời gian. 2\. Người dùng nhấn vào nút chức năng "Chỉnh sửa cuộc họp". 3\. Hệ thống hiển thị biểu mẫu chứa các thông tin hiện tại của cuộc họp. 4\. Người dùng tiến hành thay đổi Ngày họp, Giờ bắt đầu hoặc Giờ kết thúc thành khung thời gian mới. 5\. Người dùng nhấn nút "Lưu thay đổi" (hoặc "Cập nhật"). 6\. Hệ thống tiến hành xác thực tính hợp lệ của thời gian (Ví dụ: kiểm tra giờ kết thúc phải lớn hơn giờ bắt đầu). 7\. Hệ thống rà soát tình trạng của Phòng họp hiện tại: Xác nhận phòng họp này vẫn còn trống (Available) trong khung giờ mới vừa được đổi. 8\. Hệ thống cập nhật hồ sơ cuộc họp với khung thời gian mới và cập nhật lại quỹ thời gian giữ chỗ của phòng họp. 9\. Hệ thống hiển thị thông báo "Cập nhật thời gian cuộc họp thành công" và tự động gửi email thông báo thay đổi đến những người tham gia. |  |  |
| Alternative Flows: | **A1. Thay đổi phòng họp do xung đột lịch:** Tại bước 7, nếu hệ thống phát hiện phòng họp hiện tại đã bị một nhóm khác đặt trước trong khung giờ mới, hệ thống sẽ cảnh báo: "Phòng họp hiện tại không khả dụng trong khung giờ mới". Lúc này, người dùng bắt buộc phải chọn chức năng "Tìm phòng họp khác" ngay trên biểu mẫu chỉnh sửa, chọn một phòng mới đang trống và nhấn Lưu. Hệ thống sẽ cập nhật đồng thời cả Thời gian và Phòng họp.  |  |  |
| Exceptions: | **E1. Thời gian cập nhật không hợp lệ:** Tại bước 6, nếu người dùng vô tình chọn khung thời gian mới nằm ở trong quá khứ (trước thời điểm thao tác hiện tại), hệ thống sẽ chặn thao tác lưu, bôi đỏ ô nhập liệu và báo lỗi: "Không thể dời lịch họp về thời điểm trong quá khứ." **E2. Cuộc họp đã bắt đầu (In-progress) hoặc Đã kết thúc:** Nếu trong lúc người dùng đang mở biểu mẫu chỉnh sửa mà cuộc họp đã đến giờ bắt đầu và chuyển trạng thái sang "Đang diễn ra", hoặc cuộc họp đã kết thúc, hệ thống sẽ vô hiệu hóa nút Lưu và hiển thị thông báo: "Không thể thay đổi thời gian dự kiến cho cuộc họp đang diễn ra hoặc đã kết thúc. Vui lòng sử dụng chức năng Gia hạn nếu cần thêm thời gian." **E3. Trùng lịch của người tham dự (Participant Conflict):** Tại bước 6, nếu khung giờ mới bị trùng với lịch họp khác của một hoặc một vài khách mời quan trọng trong danh sách, hệ thống có thể hiển thị cảnh báo mềm (Soft warning): "Khung giờ mới trùng lịch với \[Tên khách mời\]. Bạn có muốn tiếp tục lưu?". Người dùng có thể chọn tiếp tục lưu bất chấp cảnh báo. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 :** Khách mời (Participant) tuyệt đối không có quyền thay đổi thời gian cuộc họp. Quyền này bị khóa chặt cho Host, Creator hoặc Quản trị viên cấp cao. **BR2 :** Khi cập nhật thời gian, các thông tin khác của cuộc họp (Tiêu đề, Agenda, Cấu hình ghi hình) phải được giữ nguyên vẹn, không bị reset hay mất mát. |  |  |
| Other Information: | Nội dung Email thông báo tự động cần được thiết kế trực quan, làm nổi bật (ví dụ: bôi đậm, đổi màu) phần khung thời gian cũ bị gạch ngang và khung thời gian mới để khách mời dễ dàng nhận biết sự thay đổi chỉ qua một ánh nhìn.  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-MM-03 Cập nhật phòng họp** 

| UC ID and Name: | UC-MM-03 Cập nhật phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee,Manager   | Secondary Actors: |  |
| Trigger: | Kế hoạch tổ chức có sự thay đổi (ví dụ: cần một phòng họp lớn hơn do bổ sung thêm nhiều khách mời, phòng họp ban đầu bị hỏng điều hòa/máy chiếu) khiến Người tổ chức hoặc Chủ trì cuộc họp (Host) phải đổi địa điểm sang một phòng họp khác.  |  |  |
| Description: | Chức năng này cung cấp công cụ để Người tổ chức hoặc Chủ trì cuộc họp tiến hành di dời địa điểm tổ chức (phòng họp vật lý) của một sự kiện đã được lên lịch trước đó. Hệ thống đóng vai trò quản lý tài nguyên thông minh: tự động lọc ra các phòng họp khả dụng trong cùng khung thời gian, thực hiện quy trình đổi phòng (thu hồi lại không gian phòng cũ để người khác có thể đặt, và chốt giữ chỗ đối với phòng mới). Ngay khi hoàn tất, hệ thống sẽ tự động phát hành thư thông báo cập nhật địa điểm tới toàn bộ danh sách những người tham gia để họ chủ động di chuyển đến đúng vị trí, tránh tình trạng nhầm phòng họp.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và có quyền thao tác với cuộc họp này (là Người tạo, Người chủ trì, hoặc Quản trị viên cấp cao). **PRE2:** Cuộc họp đang ở trạng thái "Đã lên lịch" (Scheduled) – tức là cuộc họp chưa diễn ra hoặc chưa bị hủy bỏ. **PRE3:** Hệ thống vẫn còn sẵn các phòng họp khác đang trống trong quỹ thời gian dự kiến diễn ra cuộc họp. |  |  |
| Postconditions: | **POST1:** Hồ sơ thông tin của cuộc họp được cập nhật địa điểm không gian mới thành công trên phần mềm. **POST2:** Lịch giữ chỗ của phòng họp cũ được giải phóng hoàn toàn, đồng thời hệ thống thực hiện thao tác khóa (giữ chỗ) đối với phòng họp mới trong đúng khoảng thời gian họp. **POST3:** Một tác vụ tự động gửi email/thông báo đổi phòng họp được đưa vào hàng đợi để gửi đến tất cả người tham gia (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Lịch của tôi" hoặc danh sách quản lý cuộc họp, tìm và chọn xem chi tiết cuộc họp cần đổi phòng. 2\. Người dùng chọn chức năng "Chỉnh sửa" hoặc "Đổi phòng họp". 3\. Hệ thống hiển thị biểu mẫu chứa các thông tin hiện tại của cuộc họp. 4\. Tại trường lựa chọn Phòng họp, người dùng nhấp vào để tìm kiếm. Hệ thống tự động lọc và chỉ hiển thị danh sách các phòng đang trống (Available) trùng khớp với khung thời gian của cuộc họp. 5\. Người dùng xem xét sức chứa, tiện ích thiết bị và chọn một phòng họp mới thay thế. 6\. Người dùng nhấn nút "Lưu thay đổi". 7\. Hệ thống rà soát đối chiếu lại lần cuối để đảm bảo phòng mới vẫn còn trống và đáp ứng được số lượng người tham dự đã mời. 8\. Hệ thống cập nhật hồ sơ cuộc họp sang không gian mới, cập nhật lại trạng thái giữ chỗ của cả hai phòng (cũ và mới). 9\. Hệ thống hiển thị thông báo "Cập nhật phòng họp thành công" trên màn hình và tự động kích hoạt luồng gửi thư thông báo địa điểm thay thế. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Xung đột phòng họp phút chót (Concurrency Conflict):** Tại bước 7, nếu có một người dùng khác vừa thao tác đặt thành công chính phòng họp đó nhanh hơn vài giây, hệ thống sẽ chặn thao tác lưu, bôi đỏ ô phòng họp và hiển thị lỗi: "Phòng họp này vừa được đặt bởi người khác. Vui lòng chọn một phòng khả dụng khác." **E2. Cảnh báo quá tải sức chứa:** Tại bước 7, nếu hệ thống phát hiện phòng mới được chọn có sức chứa thiết kế nhỏ hơn tổng số người tham dự đang có trong danh sách mời, hệ thống sẽ hiển thị một thông báo mềm (Soft-warning): "Sức chứa của phòng (X người) nhỏ hơn số lượng người tham dự hiện tại (Y người). Bạn có chắc chắn muốn tiếp tục?". Người dùng có thể nhấn "Tiếp tục" để ép lưu hoặc "Hủy" để đổi sang phòng lớn hơn. **E3. Thao tác khi cuộc họp đang diễn ra:** Nếu cuộc họp đã qua giờ bắt đầu thực tế và trạng thái đã chuyển sang "Đang diễn ra" (In-progress), hệ thống sẽ vô hiệu hóa chức năng đổi phòng và hiển thị cảnh báo: "Không thể đổi phòng trên hệ thống khi cuộc họp đã bắt đầu. Bạn chỉ có thể kết thúc phiên này và tạo cuộc họp đột xuất (Ad-hoc) ở phòng khác nếu cần." |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 :** Khách mời tham gia (Participants) chỉ có quyền tiếp nhận thông tin, tuyệt đối không có quyền can thiệp vào việc thay đổi phòng họp. Quyền này chỉ dành riêng cho Người tổ chức (Creator) hoặc Chủ tọa (Host). **BR2 :** Khi cập nhật phòng họp, hệ thống chỉ điều chỉnh dữ liệu liên quan đến địa điểm không gian. Tất cả các dữ liệu khác như Khung thời gian, Tiêu đề, Danh sách người tham gia, Chính sách ghi hình phải được giữ nguyên vẹn 100%. |  |  |
| Other Information: | Trong email tự động gửi ra ở bước POST3, hệ thống nên thiết kế giao diện trực quan làm nổi bật phần thay đổi (Ví dụ: Tên phòng cũ bị gạch ngang mờ đi, mũi tên trỏ sang Tên phòng mới in đậm) để người tham gia có thể dễ dàng nhận ra thông điệp chính ngay khi mở email.  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-MM-04 Hủy cuộc họp** 

| UC ID and Name: | UC-MM-04 Hủy cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee,Manager   | Secondary Actors: |  |
| Trigger: | Mục đích của cuộc họp không còn tồn tại hoặc người chủ trì vắng mặt không thể thay thế, dẫn đến việc Người tổ chức quyết định hủy bỏ hoàn toàn lịch trình này.  |  |  |
| Description: | Chức năng để Người tổ chức hoặc Người chủ trì (Host) chấm dứt và hủy bỏ một cuộc họp đã được lên kế hoạch trước đó. Khi một cuộc họp bị hủy, hệ thống không chỉ đơn thuần thay đổi trạng thái sự kiện trên lịch, mà quan trọng hơn là thực hiện thu hồi và giải phóng ngay lập tức không gian phòng họp vật lý đã được giữ chỗ. Việc này giúp tối ưu hóa tài nguyên, cho phép các nhóm khác trong công ty có thể tái sử dụng phòng họp đó, tránh tình trạng lãng phí không gian (no-show do quên hủy phòng). Đồng thời, hệ thống sẽ tự động phát hành thông báo hủy lịch để người tham dự kịp thời sắp xếp lại công việc cá nhân.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống và sở hữu quyền kiểm soát cuộc họp này (là Người tạo, Người chủ trì, hoặc Quản trị viên hệ thống). **PRE2:** Cuộc họp đang ở trạng thái "Đã lên lịch" (Scheduled), tức là thời gian bắt đầu thực tế chưa diễn ra. |  |  |
| Postconditions: | **POST1:** Hồ sơ cuộc họp được cập nhật sang trạng thái "Đã hủy" (Cancelled) và có thể bị gạch ngang hoặc ẩn đi trên giao diện lịch chung. **POST2:** Tài nguyên phòng họp được liên kết với cuộc họp này (nếu có) được giải phóng hoàn toàn quỹ thời gian, trở về trạng thái trống (Available) để người khác có thể đặt chỗ. **POST3:** Một tác vụ tự động gửi email/thông báo hủy cuộc họp được gửi tới toàn bộ danh sách khách mời (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phần "Lịch của tôi" hoặc danh sách quản lý cuộc họp, tìm và chọn xem chi tiết cuộc họp muốn hủy. 2\. Người dùng nhấn vào nút hành động "Hủy cuộc họp". 3\. Hệ thống hiển thị một hộp thoại (Pop-up) yêu cầu người dùng xác nhận hành động hủy, kèm theo một ô nhập liệu tùy chọn để ghi "Lý do hủy cuộc họp". 4\. Người dùng nhập lý do (nếu cần) và nhấn nút "Xác nhận hủy". 5\. Hệ thống tiếp nhận lệnh, tiến hành khóa hồ sơ cuộc họp để ngăn chặn các chỉnh sửa khác. 6\. Hệ thống chuyển đổi trạng thái của cuộc họp thành "Đã hủy". 7\. Hệ thống gỡ bỏ liên kết giữ chỗ giữa cuộc họp này và phòng họp vật lý tương ứng, trả lại quỹ thời gian trống cho phòng họp. 8\. Hệ thống hiển thị thông báo "Hủy cuộc họp thành công" trên màn hình và tự động kích hoạt luồng gửi email thông báo đến những người tham gia. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Cuộc họp đang diễn ra (In-progress):** Tại bước 2, nếu mốc thời gian đã vượt qua giờ bắt đầu và cuộc họp đang ở trạng thái "Đang diễn ra", nút "Hủy cuộc họp" sẽ bị ẩn hoặc vô hiệu hóa. Hệ thống sẽ hiển thị thông báo: "Cuộc họp đã bắt đầu. Bạn không thể hủy mà chỉ có thể chọn 'Kết thúc sớm' (End Meeting)." **E2. Cuộc họp đã kết thúc (Completed) hoặc Đã hủy trước đó:** Nếu cuộc họp đã hoàn tất toàn bộ vòng đời hoặc đã bị hủy bởi một quản trị viên khác trước đó vài giây, thao tác hủy sẽ bị chặn lại kèm theo thông báo: "Trạng thái cuộc họp không hợp lệ để thực hiện thao tác này." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Trung bình  |  |  |
| Business Rules: | **BR1:** Chỉ những người có thẩm quyền (Creator, Host, System Admin) mới được phép hủy cuộc họp.  **BR2 :** Một khi cuộc họp đã chuyển sang trạng thái "Đã hủy", nó không thể được "Khôi phục" (Un-cancel) trở lại trạng thái cũ. Nếu người dùng đổi ý, họ bắt buộc phải tạo một cuộc họp mới hoàn toàn  |  |  |
| Other Information: | Trong email tự động gửi, tiêu đề email nên được tự động gắn thêm tiền tố \[ĐÃ HỦY\] hoặc \[CANCELLED\] bằng chữ in hoa nổi bật, và nội dung email cần hiển thị rõ "Lý do hủy" (nếu người tổ chức có nhập ở bước 3\) để người tham gia hiểu rõ bối cảnh. |  |  |
| Assumptions: |  |  |  |

5. #### **UC-MM-05 Tra cứu lịch trình cá nhân**


| UC ID and Name: | UC-MM-05 Tra cứu lịch trình cá nhân  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee,Manager  | Secondary Actors: |  |
| Trigger: | Người dùng cần kiểm tra lịch làm việc cá nhân trong ngày, tuần hoặc tháng để biết mình có những sự kiện nào cần tham gia, địa điểm tổ chức ở đâu, thời gian bắt đầu ra sao để chủ động sắp xếp công việc.  |  |  |
| Description: | Cung cấp cho người dùng một giao diện bảng điều khiển (Calendar Dashboard) cá nhân hóa để theo dõi toàn bộ các sự kiện cuộc họp mà họ có liên quan (với tư cách là Người tổ chức, Người chủ trì hoặc Khách mời). Hệ thống cho phép người dùng tùy chỉnh góc nhìn hiển thị linh hoạt theo Ngày (Day), Tuần (Week) hoặc Tháng (Month). Tại mỗi sự kiện trên lịch, phần mềm sẽ hiển thị trực quan các thông tin sống còn: Tiêu đề cuộc họp, Khung thời gian, Trạng thái hiện tại của sự kiện (Đã lên lịch, Đang diễn ra, Đã hủy) và Địa điểm phòng họp vật lý tương ứng. Tính năng này giúp nhân sự làm chủ quỹ thời gian cá nhân, tránh tình trạng bỏ quên lịch họp hoặc đến muộn.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống ứng dụng Web với tài khoản hợp lệ. **PRE2:** Trong hệ thống đã tồn tại dữ liệu về các cuộc họp mà tài khoản của người dùng này có mặt trong danh sách liên quan (nếu không, lịch sẽ hiển thị trống). |  |  |
| Postconditions: | **POST1:** Lịch trình sự kiện cá nhân của người dùng được tải và hiển thị chính xác theo mốc thời gian đã chọn trên giao diện. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Lịch của tôi" (My Schedule) trên menu điều hướng chính. 2\. Hệ thống tải và hiển thị giao diện lưới lịch mặc định (thường là góc nhìn theo Tuần làm việc hiện tại). 3\. Hệ thống tự động truy xuất và đổ dữ liệu tất cả các cuộc họp có liên quan đến người dùng vào các khung giờ tương ứng trên lưới lịch. 4\. Người dùng sử dụng các nút chức năng ở thanh công cụ để chuyển đổi góc nhìn lịch (Theo ngày, Theo tuần, Theo tháng) hoặc chuyển sang các tuần/tháng tiếp theo. 5\. Tại một khối sự kiện trên lịch, hệ thống hiển thị tóm tắt: Thời gian (Từ giờ \- Đến giờ), Tên cuộc họp, Tên phòng họp. 6\. Người dùng nhấp chuột vào một khối sự kiện cụ thể để xem Popup chi tiết (Bao gồm Agenda, Danh sách khách mời, Liên kết tài liệu đính kèm, Cấu hình ghi hình...). |  |  |
| Alternative Flows: | **A1. Lọc và phân loại sự kiện:**Người dùng có thể sử dụng bộ lọc nâng cao để làm gọn giao diện  |  |  |
| Exceptions: | **E1. Không có dữ liệu lịch trình:** Nếu trong khoảng thời gian người dùng đang xem (ví dụ: tháng sau) không có bất kỳ lịch họp nào, hệ thống sẽ hiển thị một lưới lịch trống kèm theo hình ảnh minh họa (empty state) và dòng chữ: "Bạn không có lịch trình nào trong khoảng thời gian này."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1:** Phân hệ "Lịch của tôi" hoạt động theo cơ chế cách ly dữ liệu cá nhân. Hệ thống chỉ hiển thị độc quyền các cuộc họp mà chính tài khoản đang đăng nhập đó có liên quan. Người dùng A không thể mượn tính năng này để xem lén lịch họp cá nhân của người dùng B. **BR2:** Hệ thống bắt buộc phải sử dụng mã hóa màu sắc (Color-coding) hoặc các biểu tượng (Icon) để phân biệt các loại sự kiện trên cùng một lưới lịch |  |  |
| Other Information: | Giao diện lưới lịch nên tích hợp một đường kẻ (Timeline indicator) chỉ báo "Thời điểm hiện tại" chạy vắt ngang qua giao diện xem Ngày/Tuần. Đường kẻ này sẽ tự động dịch chuyển theo thời gian thực, giúp người dùng nhìn lướt qua là biết ngay khoảng cách từ hiện tại đến cuộc họp tiếp theo còn bao nhiêu phút.  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-MM-06 Thêm thành viên nội bộ cuộc họp thủ công** 

| UC ID and Name: | UC-MM-06 Thêm thành viên nội bộ cuộc họp thủ công  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host),Manager  | Secondary Actors: |  |
| Trigger: | Trong quá trình chuẩn bị hoặc trước khi cuộc họp diễn ra, Người tổ chức nhận thấy cần bổ sung thêm chuyên môn hoặc ý kiến từ một nhân sự nội bộ khác trong công ty vào phiên thảo luận, do đó họ cần cập nhật lại danh sách khách mời.  |  |  |
| Description: | Nằm trong chuỗi các hoạt động của giai đoạn Tiền cuộc họp (Pre-meeting), Use Case này cung cấp công cụ để Người chủ trì hoặc Quản lý dễ dàng tra cứu danh bạ tổ chức và bổ sung thêm từng cá nhân vào một sự kiện đã được lên lịch. Tính năng này đóng vai trò quyết định trong việc định hình danh sách người tham dự (Participants List) \- vốn là dữ liệu đầu vào (Input) cực kỳ quan trọng để thiết bị nhận diện khuôn mặt (Face Server) đối chiếu và hệ thống tính toán kết quả điểm danh hợp lệ ở giai đoạn trong cuộc họp (In-meeting) sau này. Ngay sau khi thêm thành công, hệ thống sẽ tự động phát hành thư mời tới nhân sự vừa được bổ sung để họ kịp thời sắp xếp công việc.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống và có quyền quản lý/chỉnh sửa đối với cuộc họp hiện tại (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp mục tiêu đang ở trạng thái "Đã lên lịch" (Scheduled) hoặc "Đang diễn ra" (In-progress). **PRE3:** Nhân sự nội bộ cần thêm đã có tài khoản hoạt động bình thường trên hệ thống của công ty. |  |  |
| Postconditions: | **POST1:** Hồ sơ nhân sự vừa chọn được thêm thành công vào Danh sách người tham gia (Participant List) của cuộc họp. **POST2:** Hệ thống tự động kích hoạt tiến trình chạy ngầm để gửi một email "Lời mời tham dự cuộc họp mới" đến địa chỉ hộp thư của thành viên vừa được thêm. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang chi tiết của một cuộc họp cụ thể. 2\. Người dùng di chuyển đến khu vực "Danh sách người tham dự" và nhấn chọn nút "Thêm thành viên". 3\. Hệ thống hiển thị một khung tìm kiếm (Search box) hoặc cửa sổ danh bạ nội bộ. 4\. Người dùng nhập tên, mã nhân viên hoặc email của nhân sự cần tìm. 5\. Hệ thống lọc và hiển thị kết quả tương ứng theo thời gian thực (Real-time). 6\. Người dùng click chọn nhân sự đúng từ danh sách kết quả và nhấn "Xác nhận thêm". 7\. Hệ thống rà soát tính hợp lệ (đảm bảo nhân sự này chưa có mặt trong danh sách hiện tại). 8\. Hệ thống cập nhật danh sách khách mời, hiển thị tên nhân sự mới với trạng thái phản hồi là "Đang chờ xác nhận" (Pending). 9\. Hệ thống thông báo "Thêm thành viên thành công" và tự động gửi email thư mời đến nhân sự đó. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Nhân sự đã tồn tại trong danh sách:** Tại bước 7, nếu hệ thống phát hiện nhân sự vừa chọn đã có tên trong danh sách mời của cuộc họp này, hệ thống sẽ từ chối thao tác và hiển thị cảnh báo: "Thành viên này đã có mặt trong danh sách cuộc họp." **E2. Xung đột lịch của người được mời:** Tại bước 7, nếu hệ thống rà soát thấy nhân sự vừa được thêm đang có một lịch họp khác trùng với khung giờ này, hệ thống sẽ hiển thị cảnh báo mềm: "Nhân sự \[Tên nhân viên\] đang có lịch bận trong khung giờ này. Bạn có chắc chắn muốn gửi lời mời?". Người dùng có thể phớt lờ cảnh báo và tiếp tục thêm. **E3. Vượt quá sức chứa phòng họp:** Tại bước 7, nếu việc thêm người mới làm tổng số lượng khách mời vượt quá mức sức chứa tối đa của phòng họp vật lý đang đặt, hệ thống sẽ báo lỗi hoặc cảnh báo mềm (tùy theo cấu hình của quản trị viên): "Số lượng người tham dự đã vượt quá sức chứa của phòng họp. Vui lòng cân nhắc đổi phòng." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Mọi thành viên nội bộ khi được thêm vào thông qua tính năng này mặc định sẽ mang vai trò "Người tham dự" (Participant/Attendee) và bị ràng buộc bởi các quy tắc điểm danh, tính toán thời gian hiện diện của hệ thống trong giai đoạn In-meeting. **BR2:** Người được thêm vào chỉ có thể nhìn thấy chi tiết cuộc họp trên lịch cá nhân của họ sau khi thao tác thêm ở bước này hoàn tất. |  |  |
| Other Information: | Trong email thư mời gửi riêng cho nhân sự được thêm muộn này, nội dung nên cung cấp đầy đủ thông tin bối cảnh (Context) như Tiêu đề, Thời gian, Địa điểm phòng họp  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-MM-07 Import danh sách thành viên nội bộ cuộc họp bằng Excel** 

| UC ID and Name: | UC-MM-07 Import danh sách thành viên nội bộ cuộc họp bằng Excel  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host),Manager  | Secondary Actors: |  |
| Trigger: | Người tổ chức cần thiết lập một cuộc họp có nhiều người và họ muốn tiết kiệm thời gian bằng cách tải lên một tệp danh sách thay vì phải gõ tìm kiếm và thêm thủ công từng cá nhân.  |  |  |
| Description: | Nằm trong chuỗi hoạt động chuẩn bị Tiền cuộc họp (Pre-meeting), Use Case này cung cấp giải pháp nhập liệu hàng loạt danh sách khách mời thông qua tệp tin bảng tính (Excel). Hệ thống sẽ đảm nhiệm việc đọc tệp, quét và đối chiếu hàng loạt địa chỉ email hoặc mã nhân viên trong tệp với cơ sở dữ liệu của tổ chức để bóc tách và xác thực thông tin. Sau khi xác thực thành công, toàn bộ nhân sự hợp lệ sẽ được tự động bổ sung vào danh sách điểm danh dự kiến của cuộc họp, tạo nền tảng dữ liệu cho thiết bị camera nhận diện và hệ thống gửi thư mời đồng loạt  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống và có quyền quản lý/chỉnh sửa đối với cuộc họp hiện tại (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp mục tiêu đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Người dùng đã chuẩn bị sẵn một tệp tin bảng tính (.xlsx, .xls) chứa danh sách email hoặc mã nhân viên tuân thủ theo biểu mẫu (Template) quy định của phần mềm. |  |  |
| Postconditions: | **POST1:** Toàn bộ nhân sự được xác thực hợp lệ từ tệp Excel được nạp thành công vào Danh sách người tham gia (Participant List) của cuộc họp. **POST2:** Hệ thống tự động kích hoạt một tiến trình chạy ngầm để phát hành email thư mời họp đồng loạt đến toàn bộ những nhân sự vừa được import. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang chi tiết của cuộc họp, di chuyển đến khu vực "Danh sách người tham dự". 2\. Người dùng chọn tính năng "Nhập từ tệp Excel" (Import from Excel). 3\. Hệ thống hiển thị hộp thoại tải tệp, kèm theo một liên kết "Tải tệp biểu mẫu mẫu" (Download Template) để người dùng tham khảo định dạng cột nếu cần. 4\. Người dùng chọn tệp Excel đã chuẩn bị từ máy tính cá nhân (hoặc kéo thả) và tải lên hệ thống. 5\. Hệ thống tiếp nhận tệp, tiến hành phân tích dữ liệu và đối chiếu từng dòng thông tin (email/mã nhân viên) với danh bạ người dùng nội bộ. 6\. Hệ thống hiển thị màn hình "Xem trước kết quả" (Preview), liệt kê thống kê: Số lượng bản ghi hợp lệ và Số lượng bản ghi bị lỗi. 7\. Người dùng kiểm tra lại danh sách dữ liệu hợp lệ (những người sẽ được thêm) và nhấn nút "Xác nhận Import". 8\. Hệ thống lưu toàn bộ nhân sự hợp lệ vào danh sách khách mời của cuộc họp. 9\. Hệ thống hiển thị thông báo "Nhập danh sách thành công X/Y thành viên" và tự động kích hoạt luồng gửi email thư mời đồng loạt. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Tệp sai định dạng hoặc vượt quá dung lượng:** Tại bước 5, nếu người dùng tải lên một tệp không phải định dạng bảng tính (.pdf, .docx, .csv) hoặc tệp quá nặng (ví dụ: \> 5MB), hệ thống sẽ chặn thao tác ngay lập tức và báo lỗi: "Định dạng tệp không được hỗ trợ hoặc dung lượng vượt quá giới hạn." **E2. Dữ liệu lỗi một phần (Partial Error):** Tại bước 6, nếu hệ thống phát hiện một số dòng chứa email không tồn tại trong công ty, sai cú pháp, hoặc nhân sự đó đã có mặt trong cuộc họp từ trước, hệ thống sẽ đánh dấu đỏ các dòng đó ở màn hình xem trước kèm theo lý do lỗi. Người dùng chỉ có thể bấm "Xác nhận Import" để hệ thống nạp những dòng dữ liệu hợp lệ (màu xanh), bỏ qua các dòng lỗi. **E3. Cảnh báo quá tải sức chứa phòng họp:** Tại bước 6, nếu tổng số lượng người hợp lệ từ tệp Excel cộng với số lượng người đang có sẵn trong danh sách vượt quá giới hạn sức chứa (Capacity) của phòng họp vật lý, hệ thống sẽ hiển thị một thông báo mềm (Soft-warning): "Số lượng khách mời đang vượt quá sức chứa tối đa của phòng họp. Vui lòng cân nhắc điều chỉnh số lượng hoặc đổi sang phòng lớn hơn." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Trung bình  |  |  |
| Business Rules: | **BR1 :** Việc import bằng Excel chỉ sử dụng "Email nội bộ" hoặc "Mã nhân viên" làm chìa khóa định danh. Mọi thông tin phụ khác được gõ trong tệp Excel (như Tên gọi, Phòng ban) sẽ bị phần mềm bỏ qua. Hệ thống chỉ lấy thông tin chính xác tuyệt đối từ danh bạ trung tâm của tổ chức để tránh sai lệch. **BR2 :** Hệ thống có cơ chế tự động lọc và loại bỏ các dòng dữ liệu bị trùng lặp bên trong chính tệp Excel đó, đồng thời tự động bỏ qua những tài khoản đã được thêm vào cuộc họp trước thời điểm tải tệp, đảm bảo mỗi người chỉ xuất hiện duy nhất một lần trong danh sách. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

8. #### **UC-MM-08 Gỡ bỏ thành viên nội bộ khỏi cuộc họp** 

| UC ID and Name: | UC-MM-08 Gỡ bỏ thành viên nội bộ khỏi cuộc họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Trigger: | Thành phần nhân sự tham gia cuộc họp có sự thay đổi, hoặc Người tổ chức nhận ra đã mời nhầm người và cần điều chỉnh lại danh sách khách mời để đảm bảo tính bảo mật của cuộc họp trước khi sự kiện diễn ra.  |  |  |
| Description: | Cung cấp chức năng để Người chủ trì hoặc Quản lý loại bỏ một nhân sự ra khỏi danh sách tham dự dự kiến của một sự kiện đã lên lịch. Việc gỡ bỏ thành viên không chỉ làm gọn danh sách hiển thị, mà còn đóng vai trò quan trọng trong việc đồng bộ dữ liệu với thiết bị phần cứng: đảm bảo hệ thống không yêu cầu người này phải có mặt, và thiết bị camera nhận diện sẽ không tính họ vào tỷ lệ vắng mặt (absent) trong giai đoạn điểm danh của cuộc họp. Sau khi thao tác hoàn tất, hệ thống tự động phát hành một thông báo đến nhân sự bị gỡ để họ giải phóng lịch làm việc cá nhân của mình.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập vào hệ thống và sở hữu quyền quản lý đối với cuộc họp (là Người tạo, Người chủ trì hoặc Quản trị viên). **PRE2:** Cuộc họp đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Nhân sự mục tiêu đang hiện diện hợp lệ trong Danh sách người tham gia (Participant List) của cuộc họp này. |  |  |
| Postconditions: | **POST1:** Hồ sơ nhân sự mục tiêu được rút hoàn toàn khỏi danh sách người tham gia của cuộc họp. **POST2:** Sự kiện cuộc họp này tự động bị gỡ bỏ khỏi màn hình "Lịch của tôi" (My Schedule) của nhân sự vừa bị xóa. **POST3:** Hệ thống tự động kích hoạt và đưa một tác vụ gửi email thông báo hủy lời mời họp vào hàng đợi để gửi đến nhân sự đó. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang xem chi tiết của cuộc họp, cuộn đến khu vực "Danh sách người tham dự". 2\. Hệ thống hiển thị danh sách toàn bộ khách mời đang có mặt trong sự kiện. 3\. Người dùng tìm kiếm nhân sự cần loại bỏ và nhấn vào biểu tượng "Xóa/Gỡ bỏ" nằm ngay cạnh tên nhân sự đó. 4\. Hệ thống hiển thị một hộp thoại (Pop-up) yêu cầu xác nhận thao tác để tránh việc bấm nhầm: "Bạn có chắc chắn muốn gỡ \[Tên nhân sự\] khỏi cuộc họp này?". 5\. Người dùng nhấn nút "Xác nhận". 6\. Hệ thống tiến hành cập nhật lại danh sách, loại trừ nhân sự vừa chọn. 7\. Hệ thống hiển thị thông báo "Đã gỡ bỏ thành viên thành công" trên màn hình và âm thầm kích hoạt luồng gửi email thông báo cho người bị gỡ. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Cố ý gỡ bỏ Người chủ trì (Host):** Hệ thống không cho phép Người chủ trì tự gỡ bỏ chính bản thân họ (hoặc người tạo) khỏi cuộc họp. Biểu tượng "Xóa" sẽ tự động bị ẩn hoặc làm mờ (disabled) bên cạnh tên của Host. Nếu Host không thể tham gia và muốn rời đi, họ bắt buộc phải thực hiện tính năng "Chuyển giao quyền chủ trì" (Transfer Host) cho một người khác trước. **E2. Cuộc họp đã bắt đầu hoặc kết thúc:** Nếu thời gian đã trôi qua mốc bắt đầu và trạng thái cuộc họp chuyển sang "Đang diễn ra" (In-progress) hoặc "Đã kết thúc", toàn bộ tính năng gỡ bỏ khách mời sẽ bị khóa lại. Điều này nhằm bảo toàn tính toàn vẹn của dữ liệu điểm danh thực tế (những ai đã được mời thì phải chốt danh sách để hệ thống đánh giá Có mặt/Vắng mặt). |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1 :** Chỉ Người tổ chức hoặc Host mới có đặc quyền gỡ bỏ người khác. Các khách mời thông thường (Participant) tuyệt đối không thể tự ý gỡ bỏ lẫn nhau khỏi danh sách. **BR2 :** Ngay khi một thành viên bị gỡ bỏ hợp lệ ở giai đoạn Pre-meeting, mọi quy tắc yêu cầu điểm danh và giám sát hiện diện đối với thành viên đó trong cuộc họp này lập tức bị vô hiệu hóa. |  |  |
| Other Information: | Nội dung email thông báo gửi cho người bị gỡ nên được thiết kế với văn phong lịch sự, thông báo rõ ràng rằng lịch họp đã có sự điều chỉnh về thành phần tham dự, do đó họ không cần phải tham gia sự kiện này nữa, giúp họ yên tâm dời lịch.  |  |  |
| Assumptions: |  |  |  |

9. #### **UC-MM-09 Tạo chương trình họp (Agenda)**


| UC ID and Name: | UC-MM-09 Tạo chương trình họp (Agenda)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Trigger: | Người tổ chức muốn lên kế hoạch chi tiết cho buổi họp, phân bổ thời gian hợp lý và giao việc rõ ràng cho từng cá nhân để đảm bảo sự kiện diễn ra hiệu quả, đúng trọng tâm và không bị "cháy timeline".  |  |  |
| Description: | Thuộc giai đoạn chuẩn bị Tiền cuộc họp (Pre-meeting), tính năng này cung cấp một công cụ soạn thảo kịch bản kĩ lưỡng cho sự kiện. Người chủ trì (Host) có thể tạo lập danh sách các nội dung cần thảo luận, sắp xếp thứ tự ưu tiên, dự phóng thời lượng (số phút) cho từng hạng mục và chỉ định đích danh cá nhân phụ trách trình bày. Bản chương trình này (Agenda) không chỉ giúp khách mời nắm được bối cảnh để chuẩn bị tài liệu trước ở nhà, mà còn đóng vai trò như một thanh tiến trình (Timeline) hỗ trợ Host điều phối, bám sát thời gian thực tế tại giao diện "In-meeting" khi cuộc họp diễn ra.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và có quyền thao tác với cuộc họp này (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp mục tiêu đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Cuộc họp đã được thiết lập khung Thời gian bắt đầu, Thời gian kết thúc tổng thể, và đã có sẵn Danh sách người tham gia (Participant List). |  |  |
| Postconditions: | **POST1:** Bản chương trình họp chi tiết (Agenda) được lưu trữ thành công và đính kèm chặt chẽ vào hồ sơ của cuộc họp. **POST2:** Toàn bộ khách mời (Participants) có thể xem được nội dung Agenda này khi họ mở chi tiết sự kiện trên lịch cá nhân hoặc thông qua email nhắc lịch họp. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang quản lý chi tiết của cuộc họp, di chuyển đến thẻ (tab) "Chương trình họp" (Agenda) và nhấn nút "Thêm hạng mục". 2\. Hệ thống hiển thị một khung nhập liệu cho hạng mục mới. 3\. Người dùng điền các thông tin: Tên nội dung thảo luận, Thời lượng dự kiến (tính bằng phút), và lựa chọn Người phụ trách (trình bày) từ danh sách xổ xuống. 4\. Người dùng có thể tiếp tục nhấn "Thêm hạng mục" để khai báo liên tục các nội dung tiếp theo theo đúng thứ tự logic của sự kiện. 5\. Người dùng rà soát lại toàn bộ kịch bản và sử dụng thao tác kéo-thả (drag-and-drop) để thay đổi vị trí thứ tự các hạng mục nếu cần thiết. 6\. Người dùng nhấn nút "Lưu chương trình họp". 7\. Hệ thống tiến hành xác thực dữ liệu: Tính tổng thời lượng (số phút) của tất cả các hạng mục để đối chiếu với tổng thời gian quy định của cuộc họp. 8\. Hệ thống lưu cấu hình kịch bản, hiển thị thông báo "Cập nhật chương trình họp thành công" và cập nhật giao diện hiển thị danh sách các mục thảo luận. |  |  |
| Alternative Flows: | **A1. Chỉnh sửa/Xóa hạng mục:** Trước hoặc sau khi lưu, người dùng có thể nhấn vào biểu tượng "Cây bút" (Chỉnh sửa) hoặc "Thùng rác" (Xóa) ở từng dòng hạng mục độc lập để tinh chỉnh nội dung, sau đó hệ thống sẽ tự động cập nhật lại tổng thời gian.  |  |  |
| Exceptions: | **E1. Vượt quá giới hạn thời gian (Time Overflow):** Tại bước 7, nếu tổng thời lượng các hạng mục cộng lại lớn hơn quỹ thời gian thực tế của sự kiện (Ví dụ: Sự kiện diễn ra trong 60 phút, nhưng các mục Agenda cộng lại lên tới 75 phút), hệ thống sẽ chặn thao tác lưu. Các con số thời gian bị bôi đỏ kèm theo cảnh báo: "Tổng thời lượng phân bổ đang vượt quá quỹ thời gian của cuộc họp. Vui lòng cắt giảm hoặc gia hạn thêm thời gian cho cuộc họp." **E2. Gán nhầm người phụ trách:** Tại bước 3, danh sách xổ xuống của mục "Người phụ trách" chỉ hiển thị những nhân sự đang có mặt trong danh sách khách mời (Participants) của sự kiện này. Nếu người dùng cố tình nhập tay một tên người lạ chưa được mời, hệ thống sẽ báo lỗi và yêu cầu người dùng quay lại bước "Thêm thành viên nội bộ" trước khi giao việc cho họ. |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 :** Hệ thống đảm bảo tính hợp lý của kịch bản thời gian, không bao giờ cho phép bản Agenda bị vượt hoặc mâu thuẫn với khung giờ chung đã được chốt của phòng họp. **BR2 :** Chỉ Host hoặc Người tổ chức mới có quyền soạn thảo và chỉnh sửa Agenda. Các khách mời thông thường chỉ có quyền Xem (Read-only) để chuẩn bị tinh thần và tài liệu. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

10. #### **UC-MM-10 Xem chương trình họp (Agenda)**


| UC ID and Name: | UC-MM-10 Xem chương trình họp (Agenda)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee  | Secondary Actors: |  |
| Trigger: | Khách mời muốn xem trước nội dung chương trình để chuẩn bị tài liệu hoặc chuẩn bị bài phát biểu của cá nhân, hoặc người tham gia muốn theo dõi tiến độ của các chủ đề khi cuộc họp đang thực sự diễn ra.  |  |  |
| Description: | Chức năng cho phép mọi cá nhân có liên quan (khách mời, người tổ chức) xem lại toàn bộ cấu trúc nội dung đã được Người chủ trì (Host) dày công soạn thảo từ trước. Hệ thống sẽ hiển thị một danh sách trực quan bao gồm các chủ đề cần thảo luận, thứ tự trình bày logic, mốc thời gian/thời lượng dự kiến và định danh cá nhân phụ trách từng mục cụ thể. Chức năng này đóng vai trò như một chiếc "bản đồ", giúp đồng bộ hóa thông tin trong giai đoạn chuẩn bị (Pre-meeting) và điều hướng thảo luận đi đúng trọng tâm ở giai đoạn thực thi (In-meeting).  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống với tài khoản hợp lệ. **PRE2:** Người dùng là thành viên có quyền truy cập vào cuộc họp (là Người tạo, Người chủ trì, hoặc nằm trong Danh sách Người tham dự). **PRE3:** Cuộc họp này đã được cấu hình và lưu ít nhất một hạng mục thảo luận trong Chương trình họp (Agenda). |  |  |
| Postconditions: | **POST1:** Hệ thống truy xuất và hiển thị chính xác danh sách các hạng mục Agenda trên giao diện người dùng theo đúng cấu trúc và trình tự thời gian đã thiết lập. **POST2:** Trạng thái của hệ thống và dữ liệu cuộc họp không có bất kỳ sự thay đổi nào (đây là thao tác thuần túy "Chỉ đọc" \- Read-only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phần "Lịch của tôi" hoặc danh sách cuộc họp cá nhân. 2\. Người dùng chọn vào một sự kiện cụ thể để mở màn hình "Chi tiết cuộc họp". 3\. Người dùng di chuyển xuống khu vực "Chương trình họp" (hoặc nhấp vào thẻ/tab Agenda). 4\. Hệ thống kiểm tra quyền truy cập của người dùng để đảm bảo họ có mặt trong danh sách hợp lệ. 5\. Hệ thống hiển thị danh sách các mục thảo luận được sắp xếp theo đúng trình tự ưu tiên từ trên xuống dưới. 6\. Tại mỗi mục, hệ thống hiển thị trực quan các thông tin cốt lõi: Tên chủ đề thảo luận, Khung giờ bắt đầu \- kết thúc dự phóng (hoặc số phút), và Tên của nhân sự phụ trách trình bày. 7\. Người dùng có thể cuộn trang để xem toàn bộ kịch bản chương trình. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Agenda trống (Empty State):** Tại bước 5, nếu Người chủ trì chưa soạn thảo bất kỳ nội dung nào cho kịch bản sự kiện, hệ thống sẽ không báo lỗi mà chỉ hiển thị một giao diện trống thân thiện kèm dòng chữ: "Chương trình họp chi tiết chưa được thiết lập."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1:** Khách mời (Participant) khi truy cập vào tính năng này chỉ được phép xem nội dung thuần túy. Toàn bộ các công cụ như Nút "Chỉnh sửa", "Xóa", hay "Thêm hạng mục" đều bị hệ thống tự động giấu đi (hide) hoặc vô hiệu hóa đối với tài khoản của họ. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

11. #### **UC-MM-11 Chỉnh sửa chương trình họp (Agenda)** 

| UC ID and Name: | UC-MM-11 Chỉnh sửa chương trình họp (Agenda)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Trigger: | Kế hoạch nội dung của sự kiện có sự thay đổi (ví dụ: cần rút ngắn thời gian phát biểu của một cá nhân, thay đổi người phụ trách trình bày, hoặc đảo lại thứ tự các vấn đề) buộc Người chủ trì phải điều chỉnh lại kịch bản cho phù hợp.  |  |  |
| Description: | Thuộc nhóm tính năng phục vụ công tác chuẩn bị Tiền cuộc họp (Pre-meeting), Use Case này cung cấp công cụ để những nhân sự có thẩm quyền tinh chỉnh lại cấu trúc của bản Chương trình họp (Agenda) đã được tạo trước đó. Người dùng có thể linh hoạt thay đổi tên chủ đề, điều chỉnh thời lượng phân bổ, gán lại người phụ trách, sắp xếp lại thứ tự ưu tiên hoặc xóa bớt các hạng mục không còn cần thiết. Khi thao tác hoàn tất, hệ thống đóng vai trò kiểm toán thời gian: tự động cộng dồn và rà soát để đảm bảo kịch bản mới không vượt quá tổng quỹ thời gian đã đặt phòng, đồng thời đồng bộ hóa kịch bản cập nhật này đến màn hình của tất cả khách mời.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống và sở hữu quyền quản lý đối với cuộc họp này (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Cuộc họp đã có ít nhất một hạng mục thảo luận được thiết lập trong Chương trình họp. |  |  |
| Postconditions: | **POST1:** Phiên bản kịch bản Chương trình họp (Agenda) mới được lưu trữ và cập nhật thành công trên hệ thống. **POST2:** Giao diện hiển thị lịch trình chi tiết của mọi khách mời (Participants) được tự động đồng bộ theo cấu trúc kịch bản mới nhất. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang chi tiết của cuộc họp và di chuyển đến khu vực "Chương trình họp" (Agenda). 2\. Hệ thống hiển thị danh sách các hạng mục nội dung hiện tại theo trình tự thời gian. 3\. Người dùng nhấn vào biểu tượng "Cây bút" (Chỉnh sửa) bên cạnh hạng mục cần thay đổi. 4\. Hệ thống hiển thị biểu mẫu chứa các thông tin hiện tại của hạng mục đó (Tên chủ đề, Thời lượng, Người phụ trách). 5\. Người dùng tiến hành chỉnh sửa các trường thông tin theo nhu cầu mới. 6\. Người dùng nhấn nút "Lưu thay đổi". 7\. Hệ thống tiến hành xác thực dữ liệu: Tính toán lại tổng thời lượng (số phút) của toàn bộ các hạng mục Agenda sau khi đã sửa để đối chiếu với tổng thời gian diễn ra sự kiện. 8\. Hệ thống cập nhật kịch bản mới, hiển thị thông báo "Cập nhật nội dung chương trình thành công" và làm mới lại giao diện danh sách các mục thảo luận. |  |  |
| Alternative Flows: | **A1. Sắp xếp lại thứ tự:** Tại bước 3, thay vì chỉnh sửa thông tin bên trong, người dùng có thể nhấp và giữ chuột tại một hạng mục, kéo thả (Drag and drop) để đổi vị trí của nó lên trên hoặc xuống dưới. Hệ thống sẽ tự động cập nhật lại trình tự thời gian hiển thị sau khi thả chuột. **A2. Xóa hạng mục:** Người dùng có thể nhấn vào biểu tượng "Thùng rác" (Xóa) để loại bỏ hoàn toàn một nội dung thảo luận. Hệ thống sẽ yêu cầu xác nhận trước khi xóa và tự động thu hồi lại số phút phân bổ của hạng mục đó. |  |  |
| Exceptions: | **E1. Vượt quá quỹ thời gian cuộc họp:** Tại bước 7, nếu việc tăng thời lượng của một hạng mục khiến cho tổng số phút của kịch bản lớn hơn tổng thời gian diễn ra cuộc họp (Ví dụ: Sự kiện diễn ra trong 60 phút, nhưng tổng kịch bản sau khi sửa lên thành 70 phút), hệ thống sẽ chặn thao tác lưu. Các con số thời gian bị bôi đỏ kèm theo cảnh báo: "Tổng thời lượng phân bổ đang vượt quá quỹ thời gian của cuộc họp. Vui lòng cắt giảm thời lượng hoặc điều chỉnh giờ kết thúc cuộc họp." **E2. Gán nhầm nhân sự chưa được mời:** Nếu người dùng sửa mục "Người phụ trách" và cố tình nhập một nhân sự không nằm trong Danh sách người tham dự (Participants) của sự kiện, hệ thống sẽ báo lỗi và yêu cầu phải thêm nhân sự đó vào danh sách khách mời trước. **E3. Chỉnh sửa khi cuộc họp đang diễn ra:** Nếu cuộc họp đã đến giờ bắt đầu thực tế và chuyển trạng thái sang "Đang diễn ra" (In-progress), để bảo toàn tính minh bạch của kế hoạch đã thống nhất, hệ thống có thể sẽ khóa chức năng chỉnh sửa/xóa các hạng mục đã qua, chỉ cho phép linh động điều chỉnh thời gian của các hạng mục sắp tới. |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1 :** Tương tự như lúc tạo mới, chỉ Host hoặc Người tổ chức mới có đặc quyền chỉnh sửa Agenda. Toàn bộ các nút công cụ này sẽ bị ẩn đối với góc nhìn của khách mời thông thường. **BR2 :** Hệ thống không bao giờ cho phép kịch bản nội bộ (Agenda) có tổng thời gian phình to vượt qua quỹ thời gian mượn phòng họp vật lý. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

12. #### **UC-MM-12 Xóa chương trình họp (Agenda)** 

| UC ID and Name: | UC-MM-12 Xóa chương trình họp (Agenda)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Trigger: | Kế hoạch nội dung có sự thay đổi, một hoặc một vài chủ đề dự kiến trước đó bị hủy bỏ (do thiếu thời gian, hoặc đã được giải quyết qua kênh khác) và không còn cần thiết phải thảo luận trong phiên họp sắp tới.  |  |  |
| Description: | Nằm trong bộ công cụ quản lý Tiền cuộc họp (Pre-meeting), Use Case này mô tả thao tác của Người tổ chức hoặc Người chủ trì trong việc loại bỏ một hạng mục nội dung ra khỏi kịch bản chương trình họp (Agenda). Hệ thống sẽ tiếp nhận lệnh, xóa bỏ thông tin chủ đề tương ứng, tự động tính toán hoàn trả lại quỹ thời lượng dự kiến của hạng mục đó và làm mới lại danh sách chương trình hiển thị cho tất cả khách mời. Tính năng này giúp giữ cho kịch bản sự kiện luôn tinh gọn và phản ánh đúng nhất thực tế những gì sẽ diễn ra.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và sở hữu đặc quyền quản lý đối với cuộc họp này (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp mục tiêu đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Tồn tại ít nhất một hạng mục thảo luận trong Chương trình họp (Agenda) của sự kiện này để hệ thống có dữ liệu thực hiện thao tác xóa. |  |  |
| Postconditions: | **POST1:** Hạng mục nội dung mục tiêu bị loại bỏ hoàn toàn khỏi kịch bản chương trình họp trên hệ thống. **POST2:** Khung thời gian nội bộ của kịch bản được tự động tính toán lại, và danh sách Agenda mới nhất được đồng bộ hiển thị trên giao diện của tất cả những người tham gia (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang chi tiết của cuộc họp và di chuyển đến khu vực "Chương trình họp" (Agenda). 2\. Hệ thống hiển thị danh sách các hạng mục nội dung hiện tại theo trình tự thời gian. 3\. Người dùng tìm kiếm hạng mục không còn cần thiết và nhấn vào biểu tượng "Thùng rác" (Xóa) nằm ngay cạnh hạng mục đó. 4\. Hệ thống hiển thị một hộp thoại (Pop-up) cảnh báo để tránh thao tác nhầm lẫn: "Bạn có chắc chắn muốn xóa nội dung \[Tên hạng mục\] khỏi chương trình họp?". 5\. Người dùng nhấn nút "Xác nhận xóa". 6\. Hệ thống tiến hành gỡ bỏ hạng mục khỏi kịch bản hiện tại. 7\. Hệ thống tự động khấu trừ thời lượng dự kiến của hạng mục vừa xóa, làm dư ra một khoảng thời gian trống tương ứng trong tổng quỹ thời gian của sự kiện. 8\. Hệ thống hiển thị thông báo "Xóa nội dung chương trình thành công" và tải lại danh sách các mục thảo luận đã được làm gọn. |  |  |
| Alternative Flows: | **A1. Xóa toàn bộ chương trình (Clear all):** Hệ thống hỗ trợ một nút tiện ích "Xóa toàn bộ kịch bản", người dùng có thể nhấp vào đó. Sau một bước xác nhận bảo mật, hệ thống sẽ xóa sạch toàn bộ các hạng mục cùng lúc, đưa kịch bản Agenda trở về trạng thái trống (Empty state) để Người chủ trì thiết lập lại từ đầu.  |  |  |
| Exceptions: | **E1. Thao tác xóa khi cuộc họp đã bắt đầu:** Nhằm bảo toàn tính minh bạch và lịch sử của những gì đã được lên kế hoạch, nếu thời gian hiện tại đã vượt qua mốc giờ bắt đầu và trạng thái cuộc họp đã chuyển sang "Đang diễn ra" (In-progress) hoặc "Đã kết thúc", hệ thống sẽ vô hiệu hóa (làm mờ) biểu tượng Xóa của các hạng mục đã diễn ra.  |  |  |
| Priority: | Thấp  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1 :** Tương tự như quy tắc tạo mới, chỉ có Người chủ trì (Host) hoặc Người tổ chức mới có thể xóa nội dung trong Agenda. Mọi khách mời (Participants) đều bị khóa tính năng này để tránh việc tự ý thay đổi kịch bản của người khác. **BR2 :** Việc xóa một hạng mục trong kịch bản thường mang tính chất điều chỉnh tiểu tiết. Do đó, hệ thống sẽ không tự động phát hành email thông báo đến toàn bộ người tham gia mỗi khi có một dòng Agenda bị xóa, nhằm tránh tình trạng spam hòm thư nội bộ. Khách mời sẽ tự nhận thấy sự thay đổi khi họ chủ động mở xem lại chi tiết sự kiện trên ứng dụng. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

13. #### **UC-MM-13 Cấu hình tính năng ghi hình**


| UC ID and Name: | UC-MM-13 Cấu hình tính năng ghi hình  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Trigger: | Người tổ chức muốn lưu trữ lại toàn bộ diễn biến, hình ảnh và âm thanh của buổi họp để làm biên bản điện tử, phục vụ cho việc đối soát sau này hoặc chia sẻ cho những nhân sự vắng mặt không thể tham gia trực tiếp.  |  |  |
| Description: | Chức năng cho phép Người tổ chức quyết định xem sự kiện này có được ghi hình hay không. Thao tác này có thể được thực hiện ngay lúc khởi tạo cuộc họp mới hoặc trong quá trình chỉnh sửa sự kiện đã lên lịch. Khi cấu hình này được kích hoạt, hệ thống sẽ lưu lại cờ đánh dấu. Đến thời điểm cuộc họp diễn ra, phần mềm trung tâm sẽ dựa vào cấu hình này để tự động "ra lệnh" cho các thiết bị Camera tại phòng họp bắt đầu thu hình ảnh/âm thanh mà không cần con người phải thao tác bấm nút vật lý.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và có quyền thiết lập đối với cuộc họp (là Người tạo hoặc Người chủ trì). **PRE2:** Cuộc họp đang trong quá trình tạo mới, hoặc nếu đã tạo thì phải đang ở trạng thái "Đã lên lịch" (Scheduled). **PRE3:** Không gian phòng phải được trang bị hệ thống Camera IP hoặc phần cứng có hỗ trợ tính năng ghi hình (Recording-enabled). |  |  |
| Postconditions: | **POST1:** Cấu hình bật/tắt ghi hình được lưu thành công vào hồ sơ của cuộc họp. **POST2:** Nếu cấu hình là "Bật", một nhãn dán hoặc biểu tượng cảnh báo "Sự kiện có ghi hình" sẽ tự động hiển thị trên giao diện thông tin cuộc họp của tất cả khách mời để đảm bảo minh bạch về quyền riêng tư. **POST3:** Trạng thái cấu hình được đẩy vào trạng thái sẵn sàng để cấp phát cho Dịch vụ Camera xử lý (Camera Service) khi cuộc họp đến giờ bắt đầu. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào biểu mẫu "Tạo cuộc họp mới" (UC-MM-01) hoặc màn hình "Chỉnh sửa cuộc họp" đối với sự kiện đã lên lịch. 2\. Người dùng cuộn đến phần "Tùy chọn nâng cao" hoặc "Cấu hình phòng họp". 3\. Người dùng tương tác với công tắc (Toggle/Checkbox) mang tên "Cho phép ghi hình cuộc họp" để chuyển sang trạng thái "Bật" (On) hoặc "Tắt" (Off) tùy theo nhu cầu. 4\. Người dùng nhấn nút "Lưu" (hoặc "Cập nhật"). 5\. Hệ thống tiếp nhận lệnh, kiểm tra tính tương thích của phòng họp vật lý (nếu có chọn phòng). 6\. Hệ thống ghi nhận và lưu trữ trạng thái cấu hình ghi hình vào hồ sơ cuộc họp. 7\. Hệ thống hiển thị thông báo thành công và cập nhật lại giao diện chi tiết cuộc họp (ví dụ: bổ sung biểu tượng Máy quay phim màu đỏ nếu đang bật). |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Phòng họp không hỗ trợ thiết bị ghi hình:** Tại bước 5, nếu cấu hình ghi hình được chuyển sang "Bật" nhưng người dùng lại đang chọn một phòng họp không có hạ tầng camera (ví dụ: Phòng họp nhỏ chỉ có bàn ghế), hệ thống sẽ chặn thao tác lưu, tự động gạt công tắc về "Tắt" và hiển thị cảnh báo: "Phòng họp \[Tên phòng\] không được trang bị thiết bị ghi hình. Vui lòng đổi phòng khác hoặc tắt tính năng này." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1:** Mọi sự kiện có bật tính năng ghi hình đều phải hiển thị thông điệp cảnh báo rõ ràng trên email thư mời và trên giao diện xem lịch của người tham dự. Hệ thống không cho phép tính năng "Ghi hình lén" (Stealth recording) dưới mọi hình thức. **BR2 :** Mặc định, chỉ có Người tạo (Creator) và Người chủ trì (Host) mới có quyền sở hữu, quản lý và cấp quyền xem lại tệp video/âm thanh sau khi cuộc họp kết thúc. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

14. #### **UC-MM-14 Tạo chuỗi họp định kỳ**


| UC ID and Name: | UC-MM-14 Tạo chuỗi họp định kỳ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver  | Secondary Actors: |  |
| Trigger: | Quản lý cần lên lịch cho một loạt các buổi làm việc có tính chất lặp đi lặp lại thường xuyên (ví dụ: giao ban sáng thứ Hai hàng tuần, đánh giá hiệu suất cuối mỗi tháng, họp daily hằng ngày) nhằm tiết kiệm thời gian thiết lập thay vì phải tạo thủ công từng sự kiện lẻ tẻ.  |  |  |
| Description: | Nằm trong giai đoạn Tiền cuộc họp (Pre-meeting), Use Case này cung cấp một công cụ tự động hóa mạnh mẽ. Thay vì phải điền thông tin hàng chục lần cho các cuộc họp giống hệt nhau, Quản lý chỉ cần khởi tạo một sự kiện gốc ban đầu và khai báo bộ "Quy tắc lặp lại" (Recurrence Rule). Hệ thống sẽ đóng vai trò như một cỗ máy nhân bản: tự động nội suy thời gian, sao chép các thông tin nền tảng và trải đều một chuỗi (Series) các sự kiện trên lịch chung của tổ chức. Tính năng này giúp chuẩn hóa các nghi thức vận hành nội bộ (Ceremonies) một cách nhanh chóng và đồng bộ.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản Quản lý hoặc có đặc quyền tạo sự kiện lịch. **PRE2:** Hệ thống danh bạ nội bộ và danh mục phòng họp đang ở trạng thái khả dụng để tra cứu. |  |  |
| Postconditions: | **POST1:** Một chuỗi các cuộc họp (Meeting Series) được khởi tạo thành công trên hệ thống, mỗi sự kiện lặp lại được ghi nhận như một hồ sơ độc lập nhưng vẫn giữ mối liên kết chuỗi với nhau. **POST2:** Trạng thái giữ chỗ phòng họp vật lý (nếu có) được hệ thống đăng ký đồng loạt cho tất cả các khung giờ lặp lại trong tương lai. **POST3:** Hệ thống tự động phát hành thư mời/thông báo lịch họp định kỳ đến toàn bộ danh sách khách mời (Participants) của chuỗi sự kiện. |  |  |
| Normal Flow: | 1\. Người dùng truy cập chức năng "Tạo cuộc họp mới" và điền các thông tin của sự kiện đầu tiên (Tiêu đề, Giờ bắt đầu, Giờ kết thúc, Phòng họp, Danh sách khách mời). 2\. Người dùng tích chọn hộp kiểm (Checkbox) hoặc bật công tắc "Cuộc họp định kỳ" (Recurring Meeting). 3\. Hệ thống hiển thị khung cấu hình quy tắc lặp lại (Recurrence settings). 4\. Người dùng thiết lập các tham số lặp: **Tần suất lặp:** Hàng ngày (Daily), Hàng tuần (Weekly), hoặc Hàng tháng (Monthly). **Chu kỳ chi tiết:** (Ví dụ: Lặp lại vào Thứ Hai và Thứ Năm hàng tuần, hoặc Lặp lại vào ngày 15 hàng tháng). **Điều kiện kết thúc:** Chọn mốc dừng (Ví dụ: Kết thúc sau đúng 10 lần họp, hoặc Kết thúc vào ngày 31/12/2026). 5.Người dùng rà soát lại thông tin và nhấn nút "Lưu chuỗi cuộc họp". 6\. Hệ thống tiến hành xác thực quy tắc lặp, quét qua toàn bộ các mốc thời gian tương lai để kiểm tra tính hợp lệ. 7\. Hệ thống tự động sinh ra danh sách các sự kiện rời rạc trên lưới lịch (Calendar) tương ứng với quy tắc đã thiết lập. 8\. Hệ thống hoàn tất việc giữ chỗ tài nguyên, hiển thị thông báo "Tạo chuỗi cuộc họp định kỳ thành công" và kích hoạt tiến trình gửi thư mời đồng loạt. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Xung đột phòng họp cục bộ (Partial Conflict):** Tại bước 6, do tạo ra cùng lúc nhiều sự kiện, rất có thể trong 10 cuộc họp tương lai sẽ có 2 buổi bị trùng lịch phòng họp với một nhóm khác đã đặt trước. Hệ thống sẽ hiển thị một Pop-up cảnh báo thông minh: "Phòng \[Tên phòng\] đã bị đặt trước vào các ngày \[Ngày X\], \[Ngày Y\]. Bạn muốn bỏ trống phòng vào các ngày này (chọn phòng sau) hay đổi sang một phòng khác cho toàn bộ chuỗi?". **E2. Cảnh báo quá giới hạn lặp (Infinite Loop Prevention):** Để bảo vệ hiệu suất hệ thống và tránh phình to dữ liệu rác trên lịch, hệ thống không cho phép tạo chuỗi vô hạn. Nếu người dùng chọn mốc kết thúc quá xa (ví dụ kéo dài hơn 2 năm) hoặc để trống điều kiện kết thúc, hệ thống sẽ tự động chặn hoặc áp đặt một giới hạn mặc định (Ví dụ: "Hệ thống chỉ hỗ trợ tạo chuỗi tối đa 50 sự kiện hoặc kéo dài tối đa 1 năm. Vui lòng điều chỉnh lại điều kiện kết thúc"). |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Trung bình |  |  |
| Business Rules: | **BR1 :** Các cuộc họp sinh ra từ tính năng này phải được quản lý ngầm bằng một "Mã chuỗi gốc" (Series ID). Điều này làm cơ sở cho việc chỉnh sửa sau này (khi người dùng sửa 1 buổi họp, hệ thống sẽ biết để hỏi: "Bạn muốn sửa chỉ sự kiện này, hay toàn bộ chuỗi?"). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

15. #### **UC-MM-15 Xem chuỗi họp định kỳ**


| UC ID and Name: | UC-MM-15 Xem chuỗi họp định kỳ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee  | Secondary Actors: |  |
| Trigger: | Người dùng đang theo dõi một dự án dài hạn hoặc một hoạt động thường kỳ của phòng ban. Họ muốn có cái nhìn tổng quan về toàn bộ các phiên họp trong chuỗi định kỳ đó (kiểm tra lại các buổi đã họp trong quá khứ hoặc xem trước lịch trình các buổi sắp tới) để sắp xếp khối lượng công việc cá nhân.  |  |  |
| Description: | Nằm trong nhóm tính năng quản lý lịch trình trải nghiệm người dùng, Use Case này cung cấp một giao diện tập trung (List view hoặc Timeline) gom nhóm toàn bộ các sự kiện con (Occurrences) thuộc về cùng một chuỗi cuộc họp định kỳ (Meeting Series). Thay vì phải lần mò từng ngày trên lưới lịch chung, người dùng chỉ cần một cú nhấp chuột để trải ra danh sách toàn bộ các phiên họp liên quan. Tại đây, hệ thống hiển thị rõ ràng thời gian thực tế, không gian tổ chức (phòng họp) và đặc biệt là Trạng thái (Đã hoàn tất, Đang lên lịch, Đã hủy) của từng buổi họp cụ thể.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản hợp lệ. **PRE2:** Người dùng là thành viên có quyền truy cập vào chuỗi sự kiện này (là Người tạo, Người chủ trì, hoặc nằm trong Danh sách Khách mời của chuỗi). **PRE3:** Tồn tại ít nhất một chuỗi cuộc họp định kỳ đã được khởi tạo trên hệ thống. |  |  |
| Postconditions: | **POST1:** Hệ thống truy xuất và hiển thị thành công danh sách chi tiết các cuộc họp thuộc chuỗi theo đúng trình tự thời gian. **POST2:** Không có bất kỳ dữ liệu nào bị thay đổi (Đây là thao tác truy vấn "Chỉ đọc" \- Read-only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Lịch của tôi" hoặc danh sách quản lý cuộc họp. 2\. Người dùng tìm và nhấp vào xem chi tiết một buổi họp bất kỳ (có gắn biểu tượng Lặp lại/Recurring). 3\. Tại màn hình chi tiết, người dùng nhấn vào nút chức năng "Xem toàn bộ chuỗi" (View Series) hoặc chuyển sang thẻ (tab) "Danh sách chuỗi sự kiện". 4\. Hệ thống tiến hành xác thực quyền truy cập, nhận diện "Mã định danh chuỗi" (Series ID) của buổi họp hiện tại. 5\. Hệ thống truy xuất toàn bộ các buổi họp con có chung vòng lặp và sắp xếp chúng theo trình tự thời gian từ quá khứ đến tương lai. 6\. Hệ thống hiển thị danh sách trên màn hình. Mỗi dòng sự kiện sẽ cung cấp tóm tắt: Ngày tháng, Giờ bắt đầu \- Giờ kết thúc, Địa điểm phòng họp, và Trạng thái hiện tại (Đã lên lịch, Đang diễn ra, Đã kết thúc, hoặc Đã hủy). 7\. Người dùng có thể nhấp vào một dòng sự kiện cụ thể trong danh sách này để nhảy đến trang xem chi tiết của chính phiên họp ngày hôm đó. |  |  |
| Alternative Flows: | **A1. Lọc và phân loại danh sách:** Nếu chuỗi sự kiện kéo dài quá lâu (ví dụ họp daily trong suốt 3 tháng), tại bước 6, người dùng có thể sử dụng các bộ lọc tiện ích (Filters) để chỉ hiển thị "Các cuộc họp sắp tới" (Upcoming) nhằm làm gọn màn hình, ẩn đi các buổi đã hoàn tất trong quá khứ.  |  |  |
| Exceptions: | **E1. Chuỗi sự kiện không còn tồn tại:** Nếu toàn bộ chuỗi sự kiện đã bị Quản trị viên xóa bỏ hoàn toàn khỏi hệ thống trong lúc người dùng đang giữ đường dẫn (link) trang cũ, hệ thống sẽ hiển thị thông báo lỗi: "Chuỗi cuộc họp này không còn tồn tại hoặc đã bị xóa."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên  |  |  |
| Business Rules: | **BR1 :** Nếu trong chuỗi có một vài buổi họp cá biệt bị Người chủ trì dời lịch, đổi phòng khác hoặc hủy bỏ (Ngoại lệ so với quy tắc lặp ban đầu), hệ thống bắt buộc phải phản ánh rõ ràng sự sai khác đó trên danh sách này (Ví dụ: Hiển thị chữ "Đã hủy" màu đỏ gạch ngang, hoặc gắn thẻ "Đã dời lịch" bên cạnh mốc thời gian mới). **BR2 :** Giao diện danh sách chuỗi chỉ hiển thị các thông tin khái quát chung. Các dữ liệu mang tính thời điểm của từng phiên (như file biên bản cuộc họp của ngày hôm đó, hoặc báo cáo điểm danh của ngày hôm đó) không được đổ tràn ra danh sách này mà yêu cầu người dùng phải nhấp sâu vào từng sự kiện chi tiết mới xem được. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

16. #### **UC-MM-16 Chỉnh sửa chuỗi họp định kỳ** 

| UC ID and Name: | UC-MM-16 Chỉnh sửa chuỗi họp định kỳ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver  | Secondary Actors: |  |
| Trigger: | Có sự thay đổi mang tính chiến lược hoặc dài hạn đối với kế hoạch họp thường kỳ (ví dụ: chuyển lịch giao ban từ sáng thứ Hai sang chiều thứ Sáu hàng tuần, hoặc cần chuyển toàn bộ chuỗi họp sang một phòng lớn hơn do phòng ban vừa tuyển thêm nhân sự).  |  |  |
| Description: | Nằm trong nhóm tính năng quản trị lịch trình nâng cao, Use Case này cung cấp cho Người chủ trì công cụ để cập nhật thông tin hàng loạt (Bulk update) đối với một chuỗi cuộc họp đã được lên lịch. Thay vì phải đi vào từng ngày để sửa đổi thủ công, người dùng chỉ cần thao tác một lần trên cấu hình chuỗi gốc. Hệ thống sẽ tự động quét, nội suy và áp dụng bộ thông tin mới (như Giờ giấc, Phòng họp, Danh sách khách mời, hay Quy tắc lặp lại) lên toàn bộ các sự kiện con (Occurrences) có liên quan. Quá trình này cũng bao gồm việc hệ thống tự động thiết lập lại quỹ tài nguyên phòng họp và phát hành thông báo cập nhật đồng loạt đến những người tham gia.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và sở hữu quyền quản lý đối với chuỗi cuộc họp này (là Người tạo hoặc Người chủ trì). **PRE2:** Chuỗi cuộc họp đang tồn tại trên hệ thống và có ít nhất một hoặc nhiều sự kiện con ở trạng thái "Đã lên lịch" (Scheduled) trong tương lai. |  |  |
| Postconditions: | **POST1:** Cấu hình mới của chuỗi sự kiện được lưu trữ thành công và đồng bộ hóa lên tất cả các phiên họp con bị ảnh hưởng. **POST2:** Tài nguyên phòng họp (nếu có thay đổi) được giải phóng khỏi các khung giờ cũ và được chốt giữ lại thành công theo lịch trình mới. **POST3:** Hệ thống tự động đẩy tác vụ gửi email thông báo cập nhật lịch họp định kỳ vào hàng đợi để gửi đến tất cả khách mời (Participants) của chuỗi. |  |  |
| Normal Flow: | 1\. Người dùng truy cập phân hệ "Lịch của tôi" hoặc danh sách quản lý, tìm và nhấp vào xem chi tiết một buổi họp bất kỳ thuộc chuỗi cần sửa. 2\. Người dùng nhấn nút chức năng "Chỉnh sửa" (Edit). 3\. Hệ thống nhận diện đây là một sự kiện lặp lại và hiển thị hộp thoại (Pop-up) hỏi phạm vi áp dụng: "Chỉ chỉnh sửa buổi họp này" (Just this one) hay "Chỉnh sửa toàn bộ chuỗi" (The entire series). 4\. Người dùng chọn "Chỉnh sửa toàn bộ chuỗi". 5\. Hệ thống tải biểu mẫu chứa toàn bộ thông tin gốc của chuỗi sự kiện (bao gồm cả Quy tắc lặp lại \- Recurrence rules). 6\. Người dùng tiến hành cập nhật các thông tin cần thiết (Đổi ngày, Đổi giờ, Đổi phòng, hoặc Thêm/Bớt người tham dự). 7\. Người dùng nhấn nút "Lưu thay đổi". 8\. Hệ thống tiếp nhận lệnh, kiểm tra tính hợp lệ của các mốc thời gian mới và rà soát tình trạng trống của phòng họp trên toàn bộ quỹ thời gian tương lai. 9.Hệ thống tiến hành cập nhật dữ liệu hàng loạt: áp dụng thông tin mới cho toàn bộ các sự kiện con thuộc chuỗi. 10\. Hệ thống hiển thị thông báo "Cập nhật chuỗi cuộc họp thành công" và tự động kích hoạt tiến trình gửi thư thông báo đến khách mời. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Xung đột phòng họp cục bộ (Partial Conflict):** Tại bước 8, nếu việc thay đổi thời gian/địa điểm làm phát sinh trùng lịch phòng họp tại một hoặc một vài ngày cụ thể trong chuỗi tương lai, hệ thống sẽ tạm dừng thao tác lưu và hiển thị cảnh báo: "Phòng họp mới bị trùng lịch vào các ngày \[Ngày X\], \[Ngày Y\]. Vui lòng chọn cách xử lý: (1) Bỏ trống phòng vào các ngày này; (2) Chọn một phòng khác cho toàn bộ chuỗi". **E2. Cố ý sửa đổi lịch sử trong quá khứ:** Hệ thống được thiết kế để bảo vệ tính toàn vẹn của dữ liệu quá khứ. Do đó, khi người dùng chọn "Sửa toàn bộ chuỗi", hệ thống sẽ chỉ cập nhật sự thay đổi (ví dụ: đổi tên cuộc họp, đổi phòng) cho các sự kiện ở TƯƠNG LAI. Các phiên họp đã diễn ra và kết thúc trong quá khứ sẽ bị khóa cứng (Read-only), không chịu tác động của thao tác chỉnh sửa hàng loạt này nhằm phục vụ công tác kiểm toán sau này. **E3. Giới hạn ngày kết thúc không hợp lệ:** Nếu người dùng sửa đổi quy tắc lặp lại và chọn một ngày kết thúc chuỗi lùi về trước thời điểm hiện tại (nằm trong quá khứ), hệ thống sẽ bôi đỏ trường nhập liệu và báo lỗi: "Ngày kết thúc chuỗi phải nằm ở tương lai."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Trung bình |  |  |
| Business Rules: | **BR1 :** Tương tự các thao tác quản lý khác, đặc quyền chỉnh sửa chuỗi chỉ được cấp cho Người tổ chức hoặc Chủ tọa. **BR2 :** Nếu trước đó trong chuỗi có một buổi họp ngày thứ 4 đã bị đổi giờ sang buổi chiều (tạo thành một sự kiện ngoại lệ \- Exception), thì khi thao tác "Sửa toàn bộ chuỗi" được thực thi, hệ thống sẽ hiển thị một câu hỏi: "Bạn có muốn ghi đè (Overwrite) lên các buổi họp đã được chỉnh sửa ngoại lệ trước đó không?". Nếu người dùng chọn "Không", buổi họp thứ 4 vẫn giữ nguyên lịch buổi chiều của nó. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

17. #### **UC-MM-17 Hủy chuỗi họp định kỳ** 

| UC ID and Name: | UC-MM-17 Hủy chuỗi họp định kỳ  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver  | Secondary Actors: |  |
| Trigger: | Hoạt động, dự án hoặc quy trình làm việc định kỳ đã hoàn thành sớm hơn dự kiến, hoặc toàn bộ kế hoạch dự án bị đình chỉ. Do đó, Người quản lý cần chấm dứt và gỡ bỏ toàn bộ lịch trình họp mặt trong tương lai để giải phóng quỹ thời gian cho mọi người.  |  |  |
| Description: | Nằm trong nhóm tính năng quản lý lịch trình nâng cao, Use Case này cung cấp giải pháp nhanh chóng để Người chủ trì chấm dứt vòng đời của một chuỗi cuộc họp (Meeting Series). Thay vì phải mất công đi vào từng tuần/từng tháng để hủy lẻ tẻ từng sự kiện, người dùng chỉ cần thao tác một lần. Hệ thống sẽ quét toàn bộ các sự kiện con (Occurrences) thuộc chuỗi này tính từ thời điểm hiện tại trở về tương lai, tự động chuyển đổi chúng sang trạng thái "Đã hủy", đồng thời giải phóng hàng loạt không gian phòng họp vật lý đã bị giữ chỗ trước đó. Quá trình này hoàn toàn không làm ảnh hưởng hay xóa bỏ lịch sử của các buổi họp đã diễn ra thành công trong quá khứ.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống hợp lệ và sở hữu đặc quyền quản lý đối với chuỗi cuộc họp này (là Người tạo, Người chủ trì hoặc Quản trị viên). **PRE2:** Chuỗi sự kiện đang tồn tại trên hệ thống và còn ít nhất một sự kiện con ở tương lai đang ở trạng thái "Đã lên lịch" (Scheduled). |  |  |
| Postconditions: | **POST1:** Toàn bộ các buổi họp thuộc chuỗi (tính từ thời điểm hủy trở đi) được cập nhật sang trạng thái "Đã hủy" (Cancelled) và có thể bị gạch ngang/ẩn đi trên lưới lịch. **POST2:** Tài nguyên phòng họp vật lý liên kết với các sự kiện tương lai của chuỗi này được giải phóng hoàn toàn, trở lại trạng thái trống (Available) cho người khác đặt chỗ. **POST3:** Một luồng tác vụ tự động gửi email/thông báo "Hủy chuỗi cuộc họp" được đưa vào hàng đợi để gửi đồng loạt đến danh sách khách mời (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phần "Lịch của tôi", tìm và nhấp vào xem chi tiết một buổi họp bất kỳ thuộc chuỗi cần hủy (ưu tiên sự kiện chưa diễn ra). 2\. Người dùng nhấn vào nút hành động "Hủy cuộc họp". 3\. Hệ thống nhận diện đây là một sự kiện lặp lại và hiển thị hộp thoại (Pop-up) yêu cầu xác nhận phạm vi: "Bạn muốn hủy buổi họp này hay hủy toàn bộ chuỗi cuộc họp?". 4\. Người dùng chọn tùy chọn "Hủy toàn bộ chuỗi", điền thêm "Lý do hủy" vào ô văn bản (tùy chọn) và nhấn "Xác nhận hủy". 5\. Hệ thống tiếp nhận lệnh và tiến hành khóa cấu hình chuỗi để chặn các chỉnh sửa trùng lặp. 6\. Hệ thống phân tách dữ liệu thời gian: Giữ nguyên vẹn hồ sơ của các cuộc họp đã kết thúc (trong quá khứ). Quét và chuyển đổi toàn bộ các sự kiện ở tương lai sang trạng thái "Đã hủy". 7\. Hệ thống gỡ bỏ toàn bộ liên kết giữ chỗ giữa chuỗi này và phòng họp vật lý trong tương lai. 8\. Hệ thống hiển thị thông báo "Hủy chuỗi cuộc họp định kỳ thành công" và tự động kích hoạt luồng gửi thư thông báo đến những người tham gia. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Chuỗi sự kiện đã kết thúc hoàn toàn trong quá khứ:** Nếu người dùng vô tình mở xem một chuỗi cuộc họp mà buổi họp cuối cùng của chuỗi đã kết thúc cách đây nhiều ngày, nút "Hủy cuộc họp/Hủy chuỗi" sẽ bị hệ thống làm mờ (disabled) hoặc ẩn đi để bảo vệ dữ liệu lịch sử. **E2. Hủy chuỗi khi đang có một buổi họp diễn ra (In-progress):** Nếu thao tác hủy chuỗi được thực hiện ngay trong lúc có một buổi họp (thuộc chuỗi đó) đang diễn ra thực tế, hệ thống sẽ bảo vệ buổi họp hiện tại (bắt buộc Host phải "Kết thúc sớm" thủ công), và chỉ áp dụng trạng thái "Đã hủy" cho tất cả các buổi họp của tuần/tháng tiếp theo. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1:** Quyền hủy toàn bộ chuỗi chỉ được trao cho Người chủ trì (Host), Người tạo (Creator) hoặc Admin. Các thành viên bình thường chỉ có thể chọn "Từ chối tham gia" (Decline) cho cá nhân mình đối với chuỗi này. **BR2 :** Một khi chuỗi đã bị hủy, toàn bộ các sự kiện tương lai sẽ mất liên kết với phòng họp. Người dùng không thể nhấn nút "Hoàn tác" (Undo) để khôi phục lại chuỗi. Nếu đổi ý, họ bắt buộc phải thiết lập lại từ đầu một chuỗi mới. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

18. #### **UC-MM-18 Đặt phòng họp đột xuất (Ad-hoc)** 

| UC ID and Name: | UC-MM-18 Đặt phòng họp đột xuất (Ad-hoc)  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee  | Secondary Actors: |  |
| Trigger: | Phát sinh nhu cầu cần không gian thảo luận ngay lập tức mà không hề có kế hoạch đặt lịch từ trước.  |  |  |
| Description: | Khác với luồng đặt lịch tiêu chuẩn (kéo dài từ lúc lên kế hoạch đến lúc diễn ra), Use Case này cung cấp một công cụ "Luồng tốc hành" (Express flow) để khởi tạo cuộc họp. Hệ thống thực hiện quét tài nguyên theo thời gian thực (Real-time) để tìm ra các phòng họp đang trống. Điểm nhấn thông minh của tính năng này là cơ chế "Cảnh báo xung đột con người": hệ thống tự động đối chiếu lịch cá nhân của các thành viên được mời. Nếu phát hiện họ đang kẹt trong một sự kiện khác, hệ thống sẽ đưa ra cảnh báo mềm (Soft-warning) nhưng vẫn trao toàn quyền quyết định cho Người chủ trì được phép "ép lưu" nếu sự hiện diện của nhân sự đó không mang tính bắt buộc (Optional). Ngay khi hoàn tất, phòng họp được khóa và hệ thống phát lệnh tập hợp khẩn cấp.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập vào hệ thống ứng dụng Web (hoặc thao tác trực tiếp trên màn hình máy tính bảng đặt trước cửa phòng họp). **PRE2:** Quỹ tài nguyên tổ chức đang có ít nhất một phòng họp khả dụng (Available) không bị ai đặt trước trong khoảng thời gian sắp tới. |  |  |
| Postconditions: | **POST1:** Hồ sơ cuộc họp đột xuất được tạo lập thành công và lập tức chuyển sang trạng thái "Đang diễn ra" (In-progress), bỏ qua giai đoạn "Đã lên lịch" (Scheduled). **POST2:** Trạng thái của phòng họp vật lý chuyển sang "Đang bận" (Occupied) trên lưới lịch chung để ngăn chặn người khác bước vào. **POST3:** Nếu cấu hình ghi hình được Bật, hệ thống gửi lệnh trực tiếp đến Dịch vụ Camera/Ghi hình (Recording Service) để bắt đầu thu hình/âm thanh ngay lập tức. **POST4:** Một luồng tác vụ ưu tiên cao được kích hoạt để gửi email thư mời khẩn cấp (kèm đầy đủ thông tin bối cảnh, phòng họp, và cảnh báo có ghi hình) đến danh sách khách mời (Participants). |  |  |
| Normal Flow: | 1\. Người dùng truy cập màn hình chính và nhấn vào nút tác vụ nhanh "Họp đột xuất" (Ad-hoc Meeting). 2\. Hệ thống lấy mốc thời gian thực tại (Now) làm Giờ bắt đầu tự động. 3\. Người dùng nhập tên tiêu đề nhanh (Ví dụ: "Họp xử lý lỗi thanh toán") và ước lượng Thời lượng cần thiết (Ví dụ: 15, 30, hoặc 60 phút). 4\. Hệ thống quét dữ liệu và chỉ hiển thị danh sách các phòng họp đang trống tương ứng với số phút vừa chọn. 5\. Người dùng chọn một phòng họp phù hợp từ danh sách. 6\. Người dùng tùy chỉnh công tắc "Ghi hình cuộc họp": Bật (On) hoặc Tắt (Off) tùy theo mức độ quan trọng của sự kiện (Mặc định là Tắt). 7\. Người dùng tìm kiếm và thêm danh sách Người tham dự (Participants). 8\. Hệ thống kiểm tra chéo (Cross-check) lịch cá nhân của từng khách mời vừa thêm. (Nếu không ai bận, hệ thống bỏ qua bước cảnh báo). 9\. Người dùng nhấn nút "Bắt đầu họp ngay". 10\. Hệ thống rà soát tính hợp lệ của việc ghi hình đối với phòng được chọn. 11\. Hệ thống khóa phòng, lưu dữ liệu, kích hoạt ghi hình (nếu có) và hiển thị thông báo "Phòng họp đã sẵn sàng". 12\. Hệ thống kích hoạt đồng thời email thông báo khẩn cấp và chuyển giao diện của người dùng sang màn hình điều khiển trong cuộc họp (In-meeting Dashboard). |  |  |
| Alternative Flows: | **A1. Khách mời bị trùng lịch (Conflict Warning):** Tại bước 7, nếu hệ thống rà soát thấy một hoặc nhiều khách mời đang có lịch bận ngay tại thời điểm này, hệ thống sẽ hiển thị một pop-up cảnh báo mềm (Soft-warning): "Thành viên \[Tên\] hiện đang có lịch họp khác. Vẫn tiếp tục gửi lời mời?". Người dùng (do đánh giá thành viên này chỉ cần dự thính hoặc không bắt buộc) nhấn "Tiếp tục" để ép hệ thống đưa người này vào danh sách và tiến hành bước 8\.  |  |  |
| Exceptions: | **E1. Không còn phòng trống (No Rooms Available):** Tại bước 4, nếu tất cả các phòng họp trong văn phòng đều đang được sử dụng hoặc đã được đặt trước sát giờ, hệ thống sẽ hiển thị thông báo: "Hiện tại không còn phòng họp nào trống cho thời lượng bạn yêu cầu. Vui lòng rút ngắn thời lượng hoặc chờ đến \[Khung giờ trống gần nhất\]." **E2. Xung đột tài nguyên phút chót (Concurrency Racing):** Tại bước 8, do tính chất khẩn cấp, nếu có một nhân viên khác vừa bấm chốt đúng phòng họp đó nhanh hơn vài mili-giây, hệ thống sẽ chặn thao tác, bôi đỏ ô phòng họp và báo: "Phòng họp này vừa được người khác sử dụng. Vui lòng chọn nhanh phòng khác." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 :** Việc cảnh báo khách mời đang bận chỉ nhằm mục đích cung cấp thông tin (Informative). Phần mềm không được phép dùng nó làm "Lỗi chặn cứng" (Hard-block) khiến người dùng không thể tạo cuộc họp. **BR2 :** Cuộc họp Ad-hoc bỏ qua hoàn toàn quy trình điểm danh trước (nếu có) và trạng thái chờ. Nó ngay lập tức kích hoạt các thiết bị phần cứng Camera tại phòng (nếu có tích hợp) chuyển sang chế độ giám sát "In-meeting". |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 11\. Room Utilization Management

#### 

1. #### **UC-RUM-01 Xem tổng quan trạng thái phòng họp theo thời gian thực** 

| UC ID and Name: | UC-RUM-01 Xem tổng quan trạng thái phòng họp theo thời gian thực  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin   | Secondary Actors: |  |
| Trigger: | Quản trị viên hoặc Quản lý cần nắm bắt tình hình sử dụng không gian làm việc của công ty ngay tại thời điểm hiện tại để điều phối đột xuất, giải quyết xung đột tài nguyên, hoặc giám sát việc tuân thủ quy định đặt phòng.  |  |  |
| Description: | Cung cấp một Bảng điều khiển (Real-time Dashboard) đóng vai trò như một "Trung tâm chỉ huy" cho toàn bộ hệ thống phòng họp vật lý của tổ chức. Giao diện trực quan hóa trạng thái của từng phòng họp theo từng giây (Ví dụ: Trống, Đang sử dụng, Đã đặt trước nhưng chưa tới, Cảnh báo vắng mặt). Bên cạnh việc hiển thị trạng thái bằng màu sắc, hệ thống còn cung cấp ngay lập tức các thông tin ngữ cảnh đi kèm thiết yếu như: Tên cuộc họp đang/chuẩn bị diễn ra, Khung thời gian bắt đầu \- kết thúc, và Tên người tổ chức. Tính năng này giúp đội ngũ quản lý có tầm nhìn toàn cảnh, từ đó đưa ra quyết định tối ưu hóa không gian một cách tức thời.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được phân quyền cấp Quản lý (Manager) hoặc Quản trị viên (Business Admin). **PRE2:** Hệ thống cơ sở vật chất (phòng họp) đã được khai báo đầy đủ trên hệ thống. **PRE3:** Dịch vụ đồng bộ dữ liệu thời gian thực (nhận tín hiệu từ lịch đặt phòng và/hoặc thiết bị cảm biến, thiết bị điểm danh tại phòng) đang hoạt động ổn định. |  |  |
| Postconditions: | **POST1:** Toàn bộ trạng thái và thông tin của các phòng họp được hiển thị chính xác, phản ánh đúng hiện trạng tại giây phút người dùng truy cập. **POST2:** Màn hình tự động làm mới âm thầm để cập nhật luồng dữ liệu liên tục mà người dùng không cần phải tải lại trang. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và chọn menu "Bảng điều khiển trạng thái" (Real-time Dashboard). 2\. Hệ thống tải giao diện và thiết lập luồng kết nối dữ liệu sống. 3\. Hệ thống truy xuất danh sách toàn bộ phòng họp thuộc quyền quản lý của người dùng. 4\. Hệ thống đối chiếu lịch đặt phòng hiện hành và tín hiệu thực tế để gán nhãn trạng thái tự động cho từng phòng: **Available (Trống):** Phòng hiện không có lịch đặt và không có ai sử dụng. **Reserved (Đã đặt trước):** Phòng có lịch chuẩn bị diễn ra trong khoảng thời gian ngắn sắp tới (ví dụ: trong vòng 15 phút nữa). **In-use / Occupied (Đang sử dụng):** Cuộc họp đang diễn ra đúng kế hoạch. **No-show warning (Cảnh báo vắng mặt):** Cuộc họp đã qua giờ bắt đầu nhưng hệ thống (thông qua camera nhận diện hoặc thao tác check-in) chưa ghi nhận sự hiện diện của người tổ chức. 5\. Hệ thống hiển thị danh sách phòng (dưới dạng lưới thẻ \- Grid view, hoặc sơ đồ mặt bằng \- Floor map). 6\. Tại mỗi phòng, người dùng có thể xem tóm tắt: Trạng thái (được mã hóa màu sắc), Tiêu đề cuộc họp, Giờ bắt đầu/Giờ kết thúc, và Người tổ chức. 7\. Người dùng có thể nhấp vào một phòng bất kỳ để xem nhanh luồng sự kiện tiếp theo (Upcoming events) trong ngày của chính phòng đó. |  |  |
| Alternative Flows: | **A1. Lọc và Tìm kiếm phòng:** Tại bước 5, người dùng có thể sử dụng bộ lọc (Filters) trên thanh công cụ để thu hẹp phạm vi giám sát. Ví dụ: Lọc theo Tầng (Floor 1, Floor 2), lọc theo Sức chứa (Capacity), hoặc chỉ hiển thị những phòng đang "Available" để điều phối nhanh cho một nhóm nhân viên đang cần họp đột xuất.  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Bảng điều khiển bắt buộc phải áp dụng quy chuẩn màu sắc thống nhất toàn cầu cho các trạng thái để não bộ người dùng phản xạ nhanh nhất trong 1 giây (Ví dụ: Trống \= Xanh lá, Đang sử dụng \= Đỏ, Cảnh báo vắng mặt \= Nhấp nháy Vàng/Cam).  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

   #### 

2. #### **UC-RUM-02 Tìm kiếm và lọc phòng họp khả dụng** 

| UC ID and Name: | UC-RUM-02 Tìm kiếm và lọc phòng họp khả dụng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Người dùng phát sinh nhu cầu tổ chức cuộc họp nhưng chưa biết chọn không gian nào cho phù hợp. Họ cần một công cụ tra cứu thông minh để tìm ra chính xác căn phòng đáp ứng được các tiêu chí khắt khe của họ. |  |  |
| Description: | Cung cấp một bộ công cụ tìm kiếm đa chiều hỗ trợ người dùng quét qua toàn bộ quỹ tài nguyên không gian của tổ chức. Hệ thống cho phép kết hợp linh hoạt nhiều bộ lọc cùng lúc: Từ khóa tên phòng , Thời gian dự kiến, Sức chứa tối thiểu, Thiết bị đi kèm , Loại phòng, và Trạng thái hiện tại . Thông qua việc thu hẹp dần kết quả, tính năng này giúp người dùng ra quyết định đặt phòng nhanh chóng, loại bỏ hoàn toàn cảm giác "mò kim đáy bể" khi làm việc tại các doanh nghiệp có quy mô cơ sở hạ tầng lớn.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản hợp lệ. **PRE2:** Danh mục phòng họp, kèm theo các thông số cấu hình chi tiết (Sức chứa, Thiết bị, Loại phòng) đã được Quản trị viên thiết lập đầy đủ trên hệ thống. |  |  |
| Postconditions: | **POST1:** Hệ thống trả về và hiển thị danh sách các phòng họp đáp ứng chính xác 100% các tiêu chí tìm kiếm mà người dùng đã thiết lập. **POST2:** Trạng thái của hệ thống dữ liệu không thay đổi. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Quản lý phòng họp" (Room Management) hoặc nhấn vào nút "Tìm phòng" ở màn hình trang chủ. 2\. Hệ thống hiển thị thanh công cụ tìm kiếm và danh sách toàn bộ các phòng họp hiện có (chưa lọc). 3\. Người dùng tiến hành nhập liệu hoặc chọn các tiêu chí tìm kiếm từ bộ lọc: **Từ khóa (Keyword):** Nhập tên phòng hoặc mã phòng. **Khung thời gian:** Chọn Ngày, Giờ bắt đầu và Giờ kết thúc mong muốn. **Sức chứa (Capacity):** Chọn số lượng người tham dự tối thiểu (Ví dụ: \> 10 người). **Thiết bị (Equipment):** Tích chọn các tiện ích bắt buộc (Ví dụ: Máy chiếu, Màn hình LED, Bảng trắng, Micro). **Loại phòng (Room Type):** Chọn phân loại không gian (Ví dụ: Phòng họp truyền thống, Huddle room, Phòng hội thảo, Khu vực nghỉ ngơi). **Trạng thái (Status):** Lọc theo tình trạng hiện tại (Ví dụ: Đang trống \- Available, Đang bảo trì \- Maintenance). 4\. Người dùng nhấn nút "Tìm kiếm" hoặc "Áp dụng bộ lọc" (Hệ thống có thể tự động áp dụng bộ lọc ngay khi người dùng thao tác \- Real-time filtering). 5\. Hệ thống tiếp nhận các tham số, tiến hành rà soát danh mục tài nguyên và đối chiếu chéo với lưới lịch đặt phòng (Calendar Grid) để xác định tính khả dụng. 6\. Hệ thống hiển thị danh sách kết quả trực quan. Tại mỗi thẻ phòng (Room card), hệ thống tóm tắt lại các thông số nổi bật để người dùng dễ dàng so sánh. 7\. Người dùng có thể nhấp vào nút "Đặt phòng này" trực tiếp trên kết quả tìm kiếm để chuyển sang luồng tạo cuộc họp mới. |  |  |
| Alternative Flows: | **A1. Xóa bộ lọc (Clear Filters):** Tại bất kỳ thời điểm nào ở bước 3 hoặc 6, người dùng có thể nhấn nút "Xóa tất cả bộ lọc" (Clear All) để đưa giao diện tìm kiếm trở về trạng thái nguyên bản (hiển thị tất cả các phòng).  |  |  |
| Exceptions: | **E1. Không có kết quả trùng khớp (Empty State):** Tại bước 5, nếu các tiêu chí của người dùng quá khắt khe hoặc thời điểm đó văn phòng đã hết chỗ, hệ thống không tìm thấy bất kỳ phòng nào phù hợp. Giao diện sẽ hiển thị một thông báo thân thiện: "Không tìm thấy phòng họp nào khớp với tiêu chí của bạn. Vui lòng thử nới lỏng các yêu cầu (Ví dụ: Thay đổi khung giờ hoặc bỏ bớt yêu cầu về thiết bị)." **E2. Lỗi logic thời gian tìm kiếm:** Tại bước 3, nếu người dùng nhập "Giờ kết thúc" diễn ra trước "Giờ bắt đầu", hệ thống sẽ chặn thao tác tìm kiếm, bôi đỏ trường nhập liệu và yêu cầu điều chỉnh lại khung thời gian hợp lệ. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 :** Khi người dùng tích chọn nhiều thiết bị (Ví dụ: "Máy chiếu" VÀ "Bảng trắng"), hệ thống chỉ trả về những phòng sở hữu ĐỒNG THỜI tất cả các thiết bị đó, nhằm đảm bảo chất lượng vận hành cuộc họp.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-RUM-03 Xem chi tiết trạng thái phòng họp** 

| UC ID and Name: | UC-RUM-03 Xem chi tiết trạng thái phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Quản lý hoặc Quản trị viên cần tra cứu thông tin chuyên sâu của một không gian họp cụ thể để giải quyết tranh chấp tài nguyên , rà soát lý do một phòng bị bỏ trống, hoặc kiểm tra hiệu suất sử dụng của phòng đó trong ngày.  |  |  |
| Description: | Cung cấp một màn hình "Hồ sơ chi tiết" (Room Detail Page) cho từng phòng họp độc lập. Vượt ra ngoài các thông số vật lý tĩnh (sức chứa, trang thiết bị), trang này là nơi hội tụ toàn bộ luồng dữ liệu động của phòng họp đó. Quản lý có thể quan sát trực tiếp "nhịp đập" hiện tại của phòng: cuộc họp nào đang diễn ra, ai là người chịu trách nhiệm (Host), và đối chiếu sai số giữa thời gian giữ chỗ trên lịch (Reserved) với thời gian thực tế sử dụng (Actual start/end). Hơn thế nữa, tính năng này còn cung cấp các bản ghi kiểm toán quan trọng như Nhật ký sử dụng (Usage record) và Lịch sử giải phóng tài nguyên (Release history), giúp nhà quản lý có căn cứ xử lý tình trạng đặt phòng ảo (No-show).  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được cấp quyền Quản trị viên (Business Admin) hoặc Quản lý (Manager). **PRE2:** Phòng họp mục tiêu đã được khởi tạo và đang tồn tại trong danh mục tài nguyên của tổ chức. |  |  |
| Postconditions: | **POST1:** Hệ thống truy xuất và trình bày toàn bộ thông tin tĩnh, thông tin thời gian thực và dữ liệu lịch sử của phòng họp được chọn lên màn hình. **POST2:** Trạng thái cơ sở dữ liệu không bị thay đổi (Đây là thao tác truy vấn "Chỉ đọc"). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào "Bảng điều khiển trạng thái" hoặc danh sách quản lý phòng họp. 2\. Người dùng nhấp chọn vào một phòng họp cụ thể . 3\. Hệ thống tải dữ liệu và hiển thị "Trang chi tiết phòng họp" (Room Detail Page) với các phân vùng thông tin như sau: **Thông tin phòng (Room Info):** Hình ảnh, Vị trí (Tầng/Tòa nhà), Sức chứa tối đa, và Danh sách thiết bị đính kèm. **Trạng thái hiện hành (Current Booking):** Tên cuộc họp đang diễn ra (hoặc sắp diễn ra gần nhất), Tên Người chủ trì (Host), và Khung thời gian được giữ chỗ (Reserved Time). **Chỉ số thực tế (Actual Metrics):** Giờ bắt đầu thực tế (Actual Start) và Giờ kết thúc thực tế (Actual End) lấy tín hiệu từ quá trình check-in/check-out của người dùng. **Cảnh báo vắng mặt (No-show Status):** Hiển thị cảnh báo màu đỏ/vàng nếu Người chủ trì chưa xác nhận sử dụng phòng khi đã quá giờ bắt đầu dự kiến. 4\. Người dùng cuộn xuống để xem các phân vùng dữ liệu lịch sử (được tổ chức dưới dạng danh sách hoặc bảng): **Nhật ký sử dụng (Usage Record):** Liệt kê các cuộc họp đã diễn ra và hoàn tất thành công trong ngày/tuần tại phòng này. **Lịch sử giải phóng (Release History):** Ghi nhận lại các phiên đặt phòng bị hủy giữa chừng (do quản trị viên thu hồi, người dùng kết thúc sớm, hoặc hệ thống tự động giải phóng do lỗi No-show). |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Phòng trống không có lịch trình (No Active Booking):** Tại bước 3, nếu tại thời điểm xem, phòng đang không có ai sử dụng và cũng không có lịch đặt trước trong tương lai gần, khu vực "Trạng thái hiện hành" (Current Booking) sẽ hiển thị thông báo thân thiện: "Phòng hiện đang trống (Available)" và các ô thông tin Host/Thời gian sẽ hiển thị dấu gạch ngang (-).  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Cao |  |  |
| Business Rules: | **BR1:** Giao diện bắt buộc phải thiết kế để Quản lý có thể đối chiếu trực tiếp giữa "Reserved Time" (Giờ đặt trên lịch) và "Actual Time" (Giờ dùng thực tế). Khoảng chênh lệch giữa hai mốc thời gian này là cơ sở để hệ thống đánh giá mức độ lãng phí tài nguyên của người đặt.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-RUM-04 Xem lịch sử sử dụng phòng họp theo khoảng thời gian** 

| UC ID and Name: | UC-RUM-04 Xem lịch sử sử dụng phòng họp theo khoảng thời gian  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin   | Secondary Actors: |  |
| Trigger: | Đến kỳ báo cáo cuối tháng/cuối quý, hoặc khi nhận thấy không gian văn phòng có dấu hiệu quá tải/lãng phí, Quản lý cần rà soát lại dữ liệu quá khứ để đánh giá hiệu suất khai thác tài nguyên: phòng nào đang bị "quá tải", phòng nào đang bị "ế", và cá nhân/phòng ban nào có thói quen đặt phòng nhưng không sử dụng (No-show).  |  |  |
| Description: | Cung cấp một giao diện Báo cáo lịch sử (Historical Report) cho phép nhà quản lý truy xuất toàn bộ vòng đời sử dụng của các phòng họp dựa trên một trục thời gian tùy chỉnh. Thay vì chỉ xem dữ liệu tĩnh của một phòng, người dùng có thể quét qua toàn bộ tổ chức theo Ngày, Tuần, Tháng hoặc một dải ngày (Date range) bất kỳ. Hệ thống sẽ bóc tách và trình bày dữ liệu thành hai nhóm thông tin quan trọng nhất:  (1) Mật độ sử dụng thực tế (thời lượng phòng sáng đèn)  (2) Tỷ lệ lãng phí (những phiên họp có trạng thái No-show hoặc bị giải phóng muộn).  Thông qua công cụ này, ban lãnh đạo có được cái nhìn toàn diện dựa trên dữ liệu (Data-driven) để tối ưu hóa chi phí vận hành mặt bằng.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập vào hệ thống với tài khoản được cấp quyền Quản lý (Manager) hoặc Quản trị viên (Business Admin). **PRE2:** Hệ thống đã tích lũy đủ dữ liệu lịch sử hoạt động (Log data) về việc đặt phòng, sử dụng thực tế và giải phóng phòng trong quá khứ. |  |  |
| Postconditions: | **POST1:** Hệ thống tổng hợp và trình bày danh sách chi tiết cùng các chỉ số thống kê về lịch sử sử dụng phòng khớp với khoảng thời gian được yêu cầu. **POST2:** Trạng thái của hệ thống và toàn bộ dữ liệu lịch sử không bị thay đổi (Đây là thao tác truy vấn "Chỉ đọc" \- Read-only). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và chọn menu "Lịch sử & Báo cáo sử dụng" (Usage History). 2\. Hệ thống tải giao diện mặc định, thường hiển thị dữ liệu lịch sử của 7 ngày hoặc 30 ngày gần nhất. 3\. Người dùng sử dụng bộ công cụ "Chọn mốc thời gian" (Date Picker) để thiết lập khoảng thời gian muốn rà soát (Theo Ngày, Theo Tuần, Theo Tháng, hoặc Tùy chỉnh "Từ ngày... Đến ngày..."). 4\. (Tùy chọn) Người dùng kết hợp thêm bộ lọc phòng (Ví dụ: Chỉ xem dữ liệu của "Phòng Hội đồng" hoặc xem toàn bộ các phòng ở Tầng 2). 5\. Người dùng nhấn nút "Truy xuất" hoặc "Áp dụng bộ lọc". 6\. Hệ thống xử lý truy vấn và hiển thị kết quả bao gồm 2 phần: **Phần 1 \- Chỉ số tổng quan (Summary Metrics):** Hiển thị tổng số giờ đã được đặt (Reserved Hours), tổng số giờ sử dụng thực tế (Actual Used Hours), số lượng phòng bị bỏ trống (No-show count), và tỷ lệ sử dụng (Utilization Rate). **Phần 2 \- Danh sách chi tiết (Detailed Log):** Một bảng liệt kê từng phiên sử dụng phòng bao gồm: Tên phòng, Tên cuộc họp, Tên người đặt (Host), Thời gian đăng ký (Kế hoạch), Thời gian thực tế diễn ra (Thực tế), và Trạng thái cuối cùng của phiên đó (Ví dụ: Hoàn tất, No-show, Hủy sát giờ). 7\. Người dùng có thể tương tác với các tiêu đề cột (như cột "Trạng thái" hoặc cột "Thời gian") để sắp xếp lại danh sách nhằm tìm ra các phiên No-show nhanh nhất. |  |  |
| Alternative Flows: | **A1. Xuất dữ liệu báo cáo (Export):** Tại bước 6, để phục vụ cho các buổi họp giao ban hành chính, người dùng có thể nhấn nút "Xuất dữ liệu" (Export to Excel/CSV). Hệ thống sẽ đóng gói toàn bộ bảng danh sách lịch sử đang hiển thị thành một tệp tin bảng tính để người dùng tải về máy tính cá nhân.  |  |  |
| Exceptions: | **E1. Không có dữ liệu trong khoảng thời gian đã chọn:** Nếu khoảng thời gian người dùng tra cứu rơi vào các dịp nghỉ lễ kéo dài hoặc thời điểm công ty chưa áp dụng phần mềm, hệ thống sẽ hiển thị một thông báo trạng thái trống (Empty State): "Không có dữ liệu sử dụng phòng họp nào được ghi nhận trong khoảng thời gian từ \[Ngày bắt đầu\] đến \[Ngày kết thúc\]." **E2. Giới hạn truy xuất dữ liệu quá lớn:** Nếu người dùng chọn một khoảng thời gian quá dài (ví dụ: quét dữ liệu của toàn bộ 3 năm qua cùng lúc), hệ thống có thể chặn lại để bảo vệ hiệu suất máy chủ và yêu cầu: "Khoảng thời gian tra cứu tối đa cho mỗi lần là 6 tháng. Vui lòng thu hẹp lại phạm vi." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 :** Nếu là Quản lý cấp phòng ban (Department Manager), hệ thống có thể chỉ cho phép họ xem lịch sử sử dụng phòng do nhân viên trong phòng ban của mình đặt. Nếu là Quản trị viên (Business Admin), họ có quyền truy xuất lịch sử toàn tổ chức.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-RUM-05 Xem tỷ lệ sử dụng phòng họp** 

| UC ID and Name: | UC-RUM-05 Xem tỷ lệ sử dụng phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Cuối kỳ đánh giá hiệu suất vận hành (cuối tháng, cuối quý) hoặc khi ban lãnh đạo doanh nghiệp đang cân nhắc việc thuê thêm/cắt giảm diện tích văn phòng và cần dữ liệu định lượng (tỷ lệ %) để đưa ra quyết định tối ưu hóa không gian.  |  |  |
| Description: | Cung cấp một công cụ Báo cáo phân tích (Analytics Dashboard) chuyên sâu, tập trung vào việc tính toán và trực quan hóa "Tỷ lệ sử dụng" (Utilization Rate) của toàn bộ quỹ phòng họp vật lý. Tỷ lệ này là thước đo cốt lõi để đánh giá hiệu quả vận hành: nó cho biết trong tổng số giờ hành chính khả dụng, các phòng họp thực sự được lấp đầy (sáng đèn) bao nhiêu phần trăm. Thông qua các biểu đồ xu hướng (Trend charts) và bảng xếp hạng, nhà quản lý dễ dàng nhận diện được thói quen sử dụng không gian của tổ chức, phát hiện tình trạng lãng phí hoặc "thắt cổ chai", từ đó làm cơ sở dữ liệu vững chắc cho các quyết định phân bổ ngân sách.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được phân quyền Quản trị viên (Business Admin) hoặc Quản lý (Manager). **PRE2:** Hệ thống đã tích lũy đủ dữ liệu hoạt động của các phòng họp (bao gồm dữ liệu đặt lịch và dữ liệu sử dụng thực tế) trong kỳ báo cáo. |  |  |
| Postconditions: | **POST1:** Báo cáo phân tích tỷ lệ sử dụng được trích xuất, tính toán và hiển thị thành công trên màn hình dưới dạng biểu đồ và số liệu trực quan. **POST2:** Không có bất kỳ trạng thái dữ liệu nào của hệ thống bị thay đổi (Đây là thao tác truy vấn phân tích "Chỉ đọc"). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và chọn chức năng "Báo cáo hiệu suất & Tỷ lệ sử dụng" (Utilization Analytics). 2\. Hệ thống tải giao diện mặc định, thường hiển thị Báo cáo tỷ lệ sử dụng của toàn bộ tổ chức trong 30 ngày gần nhất. 3\. Người dùng sử dụng các công cụ tùy biến để khoanh vùng phạm vi phân tích: Chọn khoảng thời gian (Ngày/Tuần/Tháng/Quý/Tùy chỉnh Date-range). Lọc theo Vị trí (Tòa nhà, Tầng) hoặc Phân loại phòng (Chỉ tính nhóm phòng họp lớn, hoặc nhóm phòng Huddle). 4\. Người dùng nhấn "Phân tích" (hoặc hệ thống tự động tải lại dữ liệu khi có thay đổi bộ lọc). 5\. Hệ thống thực hiện phép tính logic: Lấy tổng số giờ phòng thực tế được sử dụng (Actual Used Hours) chia cho tổng số giờ khả dụng trong khung giờ làm việc (Available Business Hours). 6\. Hệ thống trình bày kết quả lên Bảng điều khiển (Dashboard) bao gồm các phân vùng: **Chỉ số tổng quan (Overview KPI):** Hiển thị "Tỷ lệ sử dụng trung bình toàn công ty" bằng con số % nổi bật. **Biểu đồ xu hướng (Trend Chart):** Một biểu đồ đường (Line chart) thể hiện sự biến động của tỷ lệ sử dụng theo từng ngày hoặc từng tuần trong kỳ báo cáo. **Bảng xếp hạng (Leaderboards):** Hiển thị "Top 5 phòng có tỷ lệ sử dụng cao nhất (Quá tải)" và "Top 5 phòng có tỷ lệ sử dụng thấp nhất (Lãng phí)". 7\. Người dùng tương tác với biểu đồ (di chuột qua các cột/đường) để xem chi tiết con số cấu thành của từng mốc thời gian. |  |  |
| Alternative Flows: | **A1. Xuất báo cáo (Export/Download):** Người dùng có thể nhấn nút "Xuất báo cáo". Hệ thống sẽ kết xuất toàn bộ các biểu đồ và bảng số liệu đang hiển thị thành một tệp tài liệu tiêu chuẩn (PDF hoặc Excel) để người dùng tải về đính kèm vào báo cáo vận hành.  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-RUM-06 Ghi nhận và xử lý trường hợp No-show**


| UC ID and Name: | UC-RUM-06 Ghi nhận và xử lý trường hợp No-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System (automated)  | Secondary Actors: |  |
| Trigger: | Một cuộc họp đã trôi qua mốc giờ bắt đầu dự kiến cộng thêm một khoảng thời gian được cấu hình (Grace period \- ví dụ: 15 phút), nhưng hệ thống vẫn không nhận được bất kỳ tín hiệu sử dụng thực tế nào tại phòng họp (không có thao tác Check-in trên thiết bị, hoặc cảm biến không phát hiện có người).  |  |  |
| Description: | Use Case này đóng vai trò như một "người gác cổng" tự động để chống lãng phí tài nguyên. Khi phát hiện một phòng họp bị giữ chỗ nhưng bỏ trống, hệ thống không thu hồi ngay lập tức mà sẽ khởi tạo một hồ sơ (Log) để theo dõi và xử lý vòng đời của sự kiện No-show này. Vòng đời này được lưu vết nghiêm ngặt qua 4 trạng thái (DETECTED, WARNING\_SENT, RELEASED, DISMISSED) nhằm đảm bảo minh bạch, hỗ trợ quản trị viên kiểm toán (Audit) và xử lý khiếu nại của người dùng về sau.  |  |  |
| Preconditions: | **PRE1:** Cuộc họp đã được lên lịch thành công và đã giữ chỗ phòng họp vật lý tương ứng. **PRE2:** Các phương thức xác nhận hiện diện tại phòng (thiết bị máy tính bảng trước cửa, cảm biến, hoặc nút Check-in trên ứng dụng) đang hoạt động đồng bộ với hệ thống. **PRE3:** Cấu hình Grace period và "Thời gian chờ phản hồi" đã được Quản trị viên thiết lập trước. |  |  |
| Postconditions: | **POST1:** Hồ sơ xử lý No-show được lưu lại vĩnh viễn vào lịch sử kiểm toán của phòng họp với một trạng thái đóng (RELEASED hoặc DISMISSED). **POST2:** Nếu trạng thái cuối cùng là RELEASED, tài nguyên phòng họp được giải phóng hoàn toàn và cập nhật là "Trống" trên lưới lịch chung. |  |  |
| Normal Flow: | **1\. \[Trạng thái: DETECTED\]** Khi hết thời gian ân hạn mà phòng vẫn trống, hệ thống tự động khởi tạo một hồ sơ No-show mới và gắn nhãn trạng thái đầu tiên là DETECTED (Đã phát hiện). **2\. \[Trạng thái: WARNING\_SENT\]** Ngay lập tức, hệ thống phát hành một thông báo khẩn cấp (qua Email hoặc Push Notification) đến thiết bị của Người chủ trì (Host) với nội dung yêu cầu xác nhận sử dụng. Hệ thống tự động chuyển trạng thái hồ sơ sang WARNING\_SENT (Đã gửi cảnh báo). 3\. Hệ thống bắt đầu đếm ngược một khoảng "Thời gian chờ phản hồi" (ví dụ: 5 phút). 4\. Hết thời gian chờ, hệ thống kiểm tra và xác nhận Người chủ trì không có bất kỳ hành động phản hồi hay thao tác Check-in nào. **5\. \[Trạng thái: RELEASED\]** Hệ thống kích hoạt lệnh thu hồi: gỡ bỏ lịch đặt phòng hiện tại, chuyển trạng thái phòng vật lý sang "Trống" (Available) để những nhóm khác có thể đặt. Hồ sơ No-show được chốt hạ và đóng lại ở trạng thái RELEASED (Đã giải phóng). 6\. Hệ thống gửi một email thông báo cuối cùng cho Người chủ trì về việc phòng của họ đã bị thu hồi do vắng mặt. |  |  |
| Alternative Flows: | **A1. Can thiệp thủ công từ Business Admin:** Quản trị viên khi xem Bảng điều khiển thời gian thực phát hiện có cảnh báo No-show tại một phòng. Do Admin biết rõ nhóm này đang họp bên trong nhưng quên check-in (hoặc thiết bị nhận diện bị lỗi), Admin có thể chủ động nhấn nút "Bỏ qua cảnh báo" trên giao diện quản trị. Hồ sơ lập tức chuyển sang **DISMISSED** kèm theo bản ghi lưu vết: "Được can thiệp bởi Admin \[Tên Admin\]".  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1 :** Vòng đời của một trường hợp No-show phải tuân thủ nghiêm ngặt tính một chiều. Một khi đã đạt đến trạng thái đóng (RELEASED hoặc DISMISSED), hồ sơ không thể bị đảo ngược hay xóa bỏ, đảm bảo tính toàn vẹn của dữ liệu báo cáo sau này. **BR2 :** Mỗi sự thay đổi trạng thái (Từ DETECTED \-\> WARNING\_SENT \-\> RELEASED/DISMISSED) đều phải được hệ thống đóng dấu thời gian (Timestamp) chính xác đến từng giây, và ghi nhận rõ tác nhân thực thi (Do Hệ thống tự động hay Do Con người can thiệp). |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-RUM-07 Cập nhật trạng thái xử lý No-show** 

| UC ID and Name: | UC-RUM-07 Cập nhật trạng thái xử lý No-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System (automated)  | Secondary Actors: |  |
| Trigger: | Hệ thống đếm ngược hết khoảng thời gian chờ (Timeout) quy định cho một giai đoạn và tự động kích hoạt lệnh chuyển trạng thái tiếp theo. Hoặc quản trị viên nhận được báo cáo về sự cố thiết bị điểm danh hoặc nhận được phản hồi trực tiếp từ người dùng, cần truy cập vào hệ thống để ghi đè (override) lại trạng thái hiện hành. |  |  |
| Description: | Use Case này mô tả quá trình cập nhật các mốc trạng thái (Status transition) của một hồ sơ No-show (Vắng mặt) đã được tạo ra trước đó. Quá trình này có thể được thực thi ngầm bởi các tiến trình (Background jobs) của hệ thống, hoặc được thực hiện trực tiếp bởi các Quản trị viên có thẩm quyền thông qua giao diện quản lý. Việc cập nhật đảm bảo hồ sơ đi qua đúng quy trình: từ DETECTED (Phát hiện) \-\> WARNING\_SENT (Đã gửi cảnh báo) \-\> CONFIRMED (Xác nhận vắng mặt) \-\> RELEASED (Đã giải phóng phòng), hoặc rẽ nhánh sang DISMISSED (Hủy bỏ cảnh báo do phát hiện sai sót).  |  |  |
| Preconditions: | **PRE1:** Hệ thống đang tồn tại ít nhất một hồ sơ No-show đang ở trạng thái "Mở" (Ví dụ: DETECTED hoặc WARNING\_SENT). **PRE2:** Nếu thao tác bằng tay, người dùng phải đăng nhập bằng tài khoản Business Admin hoặc có đặc quyền quản lý cơ sở vật chất (Facility Manager). |  |  |
| Postconditions: | **POST1:** Trạng thái của hồ sơ No-show được cập nhật thành công lên phiên bản mới nhất. **POST2:** Một bản ghi kiểm toán (Audit log) tự động được sinh ra, lưu lại chính xác thời điểm cập nhật, trạng thái cũ, trạng thái mới và tác nhân thực hiện. **POST3:** Các logic nghiệp vụ đi kèm với trạng thái mới (như thay đổi trạng thái phòng trên lịch, kích hoạt gửi email thông báo) được thực thi thành công. |  |  |
| Normal Flow: | **Luồng 1: Hệ thống tự động cập nhật (System-driven)** Hệ thống chạy các tiến trình quét định kỳ (Cron jobs) kiểm tra các hồ sơ No-show đang mở. Hệ thống phát hiện hồ sơ \[A\] đã thỏa mãn điều kiện thời gian của quy tắc nghiệp vụ (Ví dụ: Đã gửi cảnh báo được 5 phút nhưng không có phản hồi). Hệ thống tự động thực thi lệnh cập nhật trạng thái của hồ sơ \[A\] sang bước tiếp theo (Ví dụ: Từ WARNING\_SENT sang CONFIRMED, sau đó sang RELEASED). Hệ thống lưu vết hành động này dưới danh nghĩa "Tác nhân: Hệ thống" và ghi nhận thời gian (Timestamp). Hệ thống kích hoạt các tác vụ hậu kỳ (như nhả phòng vật lý và đẩy thông báo cho người đặt). **Luồng 2: Quản trị viên cập nhật thủ công (Manual Override)** Quản trị viên truy cập vào giao diện "Quản lý cảnh báo No-show" hoặc Trang chi tiết của phòng họp. Hệ thống hiển thị danh sách các hồ sơ No-show đang chờ xử lý. Quản trị viên nhấp vào một hồ sơ và chọn hành động cập nhật trạng thái từ các nút chức năng (Ví dụ: "Xác nhận giải phóng phòng" hoặc "Hủy cảnh báo \- Đánh dấu thiết bị lỗi"). Hệ thống hiển thị một hộp thoại yêu cầu nhập lý do ghi đè (Tùy chọn nhưng khuyến nghị đối với thao tác Hủy cảnh báo). Quản trị viên điền lý do và nhấn "Xác nhận cập nhật". Hệ thống tiếp nhận lệnh, chuyển hồ sơ sang trạng thái đóng tương ứng (RELEASED hoặc DISMISSED). Hệ thống lưu vết toàn bộ quá trình với thông tin "Tác nhân: \[Tên Admin\]", kèm theo lý do đã nhập. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 :** Mọi lệnh can thiệp thủ công từ tài khoản Business Admin luôn có mức độ ưu tiên cao nhất, có khả năng đình chỉ ngay lập tức các lệnh đếm ngược tự động của hệ thống đối với hồ sơ đó. **BR2:** Bảng lịch sử thay đổi trạng thái của hồ sơ No-show không bao giờ được phép xóa hay chỉnh sửa (Append-only). Mỗi dòng log là một bằng chứng vĩnh viễn về cách một cuộc họp bị thu hồi. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

8. #### **UC-RUM-08 Xem danh sách phòng họp đang trong tình trạng no-show**


| UC ID and Name: | UC-RUM-08 Xem danh sách phòng họp đang trong tình trạng no-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin   | Secondary Actors: |  |
| Trigger: | Quản lý hoặc Lễ tân (Facility team) cần một công cụ gom nhóm nhanh để phát hiện ngay lập tức những căn phòng đang bị giữ chỗ ảo (đã đến giờ họp nhưng không có ai), từ đó chủ động nhắc nhở người đặt hoặc giải phóng phòng khẩn cấp cho các nhóm khác đang cần.  |  |  |
| Description: | Cung cấp một màn hình danh sách (List view) hoặc một bảng lọc chuyên dụng (Dedicated Filter) chỉ tập trung vào các phòng họp "có vấn đề". Thay vì phải quét mắt qua toàn bộ Bảng điều khiển (Dashboard) với hàng chục, hàng trăm phòng, hệ thống sẽ tự động tổng hợp và hiển thị duy nhất những phòng đang nằm trong chu trình cảnh báo No-show (Ví dụ: trạng thái DETECTED hoặc WARNING\_SENT). Tại đây, Quản lý có thể xem được thông tin chi tiết về người đặt (Host) để liên hệ trực tiếp, đồng thời theo dõi được đồng hồ đếm ngược thời gian ân hạn còn lại trước khi hệ thống kích hoạt thu hồi phòng tự động.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được cấp quyền Quản lý (Manager) hoặc Quản trị viên (Business Admin). **PRE2:** Các tiến trình giám sát và phát hiện No-show tự động của hệ thống đang hoạt động ổn định. |  |  |
| Postconditions: | **POST1:** Hệ thống truy xuất và hiển thị chính xác danh sách các phòng đang vi phạm hoặc trong diện tình nghi No-show ngay tại thời điểm tra cứu. **POST2:** Không có bất kỳ dữ liệu hệ thống nào bị thay đổi bởi tác vụ này (Đây là thao tác truy vấn "Chỉ đọc"). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và điều hướng đến "Trung tâm cảnh báo" (Alert Center) hoặc nhấn vào thẻ chỉ số "Phòng No-show" ngay trên Bảng điều khiển chính. 2\. Hệ thống tiến hành rà soát trạng thái hiện hành của toàn bộ quỹ phòng họp. 3\. Hệ thống lọc ra và chỉ hiển thị danh sách các phòng đang ở trạng thái phát hiện vắng mặt. 4\. Trên mỗi dòng (hoặc thẻ) của danh sách, hệ thống trình bày các thông tin thiết yếu: Tên phòng & Vị trí. Tên cuộc họp bị cảnh báo. Tên Người chủ trì (Host) kèm thông tin liên lạc nhanh (ví dụ: Số điện thoại nội bộ hoặc biểu tượng chat). Thời gian dự kiến bắt đầu. Thời gian đã trôi qua kể từ lúc bắt đầu (Overdue time). Trạng thái cảnh báo hiện tại (Ví dụ: "Đang chờ Host xác nhận"). 5\. Danh sách tự động làm mới (Auto-refresh) ngầm để đảm bảo tính thời gian thực. Nếu một phòng trong danh sách vừa được Host check-in hoặc vừa bị hệ thống tự động giải phóng, dòng dữ liệu của phòng đó sẽ tự động biến mất khỏi màn hình này. 6\. Người dùng có thể nhấp vào một dòng bất kỳ để đi sâu vào "Trang chi tiết phòng họp" để xem đầy đủ lịch sử. |  |  |
| Alternative Flows: | **A1. Lọc và Sắp xếp:** Tại bước 3, nếu danh sách No-show có nhiều phòng , hệ thống cho phép người dùng nhấp vào tiêu đề cột để sắp xếp. Quản lý thường ưu tiên sắp xếp theo cột "Thời gian quá hạn" (Từ cao xuống thấp) để xử lý những phòng bị bỏ trống lâu nhất trước. **A2. Thao tác nhanh (Quick Actions):** Thay vì phải nhấp vào xem chi tiết, tại mỗi dòng của danh sách, hệ thống cung cấp sẵn các nút hành động nhanh. Quản lý có thể bấm nút "Giải phóng ngay" (Force Release) hoặc nút "Hủy cảnh báo" (Dismiss) trực tiếp ngay trên giao diện danh sách này. |  |  |
| Exceptions: | **E1. Danh sách trống (Zero No-shows):** Tại bước 3, nếu toàn bộ nhân viên đều tuân thủ tốt việc sử dụng phòng, hoặc hệ thống chưa phát hiện trường hợp No-show nào tại thời điểm đó, giao diện sẽ hiển thị một trạng thái trống (Empty State) với thông điệp tích cực: "Tuyệt vời\! Hiện tại không có phòng họp nào bị lãng phí do No-show."  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

9. #### **UC-RUM-09 Xem báo cáo tỷ lệ No-show**


| UC ID and Name: | UC-RUM-09 Xem báo cáo tỷ lệ No-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin  | Secondary Actors: |  |
| Trigger: | Quản lý cần số liệu định lượng để xem tỉ lệ lãng phí phòng họp của công ty |  |  |
| Description: | Cung cấp một Bảng điều khiển phân tích chuyên sâu (No-show Rate Dashboard) chuyên bóc tách các hành vi đặt phòng nhưng không sử dụng. Hệ thống không chỉ tính toán tỷ lệ No-show tổng thể mà còn chia nhỏ (drill-down) dữ liệu theo 3 góc nhìn đa chiều: Theo từng không gian vật lý (Phòng họp), Theo sơ đồ tổ chức (Phòng ban/Department), và Theo cá nhân (Người tổ chức/Organizer). Thông qua các bảng xếp hạng "Top vi phạm", ban lãnh đạo sẽ có cơ sở dữ liệu khách quan để điều chỉnh quy định đặt phòng hoặc tính phí nội bộ (Chargeback) cho sự lãng phí.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được cấp quyền Quản lý hoặc Quản trị viên. **PRE2:** Hệ thống đã ghi nhận các hồ sơ No-show (đã được xử lý đóng ở trạng thái hợp lệ). **PRE3:** Danh sách người dùng hệ thống đã được ánh xạ (map) đầy đủ vào cơ cấu phòng ban (Department) của doanh nghiệp. |  |  |
| Postconditions: | **POST1:** Báo cáo tỷ lệ No-show được tính toán, trích xuất và hiển thị thành công bằng các biểu đồ/bảng số liệu trực quan. **POST2:** Trạng thái của hệ thống và dữ liệu gốc không bị thay đổi (Thao tác truy vấn "Chỉ đọc"). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và chọn menu "Báo cáo Tỷ lệ No-show" (No-show Analytics). 2\. Hệ thống tải giao diện và mặc định hiển thị dữ liệu của tháng hiện tại. 3\. Người dùng sử dụng công cụ "Chọn kỳ báo cáo" (Date Picker) để thiết lập khoảng thời gian phân tích mong muốn (Ví dụ: Tháng trước, Quý 1, hoặc Năm nay). 4\. Hệ thống xử lý dữ liệu và tính toán công thức: Tỷ lệ No-show \= (Tổng số cuộc họp bị gắn cờ No-show / Tổng số cuộc họp đã đặt) \* 100%. 5\. Hệ thống hiển thị Bảng điều khiển (Dashboard) bao gồm các phân vùng chính: **Chỉ số tổng quan:** Tổng số giờ lãng phí, Tỷ lệ No-show trung bình toàn công ty. **Phân tích theo Phòng họp:** Biểu đồ cột thể hiện những phòng nào bị "bỏ bom" nhiều nhất. **Top Phòng ban vi phạm:** Bảng xếp hạng (Leaderboard) các phòng ban (Ví dụ: Khối Sales, Khối Marketing) có tỷ lệ No-show cao nhất, kèm số giờ lãng phí tương ứng. **Top Cá nhân vi phạm (Organizer):** Bảng danh sách vinh danh "ngược" những cá nhân thường xuyên đặt phòng nhưng không dùng. 6\. Người dùng có thể tương tác với biểu đồ, nhấp vào tên một Phòng ban cụ thể để xem chi tiết (Drill-down) danh sách các cá nhân vi phạm bên trong phòng ban đó. |  |  |
| Alternative Flows: | **A1. Xuất báo cáo (Export Report):** Tại bước 5, người dùng nhấn nút "Xuất báo cáo PDF/Excel". Hệ thống sẽ đóng gói toàn bộ bảng xếp hạng vi phạm này thành tệp tin để Quản lý có thể đính kèm vào email gửi đi chấn chỉnh toàn công ty.  |  |  |
| Exceptions: | **E1. Không có dữ liệu vi phạm:** Nếu trong khoảng thời gian được chọn, văn hóa công ty rất tốt và không có bất kỳ trường hợp No-show nào xảy ra, hệ thống sẽ hiển thị giao diện ăn mừng (Success State): "Tỷ lệ No-show là 0%. Không có cá nhân hay phòng ban nào vi phạm trong kỳ báo cáo này."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1 (Độ chính xác của dữ liệu No-show):** Hệ thống CHỈ được phép tính các cuộc họp vào "Danh sách vi phạm No-show" nếu hồ sơ No-show của cuộc họp đó kết thúc ở trạng thái RELEASED (Đã giải phóng do vắng mặt). Các trường hợp có cảnh báo No-show nhưng sau đó được xác nhận là thiết bị lỗi (DISMISSED) thì tuyệt đối không được đưa vào tử số để tránh oan sai cho người dùng. **BR2:** Business Admin (Quản trị toàn hệ thống) được quyền xem toàn bộ danh sách vi phạm của tất cả phòng ban. Department Manager (Quản lý cấp trung) chỉ được xem Tỷ lệ No-show của phòng ban mình và danh sách vi phạm của các nhân viên dưới quyền.. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

10. #### **UC-RUM-10 Gửi cảnh báo no-show trước khi giải phóng phòng**


| UC ID and Name: | UC-RUM-10 Gửi cảnh báo no-show trước khi giải phóng phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Hệ thống  | Secondary Actors: |  |
| Trigger: | Một cuộc họp đã bắt đầu theo lịch dự kiến và vượt qua khoảng thời gian cấu hình no-show  (Grace period) đầu tiên nhưng hệ thống không ghi nhận được bất kỳ thao tác check-in hay sự hiện diện nào của Người chủ trì tại phòng họp.  |  |  |
| Description: | Use Case này hoạt động như một "vùng đệm an toàn" (Buffer zone). Thay vì thu hồi phòng ngay lập tức một cách cứng nhắc, hệ thống sẽ tự động phát đi các cảnh báo khẩn cấp (qua Email, Thông báo đẩy In-app, hoặc tích hợp chat nội bộ) đến Người tổ chức. Mục đích của tính năng này là nhắc nhở và cung cấp cho họ một khoảng thời gian ngắn (Thời gian chờ phản hồi) để xác nhận việc vẫn sử dụng phòng, hoặc chủ động giải phóng nếu họ thực sự không cần nữa. Cơ chế này giúp cân bằng giữa việc tối ưu hóa hiệu suất mặt bằng và trải nghiệm người dùng, tránh tình trạng lãng phí phòng họp.  |  |  |
| Preconditions: | **PRE1:** Cuộc họp đã đến giờ bắt đầu thực tế và vừa bị hệ thống đưa vào danh sách nghi ngờ vắng mặt (Trạng thái DETECTED). **PRE2:** Phân hệ gửi thông báo đa kênh (Notification Engine) của hệ thống đang hoạt động bình thường. **PRE3:** Thông tin liên lạc của Người chủ trì (Email, tài khoản ứng dụng nội bộ) được lưu trữ chính xác. |  |  |
| Postconditions: | **POST1:** Luồng thông báo cảnh báo được phát hành thành công đến các kênh liên lạc của Người chủ trì. **POST2:** Trạng thái hồ sơ vi phạm No-show chuyển sang WARNING\_SENT (Đã gửi cảnh báo). **POST3:** Hệ thống tự động kích hoạt bộ đếm ngược "Thời gian chờ phản hồi" (Timeout countdown) cho phòng họp đó. |  |  |
| Normal Flow: | 1\. Hệ thống ghi nhận cuộc họp vi phạm mốc thời gian ân hạn ban đầu (Ví dụ: Đã quá giờ bắt đầu 15 phút nhưng trạng thái phòng vẫn đang trống). 2\. Hệ thống đánh dấu sự kiện này và chuẩn bị gói dữ liệu để gửi cảnh báo. 3\. Hệ thống trích xuất thông tin liên lạc (địa chỉ Email, User ID) của Người chủ trì từ hồ sơ cuộc họp. 4\. Hệ thống tự động biên soạn nội dung thông điệp dựa trên mẫu cảnh báo khẩn cấp (Template). Nội dung bao gồm: Tiêu đề nổi bật: "\[HÀNH ĐỘNG KHẨN\] Xác nhận sử dụng phòng họp". Tên phòng & Thời gian cuộc họp. Số phút còn lại để xác nhận trước khi hệ thống tự động giải phóng. Hai nút hành động trực tiếp: "Tôi đang sử dụng" (Check-in) và "Giải phóng phòng" (Release). 5\. Hệ thống đẩy thông báo qua email (Email nội bộ). 6\. Hệ thống cập nhật trạng thái hồ sơ thành WARNING\_SENT và bắt đầu chạy đồng hồ đếm ngược thời gian chờ. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

11. #### **UC-RUM-11 Tự động giải phóng phòng sau khi xác nhận no-show** 

| UC ID and Name: | UC-RUM-11 Tự động giải phóng phòng sau khi xác nhận no-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Hệ thống  | Secondary Actors: |  |
| Trigger: | Bộ đếm ngược "Thời gian chờ phản hồi" (Timeout countdown) được kích hoạt từ lúc gửi cảnh báo (UC-RUM-10) đã chạy về mốc 0, nhưng hệ thống vẫn hoàn toàn không ghi nhận được bất kỳ tín hiệu sử dụng (check-in) hay phản hồi giữ phòng nào từ phía Người chủ trì.  |  |  |
| Description: | Khi cảnh báo không nhận được phản hồi, hệ thống sẽ mặc định đánh giá đây là một trường hợp "vắng mặt chắc chắn" (Confirmed No-show). Ngay lập tức, một chuỗi các tác vụ tự động được kích hoạt để cưỡng chế thu hồi lại không gian vật lý. Phòng họp được đưa trở lại quỹ tài nguyên chung ở trạng thái "Trống" (Available) để những nhân sự khác đang cần gấp có thể đặt ngay lập tức. Cùng lúc đó, hệ thống sẽ phát hành một thông báo chính thức đến người đặt để xác nhận việc họ đã mất quyền sử dụng không gian này.  |  |  |
| Preconditions: | **PRE1:** Hồ sơ No-show của cuộc họp đang ở trạng thái WARNING\_SENT (Đã gửi cảnh báo). **PRE2:** Thời gian chờ (Ví dụ: 5 phút kể từ lúc gửi cảnh báo) đã cạn kiệt hoàn toàn. **PRE3:** Hệ thống cơ sở dữ liệu và lưới lịch chung (Calendar Grid) đang hoạt động đồng bộ. |  |  |
| Postconditions: | **POST1:** Hồ sơ No-show được chuyển trạng thái đóng thành RELEASED (Đã giải phóng). **POST2:** Liên kết giữa cuộc họp và không gian phòng vật lý bị gỡ bỏ; trạng thái phòng họp lập tức chuyển sang "Trống" (Available) trên mọi giao diện người dùng và bảng điều khiển trước cửa phòng. **POST3:** Một thư điện tử (Email) hoặc thông báo tự động được gửi đến Người chủ trì báo cáo về việc thu hồi phòng. **POST4:** Bản ghi vi phạm được lưu trữ để kết xuất cho Báo cáo Tỷ lệ No-show . |  |  |
| Normal Flow: | 1\. Hệ thống (thông qua Cron job/Background worker) nhận tín hiệu bộ đếm ngược thời gian chờ đã hết. 2\. Hệ thống thực hiện kiểm tra chéo (Cross-check) lần cuối trong cơ sở dữ liệu để đảm bảo không có lệnh Check-in nào vừa được thực hiện ở những mili-giây cuối cùng. 3\. Hệ thống cập nhật trạng thái hồ sơ No-show từ WARNING\_SENT sang CONFIRMED (Xác nhận vắng mặt), và lập tức chuyển sang RELEASED (Đã giải phóng). 4\. Hệ thống thực thi lệnh can thiệp lịch (Calendar Override): Gỡ bỏ quyền chiếm dụng không gian của cuộc họp này đối với căn phòng hiện tại. 5\. Hệ thống làm mới (Refresh) Bảng điều khiển thời gian thực, chuyển màu phòng họp từ Cam/Đỏ (Cảnh báo/Bận) sang màu Xanh lá (Available \- Trống). 6\. Hệ thống tự động biên soạn và gửi một Email thông báo thu hồi phòng đến Người chủ trì (Host) và cc cho Business Admin (nếu có cấu hình). 7\. Hệ thống đóng tiến trình xử lý đối với sự kiện này. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Một khi hệ thống đã dán nhãn RELEASED và nhả phòng, quyết định này là không thể đảo ngược. Nếu Người chủ trì đến muộn sau khi phòng đã bị giải phóng, họ không thể "Hoàn tác" (Undo) mà bắt buộc phải thực hiện thao tác Đặt phòng đột xuất (Ad-hoc Booking) lại từ đầu với rủi ro phòng đó có thể đã bị nhóm khác lấy mất.  |  |  |
| Other Information: | Nội dung Email thông báo (ở bước 6\) cần được thiết kế với văn phong chuyên nghiệp, giải thích rõ ràng lý do: "Do không ghi nhận sự hiện diện của bạn tại phòng \[Tên phòng\] sau \[X\] phút kể từ giờ bắt đầu, hệ thống đã tự động giải phóng phòng để tối ưu hóa tài nguyên chung của công ty. Vui lòng đặt lại phòng mới nếu bạn vẫn có nhu cầu."  |  |  |
| Assumptions: |  |  |  |

12. #### **UC-RUM-12 Giải phóng phòng họp thủ công** 

| UC ID and Name: | UC-RUM-12 Giải phóng phòng họp thủ công  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Trigger: | Một phòng họp đang trống nhưng trên hệ thống lại báo "Đang sử dụng" (do nhóm họp kết thúc sớm nhưng quên thao tác check-out)  |  |  |
| Description: | Quản lý có thể ngay lập tức kết thúc phiên giữ chỗ của một cuộc họp, đưa không gian vật lý trở về trạng thái "Trống" (Available). Mọi thao tác cưỡng chế này đều được lưu vết kiểm toán (Audit log) nghiêm ngặt để đảm bảo tính minh bạch và tránh lạm quyền.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được cấp đặc quyền Quản trị viên (Business Admin) hoặc Quản lý (Manager). **PRE2:** Phòng họp mục tiêu đang ở trạng thái "Đã đặt trước" (Reserved), "Đang sử dụng" (In-use), hoặc đang trong chu trình cảnh báo (Warning). |  |  |
| Postconditions: | **POST1:** Phiên sử dụng phòng của cuộc họp hiện tại bị kết thúc lập tức; phòng họp chuyển sang trạng thái "Trống" (Available) trên toàn bộ hệ thống. **POST2:** Thời gian kết thúc thực tế (Actual End Time) của cuộc họp được chốt ngay tại mốc thời gian Quản lý nhấn nút giải phóng. **POST3:** Hệ thống tự động gửi một thông báo cho Người chủ trì (Host) báo về việc phòng của họ đã được thu hồi bởi Quản trị viên. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào "Bảng điều khiển trạng thái phòng họp" hoặc "Trang chi tiết phòng họp" . 2\. Người dùng xác định và nhấp vào một phòng đang ở trạng thái bận (màu Đỏ) mà họ cần can thiệp. 3\. Người dùng nhấn vào nút hành động "Giải phóng phòng" (Force Release / End Now). 4\. Hệ thống hiển thị một hộp thoại (Pop-up) cảnh báo: "Bạn đang thực hiện thu hồi phòng \[Tên phòng\] trước thời hạn. Vui lòng xác nhận hành động này." 5\. Hệ thống cung cấp một ô văn bản để Người dùng nhập "Lý do giải phóng" (Ví dụ: "Phòng trống, cuộc họp kết thúc sớm nhưng Host không check-out"). 6\. Người dùng nhấn nút "Xác nhận Giải phóng". 7\. Hệ thống lập tức ngắt liên kết giữ chỗ của cuộc họp hiện hành đối với phòng này, tính toán thời gian sử dụng thực tế tính đến phút hiện tại. 8\. Hệ thống làm mới giao diện, chuyển phòng sang trạng thái "Trống" và lưu vết toàn bộ thao tác vào lịch sử (Release History). 9\. Hệ thống gửi Email/Thông báo cho Người chủ trì. |  |  |
| Alternative Flows: | **A1. Host tự kết thúc sớm (Host-initiated early release):** Người chủ trì (Host) cũng có thể chủ động thực hiện chức năng này khi cuộc họp của họ hoàn thành sớm hơn dự kiến. Lúc này, luồng thực thi diễn ra tương tự nhưng hệ thống sẽ không cần gửi thông báo thu hồi, và lịch sử sẽ ghi nhận "Tác nhân: Người chủ trì".  |  |  |
| Exceptions: | **E1. Phòng đã được giải phóng :** Tại bước 6, nếu trong lúc Admin đang gõ lý do thì Host ở trong phòng đã thao tác bấm nút "Kết thúc" trên màn hình check-out, hệ thống sẽ chặn thao tác của Admin và thông báo: "Phòng này vừa được giải phóng bởi Người chủ trì. Vui lòng làm mới trang."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 :** Thao tác giải phóng phòng của Quản trị viên CHỈ có tác dụng đối với Không gian vật lý (Room Booking). Nó tuyệt đối không được xóa bỏ Cuộc họp (Meeting Event) gốc trên lịch của những người tham dự. **BR2 :** Bảng lịch sử sử dụng phòng (Usage Record) bắt buộc phải ghi chú rõ những phiên được giải phóng thủ công bằng nhãn: Bị thu hồi bởi Quản trị viên: \[Tên Admin\] |  |  |
| Other Information: | Nội dung Email thông báo gửi cho Host ở bước 9 cần mềm mỏng nhưng rõ ràng, ví dụ: "Quản trị viên \[Tên\] đã tiến hành giải phóng phòng \[Tên phòng\] của bạn vào lúc \[Giờ\]. Lý do: \[Lý do Admin đã nhập\]. Nếu có sự nhầm lẫn, vui lòng liên hệ bộ phận \[...\]"  |  |  |
| Assumptions: |  |  |  |

13. #### **UC-RUM-13 Phát hiện phòng họp trống sớm**


| UC ID and Name: | UC-RUM-13 Phát hiện phòng họp trống sớm  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Hệ thống  | Secondary Actors: |  |
| Trigger: | Hệ thống ghi nhận không gian phòng họp không có bất kỳ người nào hoặc không có chuyển động/âm thanh trong một khoảng thời gian liên tục (ví dụ: 10 phút), trong khi thời gian đặt lịch trên hệ thống vẫn còn dư khá nhiều.  |  |  |
| Description: | Tính năng này được thiết kế để giải quyết tình trạng "Ghost Meeting" hoặc các cuộc họp kết thúc sớm (Early end) nhưng Người chủ trì quên thực hiện thao tác Check-out/Trả phòng trên hệ thống. Thay vì để căn phòng bị khóa cứng trên lưới lịch chung cho đến hết giờ, hệ thống sử dụng dữ liệu viễn trắc (Telemetry data) từ các thiết bị cảm biến (IoT) để nhận diện sự vắng mặt. Khi xác định chắc chắn phòng đã trống, hệ thống sẽ tự động giải phóng khoảng thời gian còn lại của cuộc họp, trả phòng về trạng thái khả dụng (Available) để những nhân sự khác trong tổ chức có thể tận dụng ngay lập tức.  |  |  |
| Preconditions: | **PRE1:** Cuộc họp đang ở trạng thái "Đang diễn ra" (In-progress) và đã được ghi nhận Check-in thành công ban đầu. **PRE2:** Phòng họp vật lý được trang bị hệ thống thiết bị cảm biến (Cảm biến hiện diện, đếm người, hoặc Camera) và đang truyền dữ liệu thời gian thực về máy chủ ổn định. **PRE3:** Cấu hình "Ngưỡng thời gian chờ xác nhận trống" (Ví dụ: 10 phút) đã được Quản trị viên thiết lập cho hệ thống. |  |  |
| Postconditions: | **POST1:** Thời gian kết thúc thực tế (Actual End Time) của cuộc họp được hệ thống cập nhật tự động sớm hơn so với Giờ kết thúc dự kiến (Scheduled End Time). **POST2:** Liên kết giữa cuộc họp và không gian vật lý trong khoảng thời gian còn lại bị gỡ bỏ; phòng họp chuyển sang trạng thái "Trống" (Available). **POST3:** Hồ sơ lịch sử được lưu vết dưới dạng "Giải phóng tự động do kết thúc sớm". |  |  |
| Normal Flow: | 1\. Cuộc họp đang diễn ra. Hệ thống liên tục nhận tín hiệu (ping) trạng thái từ cảm biến tại phòng. 2\. Cảm biến gửi dữ liệu báo cáo trạng thái "Không có người" (Unoccupied). 3\. Hệ thống khởi động bộ đếm thời gian. Nếu trạng thái "Không có người" duy trì liên tục và vượt qua "Ngưỡng thời gian chờ xác nhận trống" (Ví dụ: 10 phút), hệ thống tiến hành kiểm tra lịch sử. 4\. Hệ thống kiểm tra khoảng thời gian còn lại của cuộc họp. Nếu thời gian còn lại đủ lớn (Ví dụ: Còn dư hơn 15 phút mới hết lịch), hệ thống sẽ kích hoạt luồng cảnh báo. 5\. Hệ thống tự động phát hành một thông báo (Push Notification/Email/Tin nhắn chat) đến Người chủ trì: "Có vẻ cuộc họp tại phòng \[Tên phòng\] đã kết thúc. Hệ thống sẽ tự động giải phóng phòng sau 3 phút nếu không có phản hồi." 6\. Hết 3 phút đếm ngược, không có phản hồi từ Người chủ trì hoặc không có tín hiệu có người quay lại phòng từ cảm biến. 7\. Hệ thống tự động thực thi lệnh "Kết thúc sớm" (End early), chốt lại "Giờ kết thúc thực tế" (Actual End Time). 8\. Hệ thống làm mới (Refresh) lưới lịch và Bảng điều khiển thời gian thực, chuyển phòng sang màu Xanh (Trống). |  |  |
| Alternative Flows: | **A1. Host phản hồi giữ phòng (False Alarm):** Tại bước 5, nếu Host chỉ đang cho nhóm nghỉ giải lao 15 phút và phòng tạm thời trống, họ có thể nhấn nút "Vẫn đang sử dụng" trên thông báo. Hệ thống lập tức hủy bỏ luồng giải phóng, đặt lại bộ đếm và không làm phiền Host trong phần thời gian còn lại của cuộc họp  |  |  |
| Exceptions: |  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: | **BR1:** Việc hệ thống cập nhật "Thời gian kết thúc thực tế" (Actual End Time) lên sớm hơn chỉ nhằm mục đích giải phóng mặt bằng, tuyệt đối không làm ảnh hưởng đến dữ liệu báo cáo điểm danh ban đầu của những người đã tham gia cuộc họp.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

14. #### **UC-RUM-14 Cập nhật cấu hình ngưỡng thời gian chờ no-show** 

| UC ID and Name: | UC-RUM-14 Cập nhật cấu hình ngưỡng thời gian chờ no-show  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin  | Secondary Actors: |  |
| Trigger: | Quản trị viên hệ thống muốn chỉnh sửa hoặc cấu hình lại khoảng thời gian để nhận diện trường hợp phòng trong trạng thái no-show |  |  |
| Description: | Cung cấp cho Quản trị viên một giao diện để thiết lập các "Tham số toàn cục" (Global Parameters) kiểm soát tính năng tự động hóa của hệ thống. Tại đây, Quản trị viên có thể định nghĩa "Thời gian ân hạn" (Grace Period) – tức là khoảng thời gian (tính bằng phút) mà hệ thống sẽ kiên nhẫn chờ đợi tín hiệu check-in của người dùng kể từ lúc cuộc họp chính thức bắt đầu. Nếu vượt qua con số này mà phòng vẫn trống, hệ thống mới bắt đầu kích hoạt chu trình cảnh báo No-show. Tính năng này đảm bảo phần mềm có khả năng thích ứng linh hoạt với văn hóa và quy định riêng của từng tổ chức thay vì bị mã hóa cứng (hard-code).  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản có cấp bậc cao nhất (System Admin hoặc Business Admin). **PRE2:** Phân hệ xử lý No-show tự động đang trong trạng thái sẵn sàng hoạt động. |  |  |
| Postconditions: | **POST1:** Ngưỡng thời gian mới được lưu vào cơ sở dữ liệu cấu hình trung tâm. **POST2:** Mọi cuộc họp diễn ra từ thời điểm cấu hình được lưu sẽ tuân thủ theo ngưỡng thời gian chờ mới này. **POST3:** Bản ghi lưu vết kiểm toán (Audit Log) được tự động sinh ra để ghi nhận sự thay đổi cấu hình. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Cài đặt hệ thống" (System Settings) và chọn tab "Quy tắc không gian làm việc" (Workspace Rules). 2\. Hệ thống tải và hiển thị biểu mẫu chứa các tham số vận hành hiện tại của tổ chức. 3\. Người dùng di chuyển đến mục cấu hình "Chính sách No-show" (No-show Policy). 4\. Người dùng nhập hoặc chọn một giá trị số mới vào trường "Ngưỡng thời gian chờ No-show / Thời gian ân hạn" (Ví dụ: Đổi từ 15 phút thành 10 phút). 5\. Người dùng có thể cấu hình thêm trường "Thời gian đếm ngược sau cảnh báo" (Khoảng thời gian cho phép Host xác nhận sau khi nhận tin nhắn). 6\. Người dùng nhấn nút "Lưu thay đổi". 7\. Hệ thống kiểm tra tính hợp lệ của các giá trị vừa nhập. 8\. Hệ thống cập nhật cấu hình mới, ghi log hành động của Admin và hiển thị thông báo "Cập nhật chính sách thành công". 9\. Hệ thống tự động khởi động lại các tiến trình chạy ngầm (Background Workers) để nạp bộ tham số mới vào logic giám sát lịch họp. |  |  |
| Alternative Flows: | **A1. Tắt hoàn toàn tính năng No-show:** Admin có thể vô hiệu hóa quy trình này bằng cách gạt công tắc "Kích hoạt xử lý No-show tự động" sang trạng thái Tắt (Off). Lúc này, các trường nhập thời gian sẽ bị làm mờ, hệ thống sẽ không bao giờ tự động thu hồi phòng cho dù bỏ trống đến hết giờ.  |  |  |
| Exceptions: |  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Low  |  |  |
| Business Rules: | **BR1 :** Việc thay đổi ngưỡng thời gian này CHỈ áp dụng cho các cuộc họp chưa diễn ra hoặc đang diễn ra nhưng chưa chạm đến ngưỡng thời gian cũ. Nó KHÔNG làm thay đổi, hoàn tác hay ảnh hưởng đến các hồ sơ No-show đã được ghi nhận hoặc đang nằm trong chu trình đếm ngược của phiên bản cấu hình trước đó. **BR2 :** Bất kỳ thao tác điều chỉnh nào trong phần Cài đặt hệ thống đều phải được ghi log chặt chẽ (Ai đổi, đổi từ giá trị cũ nào sang giá trị mới nào, vào thời điểm nào) để quy trách nhiệm khi có sự cố vận hành. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

15. #### **UC-RUM-15 Cập nhật cấu hình ngưỡng phát hiện phòng trống sớm**


| UC ID and Name: | UC-RUM-15 Cập nhật cấu hình ngưỡng phát hiện phòng trống sớm  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin  | Secondary Actors: |  |
| Trigger: | Quản trị viên hệ thống muốn chỉnh sửa hoặc cấu hình lại khoảng thời gian để nhận diện trường hợp phòng trong trạng thái trống sớm. |  |  |
| Description: | Cung cấp giao diện quản trị trung tâm để cấu hình "Ngưỡng thời gian chờ xác nhận trống". Đây là bộ tham số quyết định cách hệ thống phản ứng với các tín hiệu từ thiết bị IoT. Quản trị viên sẽ định nghĩa xem hệ thống phải kiên nhẫn chờ đợi bao nhiêu phút kể từ khoảnh khắc cảm biến báo "Không có chuyển động/sự hiện diện" trước khi chính thức kết luận là cuộc họp đã kết thúc sớm và tiến hành luồng giải phóng phòng.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với đặc quyền Quản trị viên (System Admin hoặc Business Admin). **PRE2:** Phân hệ tích hợp cảm biến IoT (IoT Integration Module) đã được kích hoạt trên hệ thống. **PRE3:** Tính năng "Phát hiện phòng trống sớm" đang được bật ở chế độ Bật (ON). |  |  |
| Postconditions: | **POST1:** Ngưỡng thời gian chờ mới được lưu trữ thành công vào cơ sở dữ liệu cấu hình. **POST2:** Mọi tiến trình quét và giám sát phòng họp tự động lập tức áp dụng ngưỡng thời gian mới này. **POST3:** Bản ghi lưu vết kiểm toán (Audit Log) được tự động sinh ra để ghi nhận sự thay đổi cấu hình. |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Cài đặt hệ thống" (System Settings) và điều hướng đến tab "Cấu hình IoT & Cảm biến" hoặc "Quy tắc không gian" (Workspace Rules). 2\. Hệ thống tải và hiển thị danh sách các tham số tự động hóa liên quan đến cảm biến. 3\. Người dùng di chuyển đến mục "Ngưỡng phát hiện phòng trống sớm" (Early Departure Threshold). 4\. Người dùng nhập một giá trị số nguyên mới vào trường văn bản hoặc sử dụng nút tăng/giảm (Ví dụ: Đổi từ 5 phút lên 10 phút). 5\. Người dùng có thể cấu hình thêm các tham số đi kèm (Ví dụ: Bật/Tắt việc gửi thông báo hỏi ý kiến Host trước khi hệ thống nhả phòng). 6\. Người dùng nhấn nút "Lưu cấu hình". 7\. Hệ thống kiểm tra tính hợp lệ của giá trị vừa nhập (đảm bảo là số dương và nằm trong giới hạn cho phép). 8\. Hệ thống lưu cấu hình mới, ghi nhận log thao tác của Admin và hiển thị thông báo "Đã cập nhật ngưỡng thời gian phát hiện trống thành công". 9\. Hệ thống tự động đồng bộ tham số mới đến các dịch vụ (Services) đang phụ trách xử lý tín hiệu cảm biến thời gian thực. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Giá trị thời gian quá ngắn (Aggressive Threshold Warning):** Tại bước 7, nếu Quản trị viên nhập một con số quá nhỏ (Ví dụ: 1 hoặc 2 phút), hệ thống vẫn cho phép lưu nhưng sẽ hiển thị một hộp thoại cảnh báo mềm (Soft-warning).  |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Low  |  |  |
| Business Rules: | **BR1:** Sự thay đổi này có hiệu lực ngay lập tức đối với tất cả các phòng đang có người sử dụng. Nếu một phòng đang được cảm biến đếm ngược là trống được 8 phút (với cấu hình cũ là 10 phút nhả phòng), và Admin vừa đổi cấu hình xuống còn 5 phút, thì phòng đó sẽ lập tức bị đưa vào luồng thu hồi ngay trong tíc-tắc sau khi Admin bấm lưu.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

16. #### **UC-RUM-16 Xuất báo cáo sử dụng phòng họp**


| UC ID and Name: | UC-RUM-16 Xuất báo cáo sử dụng phòng họp  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin, Business Admin  | Secondary Actors: |  |
| Trigger: | Người quản lý cần xuất ra báo cáo sử dụng phòng họp để phục vụ cho các mục đích của công ty. |  |  |
| Description: | Cung cấp công cụ kết xuất dữ liệu (Data Export) từ các Bảng điều khiển phân tích của hệ thống ra thành các tệp tài liệu ngoại tuyến. Thay vì chỉ xem trực quan trên màn hình phần mềm, Quản trị viên có thể đóng gói toàn bộ các chỉ số vận hành cốt lõi—bao gồm: Tỷ lệ lấp đầy (Utilization rate), Tỷ lệ vắng mặt (No-show rate), Số giờ sử dụng thực tế (Actual usage), và Danh sách các phòng bị thu hồi (Released rooms)—sang các định dạng phổ biến như PDF, Excel, hoặc CSV. Tính năng này đảm bảo tính lưu động của dữ liệu, hỗ trợ lưu trữ hồ sơ kiểm toán (Audit records) và chia sẻ thông tin dễ dàng cho các bên liên quan không có tài khoản truy cập hệ thống.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập hệ thống với tài khoản được cấp đặc quyền Quản trị viên (System Admin hoặc Business Admin). **PRE2:** Hệ thống đã có sẵn dữ liệu lịch sử sử dụng phòng họp trong khoảng thời gian người dùng muốn trích xuất. |  |  |
| Postconditions: | **POST1:** Một tệp tài liệu (PDF, Excel, hoặc CSV) chứa thông tin báo cáo được tạo ra và tải xuống thành công thiết bị của người dùng. **POST2:** Trạng thái cơ sở dữ liệu trên hệ thống không có bất kỳ sự thay đổi nào (Đây là thao tác "Chỉ đọc"). |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào phân hệ "Room Utilization Management" và điều hướng đến màn hình "Báo cáo & Phân tích" (Ví dụ: Dashboard Tỷ lệ sử dụng hoặc Tỷ lệ No-show). 2\. Người dùng thiết lập các bộ lọc (Filters) mong muốn trên giao diện (Ví dụ: Chọn kỳ báo cáo là "Tháng trước"). 3\. Người dùng nhấn vào nút chức năng "Xuất báo cáo" (Export) nằm ở góc trên cùng của màn hình. 4\. Hệ thống hiển thị một Menu thả xuống (Dropdown) hoặc Hộp thoại yêu cầu người dùng chọn định dạng tệp tin muốn xuất: **Tệp PDF:** Dành cho báo cáo trực quan, giữ nguyên biểu đồ và bố cục để in ấn hoặc gửi email cho sếp. **Tệp Excel (.xlsx):** Dành cho dữ liệu dạng bảng, giữ nguyên các cột chỉ số để Quản lý có thể thêm công thức tính toán chi phí nội bộ. **Tệp CSV:** Dành cho dữ liệu thô dung lượng lớn, phục vụ việc import vào hệ thống ERP hoặc Data Warehouse khác. 5\. Người dùng nhấp chọn một định dạng (Ví dụ: Excel). 6\. Hệ thống thu thập dữ liệu hiện đang hiển thị trên Bảng điều khiển (bao gồm cả các tham số lọc), sắp xếp cấu trúc và đóng gói thành tệp tin. Hiển thị thanh tiến trình (Loading bar) nếu dữ liệu lớn. 7\. Hệ thống gửi lệnh tải xuống (Download) tệp tin qua trình duyệt web của người dùng. 8\. Người dùng lưu tệp tin thành công vào ổ cứng máy tính cá nhân. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Không có dữ liệu để xuất:** Nếu bộ lọc người dùng chọn dẫn đến kết quả trống (Ví dụ: chọn khoảng thời gian ở tương lai), khi bấm xuất, hệ thống sẽ cảnh báo: "Không có dữ liệu trong khoảng thời gian đã chọn. Không thể xuất báo cáo."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng |  |  |
| Business Rules: | **BR1 (Nhất quán dữ liệu \- WYSIWYG):** Dữ liệu được trích xuất ra tệp tin BẮT BUỘC phải khớp hoàn toàn 100% với những con số hiển thị trên giao diện màn hình tại thời điểm bấm xuất, dựa trên cùng một bộ lọc.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

## 12\. In-Meeting Management

#### 

1. #### **UC-IMM-01 Bắt đầu phiên họp**  

#### 

| UC ID and Name: | UC-IMM-01 Bắt đầu phiên họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: |  |
| Description | Use case cho phép người chủ trì (Host) chủ động bắt đầu phiên họp, cập nhật trạng thái cuộc họp và ghi nhận mốc thời gian bắt đầu thực tế.  |  |  |
| Trigger: | Host muốn bắt đầu cuộc họp khi phòng họp đã sẵn sàng hoặc khi đến thời gian dự kiến. |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host (hoặc Organizer) của cuộc họp.  **PRE-2.** Cuộc họp đang ở trạng thái đã lên lịch (SCHEDULED).  |  |  |
| Postconditions: | **POST-1.** Trạng thái phiên họp được chuyển sang đang diễn ra (IN\_PROGRESS).  **POST-2**. Thời gian bắt đầu thực tế (Actual Start Time) được hệ thống ghi nhận thành công vào cơ sở dữ liệu.  |  |  |
| Normal Flow: | 1\. Người dùng điều hướng đến màn hình Danh sách cuộc họp hoặc Chi tiết cuộc họp. 2\. Hệ thống hiển thị thông tin cuộc họp chuẩn bị diễn ra. 3\. Người dùng nhấp vào nút "Bắt đầu cuộc họp". 4\. Hệ thống tiếp nhận lệnh và cập nhật trạng thái cuộc họp thành IN\_PROGRESS. 5\. Hệ thống lấy thời gian thực tại (Real-time) và lưu thành Thời gian bắt đầu thực tế. 6\. Hệ thống chuyển hướng người dùng đến màn hình Bảng điều khiển trong cuộc họp (In-Meeting Dashboard). |  |  |
| Alternative Flow: | **AF1: Bắt đầu cuộc họp thông qua thiết bị Check-in tại phòng**  3.1. Host thực hiện thao tác Check-in trên thiết bị trước cửa phòng họp.  3.2. Hệ thống xác nhận danh tính Host thành công.  3.3. Hệ thống tự động kích hoạt bắt đầu phiên họp và tiếp tục từ bước 4 của Normal Flow.  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Chỉ tài khoản được phân quyền là Host hoặc Organizer mới có thể thực hiện thao tác Bắt đầu phiên họp.  **BR2:** Mốc "Thời gian bắt đầu thực tế" là dữ liệu bất biến, được sử dụng làm căn cứ đối soát (Audit) để tính toán hiệu suất sử dụng phòng và giải quyết No-show.  |  |  |
| Other Information: | Ngay khi phiên họp bắt đầu, giao diện của tất cả những người tham dự (Participants) khác cũng sẽ được tự động đồng bộ trạng thái "Đang diễn ra".  |  |  |
| Assumptions: |  |  |  |

2. #### **UC-IMM-02 Yêu cầu gia hạn phiên họp** 

#### 

| UC ID and Name: | UC-IMM-02 Yêu cầu gia hạn phiên họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: |  |
| Description | Use case cho phép người chủ trì (Host) yêu cầu gia hạn thêm thời gian cho phiên họp đang diễn ra khi nội dung chưa hoàn tất và sắp đến giờ kết thúc dự kiến.  |  |  |
| Trigger: | Host nhận thấy cuộc họp cần thêm thời gian và chủ động nhấn nút yêu cầu gia hạn trên giao diện điều khiển.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host.  **PRE-2.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  |  |  |
| Postconditions: | **POST-1**. Thời gian kết thúc dự kiến của cuộc họp được cập nhật theo thời gian mới.  **POST-2**. Thời gian sử dụng phòng họp trên lưới lịch chung được kéo dài tương ứng.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Gia hạn thời gian" trên Bảng điều khiển trong cuộc họp. 2\. Hệ thống hiển thị hộp thoại yêu cầu chọn khoảng thời gian muốn gia hạn thêm (ví dụ: 15 phút, 30 phút, 60 phút). 3\. Người dùng chọn thời gian gia hạn mong muốn và nhấp xác nhận. 4\. Hệ thống kiểm tra tính khả dụng của phòng họp trong khoảng thời gian vừa yêu cầu. 5\. Hệ thống xác nhận phòng trống và cập nhật thời gian kết thúc mới cho cuộc họp. 6\. Hệ thống hiển thị thông báo "Gia hạn thành công" cho Host và đồng bộ lịch mới. |  |  |
| Alternative Flow: | **AF1: Phòng họp không khả dụng để gia hạn**  4.1. Hệ thống kiểm tra và phát hiện phòng họp đã có lịch đặt của nhóm khác ngay sau khoảng thời gian hiện tại.  4.2. Hệ thống chặn yêu cầu gia hạn và hiển thị thông báo: "Không thể gia hạn do phòng đã được đặt trước. Vui lòng kết thúc đúng giờ."  4.3. Người dùng đóng hộp thoại.  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | **BR1:** Việc gia hạn chỉ được phép thực hiện thành công nếu khoảng thời gian gia hạn không gây xung đột (conflict) với bất kỳ lịch đặt phòng nào đã có trên hệ thống.  |  |  |
| Other Information: | Hệ thống nên tự động hiển thị thông báo cảnh báo nhắc nhở (kèm nút bấm gia hạn nhanh) khi cuộc họp chỉ còn 5 hoặc 10 phút là kết thúc.  |  |  |
| Assumptions: | Dữ liệu lưới lịch phòng họp của hệ thống luôn được đồng bộ theo thời gian thực (Real-time) để đảm bảo việc kiểm tra xung đột lịch tại bước 4 là chính xác tuyệt đối.  |  |  |

3. #### **UC-IMM-03 Phê duyệt hoặc từ chối yêu cầu gia hạn phiên họp**

#### 

| UC ID and Name: | UC-IMM-03 Phê duyệt hoặc từ chối yêu cầu gia hạn phiên họp |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Business Admin, Host  |
| Description | Use case mô tả quá trình hệ thống tự động kiểm tra các điều kiện ràng buộc (quyền hạn, xung đột lịch) để quyết định phê duyệt hoặc từ chối yêu cầu gia hạn cuộc họp. |  |  |
| Trigger: | Hệ thống nhận được một lệnh yêu cầu gia hạn thời gian từ người chủ trì (Host). |  |  |
| Preconditions: | **PRE-1.** Hệ thống quản lý lịch và không gian phòng họp đang hoạt động bình thường.  **PRE-2.** Cuộc họp của Host đang diễn ra (IN\_PROGRESS) và đã gửi yêu cầu gia hạn thành công.  |  |  |
| Postconditions: | **POST-1**. Trạng thái của yêu cầu gia hạn được chốt (APPROVED hoặc REJECTED).  **POST-2**. Nếu được duyệt, lưới lịch phòng họp được cập nhật thời gian kết thúc mới.  **POST-3.** Host nhận được thông báo về kết quả xử lý.  |  |  |
| Normal Flow: | 1\. Hệ thống tiếp nhận thông tin yêu cầu gia hạn (bao gồm ID cuộc họp, số phút muốn gia hạn). 2\. Hệ thống kiểm tra quyền hạn của người gửi yêu cầu (đảm bảo là Host hoặc người có thẩm quyền). 3\. Hệ thống quét lưới lịch thực tế của phòng họp để xác định tính khả dụng trong khoảng thời gian gia hạn. 4\. Hệ thống xác nhận không có bất kỳ xung đột lịch nào với các cuộc họp khác. 5\. Hệ thống tự động chuyển trạng thái yêu cầu sang APPROVED (Đã phê duyệt). 6\. Hệ thống cập nhật thời gian kết thúc mới cho cuộc họp và lưu dữ liệu. 7\. Hệ thống hiển thị thông báo "Gia hạn thành công" trên màn hình điều khiển của Host. |  |  |
| Alternative Flow: | **AF1: Tự động từ chối do xung đột tài nguyên**  4.1. Hệ thống phát hiện có một cuộc họp khác đã được đặt ngay sau đó, gây xung đột không gian.  4.2. Hệ thống tự động chuyển trạng thái yêu cầu sang REJECTED (Đã từ chối).  4.3. Hệ thống giữ nguyên thời gian kết thúc cũ và gửi thông báo: "Yêu cầu bị từ chối do phòng họp đã được đặt trước bởi nhóm khác."  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Quyết định tự động phê duyệt chỉ được đưa ra khi đạt 100% điều kiện: Không xung đột lịch và Host có đủ quyền hạn.  **BR2:** Lịch sử phê duyệt hoặc từ chối đều phải được lưu log kiểm toán (Audit log).  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-IMM-04 Cập nhật thời gian kết thúc phiên họp sau khi gia hạn** 

#### 

| UC ID and Name: | UC-IMM-04 Cập nhật thời gian kết thúc phiên họp sau khi gia hạn  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Host |
| Description | Use case mô tả quá trình hệ thống tự động đồng bộ hóa thời gian kết thúc mới cho cả thực thể phiên họp và lịch giữ phòng vật lý ngay sau khi một yêu cầu gia hạn đã được phê duyệt.  |  |  |
| Trigger: | Yêu cầu gia hạn phiên họp được chuyển sang trạng thái đã phê duyệt (APPROVED) từ hệ thống tự động.  |  |  |
| Preconditions: | **PRE-1.** Yêu cầu gia hạn đã được xử lý và phê duyệt thành công.  **PRE-2.** Phiên họp đang ở trạng thái diễn ra (IN\_PROGRESS).  |  |  |
| Postconditions: | **POST-1**. Thời gian kết thúc dự kiến của phiên họp (Meeting End Time) được cập nhật thành công.  **POST-2.** Thời gian giữ phòng (Room Reservation Time) trên lưới lịch chung được kéo dài tương ứng, ngăn chặn việc người khác đặt trùng. |  |  |
| Normal Flow: | 1\. Hệ thống tiếp nhận sự kiện phê duyệt yêu cầu gia hạn cùng với khoảng thời gian gia hạn cụ thể (ví dụ: \+30 phút). 2\. Hệ thống tính toán thời gian kết thúc mới bằng cách cộng số phút gia hạn vào mốc thời gian kết thúc dự kiến hiện tại. 3\. Hệ thống cập nhật thời gian kết thúc mới vào cơ sở dữ liệu cốt lõi của phiên họp. 4\. Hệ thống thực thi lệnh cập nhật đồng bộ lên thực thể Lịch đặt phòng (Booking/Calendar Entity) để giữ không gian vật lý. 5\. Hệ thống gửi tín hiệu làm mới (Real-time update) đến thiết bị máy tính bảng/màn hình hiển thị trước cửa phòng họp. 6\. Hệ thống làm mới bộ đếm ngược thời gian và gửi thông báo cập nhật lên giao diện Bảng điều khiển của Host cùng tất cả người tham dự. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **N/A** |  |  |
| Other Information: | Thời gian đếm ngược (Countdown Timer) trên giao diện của tất cả các thiết bị trong phòng họp sẽ tự động nhảy số theo thời gian mới mà không cần người dùng tải lại trang (F5).  |  |  |
| Assumptions: | Kiến trúc hệ thống sử dụng giao thức truyền thông điệp thời gian thực (như WebSockets) để đảm bảo việc đồng bộ trạng thái ở bước 5 và 6 diễn ra tức thì với độ trễ dưới 1 giây.  |  |  |

5. #### **UC-IMM-05 Kết thúc phiên họp**  

#### 

| UC ID and Name: | UC-IMM-05 Kết thúc phiên họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người chủ trì (Host) chủ động kết thúc phiên họp khi nội dung đã hoàn thành. Hệ thống sẽ ghi nhận thời gian kết thúc thực tế, cập nhật trạng thái cuộc họp và giải phóng không gian phòng vật lý.  |  |  |
| Trigger: | Host nhấn nút kết thúc phiên họp trên giao diện điều khiển  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host.  **PRE-2.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  |  |  |
| Postconditions: | **POST-1**. Trạng thái phiên họp được chuyển sang đã kết thúc (COMPLETED).  **POST-2**. Thời gian kết thúc thực tế (Actual End Time) được hệ thống ghi nhận thành công.  **POST-3.** Phòng họp được giải phóng và chuyển sang trạng thái trống (AVAILABLE) trên lưới lịch chung nếu cuộc họp kết thúc sớm hơn dự kiến.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Kết thúc cuộc họp" trên Bảng điều khiển trong cuộc họp. 2\. Hệ thống hiển thị hộp thoại xác nhận với thông báo: "Bạn có chắc chắn muốn kết thúc cuộc họp này?". 3\. Người dùng nhấp vào nút "Xác nhận". 4\. Hệ thống tiếp nhận lệnh và cập nhật trạng thái cuộc họp thành COMPLETED. 5\. Hệ thống lấy thời gian thực tại (Real-time) và lưu thành Thời gian kết thúc thực tế. 6\. Hệ thống thực thi lệnh giải phóng phòng họp vật lý (nếu còn thời gian dư). 7\. Hệ thống chuyển hướng người dùng về màn hình Danh sách cuộc họp hoặc hiển thị Báo cáo tóm tắt. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | BR1: Chỉ tài khoản Host (hoặc Business Admin) mới có quyền kết thúc cuộc họp. Các thành viên tham dự (Participants) thông thường không thể kết thúc (End) toàn bộ cuộc họp.  |  |  |
| Other Information: | Ngay khi Host bấm kết thúc, giao diện ứng dụng của tất cả người tham dự khác (nếu đang mở Bảng điều khiển cuộc họp) sẽ tự động đồng bộ và hiển thị thông báo cuộc họp đã kết thúc.  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-IMM-07 Xem danh sách người tham dự đang có mặt** 

#### 

| UC ID and Name: | UC-IMM-07 Xem danh sách người tham dự đang có mặt  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người chủ trì (Host) hoặc Quản trị viên doanh nghiệp (Business Admin) xem danh sách thời gian thực của tất cả những người hiện đang có mặt (vật lý tại phòng hoặc tham gia trực tuyến) trong phiên họp.  |  |  |
| Trigger: | Người dùng muốn kiểm tra sĩ số, tiến hành điểm danh hoặc xác nhận sự hiện diện của các thành viên trong cuộc họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host của cuộc họp đó hoặc Business Admin của hệ thống.  **PRE-2.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  |  |  |
| Postconditions: | **POST-1.** Danh sách chi tiết các thành viên đang có mặt được hiển thị chính xác theo thời gian thực trên giao diện điều khiển.  **POST-2.** Trạng thái của hệ thống không bị thay đổi (Thao tác chỉ đọc).  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào Bảng điều khiển trong cuộc họp (In-Meeting Dashboard). 2\. Người dùng nhấp vào tab "Người tham dự" (Participants) trên thanh công cụ điều hướng. 3\. Hệ thống truy xuất dữ liệu từ các nguồn ghi nhận hiện diện (tín hiệu đăng nhập ứng dụng, thiết bị check-in tại phòng). 4\. Hệ thống hiển thị danh sách tất cả nhân sự liên quan, bao gồm các thông tin: Họ tên, Phòng ban, Vai trò trong cuộc họp (Host/Participant) và Mốc thời gian vào phòng (Joined time). 5\. Danh sách tự động làm mới (Auto-refresh) khi có sự thay đổi về nhân sự ra/vào phòng. |  |  |
| Alternative Flow: | **AF1: Xem danh sách từ xa bởi Business Admin** 1\. Business Admin truy cập vào màn hình Giám sát phòng họp thời gian thực. 2\. Admin chọn một phòng họp cụ thể đang có trạng thái "Đang sử dụng" (In-use). 3\. Admin nhấp vào nút "Xem danh sách hiện diện". 4\. Hệ thống hiển thị danh sách người đang có mặt tương tự như bước 4 của Normal Flow |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High |  |  |
| Frequency of Use: | High |  |  |
| Business Rules: | BR1: Chỉ những tài khoản có quyền quản trị (Business Admin) hoặc có vai trò quản lý trong chính cuộc họp đó (Host) mới được xem đầy đủ thông tin thời gian vào/ra phòng của các thành viên để phục vụ mục đích kiểm toán (Audit).  |  |  |
| Other Information: | Giao diện hiển thị danh sách nên tích hợp thanh tìm kiếm nhanh (Search bar) theo Tên hoặc Phòng ban để Host dễ dàng lọc thông tin khi cuộc họp có số lượng người tham gia lớn.  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-IMM-08 Xem trạng thái điểm danh của người tham dự** 

#### 

| UC ID and Name: | UC-IMM-08 Xem trạng thái điểm danh của người tham dự  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người chủ trì (Host) hoặc Quản trị viên doanh nghiệp (Business Admin) xem chi tiết trạng thái điểm danh (Đã điểm danh, Đến muộn, Vắng mặt) của toàn bộ nhân sự có tên trong danh sách mời tham dự cuộc họp.  |  |  |
| Trigger: | Người dùng muốn kiểm tra tình hình tham gia, thống kê tỷ lệ đi muộn hoặc vắng mặt của các khách mời trong cuộc họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host của cuộc họp đó hoặc Business Admin.  **PRE-2.** Cuộc họp đang ở trạng thái diễn ra (IN\_PROGRESS) hoặc đã kết thúc (COMPLETED).  |  |  |
| Postconditions: | **POST-1.** Bảng chi tiết trạng thái điểm danh của toàn bộ khách mời được hiển thị đầy đủ và chính xác.  **POST-2.** Trạng thái hệ thống không đổi (Thao tác chỉ đọc).  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào Bảng điều khiển trong cuộc họp (In-Meeting Dashboard) hoặc Trang chi tiết cuộc họp. 2\. Người dùng nhấp vào mục "Báo cáo điểm danh" (Attendance Report). 3\. Hệ thống tiến hành đối chiếu danh sách khách mời được lên lịch ban đầu với dữ liệu ghi nhận hiện diện thực tế. 4\. Hệ thống hiển thị bảng danh sách toàn bộ người được mời kèm theo trạng thái tương ứng: Đã điểm danh (Checked-in), Đến muộn (Late), hoặc Vắng mặt (Absent). 5\. Đối với các trạng thái "Đã điểm danh" và "Đến muộn", hệ thống hiển thị chính xác mốc thời gian người đó vào phòng. |  |  |
| Alternative Flow: | **AF1: Lọc danh sách theo trạng thái điểm danh** 1\. Tại màn hình Bảng chi tiết điểm danh, người dùng nhấp vào bộ lọc trạng thái (ví dụ: chọn lọc những người "Vắng mặt"). 2\. Hệ thống thu hẹp danh sách và chỉ hiển thị các nhân sự thỏa mãn điều kiện được chọn để Host tiện theo dõi hoặc nhắc nhở. |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Trạng thái "Đến muộn" (Late) được hệ thống tự động gắn cho người tham dự nếu mốc thời gian check-in của họ vượt quá số phút quy định (ví dụ: muộn hơn 10 phút kể từ Giờ bắt đầu thực tế của cuộc họp).  **BR2:** Trạng thái "Vắng mặt" (Absent) được mặc định áp dụng cho tất cả những người có trong danh sách mời nhưng hoàn toàn không có dữ liệu check-in cho đến khi cuộc họp kết thúc.  |  |  |
| Other Information: | Giao diện báo cáo nên hỗ trợ một nút hành động nhanh cho phép Host xuất dữ liệu điểm danh này ra tệp Excel (.xlsx) để phục vụ công tác tính chỉ số chuyên cần (KPI) nếu cần.  |  |  |
| Assumptions: | Danh sách tài khoản khách mời (Invitee List) được hệ thống lưu trữ đồng bộ và nguyên vẹn từ phân hệ đặt phòng (Room Booking) để làm cơ sở dữ liệu đối chiếu chính xác cho phân hệ điểm danh.  |  |  |

8. #### **UC-IMM-09 Thêm ghi chú trong cuộc họp** 

#### 

| UC ID and Name: | UC-IMM-09 Thêm ghi chú trong cuộc họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người chủ trì (Host) tạo và lưu trữ các ghi chú có gắn mốc thời gian tự động (timestamped notes) ngay trong lúc cuộc họp đang diễn ra nhằm ghi lại các nội dung, ý tưởng hoặc quyết định quan trọng.  |  |  |
| Trigger: | Host muốn ghi lại một thông tin quan trọng xuất hiện trong phiên họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host.  **PRE-2.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  |  |  |
| Postconditions: | **POST-1.** Ghi chú mới được tạo và lưu trữ thành công vào cơ sở dữ liệu của phiên họp.  **POST-2.** Ghi chú được hệ thống tự động đóng dấu mốc thời gian chính xác tương ứng với thời điểm tạo.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào Bảng điều khiển trong cuộc họp (In-Meeting Dashboard). 2\. Người dùng chọn mục "Ghi chú cuộc họp" (Meeting Notes) trên thanh công cụ. 3\. Người dùng nhấp vào vùng nhập liệu hoặc nút "Thêm ghi chú". 4\. Hệ thống tự động tạo một dòng ghi chú mới và hiển thị mốc thời gian hiện tại (ví dụ: hiển thị số phút tính từ lúc bắt đầu họp hoặc giờ hệ thống). 5\. Người dùng nhập nội dung ghi chú vào ô văn bản. 6\. Người dùng nhấn nút "Lưu" (hoặc hệ thống tự động lưu). 7\. Hệ thống hiển thị ghi chú mới ở đầu danh sách dòng thời gian ghi chú của phiên họp. |  |  |
| Alternative Flow: | **AF1: Gắn thẻ phân loại (Tagging) cho ghi chú**  5.1. Trong lúc nhập nội dung, người dùng chọn một nhãn/thẻ phân loại có sẵn (ví dụ: "Quyết định", "Hành động cần làm", "Ý tưởng").  5.2. Người dùng nhấn Lưu.  5.3. Hệ thống lưu ghi chú kèm theo thẻ phân loại tương ứng và hiển thị màu sắc đại diện nhãn đó trên giao diện để dễ phân biệt.  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Mốc thời gian (Timestamp) gắn liền với ghi chú phải được tính tự động dựa trên thời gian thực của hệ thống, người dùng tuyệt đối không thể tự chỉnh sửa hoặc làm sai lệch mốc thời gian này.  **BR2:** Quyền riêng tư: Mặc định các ghi chú do Host tạo sẽ ở chế độ riêng tư (chỉ Host nhìn thấy) trừ khi Host chủ động nhấn nút "Chia sẻ" (Share) để công khai cho toàn bộ người tham dự cùng theo dõi.  |  |  |
| Other Information: | 1\. Ô nhập ghi chú hỗ trợ định dạng văn bản nâng cao (Rich Text) cơ bản như bôi đậm (Bold), gạch chân (Underline) hoặc gạch đầu dòng (Bullet points) để tiện cho việc ghi chép nhanh. 2\. Toàn bộ danh sách ghi chú này sẽ được đính kèm trực tiếp vào Email biên bản cuộc họp (Meeting Minutes) gửi cho các thành viên sau khi phiên họp kết thúc. |  |  |
| Assumptions: | Hệ thống tích hợp cơ chế tự động lưu ngầm (Auto-save) sau mỗi 3 giây khi người dùng ngừng gõ để đảm bảo không bị mất mát dữ liệu trong trường hợp Host quên bấm lưu.  |  |  |

9. #### **UC-IMM-10 Xem ghi chú trong cuộc họp** 

#### 

| UC ID and Name: | UC-IMM-10 Xem ghi chú trong cuộc họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant) | Secondary Actors: | System |
| Description | Use case cho phép người dùng có quyền (Host hoặc Người tham dự) xem lại danh sách các ghi chú kèm mốc thời gian (timestamped notes) đã được ghi lại trong suốt phiên họp.  |  |  |
| Trigger: | Người dùng muốn xem lại nội dung, ý tưởng hoặc các quyết định quan trọng được ghi chép trong khi cuộc họp đang diễn ra hoặc sau khi đã kết thúc.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống.  **PRE-2.** Người dùng thuộc danh sách thành viên hợp lệ (Host hoặc Participant) của cuộc họp được chọn.  |  |  |
| Postconditions: | **POST-1.** Danh sách các ghi chú hợp lệ được hiển thị trực quan và chính xác theo cấu trúc phân quyền trên giao diện.  **POST-2.** Không có sự thay đổi nào về mặt dữ liệu gốc của hệ thống (Thao tác chỉ đọc).  |  |  |
| Normal Flow: | 1\. Người dùng điều hướng đến Bảng điều khiển trong cuộc họp (đối với cuộc họp đang diễn ra) hoặc Trang chi tiết cuộc họp (đối với cuộc họp đã kết thúc). 2\. Người dùng nhấp vào tab "Ghi chú cuộc họp" (Meeting Notes). 3\. Hệ thống kiểm tra vai trò và quyền hạn của tài khoản đối với cuộc họp này. 4\. Hệ thống lọc và truy xuất các bản ghi ghi chú phù hợp với quyền hạn của người dùng từ cơ sở dữ liệu. 5\. Hệ thống hiển thị danh sách ghi chú sắp xếp theo trình tự thời gian, kèm mốc thời gian cụ thể và thẻ phân loại (nếu có). |  |  |
| Alternative Flow: | **AF1: Xem ghi chú từ góc nhìn của Người tham dự (Participant)** 4.1. Hệ thống xác nhận tài khoản đăng nhập là Participant.  4.2. Hệ thống chỉ truy xuất và hiển thị các ghi chú được Host thiết lập ở chế độ "Chia sẻ công khai" (Shared Notes).  4.3. Hệ thống ẩn hoàn toàn tất cả các ghi chú ở chế độ "Riêng tư" (Private Notes) của Host và tiếp tục bước 5 của Normal Flow.  |  |  |
| Exceptions: | **EX1:** Phiên họp không có ghi chú nào. Tại bước 4, hệ thống không tìm thấy bất kỳ dữ liệu ghi chú nào, giao diện sẽ hiển thị trạng thái trống kèm thông báo: "Cuộc họp này không có ghi chú nào được lưu lại."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1** : Host là người duy nhất có quyền xem toàn bộ tất cả ghi chú (bao gồm cả ghi chú riêng tư và công khai). Người tham dự (Participant) tuyệt đối không được phép tiếp cận hoặc xem các ghi chú riêng tư của Host dưới mọi hình thức.  **BR2 :** Khi đang ở giao diện xem ghi chú, người tham dự thông thường không được cung cấp các công cụ chỉnh sửa, thay đổi nội dung hoặc xóa bỏ các ghi chú của người khác.  |  |  |
| Other Information: | Giao diện xem hỗ trợ bộ lọc nhanh cho phép người dùng chọn xem ghi chú theo Thẻ phân loại (ví dụ: chỉ hiển thị các ghi chú mang thẻ "Quyết định" hoặc "Hành động cần làm") để dễ dàng chốt lại nội dung cuộc họp.  |  |  |
| Assumptions: | Mọi ghi chú được Host gắn nhãn công khai sẽ tự động được hệ thống đồng bộ và đính kèm vào Email biên bản cuộc họp (Meeting Minutes) gửi cho toàn thể thành viên ngay sau khi phiên họp kết thúc.  |  |  |

10. #### **UC-IMM-11 Tìm kiếm ghi chú trong cuộc họp** 

#### 

| UC ID and Name: | UC-IMM-11 Tìm kiếm ghi chú trong cuộc họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant) | Secondary Actors: | System |
| Description | Use case cho phép người dùng có quyền (Host hoặc Người tham dự) tìm kiếm và sàng lọc các ghi chú trong cuộc họp dựa trên các tiêu chí như từ khóa, mốc thời gian, người tạo hoặc thẻ phân loại (tag).  |  |  |
| Trigger: | Người dùng nhập nội dung vào thanh tìm kiếm hoặc chọn một bộ lọc ghi chú trên giao diện.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống.  **PRE-2.** Người dùng thuộc danh sách thành viên hợp lệ (Host hoặc Participant) của cuộc họp.  **PRE-3.** Phiên họp đã hoặc đang có dữ liệu ghi chú được tạo  |  |  |
| Postconditions: | **POST-1**. Danh sách các ghi chú thỏa mãn chính xác điều kiện tìm kiếm được hiển thị trên giao diện.  **POST-2**. Trạng thái dữ liệu gốc của hệ thống không bị thay đổi (Thao tác chỉ đọc).  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào tab "Ghi chú cuộc họp" (Meeting Notes) tại Bảng điều khiển cuộc họp hoặc Trang chi tiết cuộc họp. 2\. Người dùng nhấp vào thanh công cụ "Tìm kiếm ghi chú". 3\. Người dùng nhập từ khóa cần tìm (ví dụ: tên một đầu việc, một quyết định) hoặc chọn các bộ lọc có sẵn (chọn Thẻ tag, chọn Người tạo, hoặc chọn Khoảng thời gian). 4\. Hệ thống tiếp nhận các tham số tìm kiếm và thực hiện quét, lọc trong cơ sở dữ liệu ghi chú của cuộc họp đó. 5\. Hệ thống hiển thị danh sách các ghi chú trùng khớp với điều kiện tìm kiếm lên màn hình theo thứ tự thời gian. |  |  |
| Alternative Flow: | **AF1: Tìm kiếm không trả về kết quả**  4.1. Hệ thống thực hiện quét dữ liệu nhưng không tìm thấy ghi chú nào khớp với từ khóa hoặc bộ lọc được chọn.  4.2. Hệ thống ẩn danh sách ghi chú cũ và hiển thị thông báo: "Không tìm thấy ghi chú nào khớp với điều kiện tìm kiếm của bạn."  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | BR1 : Kết quả tìm kiếm phải tuân thủ nghiêm ngặt quy tắc phân quyền hiển thị. Người tham dự (Participant) tuyệt đối không thể tìm thấy hoặc nhìn thấy các ghi chú ở chế độ "Riêng tư" (Private) của Host, dù từ khóa nhập vào có trùng khớp hoàn toàn.  BR2 : Hệ thống phải hỗ trợ tìm kiếm không phân biệt chữ hoa, chữ thường và hỗ trợ tìm kiếm tiếng Việt không dấu để tối ưu hóa tốc độ thao tác nhanh của người dùng trong cuộc họp.  |  |  |
| Other Information: | Thanh tìm kiếm nên tích hợp cơ chế tự động gợi ý nhanh (Auto-suggestion) các thẻ tag hoặc tên người tạo hiện có trong cuộc họp ngay khi người dùng nhấp chuột vào.  |  |  |
| Assumptions: |  |  |  |

11. #### **UC-IMM-12 Lập lịch cảnh báo thời gian còn lại** 

#### 

| UC ID and Name: | UC-IMM-12 Lập lịch cảnh báo thời gian còn lại  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Host |
| Description | Use case mô tả quá trình hệ thống tự động tính toán và đăng ký một tác vụ ngầm (scheduler job) để phát ra thông báo nhắc nhở cho Host khi cuộc họp sắp đi đến những phút cuối cùng của thời lượng đã đặt.  |  |  |
| Trigger: | Một phiên họp chính thức được chuyển sang trạng thái đang diễn ra (IN\_PROGRESS) hoặc thời gian kết thúc của cuộc họp bị thay đổi (sau khi gia hạn thành công).  |  |  |
| Preconditions: | **PRE-1.** Hệ thống đã xác định được Thời gian kết thúc dự kiến (Scheduled End Time) của cuộc họp.  **PRE-2.** Tham số cấu hình "Khoảng thời gian cảnh báo trước" (ví dụ: 5 phút hoặc 10 phút trước khi hết giờ) đã được thiết lập sẵn trong hệ thống.  |  |  |
| Postconditions: | **POST-1.** Một tác vụ nhắc nhở (Reminder Job) được lập lịch thành công trong hàng đợi hệ thống để tự động kích hoạt vào đúng thời điểm đã tính toán.  |  |  |
| Normal Flow: | 1\. Phiên họp được kích hoạt chuyển sang trạng thái IN\_PROGRESS. 2\. Hệ thống truy xuất tham số cấu hình "Khoảng thời gian cảnh báo trước" của hệ thống (ví dụ: 10 phút). 3\. Hệ thống thực hiện phép tính toán: Thời điểm cảnh báo \= Thời gian kết thúc dự kiến \- Khoảng thời gian cảnh báo trước. 4\. Hệ thống đăng ký một tác vụ hẹn giờ (Timer/Schedule Job) với mốc thời gian vừa tính toán vào hàng đợi xử lý của hệ thống. 5\. Hệ thống xác nhận tác vụ đã được đưa vào hàng đợi chạy ngầm thành công. |  |  |
| Alternative Flow: | **AF1: Hủy và lập lịch lại sau khi gia hạn thời gian họp** 1\. Cuộc họp được phê duyệt gia hạn thời gian thành công. 2\. Hệ thống tìm kiếm và thực hiện hủy bỏ (Cancel) tác vụ cảnh báo cũ đang nằm trong hàng đợi. 3\. Hệ thống thực hiện lại tính toán mốc thời gian dựa trên Thời gian kết thúc mới và tiếp tục tiến trình từ bước 3 của Normal Flow. **AF2: Thời lượng cuộc họp quá ngắn so với cấu hình** 1\. Tại bước 3, hệ thống phát hiện tổng thời lượng cuộc họp nhỏ hơn hoặc bằng khoảng thời gian cảnh báo cấu hình (ví dụ: cuộc họp đột xuất chỉ đặt 10 phút, trong khi cấu hình hệ thống yêu cầu báo trước 10 phút). 2\. Hệ thống tự động điều chỉnh mốc thời gian cảnh báo xuống còn một nửa thời lượng thực tế của cuộc họp (ví dụ: thay đổi thành báo trước 5 phút). 3\. Hệ thống tiếp tục tiến trình từ bước 4 của Normal Flow. |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | BR1: Tác vụ cảnh báo phải được cập nhật hoặc thiết lập lại ngay lập tức nếu có bất kỳ biến động nào liên quan đến mốc thời gian kết thúc dự kiến của cuộc họp.  BR2: Nếu cuộc họp bị kết thúc sớm thủ công trước khi đến mốc cảnh báo, hệ thống bắt buộc phải gỡ bỏ hoàn toàn tác vụ lập lịch này khỏi hàng đợi để tránh phát cảnh báo giả cho phòng họp đã trống.  |  |  |
| Other Information: | **N/A**  |  |  |
| Assumptions: | **N/A**  |  |  |

12. #### **UC-IMM-13 Gửi cảnh báo kết thúc phiên họp và xung đột lịch** 

#### 

| UC ID and Name: | UC-IMM-13 Gửi cảnh báo kết thúc phiên họp và xung đột lịch  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Host |
| Description | Use case mô tả quá trình hệ thống phát đi thông báo nhắc nhở cho Host khi cuộc họp sắp hết giờ dự kiến. Nếu phát hiện phòng đã có lịch đặt của nhóm khác ngay sau đó, hệ thống sẽ tự động nâng cấp lên mức cảnh báo nghiêm ngặt hơn để yêu cầu Host khẩn trương kết thúc cuộc họp.  |  |  |
| Trigger: | Đến mốc thời gian cảnh báo đã được hệ thống lập lịch tự động trước đó.  |  |  |
| Preconditions: | **PRE-1.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  **PRE-2.** Tác vụ nhắc nhở (Reminder Job) chạy ngầm đến giờ kích hoạt.  |  |  |
| Postconditions: | POST-1. Thông báo cảnh báo (thông thường hoặc nâng cao) được gửi thành công đến ứng dụng của Host và màn hình hiển thị tại phòng.  |  |  |
| Normal Flow: | 1\. Đến giờ hẹn, hệ thống kiểm tra trạng thái lưới lịch của phòng họp này trong khung giờ ngay sau khi cuộc họp hiện tại kết thúc. 2\. Hệ thống xác nhận không có bất kỳ cuộc họp nào khác đặt phòng tiếp theo (phòng trống sau cuộc họp). 3\. Hệ thống phát đi cảnh báo tiêu chuẩn (Standard Warning) đến Host thông qua ứng dụng di động/máy tính (ví dụ: "Cuộc họp của bạn còn 10 phút. Bạn có muốn gia hạn thêm thời gian?"). 4\. Hệ thống hiển thị thông báo kèm theo tùy chọn "Gia hạn nhanh" trên màn hình điều khiển của Host. |  |  |
| Alternative Flow: | **AF1: Gửi cảnh báo nâng cao khi có xung đột lịch tiếp theo**  2.1. Hệ thống phát hiện phòng họp đã được một nhóm khác đặt trước ngay sau khung giờ hiện tại.  2.2. Hệ thống tự động nâng cấp mức độ thành Cảnh báo nghiêm ngặt (Strict/Escalated Warning).  2.3. Hệ thống gửi thông báo khẩn cấp với độ ưu tiên cao đến Host (ví dụ: "Cuộc họp còn 10 phút. Phòng đã có lịch đặt tiếp theo từ nhóm khác, hệ thống KHÔNG cho phép gia hạn. Vui lòng khẩn trương thu xếp kết thúc đúng giờ").  2.4. Hệ thống hiển thị thông báo dạng Pop-up cảnh báo (màu đỏ/vàng) trên ứng dụng của Host, đồng thời vô hiệu hóa (disable) nút bấm gia hạn thời gian.  |  |  |
| Exceptions: | **N/A** |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | BR1: Khi có xung đột lịch, hệ thống bắt buộc phải khóa chức năng gia hạn của cuộc họp hiện tại ngay từ màn hình giao diện của Host để tránh việc gửi yêu cầu lỗi lên hệ thống.  |  |  |
| Other Information: | **N/A** |  |  |
| Assumptions: | **N/A** |  |  |

## 13\. Recording Management

#### 

1. #### **UC-REC-01 Tạo cấu hình ghi âm/ghi hình cho cuộc họp** 

| UC ID and Name: | UC-REC-01 Tạo cấu hình ghi âm/ghi hình cho cuộc họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người dùng thiết lập cấu hình ghi âm, ghi hình ban đầu cho phiên họp bao gồm các tùy chọn bật/tắt ghi dữ liệu, lựa chọn thiết bị phần cứng (Camera, Room Capture Agent) và định hình phân kênh âm thanh theo vị trí chỗ ngồi (channel/seat) trong phòng họp.  |  |  |
| Trigger: | Người dùng muốn chuẩn bị trước các thiết lập ghi âm/ghi hình cho một cuộc họp sắp diễn ra.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với vai trò Host hoặc Business Admin.  **PRE-2.** Cuộc họp đã được lên lịch thành công và phòng họp vật lý có trang bị các thiết bị phần cứng hỗ trợ recording.  **PRE-3.** Thiết bị Room Capture Agent của phòng đang ở trạng thái kết nối trực tuyến (Online) với hệ thống trung tâm.  |  |  |
| Postconditions: | **POST-1**. Cấu hình ghi âm/ghi hình của cuộc họp được lưu trữ thành công vào cơ sở dữ liệu của module Recording Management.  **POST-2**. Hệ thống sẵn sàng đồng bộ các tham số này xuống thiết bị phần cứng ngay khi phiên họp bắt đầu.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang Chi tiết cuộc họp hoặc Bảng cấu hình thiết bị phòng họp. 2\. Người dùng chọn mục "Cấu hình Ghi âm/Ghi hình" (Recording Settings). 3\. Hệ thống hiển thị bảng điều khiển chứa các trường cấu hình recording ban đầu. 4\. Người dùng bật/tắt các công tắc "Kích hoạt ghi hình" (Video Recording) và "Kích hoạt ghi âm" (Audio Recording). 5\. Người dùng chọn Camera sử dụng từ danh sách các camera khả dụng trong phòng. 6\. Người dùng chọn mã định danh Room Capture Agent sẽ phụ trách thu giữ và xử lý luồng dữ liệu. 7\. Người dùng thiết lập cấu hình phân kênh âm thanh và sơ đồ vị trí chỗ ngồi (channel/seat configuration) trên sơ đồ phòng họp ảo. 8\. Người dùng nhấn nút "Lưu cấu hình". 9\. Hệ thống kiểm tra tính hợp lệ của các tham số, cập nhật vào cơ sở dữ liệu và hiển thị thông báo "Cấu hình ghi dữ liệu cuộc họp thành công". |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **EX1:** Thiết bị phần cứng ngoại tuyến (Offline). Tại bước 8, hệ thống thực hiện kiểm tra (ping) và phát hiện Camera hoặc Room Capture Agent được chọn đã mất kết nối phần cứng. Hệ thống sẽ chặn thao tác lưu, bôi đỏ thiết bị lỗi và hiển thị thông báo: "Không thể lưu. Thiết bị \[Tên thiết bị\] hiện không phản hồi. Vui lòng kiểm tra lại nguồn hoặc cáp kết nối."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | **BR1:** Tính năng gán cấu hình channel/seat bắt buộc phải khớp với số lượng micro vật lý được lắp đặt cố định tại các vị trí ghế ngồi trong phòng để đảm bảo chất lượng bóc tách giọng nói.  **BR2:** Chỉ Host được chỉ định của cuộc họp đó hoặc Quản trị viên cấp cao (Business Admin) mới có quyền chỉnh sửa bảng cấu hình này.  |  |  |
| Other Information: | Việc cấu hình chính xác sơ đồ channel/seat là tiền đề cốt lõi giúp hệ thống sau cuộc họp có thể nhận diện chính xác danh tính người phát biểu (Speaker Diarization) dựa trên vị trí chỗ ngồi để tự động dịch tự động sang văn bản (Transcription).  |  |  |
| Assumptions: |  |  |  |

2. #### **UC-REC-02 Xem cấu hình ghi âm/ghi hình của cuộc họp** 

| UC ID and Name: | UC-REC-02 Xem cấu hình ghi âm/ghi hình của cuộc họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống |
| Description | Use case cho phép người dùng có quyền (Host hoặc Business Admin) xem chi tiết trạng thái cấu hình ghi âm/ghi hình hiện tại của cuộc họp, bao gồm thông tin camera, Room Capture Agent, thiết bị kết nối âm thanh, cùng danh sách phân kênh và vị trí chỗ ngồi tương ứng.  |  |  |
| Trigger: | Người dùng nhấp vào mục hoặc tab xem cấu hình ghi âm/ghi hình của cuộc họp trên giao diện.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host hoặc Business Admin.  **PRE-2.** Cuộc họp đã được lập lịch hoặc đang diễn ra, và đã được thiết lập cấu hình recording ban đầu.  |  |  |
| Postconditions: | **POST-1.** Toàn bộ thông tin cấu hình ghi âm/ghi hình của cuộc họp được hiển thị chi tiết và chính xác trên giao diện.  **POST-2**. Trạng thái dữ liệu hệ thống không thay đổi (Thao tác chỉ đọc).  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào trang Chi tiết cuộc họp hoặc Bảng điều khiển cuộc họp. 2\. Người dùng nhấp vào mục "Cấu hình ghi dữ liệu" (Recording Configuration). 3\. Hệ thống kiểm tra vai trò và quyền hạn của người dùng đối với cuộc họp này. 4\. Hệ thống truy xuất dữ liệu cấu hình ghi âm/ghi hình từ cơ sở dữ liệu. 5\. Hệ thống hiển thị chi tiết các thông số lên giao diện, bao gồm: Trạng thái bật/tắt ghi hình/ghi âm, Camera đang chọn, thông tin Room Capture Agent, thông tin Audio Interface, sơ đồ phân kênh (channel) và vị trí ghế ngồi (seat) tương ứng. |  |  |
| Alternative Flow: | **AF1: Xem cấu hình nhanh khi cuộc họp đang diễn ra (In-Meeting Quick View)** 1\. Tại Bảng điều khiển trong cuộc họp (In-Meeting Dashboard), Host nhấp vào biểu tượng "Trạng thái thiết bị/Ghi". 2\. Hệ thống hiển thị một cửa sổ Pop-up thu nhỏ chứa thông tin cấu hình nhanh và trạng thái kết nối thực tế (đang hoạt động/mất kết nối) của các thiết bị phần cứng. |  |  |
| Exceptions: | **EX1:** Cuộc họp chưa được thiết lập cấu hình ghi. Tại bước 4, nếu hệ thống không tìm thấy bản ghi cấu hình nào, giao diện hiển thị thông báo: "Cuộc họp này chưa được cấu hình ghi âm/ghi hình" kèm nút bấm "Tạo cấu hình nhanh".  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | BR1: Chỉ Host được phân quyền của cuộc họp đó hoặc Business Admin mới có thể xem được các thông tin cấu hình phần cứng chi tiết này. Người tham dự thông thường (Participant) không có quyền xem.  |  |  |
| Other Information: | **N/A** |  |  |
| Assumptions: | **N/A** |  |  |

3. #### **UC-REC-03 Cập nhật cấu hình ghi âm/ghi hình** 

| UC ID and Name: | UC-REC-03 Cập nhật cấu hình ghi âm/ghi hình  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống |
| Description | Use case cho phép người dùng có quyền chỉnh sửa và cập nhật các thiết lập ghi âm, ghi hình của cuộc họp trước hoặc ngay trong khi cuộc họp đang diễn ra, bao gồm việc thay đổi trạng thái bật/tắt ghi dữ liệu, thay đổi thiết bị capture và cấu hình lại sơ đồ mapping channel/seat.  |  |  |
| Trigger: | Người dùng muốn thay đổi các thông số ghi dữ liệu hiện tại của cuộc họp do có sự thay đổi về nhân sự, vị trí ngồi hoặc thiết bị phần cứng.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với vai trò Host hoặc Business Admin.  **PRE-2.** Cuộc họp đã tồn tại cấu hình ghi âm/ghi hình ban đầu .  |  |  |
| Postconditions: | **POST-1.** Cấu hình mới được cập nhật thành công vào cơ sở dữ liệu của phân hệ Recording Management.  **POST-2.** Tín hiệu đồng bộ cấu hình mới được gửi xuống thiết bị phần cứng ngay lập tức nếu cuộc họp đang diễn ra.  |  |  |
| Normal Flow: | 1\. Người dùng điều hướng đến màn hình Cấu hình ghi dữ liệu của cuộc họp (trước khi họp hoặc trên Bảng điều khiển khi đang họp). 2\. Người dùng nhấp vào nút "Chỉnh sửa cấu hình". 3\. Hệ thống chuyển giao diện sang chế độ chỉnh sửa và hiển thị các thông số hiện tại. 4\. Người dùng tiến hành thay đổi các thiết lập mong muốn: Toggle bật/tắt ghi âm/ghi hình, chọn lại thiết bị capture (Camera, Audio Interface) hoặc chỉnh sửa lại sơ đồ mapping channel/seat. 5\. Người dùng nhấn nút "Lưu thay đổi". 6\. Hệ thống thực hiện kiểm tra tính hợp lệ của cấu hình mới và cập nhật vào cơ sở dữ liệu. 7\. Hệ thống hiển thị thông báo "Cập nhật cấu hình thành công". |  |  |
| Alternative Flow: | **AF1: Cập nhật cấu hình trực tiếp khi cuộc họp đang diễn ra (In-Meeting Hot Update)** 1\. Tại bước 1, Host mở bảng điều khiển khi cuộc họp đang ở trạng thái diễn ra. 2\. Host thực hiện thay đổi cấu hình (ví dụ: tắt ghi hình để tiết kiệm băng thông, chỉ giữ lại ghi âm) và nhấn Lưu. 3\. Hệ thống cập nhật cơ sở dữ liệu, đồng thời phát một lệnh cập nhật nóng xuống thiết bị Room Capture Agent tại phòng họp vật lý. 4\. Thiết bị Room Capture Agent tiếp nhận cấu hình mới và thay đổi luồng ghi ngay lập tức mà không làm gián đoạn phiên họp đang diễn ra. |  |  |
| Exceptions: | **EX1:** Thiết bị capture mới chọn bị ngoại tuyến (Offline). Tại bước 6, hệ thống kiểm tra và phát hiện thiết bị capture hoặc audio interface mới thay đổi không phản hồi tín hiệu. Hệ thống sẽ chặn lệnh lưu, hiển thị cảnh báo lỗi phần cứng ngoại tuyến và giữ nguyên cấu hình cũ.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Medium |  |  |
| Business Rules: | **BR1:** Trong trường hợp cập nhật cấu hình khi cuộc họp đang diễn ra, các thay đổi về mapping channel/seat chỉ có hiệu lực đối với đoạn dữ liệu thu âm từ thời điểm lưu trở đi. Đoạn dữ liệu đã ghi trước đó vẫn giữ nguyên đặc tính cũ.  **BR2:** Hệ thống bắt buộc phải ghi lại log kiểm toán (Audit log) chi tiết: Ai đã thực hiện thay đổi, thay đổi thông số nào và vào thời điểm nào để phục vụ công tác kiểm tra dữ liệu sau cuộc họp.  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

4. #### **UC-REC-04 Bắt đầu ghi hình từ IP Camera góc phòng** 

| UC ID and Name: | UC-REC-04 Bắt đầu ghi hình từ IP Camera góc phòng  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | IP Camera, Host  |
| Description | Use case mô tả tiến trình hệ thống tự động kết nối và kích hoạt ghi lại luồng dữ liệu video cuộc họp từ 2 IP Camera được lắp đặt cố định tại các góc phòng họp vật lý ngay khi phiên họp bắt đầu.  |  |  |
| Trigger: | Phiên họp chuyển sang trạng thái đang diễn ra và cấu hình recording của cuộc họp có bật tính năng ghi hình.  |  |  |
| Preconditions: | **PRE-1.** Cuộc họp đã được kích hoạt bắt đầu thành công **.  PRE-2.** Cấu hình "Kích hoạt ghi hình" được đặt là Bật từ trước khi họp. **PRE-3.** Cả 2 IP Camera góc phòng đều đang trực tuyến trên mạng nội bộ và sẵn sàng cung cấp luồng truyền dữ liệu .  |  |  |
| Postconditions: | **POST-1.** Luồng video từ cả 2 IP Camera được Room Capture Agent thu giữ và lưu trữ liên tục vào máy chủ lưu trữ.  **POST-2**. Trạng thái "Đang ghi hình" (Recording) được đồng bộ và hiển thị trực quan trên giao diện quản lý của Host.  |  |  |
| Normal Flow: | 1\. Hệ thống phát hiện sự kiện cuộc họp chuyển sang trạng thái IN\_PROGRESS. 2\. Hệ thống truy xuất cấu hình recording của cuộc họp và xác nhận tùy chọn ghi hình đang được kích hoạt. 3\. Hệ thống gửi lệnh thiết lập kết nối (thông qua giao thức RTSP hoặc ONVIF) tới địa chỉ IP của 2 Camera góc phòng đã được chỉ định. 4\. Hai IP Camera phản hồi và bắt đầu truyền luồng dữ liệu video về cho thiết bị Room Capture Agent. 5\. Hệ thống khởi động tiến trình mã hóa (Encoding) và ghi các luồng video này thành tệp tin lưu trữ tạm thời trên ổ đĩa. 6\. Hệ thống đồng bộ trạng thái "Đang ghi hình" lên Bảng điều khiển của Host và màn hình hiển thị trước cửa phòng họp. |  |  |
| Alternative Flow: | **AF1: Một trong hai IP Camera gặp sự cố kết nối**  4.1. Hệ thống phát hiện Camera góc 2 không phản hồi luồng stream (hoặc mất tín hiệu kết nối).  4.2. Hệ thống tiếp tục duy trì tiến trình ghi hình đối với Camera góc 1 đang hoạt động bình thường.  4.3. Hệ thống gửi một thông báo cảnh báo nhỏ lên màn hình của Host: "Camera góc 2 mất kết nối. Hệ thống vẫn đang tiếp tục ghi hình với Camera góc 1." và ghi nhận mã lỗi vào log hệ thống.  |  |  |
| Exceptions: | **EX1:** Cả hai IP Camera đều không thể kết nối hoặc Room Capture Agent gặp sự cố nghiêm trọng. Tại bước 3, hệ thống hoàn toàn không thiết lập được luồng ghi hình nào. Hệ thống tự động chuyển trạng thái ghi hình sang THẤT BẠI , gửi thông báo Pop-up cảnh báo khẩn cấp cho Host.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Tiến trình ghi hình từ IP Camera phải khớp chính xác tuyệt đối với mốc "Thời gian bắt đầu thực tế" của cuộc họp và bắt buộc phải tự động ngừng lại khi cuộc họp chuyển sang trạng thái COMPLETED để đảm bảo quyền riêng tư.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-REC-05 Bắt đầu ghi âm theo channel/seat từ Room Capture Agent** 

| UC ID and Name: | UC-REC-05 Bắt đầu ghi âm theo channel/seat từ Room Capture Agent  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: |  |
| Description | Use case mô tả tiến trình hệ thống tự động kích hoạt và phối hợp với Room Capture Agent để bắt đầu ghi âm cuộc họp. Âm thanh được thu nhận từ một thiết bị kết nối âm thanh nhiều kênh, trong đó luồng tín hiệu từ mỗi kênh vật lý sẽ được phân tách độc lập và gán chặt với các mã định danh channel\_id và seat\_id tương ứng theo cấu hình.  |  |  |
| Trigger: | Phiên họp chuyển sang trạng thái đang diễn ra và cấu hình recording của cuộc họp có bật tính năng ghi âm.  |  |  |
| Preconditions: | **PRE-1.** Cuộc họp đã được kích hoạt bắt đầu thành công và chuyển sang trạng thái IN\_PROGRESS.  **PRE-2.** Cấu hình "Kích hoạt ghi âm" được thiết lập ở trạng thái Bật từ trước khi họp .  **PRE-3.** Thiết bị Room Capture Agent và Audio Interface đa kênh tại phòng họp đang ở trạng thái trực tuyến và hoạt động bình thường.  |  |  |
| Postconditions: | **POST-1**. Luồng âm thanh đa kênh được Room Capture Agent ghi lại liên tục và lưu trữ vào phân hệ quản lý.  **POST-2**. Từng track âm thanh được định danh chính xác theo cặp dữ liệu channel\_id và seat\_id.  **POST-3.** Trạng thái "Đang ghi âm" được đồng bộ lên Bảng điều khiển của Host.  |  |  |
| Normal Flow: | 1\. Hệ thống phát hiện sự kiện cuộc họp chuyển sang trạng thái IN\_PROGRESS. 2\. Hệ thống truy xuất cấu hình sơ đồ mapping channel/seat của cuộc họp này từ cơ sở dữ liệu. 3\. Hệ thống gửi lệnh khởi động tiến trình ghi âm kèm theo danh sách các tham số mapping (channel\_id, seat\_id) xuống thiết bị Room Capture Agent tại phòng. 4\. Room Capture Agent tiếp nhận lệnh và kích hoạt phần cứng Audio Interface đa kênh để mở các cổng thu tín hiệu từ hệ thống micro vật lý. 5\. Room Capture Agent bắt đầu thu nhận, bóc tách luồng âm thanh đầu vào từ các kênh riêng biệt, đồng thời đóng dấu nhãn thời gian và nhúng siêu dữ liệu chứa channel\_id và seat\_id vào từng track. 6\. Hệ thống thực hiện lưu trữ ngầm các luồng âm thanh phân tách này thành các tệp tin dữ liệu tạm thời trên máy chủ. 7\. Hệ thống gửi tín hiệu cập nhật trạng thái "Đang ghi âm" lên màn hình giao diện điều khiển của Host. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Hệ thống bắt buộc phải lưu trữ riêng biệt từng luồng âm thanh theo từng micro/vị trí ghế ngồi tại bước thu. Tuyệt đối không được phép trộn chung thành một hoặc hai kênh nhằm phục vụ tối ưu cho công nghệ bóc tách giọng nói theo vị trí và chuyển đổi giọng nói thành văn bản ở các module sau.  **BR2:** Dữ liệu cấu hình mapping channel/seat được Room Capture Agent áp dụng phải khớp chính xác 100% với phiên bản cấu hình mới nhất được ghi nhận tại thời điểm cuộc họp bắt đầu .  |  |  |
| Other Information: |  |  |  |
| Assumptions: | Hệ thống micro vật lý lắp đặt tại các vị trí ghế ngồi trong phòng họp đã được căn chỉnh kỹ thuật tốt, đảm bảo độ nhạy tiêu chuẩn và hạn chế tối đa hiện tượng tràn âm (audio bleed \- giọng của ghế A lọt vào micro của ghế B) làm ảnh hưởng đến chất lượng phân tách luồng.  |  |  |

6. #### **UC-REC-06 Tạo audio segment theo channelId/seatId** 

| UC ID and Name: | UC-REC-06 Tạo audio segment theo channelId/seatId  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: |  |
| Description | Use case mô tả quá trình hệ thống tự động bóc tách và phân chia luồng âm thanh đa kênh đang ghi thành các phân đoạn nhỏ dựa trên từng channel\_id/seat\_id. Các phân đoạn này được gắn nhãn siêu dữ liệu và lưu trữ tạm thời nhằm làm dữ liệu đầu vào cho các tiến trình xử lý bất đồng bộ như Speech-to-Text , nhận diện người phát biểu theo vị trí và xử lý transcript sau này.  |  |  |
| Trigger: | Hệ thống đang thực hiện ghi âm phiên họp và chu kỳ thời gian phân đoạn (ví dụ: cứ sau mỗi 15 giây) hoặc sự kiện im lặng được kích hoạt.  |  |  |
| Preconditions: | **PRE-1.** Phiên họp đang diễn ra và tiến trình ghi âm đa kênh đang hoạt động ổn định.  **PRE-2.** Tham số cấu hình độ dài phân đoạn tiêu chuẩn đã được thiết lập sẵn trong hệ thống.  |  |  |
| Postconditions: | POST-1. Các tệp phân đoạn âm thanh nhỏ được tạo ra thành công và lưu trữ vào bộ nhớ đệm.  POST-2. Metadata bao gồm channel\_id, seat\_id, start\_time, end\_time được gắn chặt và đồng bộ tương ứng với từng phân đoạn âm thanh.  |  |  |
| Normal Flow: | 1\. Hệ thống (Room Capture Agent) liên tục thu nhận luồng âm thanh từ các kênh micrô vật lý của phòng họp. 2\. Hệ thống áp dụng bộ đếm chu kỳ thời gian cố định (ví dụ: cứ sau mỗi 15 giây một lần). 3\. Hệ thống tiến hành cắt luồng âm thanh của từng kênh channel\_id thành một phân đoạn nhỏ độc lập . 4\. Hệ thống tạo mã định danh duy nhất và đóng gói tệp phân đoạn kèm các siêu dữ liệu cấu hình: meeting\_id, channel\_id, seat\_id, thời điểm bắt đầu , thời điểm kết thúc . 5\. Hệ thống lưu tệp phân đoạn này vào vùng lưu trữ đệm . 6\. Hệ thống đẩy một thông điệp sự kiện chứa thông tin phân đoạn vào hàng đợi tin nhắn để sẵn sàng phục vụ các phân hệ Speech To Text/Transcription tiêu thụ. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

7. #### **UC-REC-07 Tạm dừng ghi âm/ghi hình**


| UC ID and Name: | UC-REC-07 Tạm dừng ghi âm/ghi hình  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: | Hệ thống |
| Description | Use case cho phép người chủ trì (Host) chủ động tạm dừng phiên ghi âm/ghi hình đang diễn ra trong các trường hợp cuộc họp giải lao, thảo luận nội bộ hoặc trao đổi thông tin mật. Khi đó, hệ thống sẽ dừng thu dữ liệu và chuyển trạng thái phiên ghi sang PAUSED.  |  |  |
| Trigger: | Host nhấn nút "Tạm dừng ghi" trên Bảng điều khiển cuộc họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host.  **PRE-2.** Cuộc họp đang ở trạng thái diễn ra và phiên ghi dữ liệu đang ở trạng thái hoạt động **.**  |  |  |
| Postconditions: | **POST-1.** Trạng thái của thực thể Recording Session được chuyển sang PAUSED trong cơ sở dữ liệu.  **POST-2.** Tiến trình thu dữ liệu video từ IP Camera và âm thanh từ Audio Interface bị đình chỉ tạm thời, không sinh thêm dữ liệu mới.  **POST-3.** Giao diện điều khiển của Host và màn hình hiển thị tại phòng họp cập nhật đúng trạng thái đã tạm dừng.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Tạm dừng ghi" trên Bảng điều khiển trong cuộc họp. 2\. Hệ thống hiển thị một hộp thoại xác nhận với thông báo: "Bạn có chắc chắn muốn tạm dừng ghi âm/ghi hình cuộc họp?". 3\. Người dùng nhấp chọn "Xác nhận". 4\. Hệ thống chuyển trạng thái của phiên ghi sang PAUSED trong cơ sở dữ liệu của module Recording Management. 5\. Hệ thống gửi tín hiệu lệnh tạm dừng (Pause Signal) xuống thiết bị Room Capture Agent tại phòng họp vật lý. 6\. Room Capture Agent tiếp nhận lệnh, lập tức dừng đọc luồng stream từ các IP Camera và dừng phân tách luồng từ Audio Interface. 7\. Hệ thống cập nhật giao diện hiển thị trạng thái "Đã tạm dừng ghi" (biểu tượng Pause nhấp nháy) lên màn hình của Host và màn hình hiển thị trước cửa phòng họp. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | **BR1:** Khi trạng thái chuyển sang PAUSED, tất cả các tiến trình chạy ngầm như Ghi hình từ IP Camera , Ghi âm đa kênh và Tạo audio segment bắt buộc phải ngừng  |  |  |
| Other Information: | Sau khi thực hiện tạm dừng thành công, nút bấm "Tạm dừng ghi" trên giao diện của Host sẽ tự động chuyển đổi trạng thái và hiển thị thành nút "Tiếp tục ghi" (Resume Recording).  |  |  |
| Assumptions: |  |  |  |

8. #### **UC-REC-08 Tiếp tục ghi âm/ghi hình**


| UC ID and Name: | UC-REC-08 Tiếp tục ghi âm/ghi hình  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người chủ trì tiếp tục phiên ghi âm/ghi hình cuộc họp sau khi đã tạm dừng trước đó, kích hoạt lại hệ thống phần cứng để thu giữ dữ liệu.  |  |  |
| Trigger: | Host nhấn nút "Tiếp tục ghi" (Resume Recording) trên Bảng điều khiển cuộc họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host.  **PRE-2.** Phiên họp hiện tại đang ở trạng thái diễn ra (IN\_PROGRESS).  **PRE-3.** Phiên ghi dữ liệu (Recording Session) hiện đang ở trạng thái tạm dừng (PAUSED).  |  |  |
| Postconditions: | **POST-1.** Trạng thái của Recording Session được chuyển từ PAUSED trở lại RECORDING trong cơ sở dữ liệu.  **POST-2.** Tiến trình thu dữ liệu video từ IP Camera và âm thanh từ Audio Interface được tái kích hoạt thành công.  **POST-3.** Giao diện điều khiển của Host và màn hình hiển thị tại phòng cập nhật đúng trạng thái đang ghi dữ liệu.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Tiếp tục ghi" trên Bảng điều khiển trong cuộc họp. 2\. Hệ thống chuyển trạng thái của phiên ghi sang RECORDING trong cơ sở dữ liệu của module Recording Management. 3\. Hệ thống gửi tín hiệu lệnh tiếp tục (Resume Signal) xuống thiết bị Room Capture Agent tại phòng họp vật lý. 4\. Room Capture Agent tiếp nhận lệnh, lập tức kết nối lại luồng stream từ các IP Camera và tiếp tục phân tách luồng từ Audio Interface. 5\. Hệ thống tự động kích hoạt lại chu trình lưu trữ dữ liệu và tiến trình tạo audio segment tự động. 6\. Hệ thống cập nhật giao diện hiển thị trạng thái "Đang ghi" (biểu tượng chấm đỏ hoạt động) lên màn hình của Host và màn hình hiển thị trước cửa phòng họp. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | BR1: Khi trạng thái chuyển lại thành RECORDING, dữ liệu âm thanh và hình ảnh mới thu phải được đồng bộ hóa và đóng dấu thời gian (Timestamp) chính xác theo trục thời gian thực (Timeline) gốc của cuộc họp, đảm bảo không bị lệch pha với các đoạn đã ghi trước đó.  |  |  |
| Other Information: | Sau khi thực hiện tiếp tục ghi thành công, nút bấm "Tiếp tục ghi" trên giao diện của Host sẽ tự động chuyển đổi giao diện và chức năng thành nút "Tạm dừng ghi" (Pause Recording).  |  |  |
| Assumptions: |  |  |  |

9. #### **UC-REC-09 Dừng ghi hình từ IP Camera góc phòng** 

| UC ID and Name: | UC-REC-09 Dừng ghi hình từ IP Camera góc phòng  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: | Hệ thống  |
| Description | Use case mô tả quá trình người chủ trì (Host) hoặc Quản trị viên (Business Admin) chủ động kết thúc tiến trình ghi hình từ các IP Camera góc phòng (hoặc hệ thống tự động gọi khi cuộc họp đóng). Tệp tin video sau đó sẽ được đóng gói an toàn, kiểm tra tính toàn vẹn, gắn mã định danh cuộc họp và chuyển vào lưu trữ chính thức.  |  |  |
| Trigger: | Host hoặc Business Admin nhấn nút "Dừng ghi hình" trên giao diện điều khiển, hoặc hệ thống tự động kích hoạt khi cuộc họp kết thúc hoàn toàn.  |  |  |
| Preconditions: | **PRE-1.** Phiên họp đang ở trạng thái diễn ra (IN\_PROGRESS) hoặc đang trong tiến trình đóng.  **PRE-2.** Tiến trình ghi hình từ IP Camera (UC-REC-04) hiện đang ở trạng thái hoạt động (RECORDING) hoặc tạm dừng (PAUSED).  |  |  |
| Postconditions: | POST-1. Trạng thái của phiên ghi hình được chuyển sang đã hoàn thành (COMPLETED/FINALIZED) trong cơ sở dữ liệu.  POST-2. Tệp video được đóng gói (finalize file headers) thành công, đảm bảo không bị lỗi cấu trúc tệp tin.  POST-3. Đường dẫn tệp video được liên kết chính xác với mã cuộc họp (meeting\_id) trong phân hệ Recording Management.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Dừng ghi hình" trên Bảng điều khiển cuộc họp. 2\. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn kết thúc phiên ghi hình này?". 3\. Người dùng chọn "Xác nhận". 4\. Hệ thống gửi lệnh dừng ghi dữ liệu (Stop Recording Signal) xuống thiết bị Room Capture Agent tại phòng họp. 5\. Room Capture Agent lập tức ngắt kết nối luồng stream (RTSP/ONVIF) truyền về từ 2 IP Camera góc phòng. 6\. Room Capture Agent thực hiện tiến trình đóng tệp video, hoàn tất cấu trúc header của tệp (tạo file .mp4 hoặc .mkv hoàn chỉnh). 7\. Hệ thống cập nhật cơ sở dữ liệu của module Recording Management, chuyển trạng thái video session thành COMPLETED và lưu trữ thông tin đường dẫn tệp (file path/URL) gắn liền với meeting\_id. 8\. Hệ thống thông báo "Đã dừng và đóng gói tệp video cuộc họp thành công" trên giao diện điều khiển. |  |  |
| Alternative Flow: | **AF1: Tự động dừng ghi hình khi cuộc họp kết thúc (Auto-stop)** 1\. Cuộc họp chuyển sang trạng thái đã kết thúc (COMPLETED) từ phân hệ quản lý cuộc họp. 2\. Hệ thống tự động kích hoạt lệnh dừng ghi hình và thực thi thẳng tiến trình từ bước 4 của Normal Flow mà không cần người dùng thao tác hay xác nhận thủ công. |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Khi đã thực thi lệnh "Dừng ghi hình", phiên ghi hình đó sẽ bị đóng vĩnh viễn. Người dùng không thể dùng lệnh "Tiếp tục" mà bắt buộc phải tạo một phiên ghi mới hoàn toàn nếu muốn quay phim tiếp.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

10. #### **UC-REC-10 Dừng ghi âm từ mic để bàn** 

| UC ID and Name: | UC-REC-10 Dừng ghi âm từ mic để bàn  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: | Hệ thống  |
| Description | Use case mô tả quá trình dừng tiến trình ghi âm cuộc họp từ hệ thống micrô để bàn. Luồng âm thanh thu từ mỗi thiết bị micrô vật lý sẽ được kết thúc, đóng gói an toàn và lưu trữ vào hệ thống theo mã định danh thiết bị  |  |  |
| Trigger: | Host nhấn nút "Dừng ghi âm" trên giao diện điều khiển, hoặc hệ thống tự động gọi khi cuộc họp kết thúc hoàn toàn.  |  |  |
| Preconditions: | **PRE-1.** Phiên họp đang ở trạng thái diễn ra (IN\_PROGRESS) hoặc đang trong tiến trình đóng.  **PRE-2.** Tiến trình ghi âm đa kênh từ hệ thống mic để bàn (UC-REC-05) hiện đang ở trạng thái hoạt động (RECORDING) hoặc tạm dừng (PAUSED).  |  |  |
| Postconditions: | POST-1. Trạng thái của phiên ghi âm được chuyển sang đã hoàn thành.  POST-2. Các tệp âm thanh độc lập được đóng gói thành công và lưu lại theo đúng mã mic\_device\_id.  POST-3. Đường dẫn các tệp âm thanh được liên kết chính xác với mã cuộc họp.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào nút "Dừng ghi âm" trên Bảng điều khiển cuộc họp. 2\. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn kết thúc phiên ghi âm này?". 3\. Người dùng chọn "Xác nhận". 4\. Hệ thống gửi lệnh dừng ghi âm xuống thiết bị Room Capture Agent tại phòng họp. 5\. Room Capture Agent lập tức ngắt việc thu nhận tín hiệu từ các cổng của Audio Interface kết nối với các mic để bàn vật lý. 6\. Room Capture Agent thực hiện tiến trình đóng tệp âm thanh của từng kênh, hoàn tất cấu trúc header file (tạo các file định dạng chuẩn như .wav hoặc .pcm). 7\. Hệ thống cập nhật cơ sở dữ liệu của module Recording Management, chuyển trạng thái audio session thành COMPLETED và lưu trữ thông tin đường dẫn tệp (file path/URL) đi kèm với mic\_device\_id và meeting\_id. 8\. Hệ thống thông báo "Đã dừng và đóng gói tệp ghi âm cuộc họp thành công" trên giao diện điều khiển. |  |  |
| Alternative Flow: | **AF1: Tự động dừng ghi âm khi cuộc họp kết thúc (Auto-stop)** 1\. Cuộc họp chuyển sang trạng thái đã kết thúc (COMPLETED) từ phân hệ quản lý cuộc họp. 2\. Hệ thống tự động kích hoạt lệnh dừng ghi âm từ mic để bàn và thực thi thẳng tiến trình từ bước 4 của Normal Flow mà không cần người dùng thao tác hay xác nhận thủ công. |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Khi đã thực thi lệnh "Dừng ghi âm", phiên ghi đó sẽ bị đóng vĩnh viễn, người dùng không thể sử dụng lệnh "Tiếp tục" .  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

11. #### **UC-REC-11 Xem danh sách file ghi âm/ghi hình** 

| UC ID and Name: | UC-REC-11 Xem danh sách file ghi âm/ghi hình  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: | Hệ thống |
| Description | Use case cho phép người dùng có quyền (Host, Người tham dự, hoặc Quản trị viên) xem danh sách các tệp tin video từ IP Camera, tệp tin âm thanh tổng hợp và các phân đoạn âm thanh từ Room Capture Agent được lưu trữ của cuộc họp. |  |  |
| Trigger: | Người dùng truy cập vào trang chi tiết lịch sử cuộc họp hoặc Kho lưu trữ dữ liệu và chọn mục "Dữ liệu ghi âm/ghi hình".  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Cuộc họp được chọn đã kết thúc hoặc phiên ghi dữ liệu đã được dừng và đóng gói file hoàn tất.  **PRE-3.** Người dùng thuộc danh sách thành viên hợp lệ của cuộc họp hoặc có quyền quản trị doanh nghiệp.  |  |  |
| Postconditions: | **POST-1.** Danh sách các file dữ liệu (video, audio, audio segments) mà người dùng có quyền tiếp cận được hiển thị đầy đủ và trực quan trên giao diện.  **POST-2**. Trạng thái và dữ liệu gốc trên hệ thống không thay đổi.  |  |  |
| Normal Flow: | 1\. Người dùng điều hướng đến trang Chi tiết cuộc họp hoặc Kho lưu trữ dữ liệu truyền thông. 2\. Người dùng nhấp vào tab "Danh sách file ghi dữ liệu" . 3\. Hệ thống tiếp nhận yêu cầu, kiểm tra vai trò và quyền hạn của tài khoản đối với cuộc họp được chọn. 4\. Hệ thống truy xuất danh sách các tệp tin từ cơ sở dữ liệu của module Recording Management. 5\. Hệ thống thực hiện lọc danh sách file theo quy tắc phân quyền hiển thị của user. 6\. Hệ thống hiển thị danh sách các file hợp lệ lên màn hình kèm theo thông tin chi tiết: Tên file, loại file (Video/Audio/Segment), dung lượng, thời lượng, góc camera/mã thiết bị mic, và mốc thời gian ghi. |  |  |
| Alternative Flow: | **AF1: Lọc và tìm kiếm file ghi** 1\. Tại màn hình danh sách file, người dùng sử dụng bộ lọc để chọn hiển thị theo Loại file (chỉ xem Video hoặc chỉ xem Audio), hoặc lọc theo mã ghế (seat\_id)/kênh âm thanh (channel\_id). 2\. Hệ thống thực hiện quét dữ liệu và chỉ hiển thị các tệp tin thỏa mãn điều kiện lọc. **AF2: Business Admin xem danh sách file từ bảng quản trị hệ thống** 1\. Business Admin truy cập vào menu Quản lý tài nguyên ghi âm (Recording Asset Management) trên trang quản trị trung tâm. 2\. Admin tìm kiếm theo mã cuộc họp (meeting\_id) hoặc mã phòng họp. 3\. Hệ thống bỏ qua các ràng buộc thành viên cuộc họp riêng lẻ và hiển thị toàn bộ tất cả các file video, audio và segment của cuộc họp đó để phục vụ công tác quản lý hạ tầng lưu trữ. |  |  |
| Exceptions: | **EX1:** Cuộc họp không cấu hình ghi dữ liệu. Tại bước 4, nếu hệ thống xác nhận cuộc họp này không bật tính năng recording ban đầu hoặc không có file nào được sinh ra, giao diện hiển thị thông báo trống: "Cuộc họp này không có dữ liệu ghi âm/ghi hình được lưu trữ."  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | High |  |  |
| Business Rules: | **BR1 : \- Business Admin & Host:** Có toàn quyền xem và tiếp cận tất cả các file có trong cuộc họp. **\- Participant (Người tham dự):** Mặc định chỉ được phép xem các file video góc cam chính và file audio tổng hợp được Host cấu hình chia sẻ chung.  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

12. #### **UC-REC-12 Xem chi tiết file phương tiện** 

| UC ID and Name: | UC-REC-12 Xem chi tiết file phương tiện  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: | Hệ thống  |
| Description | Use case cho phép người dùng có quyền (Host, Người tham dự, hoặc Quản trị viên) xem thông tin thuộc tính chi tiết và metadata của một file phương tiện cụ thể thuộc cuộc họp.  |  |  |
| Trigger: | Người dùng nhấp vào một file phương tiện cụ thể trong danh sách file ghi âm/ghi hình hoặc kho lưu trữ và chọn xem thông tin chi tiết.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Người dùng thuộc danh sách thành viên hợp lệ của cuộc họp (Host/Participant) hoặc có quyền quản trị doanh nghiệp (Business Admin).  **PRE-3.** File phương tiện được chọn tồn tại trong hệ thống dữ liệu và người dùng có quyền tiếp cận file đó.  |  |  |
| Postconditions: | **POST-1.** Toàn bộ thông tin chi tiết và siêu dữ liệu của file phương tiện được hiển thị đầy đủ và chính xác trên giao diện.  **POST-2**. Trạng thái và dữ liệu gốc trên hệ thống không thay đổi .  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào giao diện Xem danh sách file ghi âm/ghi hình của cuộc họp . 2\. Người dùng chọn một file phương tiện cụ thể và nhấp vào nút "Xem chi tiết". 3\. Hệ thống tiếp nhận yêu cầu, kiểm tra quyền hạn của tài khoản đối với file phương tiện được chọn. 4\. Hệ thống truy xuất metadata của file từ cơ sở dữ liệu. 5\. Hệ thống hiển thị một cửa sổ thông tin chi tiết lên màn hình, bao gồm các trường thông tin: Tên file  Loại file  Nguồn thiết bị  Phân kênh/Ghế ngồi  Dung lượng file  Thời lượng  Thời gian tạo |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

13. #### **UC-REC-13 Phát lại file ghi âm/ghi hình** 

| UC ID and Name: | UC-REC-13 Phát lại file ghi âm/ghi hình  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: |  |
| Description | Use case cho phép người dùng có quyền phát lại trực tiếp các tệp tin video hoặc tệp tin âm thanh/phân đoạn âm thanh ngay trên trình phát phương tiện tích hợp của giao diện hệ thống mà không cần phải tải tệp tin về thiết bị cá nhân.  |  |  |
| Trigger: | Người dùng nhấp vào nút "Phát" (Play) của một tệp tin phương tiện trong danh sách tệp ghi âm/ghi hình hoặc trên giao diện xem chi tiết tệp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Người dùng thuộc danh sách thành viên hợp lệ của cuộc họp hoặc là Business Admin.  **PRE-3.** Tệp tin phương tiện được chọn tồn tại trên máy chủ lưu trữ dữ liệu và người dùng có quyền tiếp cận tệp đó.  |  |  |
| Postconditions: | **POST-1.** Luồng dữ liệu phương tiện được tải và phát mượt mà trên giao diện người dùng.  **POST-2.** Trạng thái và dữ liệu gốc trên hệ thống không thay đổi.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập giao diện Xem danh sách file ghi âm/ghi hình của cuộc họp  hoặc Xem chi tiết file phương tiện . 2\. Người dùng nhấp vào biểu tượng "Phát" trên tệp tin video hoặc audio muốn xem/nghe. 3\. Hệ thống tiếp nhận yêu cầu, kiểm tra vai trò và quyền hạn của tài khoản đối với tệp tin này. 4\. Hệ thống gửi yêu cầu đến dịch vụ lưu trữ để khởi tạo một đường dẫn an toàn có thời hạn dành riêng cho phiên phát này. 5\. Hệ thống kích hoạt trình phát phương tiện trên giao diện. 6\. Hệ thống tiến hành truyền dữ liệu theo luồng và bắt đầu phát tệp tin phương tiện. Người dùng có thể sử dụng các thanh điều khiển tiêu chuẩn: Tạm dừng , Tua thời gian, Điều chỉnh âm lượng, và Bật/Tắt toàn màn hình . |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | Trình phát phương tiện cần được tích hợp tính năng điều chỉnh tốc độ phát (Playback Speed: 0.5x, 1x, 1.25x, 1.5x, 2x) để tối ưu hóa thời gian theo dõi lại của người dùng.  |  |  |
| Assumptions: |  |  |  |

14. #### **UC-REC-14 Xóa hoặc ẩn file recording** 

| UC ID and Name: | UC-REC-14 Xóa hoặc ẩn file recording  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin  | Secondary Actors: |  |
| Description | Use case này mô tả quy trình Quản trị viên doanh nghiệp (Business Admin) thực hiện hành động xóa mềm hoặc ẩn các tệp tin ghi âm/ghi hình ra khỏi danh sách.  |  |  |
| Trigger: | Business Admin chọn một hoặc nhiều file recording trên trang quản trị tài nguyên và nhấn nút "Ẩn" hoặc "Xóa".  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với vai trò Business Admin.  **PRE-2.** File phương tiện được chọn phải tồn tại trên hệ thống .   |  |  |
| Postconditions: | **POST-1.** Nếu chọn Ẩn: Trạng thái hiển thị của file được cập nhật thành "Bị ẩn". File không xuất hiện trên giao diện của Host và Participant nhưng vẫn được quản lý trong trang cấu hình nâng cao của Admin.  **POST-2.** Nếu chọn Xóa: File được đánh dấu xóa mềm, ẩn hoàn toàn khỏi tất cả giao diện người dùng thông thường.  **POST-3.** Nhật ký hệ thống ghi nhận chi tiết thông tin hành động xóa/ẩn dữ liệu.  |  |  |
| Normal Flow: | 1\. Business Admin truy cập vào menu Quản lý tài nguyên ghi âm (Recording Asset Management) trên trang quản trị trung tâm. 2\. Admin sử dụng các công cụ tìm kiếm hoặc bộ lọc để xác định các file recording cần xử lý. 3\. Admin chọn file phương tiện và nhấp vào nút "Ẩn file". 4\. Hệ thống hiển thị hộp thoại yêu cầu xác nhận hành động: "Bạn có chắc chắn muốn ẩn file này khỏi danh sách hiển thị của người dùng cuộc họp?". 5\. Admin nhấp chọn "Xác nhận". 6\. Hệ thống thực hiện cập nhật thuộc tính ẩn (is\_hidden \= true) của bản ghi file trong cơ sở dữ liệu của module Recording Management. 7\. Hệ thống làm mới danh sách và hiển thị thông báo thành công: "Đã ẩn file phương tiện thành công". |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Low |  |  |
| Business Rules: | BR2: Khi một file được chuyển sang trạng thái Ẩn, chỉ có tài khoản thuộc nhóm Business Admin mới có thể nhìn thấy nút hoàn tác ẩn (Unhide/Show) để khôi phục quyền hiển thị cho người dùng. |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

## 14\. Minutes & Knowledge Management

#### 

1. #### **UC-MKM-01 Tạo biên bản họp nháp** 

| UC ID and Name: | UC-MKM-01 Tạo biên bản họp nháp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host) | Secondary Actors: |  |
| Description | Use case mô tả quá trình Host tạo một bản ghi biên bản cuộc họp dưới dạng nháp (Draft). Bản nháp này cho phép Host soạn thảo, chỉnh sửa và bổ sung các nội dung, kết luận, quyết định và danh sách đầu việc phát sinh từ cuộc họp trước khi ban hành chính thức cho toàn bộ thành viên.  |  |  |
| Trigger: | Host nhấn nút "Tạo biên bản họp" trên giao diện hệ thống sau khi cuộc họp kết thúc, hoặc hệ thống tự động gợi ý khởi tạo.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với tư cách là Host của cuộc họp đó.  **PRE-2.** Cuộc họp liên quan đã kết thúc hoặc đang diễn ra và có phát sinh nhu cầu ghi chép biên bản.  |  |  |
| Postconditions: | **POST-1.** Một bản ghi Biên bản cuộc họp mới được khởi tạo thành công trong cơ sở dữ liệu với trạng thái ban đầu là DRAFT.  **POST-2**. Hệ thống chuyển hướng Host đến giao diện soạn thảo biên bản cuộc họp.  |  |  |
| Normal Flow: | 1\. Host truy cập vào trang Chi tiết cuộc họp hoặc Kho lưu trữ biên bản họp. 2\. Host nhấp vào nút "Tạo biên bản cuộc họp". 3\. Hệ thống khởi tạo một biểu mẫu (form) biên bản mới và tự động điền trước các thông tin cơ bản được kế thừa từ cuộc họp bao gồm: Tiêu đề cuộc họp, Thời gian bắt đầu/kết thúc thực tế, Địa điểm/Phòng họp vật lý, và Danh sách thành viên tham dự thực tế (lấy từ dữ liệu điểm danh). 4\. Hệ thống thiết lập trạng thái mặc định của biên bản này là Nháp. 5\. Hệ thống hiển thị giao diện soạn thảo văn bản để Host bắt đầu nhập liệu thông tin nội dung chi tiết. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High |  |  |
| Frequency of Use: | High |  |  |
| Business Rules: | BR1: Biên bản cuộc họp ở trạng thái DRAFT chỉ có Host của cuộc họp đó có quyền nhìn thấy, truy cập và chỉnh sửa. Người tham dự không thể tìm thấy hoặc xem nội dung bản nháp..  BR2 : Các thông tin của cuộc họp (như Thời gian thực tế, Danh sách người có mặt/vắng mặt) được hệ thống khóa cứng , Host không được phép chỉnh sửa để đảm bảo tính chính xác và minh bạch khi đối soát.  |  |  |
| Other Information: | 1\. Giao diện soạn thảo biên bản nháp cần hỗ trợ đầy đủ công cụ định dạng văn bản và các template mẫu biên bản chuẩn của doanh nghiệp để Host thao tác nhanh chóng. 2\. Hệ thống nên có cơ chế tự động lưu ngầm (Auto-save) sau mỗi 5 giây khi Host đang soạn thảo để tránh mất mát dữ liệu do sự cố mạng hoặc trình duyệt. |  |  |
| Assumptions: | N/A |  |  |

2. #### **UC-MKM-02 Xem danh sách biên bản họp** 

| UC ID and Name: | UC-MKM-02 Xem danh sách biên bản họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: |  |
| Description | Use case cho phép người dùng xem danh sách các biên bản cuộc họp mà họ có quyền truy cập dựa trên vai trò cá nhân và danh sách khách mời của cuộc họp đó.  |  |  |
| Trigger: | Người dùng điều hướng và nhấp vào menu "Quản lý biên bản họp" trên giao diện hệ thống.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  |  |  |
| Postconditions: | **POST-1.** Danh sách các biên bản họp hợp lệ được lọc và hiển thị chính xác theo cấu trúc phân quyền của tài khoản.  **POST-2.** Trạng thái và dữ liệu gốc trên hệ thống không bị thay đổi .  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào menu "Quản lý biên bản họp". 2\. Hệ thống kiểm tra vai trò của tài khoản và danh sách các cuộc họp mà tài khoản này có liên quan. 3\. Hệ thống truy xuất danh sách các bản ghi biên bản cuộc họp từ cơ sở dữ liệu. 4\. Hệ thống áp dụng quy tắc lọc phân quyền hiển thị. 5\. Hệ thống hiển thị danh sách biên bản họp lên giao diện bao gồm các thông tin trực quan: Tiêu đề cuộc họp, Thời gian diễn ra thực tế, Phòng họp, Người tạo/Chủ trì (Host). |  |  |
| Alternative Flow: | **AF1: Tìm kiếm và lọc danh sách biên bản** 1\. Tại màn hình danh sách biên bản họp, người dùng nhập từ khóa vào thanh tìm kiếm (tìm theo tiêu đề, tên cuộc họp, tên host) hoặc chọn các tiêu chí lọc (lọc theo trạng thái, khoảng thời gian, phòng họp vật lý). 2\. Hệ thống tiếp nhận tham số, thực hiện quét dữ liệu và cập nhật danh sách hiển thị chỉ chứa các biên bản thỏa mãn điều kiện lọc. **AF2: Business Admin xem toàn bộ danh sách biên bản của tổ chức** 1\. Business Admin truy cập vào Kho lưu trữ tập trung trên trang quản trị. 2\. Hệ thống bỏ qua các ràng buộc về danh sách khách mời cá nhân của từng cuộc họp. 3\. Hệ thống hiển thị toàn bộ tất cả biên bản họp. |  |  |
| Exceptions: | **EX1:** Tại bước 4 hoặc bước 1 của AF1, nếu hệ thống không tìm thấy biên bản nào người dùng có quyền tiếp cận hoặc không có kết quả trùng khớp với từ khóa tìm kiếm, giao diện sẽ ẩn danh sách và hiển thị thông báo: "Không tìm thấy biên bản cuộc họp nào phù hợp."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR2:** Hệ thống bắt buộc phải áp dụng cơ chế phân trang (Pagination) hoặc tải cuộn (Lazy loading) với số lượng tối đa 20 bản ghi trên một trang. |  |  |
| Other Information: | Trên giao diện danh sách, các biên bản cần được gắn các nhãn màu (Badge) rõ ràng để người dùng dễ nhận biết trạng thái: Màu xám cho nhãn "Nháp", màu xanh lá cho nhãn "Chính thức" và màu vàng/nâu cho nhãn "Lưu trữ".  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-MKM-03 Xem chi tiết biên bản họp** 

| UC ID and Name: | UC-MKM-03 Xem chi tiết biên bản họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình người dùng có quyền truy cập để xem toàn bộ nội dung chi tiết của một biên bản cuộc họp cụ thể, bao gồm thông tin hành chính, nội dung tóm tắt/chi tiết, danh sách file đính kèm và các tài nguyên liên quan.  |  |  |
| Trigger: | Người dùng chọn một biên bản họp cụ thể từ danh sách biên bản họp hoặc nhấp vào liên kết thông báo biên bản họp đã ban hành.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Biên bản cuộc họp được chọn tồn tại trong hệ thống dữ liệu.  **PRE-3.** Tài khoản người dùng có quyền tiếp cận biên bản này.  |  |  |
| Postconditions: | **POST-1.** Toàn bộ nội dung chi tiết, tệp đính kèm và tài nguyên liên quan của biên bản được hiển thị đầy đủ trên giao diện.  **POST-2.** Trạng thái và dữ liệu gốc trên hệ thống không thay đổi  |  |  |
| Normal Flow: | 1\. Người dùng nhấp chọn một biên bản cuộc họp cụ thể trên màn hình Danh sách biên bản họp. 2\. Hệ thống kiểm tra trạng thái của biên bản họp (Draft, Official, hay Archived) và đối chiếu quyền truy cập của tài khoản người dùng. 3\. Hệ thống truy xuất toàn bộ dữ liệu chi tiết của biên bản họp từ cơ sở dữ liệu. 4\. Hệ thống hiển thị giao diện Chi tiết biên bản họp được phân bổ thành các phân khu rõ ràng: **Thông tin chung:** Tiêu đề cuộc họp, thời gian thực tế, địa điểm, danh sách người chủ trì, người ghi chép và danh sách thành viên có mặt/vắng mặt. **Nội dung chính:** Phần văn bản chi tiết ghi chép diễn biến cuộc họp, các ý kiến thảo luận và quyết định đã được thông qua. **Tài nguyên liên quan** **File đính kèm:** Danh sách các tài liệu, slide báo cáo, hình ảnh được tải lên đi kèm biên bản. |  |  |
| Alternative Flow: | **AF1: Host/Business Admin xem biên bản ở trạng thái Nháp (Draft)** 1\. Tại bước 2, hệ thống xác nhận biên bản đang ở trạng thái DRAFT và tài khoản thực hiện là Host hoặc Business Admin. 2\. Hệ thống hiển thị toàn bộ nội dung chi tiết của bản nháp, đồng thời kích hoạt hiển thị các nút chức năng nâng cao trên thanh công cụ: "Chỉnh sửa biên bản"  và "Ban hành chính thức". |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | Giao diện nên hỗ trợ tính năng xuất (Export) nội dung chi tiết biên bản họp ra các định dạng tài liệu phổ biến như PDF hoặc Microsoft Word (đối với biên bản đã ban hành chính thức) để phục vụ việc in ấn hoặc lưu trữ ngoại tuyến.  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-MKM-04 Cập nhật nội dung biên bản họp**


| UC ID and Name: | UC-MKM-04 Cập nhật nội dung biên bản họp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host)  | Secondary Actors: |  |
| Description | Use case cho phép Host chỉnh sửa, cập nhật thông tin chi tiết, bổ sung quyết định, điều chỉnh danh sách đầu việc được giao hoặc đính kèm thêm tài liệu vào biên bản cuộc họp đang ở trạng thái nháp.  |  |  |
| Trigger: | Host nhấn nút "Chỉnh sửa" tại màn hình xem chi tiết của một biên bản cuộc họp đang ở trạng thái nháp.  |  |  |
| Preconditions: | **PRE-1.** Host phải được xác thực và đăng nhập vào hệ thống thành công. **PRE-2.** Biên bản cuộc họp được chọn phải ở trạng thái nháp . |  |  |
| Postconditions: | **POST-1.** Nội dung thay đổi mới nhất của biên bản họp được lưu trữ thành công vào cơ sở dữ liệu.  **POST-2.** Biên bản họp vẫn được giữ nguyên trạng thái nháp để có thể tiếp tục chỉnh sửa sau đó.  |  |  |
| Normal Flow: | 1\. Host truy cập vào giao diện Xem chi tiết biên bản họp của một cuộc họp đang có trạng thái biên bản là “Nháp”. 2\. Host nhấp vào nút "Chỉnh sửa biên bản" (Edit). 3\. Hệ thống chuyển đổi giao diện hiển thị sang màn hình chỉnh sửa. 4\. Host tiến hành thực hiện các thay đổi cần thiết 5\. Host nhấn nút "Lưu thay đổi" 6\. Hệ thống cập nhật các thay đổi và hiển thị thông báo: "Cập nhật nội dung biên bản cuộc họp thành công". |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1:** Chức năng cập nhật chỉ có hiệu lực đối với biên bản họp đang nằm ở trạng thái “Nháp”. Nếu biên bản đã được thực hiện lệnh "Ban hành", chức năng chỉnh sửa này sẽ bị ẩn đi. **BR2**: Chỉ Host mới được quyền chỉnh sửa biên bản họp này , người tham dự thông thường không được cấp quyền chỉnh sửa.  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-MKM-05 Xóa biên bản họp nháp** 

| UC ID and Name: | UC-MKM-05 Xóa biên bản họp nháp  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin  | Secondary Actors: |  |
| Description | Use case cho phép Host hoặc Business Admin thực hiện hành động xóa bỏ một biên bản cuộc họp đang ở trạng thái nháp  |  |  |
| Trigger: | Host hoặc Business Admin nhấn nút "Xóa" tại màn hình danh sách hoặc màn hình chi tiết của một biên bản họp đang ở trạng thái nháp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Tài khoản thực hiện phải là Host của cuộc họp đó hoặc là Business Admin.  **PRE-3.** Biên bản cuộc họp được chọn bắt buộc phải đang ở trạng thái nháp  |  |  |
| Postconditions: | **POST-1.** Bản ghi biên bản nháp được chuyển sang trạng thái xóa mềm và ẩn hoàn toàn khỏi các giao diện.  **POST-2.** Audit log ghi nhận chi tiết thông tin hành động xóa dữ liệu.  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào giao diện “Xem danh sách biên bản họp” hoặc “Xem chi tiết biên bản họp”. 2\. Người dùng chọn biên bản nháp cần xử lý và nhấn nút "Xóa" (Delete). 3\. Hệ thống hiển thị một hộp thoại cảnh báo xác nhận 4\. Người dùng nhấp chọn "Xác nhận xóa". 5\. Hệ thống thực hiện cập nhật trạng thái bản ghi biên bản thành DELETE 6\. Hệ thống làm mới danh sách và hiển thị thông báo thành công: "Đã xóa biên bản họp nháp thành công." |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | **BR1 :** Hành động xóa biên bản nháp tại giao diện này là xóa mềm.  **BR2 :**Participant hoàn toàn không có quyền thực thi use case này.  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

6. #### **UC-MKM-06 Lọc biên bản theo khoảng thời gian** 

| UC ID and Name: | UC-MKM-06 Lọc biên bản theo khoảng thời gian  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host / Participant), Business Admin | Secondary Actors: |  |
| Description | Use case mô tả người dùng thực hiện lọc danh sách biên bản cuộc họp dựa trên một khoảng thời gian xác định để nhanh chóng thu hẹp phạm vi tìm kiếm  |  |  |
| Trigger: | Người dùng tương tác với bộ chọn thời gian (Date Range Picker) trên thanh công cụ lọc của màn hình danh sách biên bản họp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống thành công.  **PRE-2.** Người dùng hiện đang ở giao diện Xem danh sách biên bản họp.  |  |  |
| Postconditions: | **POST-1.** Danh sách hiển các biên bản cuộc họp có thời gian diễn ra nằm trong khoảng thời gian được chọn.  |  |  |
| Normal Flow: | 1\. Người dùng nhấp vào thanh công cụ lọc và chọn mục "Khoảng thời gian". 2\. Hệ thống hiển thị giao diện lịch chọn chứa hai trường nhập liệu: "Từ ngày" và "Đến ngày". 3\. Người dùng chọn ngày bắt đầu và ngày kết thúc mong muốn, sau đó nhấp nút "Áp dụng" (Apply). 4\. Hệ thống tiếp nhận hai tham số mốc thời gian từ người dùng. 5\. Hệ thống thực hiện truy vấn cơ sở dữ liệu, lọc các biên bản có ngày diễn ra cuộc họp nằm trong khoảng được chỉ định, đồng thời kết hợp điều kiện phân quyền của tài khoản hiện tại. 6\. Hệ thống làm mới danh sách và hiển thị các kết quả trùng khớp lên màn hình. |  |  |
| Alternative Flow: | **AF2: Clear Filter** 1\. Người dùng nhấp vào biểu tượng dấu “X”  bên cạnh khoảng thời gian đang được áp dụng. 2\. Hệ thống xóa bỏ các tham số ngày đã lưu trong phiên làm việc, thực hiện tải lại toàn bộ danh sách biên bản họp đầy đủ. |  |  |
| Exceptions: | **EX2:**Nếu không có kết quả trả về trống, hệ thống sẽ ẩn bảng danh sách và hiển thị thông báo: "Không tìm thấy biên bản cuộc họp nào trong khoảng thời gian từ \[Ngày bắt đầu\] đến \[Ngày kết thúc\]."  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | N/A |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

7. #### **UC-MKM-07 Tìm kiếm biên bản theo nhân sự** 

| UC ID and Name: | UC-MKM-07 Tìm kiếm biên bản theo nhân sự  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Manager / Approver, Business Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình Business Admin hoặc Manager thực hiện tìm kiếm và lọc ra toàn bộ các biên bản cuộc họp có sự liên quan đến một nhân sự cụ thể  |  |  |
| Trigger: | Người dùng tương tác với bộ lọc tìm kiếm nâng cao và nhập thông tin nhân sự trên giao diện quản lý biên bản.  |  |  |
| Preconditions: | **PRE-1.** Người dùng phải được xác thực và đăng nhập vào hệ thống với vai trò Business Admin hoặc Manager.  **PRE-2.** Người dùng đang ở giao diện Quản lý biên bản cuộc họp**.**  |  |  |
| Postconditions: | **POST-1.** Hệ thống hiển thị danh sách tất cả các biên bản cuộc họp có sự liên quan của nhân sự được tìm kiếm dựa trên phạm vi quyền hạn của người tra cứu.  |  |  |
| Normal Flow: | 1\. Người dùng điều hướng đến màn hình Tra cứu biên bản cuộc họp. 2\. Người dùng chọn công cụ lọc "Tìm theo nhân sự". 3\. Người dùng nhập tên, email hoặc mã định danh (Employee ID) của nhân sự cần tra cứu vào ô tìm kiếm. 4\. Hệ thống thực hiện quét và hiển thị danh sách gợi ý tự động các nhân sự trùng khớp. 5\. Người dùng chọn chính xác tài khoản nhân sự cần tìm và nhấn nút "Tìm kiếm". 6\. Hệ thống thực hiện truy vấn và đối chiếu dữ liệu trong cơ sở dữ liệu 7\. Hệ thống hiển thị danh sách các biên bản cuộc họp thỏa mãn điều kiện lên màn hình. |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | **EX1:** Nếu thông tin nhập vào không trùng khớp với bất kỳ nhân viên nào, hệ thống hiển thị thông báo lỗi: "Không tìm thấy nhân sự phù hợp trong hệ thống." **EX2:** Nếu nhân sự có tồn tại nhưng chưa từng liên quan đến bất kỳ cuộc họp nào có biên bản, hệ thống sẽ ẩn danh sách kết quả và hiển thị thông báo: "Không tìm thấy biên bản cuộc họp nào liên quan đến nhân sự này." |  |  |
| Priority: | Medium  |  |  |
| Frequency of Use: | Medium  |  |  |
| Business Rules: | **BR1 :**  **\- Business Admin:** Hệ thống hiển thị toàn bộ tất cả các biên bản cuộc họp liên quan đến nhân sự được tìm kiếm trên toàn công ty mà không bị giới hạn. **\- Manager :** Manager chỉ có thể nhìn thấy các biên bản liên quan đến nhân sự đó nếu cuộc họp đó thuộc phạm vi quản lý của phòng ban do Manager phụ trách |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

8. #### **UC-MKM-09 Ban hành biên bản họp chính thức** 

| UC ID and Name: | UC-MKM-09 Ban hành biên bản họp chính thức  |  |  |
| :---- | :---- | :---- | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Internal Employee (Host), Business Admin | Secondary Actors: |  |
| Description | Use case mô tả quá trình Host hoặc Business Admin ban hành một biên bản cuộc họp từ trạng thái Nháp sang trạng thái Chính thức  |  |  |
| Trigger: | Host hoặc Business Admin nhấn nút "Ban hành chính thức" trên giao diện soạn thảo hoặc xem chi tiết biên bản nháp.  |  |  |
| Preconditions: | **PRE-1.** Người dùng đăng nhập vào hệ thống với vai trò Host hoặc Business Admin.  **PRE-2.** Biên bản cuộc họp liên quan hiện đang ở trạng thái Nháp.  **PRE-3.** Nội dung biên bản đã được điền các thông tin  |  |  |
| Postconditions: | **POST-1.** Trạng thái của biên bản họp được chuyển từ DRAFT sang OFFICIAL trong cơ sở dữ liệu.  **POST-2.** Chức năng chỉnh sửa nội dung văn bản của biên bản này bị khóa hoàn toàn  |  |  |
| Normal Flow: | 1\. Người dùng truy cập vào giao diện Xem chi tiết biên bản họp của một cuộc họp đang có trạng thái biên bản là DRAFT. 2\. Người dùng nhấp chọn nút "Ban hành chính thức" (Publish). 3\. Hệ thống hiển thị một hộp thoại xác nhận 4\. Người dùng nhấp chọn "Xác nhận ban hành". 5\. Hệ thống thực hiện chuyển đổi trạng thái của biên bản từ DRAFT sang OFFICIAL trong cơ sở dữ liệu. 6\. Giao diện làm mới, chuyển sang chế độ hiển thị bản chính thức và thông báo: "Ban hành biên bản cuộc họp thành công."  |  |  |
| Alternative Flow: | **N/A** |  |  |
| Exceptions: | N/A |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | High  |  |  |
| Business Rules: | **BR1 :** Ngay khi trạng thái chuyển sang OFFICIAL, hệ thống sẽ ẩn hoàn toàn nút "Chỉnh sửa"  |  |  |
| Other Information: | N/A |  |  |
| Assumptions: | N/A |  |  |

## 15\. IOT Device Management

#### 

1. #### **UC-IOT-01 Đăng ký thiết bị camera/IoT vào hệ thống** 

| UC ID and Name: | UC-IOT-01 Đăng ký thiết bị camera/IoT vào hệ thống  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | Business Admin, System Admin  | Secondary Actors: |  |
| Trigger: | Quản trị viên cần khai báo thông tin của một thiết bị phần cứng mới (ví dụ: máy điểm danh khuôn mặt, camera góc phòng) lên phần mềm để chuẩn bị cho việc kết nối và đưa thiết bị vào vận hành sau này  |  |  |
| Description: | Cho phép người có quyền quản trị tạo mới một hồ sơ định danh cho thiết bị thông minh (IoT) trên hệ thống. Thiết bị có thể thuộc các nhóm: Thiết bị điểm danh khuôn mặt (Door Face Attendance Terminal), Camera IP góc phòng (IP Room Camera), Microphone, Thiết bị thu tín hiệu (Capture Agent) hoặc Cảm biến (Sensor). Hệ thống sẽ ghi nhận các thông số nhận diện cốt lõi như Mã thiết bị, Tên thiết bị, Loại thiết bị, địa chỉ IP và các cấu hình ban đầu. Tính năng này chỉ thuần túy đóng vai trò khai báo sự tồn tại của thiết bị trên hệ thống, chưa bao gồm việc kiểm tra đường truyền tín hiệu hay phân bổ thiết bị đó vào một phòng họp cụ thể.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống với tài khoản được cấp vai trò Business Admin hoặc System Admin. **PRE2:** Người quản trị đã có đủ các thông số mạng và thông tin định danh cơ bản của thiết bị cần đăng ký. |  |  |
| Postconditions: | **POST1:** Hồ sơ thiết bị IoT mới được tạo và lưu trữ thành công trên hệ thống với trạng thái mặc định (ví dụ: "Chưa cấu hình" hoặc "Chưa kết nối"). **POST2:** Hệ thống lưu lại vết thao tác khởi tạo (Audit Log) để phục vụ mục đích kiểm tra và bảo mật. |  |  |
| Normal Flow: | 1\. Admin truy cập vào phân hệ "Quản lý thiết bị IoT" trên menu điều hướng và nhấp vào nút "Thêm thiết bị mới". 2\. Hệ thống hiển thị biểu mẫu đăng ký thông tin thiết bị. 3\. Admin tiến hành điền các thông tin theo yêu cầu: Mã thiết bị (Ví dụ: CAM-ROOM-A-01). Tên thiết bị. Loại thiết bị (Lựa chọn từ danh sách phân loại có sẵn do hệ thống cung cấp). Địa chỉ IP. Các thông số cấu hình mở rộng ban đầu (nếu có). 4\. Admin kiểm tra lại tính chính xác của thông tin và nhấn nút "Đăng ký". 5\. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào (Ví dụ: kiểm tra định dạng, kiểm tra bỏ trống). 6\. Hệ thống tiếp nhận dữ liệu, tạo lập hồ sơ định danh cho thiết bị trên phần mềm và gán trạng thái kết nối mặc định. 7\. Hệ thống hiển thị thông báo "Đăng ký thiết bị thành công" và đưa Admin trở lại màn hình danh sách thiết bị, trong đó thiết bị vừa tạo xuất hiện ở dòng đầu tiên. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Lỗi trùng lặp thông tin định danh:** Tại bước 5, nếu hệ thống rà soát và phát hiện Mã thiết bị vừa nhập đã được sử dụng cho một thiết bị khác trên hệ thống, thao tác lưu sẽ bị chặn lại. Hệ thống đánh dấu đỏ tại trường dữ liệu vi phạm và hiển thị thông báo: "Mã thiết bị này đã tồn tại. Vui lòng kiểm tra lại." **E2. Lỗi sai định dạng địa chỉ mạng:** Tại bước 5, nếu Admin nhập sai quy tắc tiêu chuẩn của địa chỉ IP, hệ thống sẽ cảnh báo lỗi xác thực (validation) ngay bên dưới ô nhập liệu và không cho phép thực hiện bước tiếp theo cho đến khi dữ liệu được sửa đúng. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thỉnh thoảng  |  |  |
| Business Rules: | **BR1:** Thông số "Mã thiết bị" bắt buộc phải là duy nhất trên toàn hệ thống. Quy tắc này giúp hệ thống phần mềm nhận diện chính xác nguồn phát tín hiệu khi các camera gửi sự kiện điểm danh về sau này, tránh tình trạng nhiễu loạn hoặc ghi nhận nhầm dữ liệu giữa các phòng. **BR2:** Việc đăng ký thiết bị ở phân hệ IoT này nhằm mục đích quản lý luồng dữ liệu mạng. Nó có thể hoạt động độc lập với phân hệ "Quản lý thiết bị vật tư" (Equipments \- nơi quản lý bàn, ghế, máy chiếu...). Quản trị viên có thể khai báo một camera tại đây để bắt đầu nhận luồng video mà không nhất thiết phải làm biên bản nhập kho tài sản trước đó. |  |  |
| Other Information: |  |  |  |
| Assumptions: | Tổ chức áp dụng chính sách cấp phát địa chỉ IP tĩnh cho toàn bộ các thiết bị Camera/Máy điểm danh nội bộ, đảm bảo địa chỉ IP đã khai báo vào hệ thống là cố định và không tự động thay đổi theo thời gian.  |  |  |

   #### 

2. #### **UC-IOT-02 Cấu hình thông tin kết nối Face Server** 

| UC ID and Name: | UC-IOT-02 Cấu hình thông tin kết nối Face Server  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin  | Secondary Actors: | Thiết bị máy điểm danh khuôn mặt (Door Face Attendance Terminal / Face Server)  |
| Trigger: | Quản trị viên hệ thống cần thiết lập hoặc thay đổi các thông số mạng và bảo mật để phần mềm có thể mở cổng kết nối, sẵn sàng tiếp nhận tín hiệu từ một máy điểm danh khuôn mặt mới được lắp đặt hoặc vừa thay đổi địa chỉ mạng.  |  |  |
| Description: | Cung cấp giao diện cho Quản trị viên hệ thống thiết lập các tham số giao tiếp kỹ thuật giữa phần mềm trung tâm và thiết bị máy điểm danh (Face Server) đặt tại cửa phòng họp. Các thông tin cấu hình bao gồm địa chỉ IP của thiết bị, đường dẫn nhận dữ liệu (Callback URL), giao thức truyền tải và các khóa bảo mật (Token/Secret) nếu thiết bị yêu cầu. Tính năng này đóng vai trò xây dựng "đường ống" giao tiếp an toàn. Khác với các luồng nghiệp vụ người dùng, Use Case này hoàn toàn không thực hiện việc đăng ký khuôn mặt nhân sự hay xử lý logic tính toán điểm danh. Nó chỉ là bước chuẩn bị hạ tầng kỹ thuật bắt buộc để hệ thống phần mềm có thể lắng nghe và chấp nhận các sự kiện phát sinh như: tín hiệu duy trì kết nối (heartbeat), sự kiện nhận diện thành công (verify event) hoặc sự kiện phát hiện người lạ (stranger event) do thiết bị gửi về sau này.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống với tài khoản được cấp quyền System Admin. **PRE2:** Hồ sơ định danh của thiết bị Face Server này đã được khởi tạo thành công trên hệ thống thông qua chức năng "Đăng ký thiết bị camera/IoT" trước đó. **PRE3:** Quản trị viên đã nắm giữ các thông số mạng (URL, Token, Secret) tương thích với cấu hình thực tế được cài đặt trên phần cứng của thiết bị máy điểm danh. |  |  |
| Postconditions: | **POST1:** Cấu hình kết nối của máy Face Server được lưu lại thành công và áp dụng ngay lập tức trên hệ thống phần mềm. **POST2:** Cổng tiếp nhận (Endpoint) của phần mềm được mở và cấp quyền hợp lệ để bắt đầu lắng nghe, chấp nhận các luồng dữ liệu (callback) bắn về từ đúng địa chỉ IP và mã thiết bị vừa được cấu hình. **POST3:** Hệ thống ghi nhận lịch sử thao tác thay đổi cấu hình bảo mật vào nhật ký hệ thống (Audit Log). |  |  |
| Normal Flow: | 1\. System Admin truy cập vào phân hệ "Quản lý thiết bị IoT", tìm kiếm và chọn thiết bị Face Server cần thiết lập từ danh sách. 2\. System Admin nhấp vào hành động "Cấu hình kết nối". 3\. Hệ thống hiển thị biểu mẫu cấu hình kỹ thuật dành riêng cho loại thiết bị Face Server. 4\. System Admin tiến hành nhập các thông số bắt buộc: Đường dẫn nhận dữ liệu (Callback URL): Địa chỉ máy chủ phần mềm sẽ nhận tín hiệu. Giao thức (Protocol): HTTP hoặc HTTPS. Khóa bảo mật / Token xác thực (Nếu thiết bị yêu cầu để chống giả mạo tín hiệu). 5\. System Admin kiểm tra lại thông số và nhấn nút "Lưu cấu hình". 6\. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào (Ví dụ: kiểm tra định dạng URL, độ dài của token bảo mật). 7\. Hệ thống cập nhật hồ sơ cấu hình của thiết bị và mã hóa các trường dữ liệu nhạy cảm (như Token/Secret). 8\. Hệ thống hiển thị thông báo "Lưu cấu hình kết nối thành công" và đưa người dùng trở lại màn hình chi tiết thiết bị. |  |  |
| Alternative Flows: | **A1. Cập nhật lại cấu hình hiện tại:** Nếu thiết bị đã từng được cấu hình trước đó nhưng công ty thay đổi máy chủ mạng hoặc thay đổi mã bảo mật, System Admin thực hiện lại các bước từ 1 đến 5 để ghi đè (overwrite) cấu hình mới lên cấu hình cũ. Hệ thống sẽ áp dụng ngay thông số mới và từ chối các tín hiệu gửi đến bằng khóa bảo mật cũ.  |  |  |
| Exceptions: | **E1. Lỗi sai định dạng đường dẫn:** Tại bước 6, nếu đường dẫn Callback URL nhập vào không đúng chuẩn định dạng web hoặc thiếu giao thức hợp lệ, hệ thống sẽ chặn thao tác lưu, bôi đỏ trường nhập liệu và báo lỗi: "Đường dẫn URL không hợp lệ. Vui lòng kiểm tra lại." **E2. Cấu hình sai loại thiết bị:** Nếu System Admin cố tình mở màn hình cấu hình Face Server cho một thiết bị đã được định nghĩa là "Camera góc phòng" (IP Room Camera) trước đó, hệ thống sẽ cảnh báo: "Loại cấu hình không tương thích với thiết bị này" và vô hiệu hóa biểu mẫu nhập liệu. |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thấp  |  |  |
| Business Rules: | **BR1 :** Các thông số như Token, Secret hoặc Mật khẩu kết nối giao tiếp giữa thiết bị và phần mềm bắt buộc phải được mã hóa khi lưu trữ và hiển thị ẩn (dạng dấu sao \*\*\*) trên giao diện người dùng để đảm bảo an ninh mạng nội bộ. **BR2 :** Phần mềm đóng vai trò bị động (lắng nghe) trong luồng giao tiếp với Face Server. Do đó, cấu hình này nhằm mục đích xác thực danh tính của thiết bị khi thiết bị chủ động gửi dữ liệu (HTTP Callback) về phần mềm, chứ phần mềm không chủ động kết nối vào thiết bị để lấy dữ liệu. |  |  |
| Other Information: | Có thể tích hợp thêm một nút "Kiểm tra kết nối" (Test Connection/Ping). Khi nhấn nút này, hệ thống sẽ thử gửi một tín hiệu nhỏ hoặc kiểm tra xem thiết bị Face Server có đang trực tuyến với các thông số vừa nhập hay không, giúp Admin phát hiện sai sót ngay lập tức trước khi lưu.  |  |  |
| Assumptions: |  |  |  |

3. #### **UC-IOT-03 Cấu hình RTSP cho IP Camera góc phòng** 

| UC ID and Name: | UC-IOT-03 Cấu hình RTSP cho IP Camera góc phòng  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System Admin  | Secondary Actors: | Thiết bị Camera IP góc phòng (IP Room Camera)  |
| Trigger: | Quản trị viên cần khai báo các thông số truyền phát luồng video (stream) của một camera IP góc phòng mới lắp đặt vào hệ thống, nhằm chuẩn bị sẵn sàng nền tảng để phục vụ tác vụ đếm người, nhận diện ra/vào phòng hoặc ghi hình cuộc họp sau này.  |  |  |
| Description: | Cung cấp giao diện để Quản trị viên hệ thống thiết lập các tham số giao thức truyền phát thời gian thực (Real-Time Streaming Protocol \- RTSP) cho các camera IP được bố trí tại các góc phòng họp. Các thông số cấu hình bao gồm: đường dẫn luồng hình ảnh (RTSP URL), kênh truyền (Channel), loại luồng (Subtype \- ví dụ: luồng chính HD, luồng phụ SD), định dạng nén hình ảnh (Codec Metadata) và các cấu hình liên đới để điều phối cho dịch vụ trí tuệ nhân tạo (như Python Camera Service) hoặc dịch vụ ghi hình (Recording Worker). Tính năng này chỉ làm nhiệm vụ lưu trữ và cập nhật cấu hình tham số trên hệ thống quản lý. Nó hoàn toàn không thực hiện việc kết nối, trực tiếp đọc luồng video nặng nề ngay tại phần mềm quản lý, và cũng không ra lệnh bắt đầu ghi hình.  |  |  |
| Preconditions: | **PRE1:** Người dùng đã đăng nhập thành công vào hệ thống với tài khoản được cấp quyền System Admin. **PRE2:** Hồ sơ định danh của thiết bị Camera IP này đã được khởi tạo trên hệ thống thông qua chức năng "Đăng ký thiết bị camera/IoT" trước đó. **PRE3:** Quản trị viên đã nắm giữ chính xác đường dẫn RTSP và các thông tin xác thực (nếu có) được cung cấp từ phần mềm quản lý gốc của thiết bị camera. |  |  |
| Postconditions: | **POST1:** Cấu hình luồng hình ảnh (RTSP) của camera góc phòng được cập nhật và lưu trữ thành công trên hệ thống. **POST2:** Hồ sơ cấu hình này chuyển sang trạng thái sẵn sàng để cấp phát (dispatch) tham số cho các dịch vụ xử lý video AI hoặc dịch vụ ghi hình khi cuộc họp bắt đầu. **POST3:** Hệ thống ghi nhận lịch sử thao tác thay đổi cấu hình thiết bị vào nhật ký hệ thống (Audit Log) để truy vết |  |  |
| Normal Flow: | 1\. System Admin truy cập vào phân hệ "Quản lý thiết bị IoT", tìm đến danh sách thiết bị và chọn một thiết bị thuộc loại "IP Room Camera". 2\. System Admin chọn chức năng "Cấu hình luồng Stream (RTSP)". 3\. Hệ thống hiển thị biểu mẫu thiết lập thông số kỹ thuật chuyên biệt dành cho luồng video. 4\. System Admin tiến hành nhập các thông số bắt buộc: Đường dẫn luồng hình ảnh (RTSP URL). Kênh kết nối (Channel). Loại luồng (Subtype \- Main Stream hoặc Sub Stream). Định dạng nén (Codec \- ví dụ: H.264, H.265). Thông tin tài khoản/mật khẩu tích hợp của camera (để phục vụ xác thực khi máy chủ AI kéo luồng). 5\. System Admin rà soát lại thông tin và nhấn "Lưu cấu hình". 6\. Hệ thống tiến hành kiểm tra tính hợp lệ cơ bản của dữ liệu đầu vào (Ví dụ: kiểm tra xem URL có bắt đầu bằng tiền tố rtsp:// hay không). 7\. Hệ thống cập nhật các thông số luồng stream vào hồ sơ của thiết bị, tiến hành mã hóa các dữ liệu xác thực nhạy cảm. 8\. Hệ thống hiển thị thông báo "Lưu cấu hình luồng camera thành công" và đưa người dùng về lại màn hình thông tin thiết bị. |  |  |
| Alternative Flows: | **A1. Cập nhật đường dẫn khi mạng thay đổi:** Nếu địa chỉ IP tĩnh của camera vật lý bị thay đổi do quy hoạch lại mạng nội bộ, System Admin lặp lại từ bước 1 đến bước 5 để ghi đè đường dẫn RTSP URL mới. Các dịch vụ đang chuẩn bị sử dụng luồng này sẽ tự động cập nhật để lấy theo đường dẫn mới nhất.  |  |  |
| Exceptions: | **E1. Sai định dạng giao thức:** Tại bước 6, nếu đường dẫn RTSP URL bị nhập sai (ví dụ: nhập http:// thay vì rtsp://), hệ thống sẽ từ chối lưu, đánh dấu đỏ tại ô nhập liệu và hiển thị cảnh báo: "Đường dẫn không hợp lệ. Chuẩn kết nối phải sử dụng giao thức RTSP." |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thấp  |  |  |
| Business Rules: | **BR1 :** Hệ thống quản trị trung tâm (Backend core) nghiêm cấm việc trực tiếp giải mã và phân tích luồng RTSP để tránh tình trạng quá tải (bottleneck) tài nguyên máy chủ. Hệ thống chỉ đóng vai trò "người nắm giữ địa chỉ" (Broker) để cung cấp đường dẫn RTSP này cho các máy chủ xử lý tác vụ nặng (Worker/AI Service) xử lý độc lập khi cần thiết. **BR2 :** Nếu RTSP URL có chứa thông tin tài khoản và mật khẩu trực tiếp (theo định dạng rtsp://user:pass@ip), hệ thống khi hiển thị ra màn hình giao diện cho các admin khác xem lại phải tự động làm mờ (mask) phần thông tin xác thực này để đảm bảo bảo mật nội bộ. |  |  |
| Other Information: | Nên thiết kế một tiện ích nhỏ "Ping RTSP" ngay cạnh ô nhập URL. Khi System Admin cấu hình xong, có thể nhấn để hệ thống gửi một yêu cầu xác thực nhanh (handshake) xuống camera, qua đó biết ngay đường dẫn đó có "sống" hay không trước khi bấm lưu chính thức.  |  |  |
| Assumptions: |  |  |  |

4. #### **UC-IOT-04 Nhận heartbeat từ Face Server** 

| UC ID and Name: | UC-IOT-04 Nhận heartbeat từ Face Server  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Thiết bị máy điểm danh khuôn mặt (Door Face Attendance Terminal / Face Server) |
| Trigger: | Thiết bị Face Server định kỳ tự động phát một tín hiệu "nhịp tim" (heartbeat) gửi về hệ thống trung tâm theo chu kỳ thời gian đã được thiết lập sẵn trên phần cứng (ví dụ: mỗi 30 giây hoặc 1 phút/lần).  |  |  |
| Description: | Tiến trình chạy ngầm (background process) của hệ thống phần mềm nhằm giám sát tình trạng "sức khỏe" và khả năng kết nối mạng của mạng lưới thiết bị điểm danh. Khi hệ thống nhận được tín hiệu heartbeat từ thiết bị gửi về, nó sẽ tiến hành xác thực, ghi nhận lại sự kiện thô (raw event) và cập nhật thời điểm trực tuyến gần nhất của thiết bị đó. Tiến trình này giúp hệ thống xác định được thiết bị nào đang hoạt động tốt (Online) và thiết bị nào đang gặp sự cố rớt mạng. Luồng xử lý này chỉ phục vụ duy nhất mục đích giám sát hạ tầng IoT, hoàn toàn không can thiệp hay khởi tạo bất kỳ bản ghi điểm danh sự kiện nào của nhân viên.  |  |  |
| Preconditions: | **PRE1:** Thiết bị Face Server đã được định danh và cấu hình đường dẫn kết nối nhận dữ liệu thành công trên phần mềm. **PRE2:** Thiết bị phần cứng đã được cấp nguồn, kết nối vào mạng nội bộ và dịch vụ gửi heartbeat của thiết bị đang trong trạng thái kích hoạt. |  |  |
| Postconditions: | **POST1:** Trạng thái hiển thị (tình trạng sức khỏe, trạng thái kết nối) và thời điểm "nhìn thấy gần nhất" của thiết bị được hệ thống cập nhật tức thời trên bảng điều khiển quản lý thiết bị. **POST2:** Nguyên bản gói tin tín hiệu (raw payload) được lưu trữ vào kho nhật ký sự kiện IoT để phục vụ đo lường tỷ lệ khả dụng (Uptime) hoặc xử lý sự cố mạng sau này. |  |  |
| Normal Flow: | 1\. Thiết bị Face Server tự động gửi một gói tin heartbeat chứa mã định danh thiết bị đến cổng tiếp nhận của hệ thống phần mềm. 2\. Hệ thống trung tâm tiếp nhận gói tin và kiểm tra xem mã định danh này có tồn tại trong danh mục thiết bị đã đăng ký hay không. 3\. Hệ thống trích xuất thời gian nhận tín hiệu và lưu trữ toàn bộ nội dung nguyên bản của gói tin sự kiện vào kho nhật ký giám sát thiết bị IoT. 4\. Hệ thống cập nhật thuộc tính "Thời gian trực tuyến gần nhất" của hồ sơ thiết bị tương ứng thành mốc thời gian hiện tại. 5\. Nếu trạng thái trước đó của thiết bị đang là "Mất kết nối" (Offline) hoặc "Chưa xác định", hệ thống sẽ tự động chuyển đổi trạng thái thành "Đang trực tuyến" (Online) và đánh giá tình trạng sức khỏe (Health status) là "Ổn định". 6\. Tiến trình xử lý kết thúc một chu kỳ một cách thầm lặng, không phát ra bất kỳ âm thanh hay thông báo làm phiền nào tới Quản trị viên. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Tín hiệu từ thiết bị "lạ":** Tại bước 2, nếu gói tin heartbeat gửi tới mang một mã định danh không tồn tại trong hệ thống (có thể do thiết bị chưa được đăng ký hoặc cấu hình sai), hệ thống sẽ lập tức từ chối xử lý, không cập nhật bất kỳ trạng thái nào và tự động loại bỏ (drop) gói tin để ngăn chặn rác dữ liệu, đồng thời có thể ghi nhận lại một cảnh báo bảo mật về sự kiện truy cập trái phép. **E2. Rớt mạng \- Mất tín hiệu heartbeat (Timeout):** Đây là hệ quả đối lập của luồng nhận. Nếu có một tiến trình quét định kỳ của hệ thống phát hiện ra rằng thiết bị đã vượt quá khoảng thời gian dung sai cho phép (ví dụ: 15 phút) mà hệ thống không nhận thêm được bất kỳ tín hiệu heartbeat nào, hệ thống sẽ tự động đổi trạng thái thiết bị thành "Mất kết nối" (Offline) để Quản trị viên nắm bắt và đi kiểm tra phần cứng. |  |  |
| Priority: | Cao  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1:** Tín hiệu heartbeat có lưu lượng lớn và diễn ra liên tục, do đó hệ thống phải xử lý chúng qua một luồng (thread) hoặc hàng đợi (queue) có mức độ ưu tiên thấp hơn so với các sự kiện điểm danh thực tế (Verify Event). Điều này đảm bảo máy chủ không bị nghẽn cổ chai khi hàng trăm thiết bị cùng lúc "đập nhịp tim".  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

5. #### **UC-IOT-05 Nhận verify event từ Face Server** 

| UC ID and Name: | UC-IOT-05 Nhận verify event từ Face Server  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System | Secondary Actors: | Thiết bị máy điểm danh khuôn mặt (Door Face Attendance Terminal / Face Server)  |
| Trigger: | Một nhân sự thao tác quét khuôn mặt tại máy điểm danh và thiết bị đối chiếu thành công. Ngay lập tức, thiết bị tự động đóng gói dữ liệu và gửi một sự kiện "Xác thực thành công" (Verify Event) về hệ thống phần mềm trung tâm.  |  |  |
| Description: | Đây là một tiến trình chạy ngầm cực kỳ quan trọng đóng vai trò "đón lõng" (listener) mọi tín hiệu điểm danh hợp lệ từ phần cứng gửi về. Gói dữ liệu sự kiện gửi lên thường bao hàm các thông tin giá trị như: Mã định danh của người quét (Person ID/Code), Tên nhân sự, Mốc thời gian nhận diện thực tế, Độ tin cậy của thuật toán (Confidence Score) và có thể kèm theo hình ảnh bằng chứng (Evidence Image). Nhiệm vụ cốt lõi của Use Case này là tiếp nhận một cách an toàn và lưu trữ tức thời gói sự kiện này ở định dạng thô nguyên bản (Raw Event). Sau đó, nó sẽ đóng vai trò như một trạm phân phối, chuyển tiếp dữ liệu thô này sang các luồng nghiệp vụ phía sau (như chuẩn hóa dữ liệu, khớp nối hồ sơ nhân sự và phân tích điểm danh phòng họp) để tiếp tục xử lý.  |  |  |
| Preconditions: | **PRE1:** Thiết bị Face Server tại khu vực phòng họp đã được đăng ký và đang ở trạng thái trực tuyến (Online), được phép giao tiếp với hệ thống trung tâm. **PRE2:** Máy chủ phần mềm đang trong trạng thái hoạt động ổn định, cổng tiếp nhận dữ liệu (Webhook/Callback endpoint) đang mở và sẵn sàng lắng nghe tín hiệu. |  |  |
| Postconditions: | **POST1:** Hệ thống lưu trữ thành công toàn bộ nội dung của gói sự kiện ở định dạng nguyên gốc (Raw Payload) vào kho nhật ký sự kiện IoT. **POST2:** Tín hiệu sự kiện được kích hoạt và đẩy vào hàng đợi (Queue) thành công để sẵn sàng chuyển giao cho các phân hệ phân tích chuyên cần xử lý tiếp. |  |  |
| Normal Flow: | 1\. Thiết bị Face Server gửi một gói dữ liệu chứa sự kiện "Xác thực thành công" đến máy chủ phần mềm. 2\. Hệ thống tiếp nhận và tiến hành đối chiếu mã thiết bị (Device ID) đính kèm trong gói tin với danh mục thiết bị đã đăng ký để đảm bảo nguồn gửi là hợp lệ. 3\. Hệ thống phân tích nhanh gói tin để đảm bảo nó không bị hỏng và chứa đầy đủ các trường thông tin tối thiểu theo chuẩn (như Mã nhân sự, Mốc thời gian). 4\. Hệ thống thực hiện lưu trữ toàn bộ nội dung gói dữ liệu ở định dạng nguyên bản (Raw Event) vào kho nhật ký sự kiện của module IoT. 5\. Ngay sau khi lưu trữ thành công, hệ thống tự động đẩy dữ liệu thô này vào hàng đợi xử lý trung tâm (Event Queue) nhằm đánh thức các tiến trình nghiệp vụ tiếp theo (Tiến trình chuẩn hóa, Tiến trình khớp nối tài khoản và Tiến trình tạo bản ghi điểm danh). 6\. Hệ thống khép lại luồng tiếp nhận sự kiện này một cách âm thầm, sẵn sàng đón nhận gói sự kiện của người tiếp theo. |  |  |
| Alternative Flows: | **A1. Xử lý dữ liệu đồng loạt (Bulk Processing):** Trong trường hợp thiết bị Face Server trước đó bị mất kết nối mạng cục bộ, nó sẽ lưu các lượt điểm danh vào bộ nhớ tạm ngoại tuyến (offline). Ngay khi có mạng trở lại, thiết bị sẽ "xả" toàn bộ dữ liệu này lên hệ thống cùng lúc (có thể là hàng chục/hàng trăm sự kiện). Tại bước 2, hệ thống sẽ tự động chuyển sang cơ chế xử lý theo lô (Batch Processing), tiếp nhận tuần tự từng gói và vẫn đảm bảo lưu trữ đúng mốc "Thời gian nhận diện thực tế" của từng người thay vì thời điểm hệ thống nhận được gói tin.  |  |  |
| Exceptions: | **E2. Gói dữ liệu bị lỗi:** Tại bước 3, nếu gói tin bị mất mát dữ liệu do đường truyền (Ví dụ: Có mốc thời gian nhưng bị rỗng phần Mã nhân sự), hệ thống sẽ không thể chuyển tiếp cho các luồng nghiệp vụ phía sau. Hệ thống chỉ lưu lại gói tin rác này vào nhóm "Sự kiện lỗi" để kỹ thuật viên rà soát, đồng thời dừng tiến trình.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Rất thường xuyên  |  |  |
| Business Rules: | **BR1 :** Mọi sự kiện nhận diện được Face Server gửi về bắt buộc phải được lưu trữ ở trạng thái nguyên thủy (Raw Data) ngay khi vừa chạm hệ thống. Hệ thống tuyệt đối không được phép chỉnh sửa, thêm bớt bất kỳ ký tự nào vào bản ghi gốc này. Điều này nhằm bảo toàn chứng cứ gốc (Single source of truth) để phục vụ đối soát, kiểm toán khi xảy ra tranh chấp khiếu nại về việc điểm danh. |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

6. #### **UC-IOT-06 Lưu trữ sự kiện nguyên bản từ thiết bị camera** 

| UC ID and Name: | UC-IOT-06 Lưu trữ sự kiện nguyên bản từ thiết bị camera  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: | Thiết bị Camera (Face Server, IP Room Camera) |
| Trigger: | Hệ thống phần mềm vừa tiếp nhận một gói dữ liệu (payload) bất kỳ gửi đến từ các thiết bị phần cứng tại phòng họp . Gói dữ liệu này có thể là tín hiệu nhịp tim, sự kiện xác thực khuôn mặt, cảnh báo người lạ, hay trạng thái có/không có người trong phòng.  |  |  |
| Description: | Đây là một chốt chặn an toàn dữ liệu (Data Safety Checkpoint) ở tầng thấp nhất của hệ thống. Trước khi bất kỳ gói dữ liệu nào được mang đi phân tích, chuẩn hóa hay chạy các logic nghiệp vụ phức tạp (như tính toán điểm danh, gửi cảnh báo), hệ thống bắt buộc phải sao lưu toàn bộ nội dung nguyên thủy của gói dữ liệu đó vào một kho lưu trữ sự kiện kỹ thuật. Việc này nhằm mục đích tạo ra một lớp "bằng chứng thép" phục vụ công tác đối soát (audit), tìm kiếm lỗi phần mềm (debug) và cơ chế tự động thử lại (retry). Đây là luồng xử lý nền tảng, đảm bảo rằng ngay cả khi các phân hệ nghiệp vụ bên trên bị sập hoặc xử lý lỗi, dữ liệu gửi về từ phần cứng cũng không bao giờ bị bốc hơi.  |  |  |
| Preconditions: | **PRE1:** Cổng giao tiếp ngoại vi (API Gateway/Webhook) của hệ thống phần mềm đang trong trạng thái mở và hoạt động ổn định. **PRE2:** Thiết bị phần cứng gửi tín hiệu lên đã được định danh và cho phép giao tiếp với hệ thống trung tâm. |  |  |
| Postconditions: | **POST1:** Toàn bộ nội dung của gói dữ liệu gửi đến được lưu trữ thành công vào kho lưu trữ sự kiện của hệ thống mà không bị thay đổi bất kỳ ký tự nào. **POST2:** Hệ thống sinh ra một mã định danh theo dõi (Trace ID) cho sự kiện thô này và đẩy nó vào hàng đợi để đánh thức các tiến trình xử lý nghiệp vụ tiếp theo (như chuẩn hóa dữ liệu, ghi nhận điểm danh). |  |  |
| Normal Flow: | 1\. Cổng tiếp nhận của hệ thống nhận được một gói dữ liệu gốc (Raw Payload) từ thiết bị phần cứng. 2\. Hệ thống tiến hành đóng gói toàn bộ nội dung nhận được, bao gồm cả siêu dữ liệu mạng (Headers) và nội dung chính (Body), dưới dạng một chuỗi văn bản tĩnh. 3\. Hệ thống đính kèm mốc thời gian thực tế (Timestamp) tại thời điểm máy chủ tiếp nhận gói tin này. 4\. Hệ thống lưu trữ bản ghi chứa chuỗi văn bản tĩnh này vào kho dữ liệu sự kiện ngoại vi một cách an toàn. 5\. Hệ thống đánh dấu trạng thái của bản ghi này là "Chưa xử lý" (Pending). 6\. Hệ thống đẩy tín hiệu thành công kèm theo Trace ID của bản ghi vào hàng đợi (Queue), chính thức chuyển giao trách nhiệm cho các module nghiệp vụ bên trên xử lý tiếp. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: |  |  |  |
| Priority: | High |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

7. #### **UC-IOT-07 Chuẩn hóa gói dữ liệu sự kiện từ thiết bị camera** 

| UC ID and Name: | UC-IOT-07 Chuẩn hóa gói dữ liệu sự kiện từ thiết bị camera  |  |  |
| ----: | :---- | ----: | :---- |
| Created By: |  | Date Created: |  |
| Primary Actor: | System  | Secondary Actors: |  |
| Trigger: | Sau khi hệ thống tiếp nhận và lưu trữ an toàn một gói sự kiện thô (Raw Event) từ thiết bị phần cứng gửi về, tín hiệu kích hoạt sẽ được đẩy vào hàng đợi để gọi tiến trình chuẩn hóa này hoạt động.  |  |  |
| Description: | Trong một hệ sinh thái tòa nhà thông minh, doanh nghiệp có thể sử dụng nhiều loại thiết bị phần cứng từ các nhà sản xuất khác nhau (ví dụ: máy điểm danh của hãng A, dịch vụ phân tích camera góc phòng của hãng B). Mỗi hãng lại gửi dữ liệu về hệ thống bằng một cấu trúc ngôn ngữ riêng biệt. Quá trình này đóng vai trò như một "bộ phiên dịch trung tâm". Nó làm nhiệm vụ bóc tách, trích xuất dữ liệu từ các gói ngôn ngữ dị biệt đó và sắp xếp, nhào nặn lại thành một "khuôn mẫu sự kiện tiêu chuẩn" dùng chung cho toàn bộ phần mềm. Khuôn mẫu chung này sẽ bao gồm các thông tin đã được gọt giũa: Thiết bị gửi, Phân loại sự kiện, Thời gian phát sinh, Phòng họp tương ứng, Mức độ tin cậy của thuật toán, và Trạng thái xử lý. Tiến trình này chỉ làm nhiệm vụ dọn dẹp và đồng nhất cấu trúc thông tin, tuyệt đối không tự đưa ra các quyết định nghiệp vụ (như phán xét nhân viên đó đi muộn hay không).  |  |  |
| Preconditions: | **PRE1:** Gói dữ liệu sự kiện nguyên thủy (Raw Event) đã được lưu trữ thành công và an toàn trên hệ thống. **PRE2:** Hệ thống đã được định nghĩa sẵn các "Bộ quy tắc biên dịch" (Mapping Rules) để biết cách đọc hiểu cấu trúc dữ liệu của từng chủng loại thiết bị đang được hỗ trợ. |  |  |
| Postconditions: | **POST1:** Một gói dữ liệu sự kiện mới, tuân thủ 100% cấu trúc tiêu chuẩn nội bộ, được khởi tạo thành công và sẵn sàng để sử dụng. **POST2:** Hồ sơ sự kiện thô ban đầu được cập nhật trạng thái từ "Chưa xử lý" sang "Đã chuẩn hóa", có kèm theo liên kết đối chiếu (reference) đến bản ghi chuẩn hóa vừa tạo. |  |  |
| Normal Flow: | 1\. Hệ thống tiếp nhận lệnh kích hoạt xử lý cùng với mã định danh của một gói sự kiện thô vừa được lưu. 2\. Hệ thống phân tích gói sự kiện thô để nhận diện chủng loại thiết bị gốc phát ra tín hiệu này. 3\. Dựa trên chủng loại thiết bị, hệ thống tự động gọi ra bộ quy tắc phiên dịch cấu trúc thông tin tương ứng. 4\. Hệ thống tiến hành trích xuất các thông tin phân tán từ bản gốc và điền vào khuôn mẫu tiêu chuẩn nội bộ: Định danh thiết bị. Loại sự kiện (Ví dụ: Nhịp tim, Xác thực thành công, Báo động người lạ). Thời điểm phát sinh sự kiện thực tế. Điểm số tin cậy của thuật toán nhận diện (nếu có). Đường dẫn liên kết về dữ liệu thô gốc (để phục vụ đối soát). 5\. Hệ thống truy xuất danh mục thiết bị để bổ sung thông tin bối cảnh (Ví dụ: Thiết bị này đang được lắp đặt ở Phòng họp nào). 6\. Hệ thống lưu trữ gói sự kiện đã được gọt giũa này với trạng thái "Chờ phân tích nghiệp vụ". 7\. Hệ thống chuyển giao sự kiện đã chuẩn hóa sang cho phân hệ "Attendance & Presence Management" để thực hiện các bước tính toán điểm danh tiếp theo. |  |  |
| Alternative Flows: |  |  |  |
| Exceptions: | **E1. Không tìm thấy bộ quy tắc phiên dịch:** Tại bước 3, nếu hệ thống tiếp nhận một gói dữ liệu từ một thiết bị có định dạng hoàn toàn mới lạ (chưa được hệ thống hỗ trợ), hệ thống sẽ không thể đọc hiểu. Sự kiện thô sẽ bị dán nhãn "Không thể chuẩn hóa" và tiến trình bị hủy bỏ an toàn.  |  |  |
| Priority: | High  |  |  |
| Frequency of Use: | Thường xuyên |  |  |
| Business Rules: |  |  |  |
| Other Information: |  |  |  |
| Assumptions: |  |  |  |

