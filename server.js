const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Helper to read database
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Logging & API path prefix stripping middleware
app.use((req, res, next) => {
  const originalUrl = req.url;
  if (req.url.startsWith('/api/v1')) {
    req.url = req.url.substring(7); // strip '/api/v1' prefix
  }
  console.log(`[Mock Server] ${req.method} ${originalUrl} -> ${req.url}`);
  next();
});

// Custom auth login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (user) {
    if (user.account_status !== 'active' && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: { message: 'Tài khoản đã bị khóa hoặc vô hiệu hóa.', code: 'ACCOUNT_LOCKED' }
      });
    }
    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        accessToken: `mock-access-token-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName || user.full_name,
          employeeCode: user.employeeCode || user.employee_code,
          avatarUrl: user.avatarUrl || user.avatar_url,
          roles: user.roles,
          positionTitle: user.positionTitle || user.position_title,
          departmentId: user.departmentId || user.department_id
        }
      }
    });
  }
  return res.status(400).json({
    success: false,
    error: { message: 'Email hoặc mật khẩu không chính xác.', code: 'INVALID_CREDENTIALS' }
  });
});

app.post('/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Đăng xuất thành công.' });
});

app.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const db = readDB();
  let user = db.users[0];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenParts = authHeader.split('-');
    const userId = tokenParts[3];
    const found = db.users.find(u => u.id === userId);
    if (found) user = found;
  }
  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || user.full_name,
      employeeCode: user.employeeCode || user.employee_code,
      avatarUrl: user.avatarUrl || user.avatar_url,
      roles: user.roles,
      positionTitle: user.positionTitle || user.position_title,
      departmentId: user.departmentId || user.department_id
    }
  });
});

app.post('/auth/refresh', (req, res) => {
  return res.json({
    success: true,
    data: {
      accessToken: `mock-access-token-rotated-${Date.now()}`,
      refreshToken: `mock-refresh-token-rotated-${Date.now()}`
    }
  });
});

// Self update profile
app.patch('/me/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  const db = readDB();
  let userId = db.users[0].id;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenParts = authHeader.split('-');
    userId = tokenParts[3] || userId;
  }
  const userIdx = db.users.findIndex(u => u.id === userId);
  if (userIdx !== -1) {
    const updatedUser = {
      ...db.users[userIdx],
      ...req.body,
      fullName: req.body.fullName || req.body.full_name || db.users[userIdx].fullName,
      full_name: req.body.fullName || req.body.full_name || db.users[userIdx].full_name,
      phoneNumber: req.body.phone || req.body.phoneNumber || req.body.phone_number || db.users[userIdx].phoneNumber,
      phone_number: req.body.phone || req.body.phoneNumber || req.body.phone_number || db.users[userIdx].phone_number,
      avatarUrl: req.body.avatarPreview || req.body.avatarUrl || req.body.avatar_url || db.users[userIdx].avatarUrl,
      avatar_url: req.body.avatarPreview || req.body.avatarUrl || req.body.avatar_url || db.users[userIdx].avatar_url,
    };
    db.users[userIdx] = updatedUser;
    writeDB(db);
    return res.json({ success: true, data: updatedUser });
  }
  return res.status(404).json({ success: false, error: { message: 'Không tìm thấy người dùng.' } });
});

// Register Face Profile
app.post('/users/:userId/face-profile', (req, res) => {
  const { userId } = req.params;
  const db = readDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    const newProfile = {
      id: `face-${Date.now()}`,
      userId,
      user_id: userId,
      profile_code: `FP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
      consent_at: new Date().toISOString(),
      quality_score: 98.5,
      sample_count: 5,
      enrolled_at: new Date().toISOString()
    };
    db.face_profiles = db.face_profiles || [];
    db.face_profiles.push(newProfile);
    writeDB(db);
    return res.json({ success: true, data: newProfile, message: 'Đăng ký khuôn mặt thành công.' });
  }
  return res.status(404).json({ success: false, error: { message: 'Không tìm thấy người dùng.' } });
});

// Cancel meeting custom endpoint
app.post('/meetings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const db = readDB();
  const meetingIdx = db.meetings.findIndex(m => m.id === id);
  if (meetingIdx !== -1) {
    db.meetings[meetingIdx].status = 'cancelled';
    db.meetings[meetingIdx].cancellation_reason = reason || 'Hủy bởi người dùng';
    const bookingIdx = db.room_bookings.findIndex(b => b.meeting_id === id);
    if (bookingIdx !== -1) {
      db.room_bookings[bookingIdx].status = 'cancelled';
    }
    writeDB(db);
    return res.json({ success: true, message: 'Hủy cuộc họp thành công.', data: db.meetings[meetingIdx] });
  }
  return res.status(404).json({ success: false, error: { message: 'Không tìm thấy cuộc họp.' } });
});

// Start meeting custom endpoint
app.post('/meetings/:id/start', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const meetingIdx = db.meetings.findIndex(m => m.id === id);
  if (meetingIdx !== -1) {
    db.meetings[meetingIdx].status = 'in_progress';
    db.meetings[meetingIdx].actual_start_time = new Date().toISOString();
    writeDB(db);
    return res.json({ success: true, message: 'Cuộc họp đã bắt đầu.', data: db.meetings[meetingIdx] });
  }
  return res.status(404).json({ success: false, error: { message: 'Không tìm thấy cuộc họp.' } });
});

// Check-in meeting custom endpoint
app.post('/meetings/:id/check-in', (req, res) => {
  const { id } = req.params;
  const { faceEmbedding, userId } = req.body;
  return res.json({
    success: true,
    message: 'Check-in thành công!',
    data: {
      userId,
      checkInTime: new Date().toISOString(),
      method: 'face'
    }
  });
});

// Read all notifications
app.patch('/notifications/read-all', (req, res) => {
  const db = readDB();
  db.notifications.forEach(n => {
    n.read_count = 1;
    n.delivery_status = 'read';
  });
  writeDB(db);
  return res.json({ success: true, message: 'Đánh dấu tất cả thông báo đã đọc thành công.' });
});

// Analytics Dashboard Overview Mockup
app.get('/analytics/dashboard/overview', (req, res) => {
  return res.json({
    success: true,
    data: {
      totalUsers: 154,
      totalRooms: 12,
      activeRooms: 6,
      totalMeetings: 289,
      activeDevices: 45,
      systemHealth: 'healthy',
      utilizationRate: 78.5,
      averageMeetingDuration: 48,
      onTimeRate: 92.4,
      noShowCount: 14,
      cancellationRate: 8.2
    }
  });
});

// Room analytics
app.get('/analytics/rooms/dashboard', (req, res) => {
  return res.json({
    success: true,
    data: [
      { roomId: 'room-1', roomName: 'Apollo Room', utilizationRate: 84.5, occupancyHours: 120, meetingsCount: 42, noShowCount: 2 },
      { roomId: 'room-2', roomName: 'Horizon Room', utilizationRate: 78.2, occupancyHours: 110, meetingsCount: 38, noShowCount: 3 },
      { roomId: 'room-3', roomName: 'Zenith Boardroom', utilizationRate: 72.1, occupancyHours: 95, meetingsCount: 30, noShowCount: 4 },
      { roomId: 'room-4', roomName: 'Cosmos Hall', utilizationRate: 68.4, occupancyHours: 88, meetingsCount: 28, noShowCount: 1 },
      { roomId: 'room-5', roomName: 'Orion Room', utilizationRate: 62.0, occupancyHours: 78, meetingsCount: 25, noShowCount: 2 },
      { roomId: 'room-6', roomName: 'Nebula Space', utilizationRate: 58.5, occupancyHours: 72, meetingsCount: 20, noShowCount: 2 }
    ]
  });
});

// Attendance analytics
app.get('/analytics/attendance/dashboard', (req, res) => {
  return res.json({
    success: true,
    data: {
      overallPresent: 890,
      overallAbsent: 45,
      overallLate: 65,
      overallLeftEarly: 25,
      trends: [
        { date: '2026-06-18', presentRate: 94.2, lateRate: 4.1 },
        { date: '2026-06-19', presentRate: 92.8, lateRate: 5.2 },
        { date: '2026-06-22', presentRate: 95.0, lateRate: 3.5 },
        { date: '2026-06-23', presentRate: 93.4, lateRate: 4.8 },
        { date: '2026-06-24', presentRate: 91.5, lateRate: 6.2 }
      ]
    }
  });
});

// More analytics mocks (required for FE dashboard charts)
app.get('/analytics/rooms/utilization-rate', (req, res) => {
  return res.json({
    success: true,
    data: [
      { name: 'Apollo Room', rate: 84.5 },
      { name: 'Horizon Room', rate: 78.2 },
      { name: 'Zenith Boardroom', rate: 72.1 },
      { name: 'Cosmos Hall', rate: 68.4 },
      { name: 'Orion Room', rate: 62.0 },
      { name: 'Nebula Space', rate: 58.5 }
    ]
  });
});

app.get('/analytics/rooms/no-show-rate', (req, res) => {
  return res.json({
    success: true,
    data: [
      { name: 'Apollo Room', rate: 4.7 },
      { name: 'Horizon Room', rate: 7.9 },
      { name: 'Zenith Boardroom', rate: 13.3 },
      { name: 'Cosmos Hall', rate: 3.5 },
      { name: 'Orion Room', rate: 8.0 },
      { name: 'Nebula Space', rate: 10.0 }
    ]
  });
});

app.get('/analytics/attendance/on-time-rate', (req, res) => {
  return res.json({
    success: true,
    data: {
      onTimeRate: 92.4,
      departments: [
        { name: 'IT', rate: 94.5 },
        { name: 'HR', rate: 91.2 },
        { name: 'Sales', rate: 88.9 },
        { name: 'RND', rate: 95.2 }
      ]
    }
  });
});

app.get('/analytics/meetings/count-by-period', (req, res) => {
  return res.json({
    success: true,
    data: [
      { period: 'T2', count: 48 },
      { period: 'T3', count: 52 },
      { period: 'T4', count: 58 },
      { period: 'T5', count: 45 },
      { period: 'T6', count: 49 }
    ]
  });
});

app.get('/analytics/meetings/status-breakdown', (req, res) => {
  return res.json({
    success: true,
    data: [
      { name: 'Completed', value: 180, color: '#10B981' },
      { name: 'Scheduled', value: 75, color: '#3B82F6' },
      { name: 'Cancelled', value: 24, color: '#EF4444' },
      { name: 'In Progress', value: 10, color: '#F59E0B' }
    ]
  });
});

app.get('/analytics/meetings/average-duration', (req, res) => {
  return res.json({
    success: true,
    data: [
      { name: 'Apollo Room', duration: 55 },
      { name: 'Horizon Room', duration: 48 },
      { name: 'Zenith Boardroom', duration: 60 },
      { name: 'Cosmos Hall', duration: 40 }
    ]
  });
});

app.get('/analytics/meetings/cancel-rate', (req, res) => {
  return res.json({
    success: true,
    data: [
      { name: 'Tháng 2', rate: 9.5 },
      { name: 'Tháng 3', rate: 8.8 },
      { name: 'Tháng 4', rate: 7.2 },
      { name: 'Tháng 5', rate: 8.2 }
    ]
  });
});

// Personal schedule helper endpoint
app.get('/me/schedule', (req, res) => {
  const authHeader = req.headers.authorization;
  const db = readDB();
  let userId = db.users[0].id;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenParts = authHeader.split('-');
    userId = tokenParts[3] || userId;
  }
  
  const meetings = db.meetings.filter(m => 
    m.organizer_id === userId || 
    m.host_id === userId ||
    (db.meeting_participants && db.meeting_participants.some(p => p.meeting_id === m.id && p.user_id === userId))
  );

  return res.json({
    success: true,
    data: meetings
  });
});

// Personal recordings endpoint
app.get('/me/recordings', (req, res) => {
  const db = readDB();
  return res.json({
    success: true,
    data: db.recordings || []
  });
});

// System configs rewrite to standard output
app.get('/system-configurations', (req, res) => {
  const db = readDB();
  return res.json({
    success: true,
    data: db.system_configurations || []
  });
});

// Import template endpoint
app.get('/users/import-template', (req, res) => {
  res.send('MOCK_EXCEL_TEMPLATE_BLOB');
});

// Export users Excel endpoint
app.get('/users/export', (req, res) => {
  res.send('MOCK_USERS_EXPORT_BLOB');
});

// Background jobs file output
app.post('/reports/meeting-activity/exports', (req, res) => {
  return res.json({
    success: true,
    message: 'Xuất báo cáo đang được xử lý trong nền.',
    data: {
      jobId: `job-${Date.now()}`,
      status: 'queued',
      jobType: 'export_report'
    }
  });
});

// Middleware helper to map snake_case to camelCase mapping for standard responses if needed
function wrapResponse(data) {
  return {
    success: true,
    data: data
  };
}


// Role permissions custom endpoint
app.get('/roles/:roleId/permissions', (req, res) => {
  const { roleId } = req.params;
  const db = readDB();
  const mappings = (db.role_permissions || []).filter(rp => String(rp.role_id) === String(roleId));
  const assignedPermissionIds = mappings.map(rp => rp.permission_id);
  
  // Return list of permission objects that are assigned
  const permissions = (db.permissions || []).filter(p => assignedPermissionIds.includes(p.id));
  return res.json({ success: true, data: permissions });
});

app.post('/roles/:roleId/permissions', (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  const db = readDB();
  
  // Remove old mappings
  db.role_permissions = (db.role_permissions || []).filter(rp => String(rp.role_id) !== String(roleId));
  
  // Add new mappings
  if (Array.isArray(permissionIds)) {
    permissionIds.forEach(pId => {
      db.role_permissions.push({
        id: `rp-${roleId}-${pId}-${Date.now()}`,
        role_id: roleId,
        permission_id: pId
      });
    });
  }
  writeDB(db);
  return res.json({ success: true, message: 'Cập nhật phân quyền thành công!' });
});

app.get('/meetings/:id', (req, res, next) => {
  const db = readDB();
  const meeting = db.meetings?.find(m => String(m.id) === String(req.params.id));
  if (!meeting) return next();

  const host = db.users?.find(u => u.id === meeting.host_id);
  const organizer = db.users?.find(u => u.id === meeting.organizer_id);
  const room = db.rooms?.find(r => r.id === meeting.room_id);
  const participants = (db.meeting_participants || [])
    .filter(p => p.meeting_id === meeting.id)
    .map(p => {
      const u = db.users?.find(u => u.id === p.user_id) || {};
      return { ...p, fullName: u.full_name || u.fullName, email: u.email, user: u };
    });
  
  const agendas = db.agendas?.filter(a => a.meeting_id === meeting.id) || [];

  const hydrated = {
    ...meeting,
    host,
    organizer,
    room,
    participants,
    agendas,
    recordingConfig: { enableVideo: true }
  };

  return res.json(wrapResponse(hydrated));
});

// Generic CRUD endpoints mapping for collections in db.json
const collections = [
  'users',
  'rooms',
  'meetings',
  'meeting_requests',
  'room_bookings',
  'departments',
  'roles',
  'permissions',
  'iot_devices',
  'notifications',
  'recordings',
  'system_configurations',
  'audit_logs',
  'face_profiles',
  'meeting_participants'
];

collections.forEach(col => {
  const paths = [`/${col}`, `/${col.replace(/_/g, '-')}`];
  
  paths.forEach(urlPath => {
    // GET all
    app.get(urlPath, (req, res) => {
      const db = readDB();
      let list = db[col] || [];
      
      // Basic query filters
      Object.keys(req.query).forEach(key => {
        if (!key.startsWith('_')) {
          const val = req.query[key];
          list = list.filter(item => String(item[key]) === String(val));
        }
      });
      
      return res.json(wrapResponse(list));
    });

    // GET by ID
    app.get(`${urlPath}/:id`, (req, res) => {
      const { id } = req.params;
      const db = readDB();
      const item = (db[col] || []).find(i => String(i.id) === String(id));
      if (item) {
        return res.json(wrapResponse(item));
      }
      return res.status(404).json({ success: false, error: { message: 'Không tìm thấy bản ghi.' } });
    });

    // POST new
    app.post(urlPath, (req, res) => {
      const db = readDB();
      const newId = `mock-id-${Date.now()}`;
      const newItem = { id: newId, ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      
      db[col] = db[col] || [];
      db[col].push(newItem);
      writeDB(db);
      
      return res.status(201).json(wrapResponse(newItem));
    });

    // PATCH update
    app.patch(`${urlPath}/:id`, (req, res) => {
      const { id } = req.params;
      const db = readDB();
      const list = db[col] || [];
      const idx = list.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) {
        const updatedItem = { ...list[idx], ...req.body, updated_at: new Date().toISOString() };
        list[idx] = updatedItem;
        writeDB(db);
        return res.json(wrapResponse(updatedItem));
      }
      return res.status(404).json({ success: false, error: { message: 'Không tìm thấy bản ghi.' } });
    });

    // DELETE
    app.delete(`${urlPath}/:id`, (req, res) => {
      const { id } = req.params;
      const db = readDB();
      const list = db[col] || [];
      const idx = list.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) {
        const deletedItem = list.splice(idx, 1)[0];
        writeDB(db);
        return res.json(wrapResponse(deletedItem));
      }
      return res.status(404).json({ success: false, error: { message: 'Không tìm thấy bản ghi.' } });
    });
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Endpoint không hợp lệ hoặc chưa được mock.' } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Mock Server] Custom mock server is running on port ${PORT}`);
});
