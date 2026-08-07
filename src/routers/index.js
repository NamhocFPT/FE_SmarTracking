import Login from '../pages/auth/login/login';
import ForgotPassword from '../pages/auth/forgotpassword/forgotpassword';
import VerifyOTP from '../pages/auth/forgotpassword/vertifyOTP';
import { ChangePass } from '../pages/auth/forgotpassword/changePass';
import Error403 from '../pages/Error/403';
import Error404 from '../pages/Error/404';
import Error500 from '../pages/Error/500';
import ProtectedRoute from './ProtectedRoute';
import RoomUsageAnalytics from '../pages/shared/RoomUsageAnalytics';
import EmployeeOnTimeAnalytics from '../pages/shared/EmployeeOnTimeAnalytics';

// SystemAdmin Layout + Pages
import SystemAdminLayout from '../pages/systemAdmin/layout/SystemAdminLayout';
import DashBoard from '../pages/systemAdmin/dashBoard';
import DeviceManagement from '../pages/systemAdmin/DeviceManagement';
import EquipmentManagement from '../pages/systemAdmin/EquipmentManagement';
import ZoneManagement from '../pages/systemAdmin/ZoneManagement';
import RolePermissionManagement from '../pages/systemAdmin/RolePermissionManagement';
import AuditLogs from '../pages/systemAdmin/AuditLogs';
import SystemSettings from '../pages/systemAdmin/SystemSettings';
import Profile from '../pages/shared/Profile';
import Notifications from '../pages/systemAdmin/Notifications';
import ANPRManagement from '../pages/bussinessAdmin/ANPRManagement'; // SystemAdmin can also use this
import GateAccessManagement from '../pages/systemAdmin/GateAccessManagement';
import MyVehicles from '../pages/shared/MyVehicles';
import SecurityAlerts from '../pages/systemAdmin/SecurityAlerts';
import AlertRules from '../pages/systemAdmin/AlertRules';
import PersonControlList from '../pages/systemAdmin/PersonControlList';
import VehicleControlList from '../pages/systemAdmin/VehicleControlList';
import VehicleRegistrations from '../pages/systemAdmin/VehicleRegistrations';
import RoomOperations from '../pages/systemAdmin/RoomOperations';
import RoomAccessLogs from '../pages/systemAdmin/RoomAccessLogs';
import UserJourney from '../pages/shared/UserJourney';
// BusinessAdmin Layout + Pages
import BusinessAdminLayout from '../pages/bussinessAdmin/layout/BusinessAdminLayout';
import BusinessDashboard from '../pages/bussinessAdmin/dashBoard';
import BusinessUserManagement from '../pages/bussinessAdmin/UserManagement';
import BusinessDepartmentManagement from '../pages/bussinessAdmin/DepartmentManagement';
import BusinessMeetingManagement from '../pages/bussinessAdmin/MeetingManagement';
import BusinessRoomManagement from '../pages/bussinessAdmin/RoomManagement';
import BusinessRecordingManagement from '../pages/bussinessAdmin/RecordingManagement';

// Manager Layout + Pages
import ManagerLayout from '../pages/manager/layout/ManagerLayout';
import ManagerHomePage from '../pages/manager/homePage';
import ManagerFaceRegistration from '../pages/manager/FaceRegistration';
import ManagerMeetingDetail from '../pages/manager/MeetingDetail';
import ManagerMeetingApprovals from '../pages/manager/MeetingApprovals';
import BiometricSubmissionsReview from '../pages/bussinessAdmin/BiometricSubmissionsReview';

// Employee Layout + Pages
import EmployeeLayout from '../pages/employee/layout/EmployeeLayout';
import EmployeeHomePage from '../pages/employee/homePage';
import BookMeeting from '../pages/employee/BookMeeting';
import PersonalCalendar from '../pages/employee/PersonalCalendar';
import EmployeeFaceRegistration from '../pages/employee/FaceRegistration';
import EmployeeMeetingDetail from '../pages/employee/MeetingDetail';
import EmployeeRecordings from '../pages/employee/Recordings';
import InMeetingRoom from '../pages/shared/InMeetingRoom';
import LegalAndSupport from '../pages/public/LegalAndSupport';
import GuestJoin from '../pages/guest/GuestJoin';
import GuestMeeting from '../pages/guest/GuestMeeting';

export const router = [
    // ========== Auth Routes (public) ==========
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/verify-otp',
        element: <VerifyOTP />
    },
    {
        path: '/change-password',
        element: <ChangePass />
    },
    {
        path: '/guest/join/:token',
        element: <GuestJoin />
    },
    {
        path: '/guest/meeting/:meetingId',
        element: <GuestMeeting />
    },
    // ========== SystemAdmin Routes (protected) ==========
    {
        path: '/system-admin',
        element: (
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'ADMIN']}>
                <SystemAdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashBoard />
            },
            {
                path: 'devices',
                element: <DeviceManagement />
            },
            {
                path: 'equipments',
                element: <EquipmentManagement />
            },
            {
                path: 'zones',
                element: <ZoneManagement />
            },
            {
                path: 'roles-permissions',
                element: <RolePermissionManagement />
            },
            {
                path: 'audit-logs',
                element: <AuditLogs />
            },
            {
                path: 'settings',
                element: <SystemSettings />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
            {
                path: 'security-alerts',
                element: <SecurityAlerts />
            },
            {
                path: 'alert-rules',
                element: <AlertRules />
            },
            {
                path: 'person-control-list',
                element: <PersonControlList />
            },
            {
                path: 'my-vehicles',
                element: <MyVehicles />
            },
            {
                path: 'rooms',
                element: <BusinessRoomManagement />
            },
            {
                path: 'anpr-management',
                element: <ANPRManagement />
            },
            {
                path: 'vehicle-control-list',
                element: <VehicleControlList />
            },
            {
                path: 'vehicle-registrations',
                element: <VehicleRegistrations />
            },
            {
                path: 'room-operations',
                element: <RoomOperations />
            },
            {
                path: 'room-access-logs',
                element: <RoomAccessLogs />
            },
            {
                path: 'gate-access',
                element: <GateAccessManagement />
            },
            {
                path: 'user-journey',
                element: <UserJourney />
            },

            {
                path: 'meeting/:id',
                element: <EmployeeMeetingDetail />
            },
            {
                path: 'in-meeting/:id',
                element: <InMeetingRoom />
            },
            {
                path: 'room-analytics',
                element: <RoomUsageAnalytics />
            },
            {
                path: 'attendance-analytics',
                element: <EmployeeOnTimeAnalytics />
            },
            {
                path: 'legal',
                element: <LegalAndSupport />
            }
        ]
    },

    // ========== BusinessAdmin Routes (protected) ==========
    {
        path: '/business-admin',
        element: (
            <ProtectedRoute allowedRoles={['BUSINESS_ADMIN']}>
                <BusinessAdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <BusinessDashboard />
            },
            {
                path: 'users',
                element: <BusinessUserManagement />
            },
            {
                path: 'departments',
                element: <BusinessDepartmentManagement />
            },
            {
                path: 'meetings',
                element: <BusinessMeetingManagement />
            },
            {
                path: 'rooms',
                element: <BusinessRoomManagement />
            },
            {
                path: 'recordings',
                element: <BusinessRecordingManagement />
            },
            {
                path: 'biometric-submissions',
                element: <BiometricSubmissionsReview />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
            {
                path: 'security-alerts',
                element: <SecurityAlerts />
            },
            {
                path: 'my-vehicles',
                element: <MyVehicles />
            },
            {
                path: 'anpr-management',
                element: <ANPRManagement />
            },
            {
                path: 'zones',
                element: <ZoneManagement />
            },
            {
                path: 'gate-access',
                element: <GateAccessManagement />
            },
            {
                path: 'user-journey',
                element: <UserJourney />
            },
            {
                path: 'person-control-list',
                element: <PersonControlList />
            },
            {
                path: 'vehicle-control-list',
                element: <VehicleControlList />
            },

            {
                path: 'meeting/:id',
                element: <EmployeeMeetingDetail />
            },
            {
                path: 'in-meeting/:id',
                element: <InMeetingRoom />
            },
            {
                path: 'room-analytics',
                element: <RoomUsageAnalytics />
            },
            {
                path: 'attendance-analytics',
                element: <EmployeeOnTimeAnalytics />
            },
            {
                path: 'legal',
                element: <LegalAndSupport />
            }
        ]
    },

    // ========== Manager Routes (protected) ==========
    {
        path: '/manager',
        element: (
            <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <ManagerHomePage />
            },
            {
                path: 'book',
                element: <BookMeeting />
            },
            {
                path: 'schedule',
                element: (
                    <ProtectedRoute requiredPermission="schedule.read.self">
                        <PersonalCalendar />
                    </ProtectedRoute>
                )
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'face-register',
                element: <ManagerFaceRegistration />
            },
            {
                path: 'meeting-approvals',
                element: <ManagerMeetingApprovals />
            },
            {
                path: 'meeting/:id',
                element: <ManagerMeetingDetail />
            },
            {
                path: 'in-meeting/:id',
                element: <InMeetingRoom />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
            {
                path: 'my-vehicles',
                element: <MyVehicles />
            },
            {
                path: 'user-journey',
                element: <UserJourney />
            },
            {
                path: 'room-analytics',
                element: <RoomUsageAnalytics />
            },
            {
                path: 'attendance-analytics',
                element: <EmployeeOnTimeAnalytics />
            },
            {
                path: 'legal',
                element: <LegalAndSupport />
            }
        ]
    },

    // ========== Employee Routes (protected) ==========
    {
        path: '/employee',
        element: (
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <EmployeeHomePage />
            },
            {
                path: 'book',
                element: <BookMeeting />
            },
            {
                path: 'schedule',
                element: (
                    <ProtectedRoute requiredPermission="schedule.read.self">
                        <PersonalCalendar />
                    </ProtectedRoute>
                )
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'face-register',
                element: <EmployeeFaceRegistration />
            },
            {
                path: 'meeting/:id',
                element: <EmployeeMeetingDetail />
            },
            {
                path: 'in-meeting/:id',
                element: <InMeetingRoom />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
            {
                path: 'recordings',
                element: <EmployeeRecordings />
            },
            {
                path: 'my-vehicles',
                element: <MyVehicles />
            },
            {
                path: 'legal',
                element: <LegalAndSupport />
            }
        ]
    },

    // ========== Error Routes ==========
    {
        path: '/403',
        element: <Error403 />
    },
    {
        path: '/404',
        element: <Error404 />
    },
    {
        path: '/500',
        element: <Error500 />
    },
    {
        path: '*',
        element: <Error404 />
    }
];
