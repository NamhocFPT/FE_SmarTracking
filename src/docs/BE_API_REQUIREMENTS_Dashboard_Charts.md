# BE API Requirements — SysAdmin Dashboard (Chart Data)

**Author**: FE Team  
**Date**: 2026-08-09  
**Priority**: Medium — Dashboard enhancement (không block core flow)

---

## Bối cảnh

Dashboard SysAdmin cần 2 endpoint aggregate mà hiện tại BE chưa có.  
Các API khác đủ rồi (xem chi tiết cuối file).

---

## API 1 — Security Alerts Daily Trend

### Endpoint
```
GET /analytics/security-alerts/daily-trend
```

### Auth
- Roles: `SYSTEM_ADMIN`, `BUSINESS_ADMIN`

### Query Parameters

| Param | Type    | Required | Default | Mô tả                        |
|-------|---------|----------|---------|------------------------------|
| days  | integer | No       | 7       | Số ngày lấy dữ liệu (1–30)  |

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "series": [
      {
        "date": "2026-08-03",
        "total": 3,
        "byType": {
          "intrusion": 1,
          "stranger": 2,
          "crowd": 0
        }
      },
      {
        "date": "2026-08-04",
        "total": 0,
        "byType": {}
      },
      {
        "date": "2026-08-05",
        "total": 1,
        "byType": { "vehicle_control_match": 1 }
      }
    ],
    "totalInPeriod": 7
  }
}
```

### Notes
- Mảng `series` luôn trả đủ `days` phần tử (điền `total: 0` cho ngày không có alert).
- `date` format `YYYY-MM-DD` theo UTC+7.
- FE dùng trường này để vẽ **LineChart/AreaChart** xu hướng 7 ngày gần nhất trên Dashboard.

---

## API 2 — Audit Log Hourly Activity

### Endpoint
```
GET /analytics/audit-activity/hourly
```

### Auth
- Roles: `SYSTEM_ADMIN`

### Query Parameters

| Param | Type   | Required | Default | Mô tả                                     |
|-------|--------|----------|---------|-------------------------------------------|
| date  | string | No       | today   | Ngày thống kê, ISO date `YYYY-MM-DD`      |

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "date": "2026-08-09",
    "buckets": [
      { "hour": "00:00", "count": 2 },
      { "hour": "01:00", "count": 0 },
      { "hour": "02:00", "count": 0 },
      { "hour": "03:00", "count": 1 },
      { "hour": "04:00", "count": 0 },
      { "hour": "05:00", "count": 0 },
      { "hour": "06:00", "count": 3 },
      { "hour": "07:00", "count": 14 },
      { "hour": "08:00", "count": 32 },
      { "hour": "09:00", "count": 45 },
      { "hour": "10:00", "count": 38 },
      { "hour": "11:00", "count": 29 },
      { "hour": "12:00", "count": 11 },
      { "hour": "13:00", "count": 27 },
      { "hour": "14:00", "count": 41 },
      { "hour": "15:00", "count": 36 },
      { "hour": "16:00", "count": 22 },
      { "hour": "17:00", "count": 18 },
      { "hour": "18:00", "count": 8 },
      { "hour": "19:00", "count": 4 },
      { "hour": "20:00", "count": 2 },
      { "hour": "21:00", "count": 1 },
      { "hour": "22:00", "count": 0 },
      { "hour": "23:00", "count": 1 }
    ],
    "totalToday": 335
  }
}
```

### Notes
- Mảng `buckets` luôn có đủ 24 phần tử (giờ 00–23), điền `count: 0` nếu không có log.
- `count` = tổng số bản ghi trong `audit_log` của giờ đó (không phân loại action).
- FE dùng trường này để vẽ **BarChart** tần suất hoạt động hệ thống theo giờ.

---

## API đã có — không cần thêm

Các API sau đã có và FE đang dùng tốt cho dashboard:

| Endpoint | Service function | Dùng cho |
|----------|-----------------|----------|
| `GET /campus-dashboard/business-admin-summary` | `getBusinessAdminSummary()` | KPI tiles + severity pie chart |
| `GET /iot-devices` | `getDevices()` | Device type bar chart + device status pie chart |
| `GET /security-alerts?status=new&limit=5` | `getSecurityAlerts()` | Recent alerts feed + alert count KPI |
| `GET /gate-access/admin/vehicle-traffic-stats?group_by=hour` | `getAdminVehicleTrafficStats()` | Vehicle traffic area chart (24h) |
| `GET /analytics/rooms/dashboard` | `getRoomAnalytics()` | Room utilization horizontal bar chart |
| `GET /analytics/attendance/on-time-rate` | `getAttendanceAnalytics()` | Attendance breakdown pie chart |
