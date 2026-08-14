# Tài liệu đặc tả: Yêu cầu Backend cung cấp API lọc phòng trống (check trùng lịch)

Tài liệu này mô tả chi tiết yêu cầu kỹ thuật từ phía Frontend (FE) gửi tới Backend (BE) để hoàn thiện và cung cấp endpoint lọc phòng họp trống không bị trùng thời gian (`startTime`/`endTime`) và đủ sức chứa.

---

## 1. Bối cảnh & Lý do
Hiện tại, khi người đặt phòng thực hiện tìm phòng họp ở Bước 1 trên giao diện FE:
* Hệ thống chỉ đang gọi API `GET /rooms/search?minCapacity=X`. API này trả về tất cả các phòng thỏa mãn sức chứa tối thiểu, **không loại trừ các phòng đã được đặt** trong khung giờ mong muốn.
* Điều này dẫn đến việc người dùng chọn phải phòng bận mà không hề biết, và chỉ khi bấm nút "Xác nhận đặt" (gọi `POST /meetings`) thì BE mới báo lỗi conflict trùng lịch. Lúc này FE mới hiển thị cảnh báo trùng.
* **Mong muốn của FE**: BE cần hỗ trợ endpoint `/rooms/available` nhận diện tham số thời gian để **loại trừ các phòng đã bận ngay từ bước tìm kiếm ban đầu**, giúp trải nghiệm người dùng mượt mà và trực quan hơn.

---

## 2. Đặc tả API yêu cầu

### **`GET /rooms/available`**

* **Mục đích**: Lấy danh sách các phòng họp đang trống (không bị trùng lịch đặt nào) trong một khoảng thời gian cụ thể và thỏa mãn sức chứa tối thiểu.
* **Authentication**: Yêu cầu JWT Token (mọi user đã đăng nhập đều có quyền gọi).

#### **Query Parameters (Request):**

| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- | :--- |
| `startTime` | `string` (ISO-8601) | **Bắt buộc** | Thời gian bắt đầu khung giờ cần đặt phòng | `2026-08-15T09:00:00.000Z` |
| `endTime` | `string` (ISO-8601) | **Bắt buộc** | Thời gian kết thúc khung giờ cần đặt phòng | `2026-08-15T10:30:00.000Z` |
| `minCapacity` | `number` | *Không* | Sức chứa tối thiểu của phòng họp cần tìm | `10` |

#### **Logic xử lý đề xuất phía Backend (SQL / ORM logic):**
1. Lấy danh sách toàn bộ các phòng hoạt động bình thường (`status = 'active'`).
2. Lọc theo sức chứa: `capacity >= minCapacity` (nếu có truyền `minCapacity`).
3. **Loại trừ các phòng đang có lịch đặt trùng lắp**:
   Loại trừ bất kỳ phòng nào có lịch đặt trong bảng `meetings` hoặc `bookings` thỏa mãn đồng thời cả hai điều kiện:
   * Trạng thái đặt lịch không phải là `cancelled` (đã hủy) hoặc `released` (đã trả phòng).
   * Khung thời gian của cuộc họp hiện tại trùng lắp (overlap) với khung giờ yêu cầu:
     ```sql
     (meeting.start_time < :endTime) AND (meeting.end_time > :startTime)
     ```

#### **Dữ liệu trả về mong muốn (Response - 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "room-uuid-1",
      "roomName": "Phong hop A101",
      "roomCode": "A101",
      "capacity": 8,
      "status": "active",
      "siteName": "Toa nha A",
      "areaName": "Tang 1",
      "hasCamera": true,
      "hasMicrophone": true,
      "hasScreen": true
    },
    {
      "id": "room-uuid-2",
      "roomName": "Phong hop B301",
      "roomCode": "B301",
      "capacity": 12,
      "status": "active",
      "siteName": "Toa nha B",
      "areaName": "Tang 3",
      "hasCamera": true,
      "hasMicrophone": false,
      "hasScreen": true
    }
  ]
}
```

---

## 3. Phối hợp tích hợp với FE
Phía Frontend hiện tại đã được code sẵn sàng để gửi request lên `/rooms/available` kèm đầy đủ tham số thời gian (`startTime`/`endTime`) như mô tả ở trên. Ngay khi Backend deploy endpoint này hoạt động tốt, tính năng check trùng lịch thời gian thực ở bước tìm phòng sẽ lập tức tự động vận hành mà không cần chỉnh sửa code FE thêm nữa.
