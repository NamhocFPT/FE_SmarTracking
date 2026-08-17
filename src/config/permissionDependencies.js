// Ràng buộc 1 chiều: quyền THAO TÁC (create/update/delete/...) cần quyền XEM (read) cùng resource
// đi kèm, vì hầu hết màn hình thao tác đều load dữ liệu qua 1 API read bị PermissionsGuard chặn
// nếu thiếu quyền đó. Quyền xem không phụ thuộc gì cả — chỉ-xem là 1 role hợp lệ.
//
// Đây là bản đồ TẠM, chỉ gồm các cặp đã xác minh chắc chắn qua đọc trực tiếp permission catalog
// thật (không suy đoán theo quy ước tên, vì catalog đặt tên không đồng nhất giữa các module).
// Sẽ thay bằng dữ liệu chính thức khi BE công bố `dependsOn` qua GET /permissions — xem
// be_smartracking/capstone-be/docs/BE_PLAN_Permission_Dependency_Constraints.md.
//
// Key/value là permissionCode.
export const PERMISSION_DEPENDENCIES = {
    'zones.zone.create': ['zones.zone.read'],
    'zones.zone.update': ['zones.zone.read'],
    'zones.zone.delete': ['zones.zone.read'],
    'zones.zone.assign_device': ['zones.zone.read'],
    'equipment.create': ['equipment.read'],
    'equipment.delete': ['equipment.read'],
    'equipment.assign': ['equipment.read'],
    'equipment.report_fault': ['equipment.read'],
    'account.role.create': ['account.role.read'],
    'account.role.update': ['account.role.read'],
    'account.role.delete': ['account.role.read'],
    'department.update': ['department.read'],
    'alert_rules.create': ['alert_rules.read'],
    'alert_rules.update': ['alert_rules.read'],
    'alert_rules.delete': ['alert_rules.read'],
    'person_control_list.create': ['person_control_list.read'],
    'person_control_list.update': ['person_control_list.read'],
    'person_control_list.delete': ['person_control_list.read'],
    'security_alert.acknowledge': ['security_alert.read'],
    'security_alert.resolve': ['security_alert.read'],
    'vehicle_control.create': ['vehicle_control.read'],
    'vehicle_control.update': ['vehicle_control.read'],
    'vehicle_control.delete': ['vehicle_control.read'],
    'meeting_request.approve': ['meeting_request.read'],
    'meeting_request.reject': ['meeting_request.read'],
    'face.unmapped.map': ['face.unmapped.read'],
    'recording.config.update': ['recording.config.read'],
    'recording.files.manage': ['recording.files.read'],
    'recording.files.play': ['recording.files.read'],
    'room.noshow.configure': ['room.noshow.read'],
    'room.noshow.release': ['room.noshow.read'],
    'room.noshow.update': ['room.noshow.read'],
};
