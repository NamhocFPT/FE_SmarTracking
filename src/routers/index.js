import Login from '../pages/auth/login/login';
import ForgotPassword from '../pages/auth/forgotpassword/forgotpassword';
import VerifyOTP from '../pages/auth/forgotpassword/vertifyOTP';
import { ChangePass } from '../pages/auth/forgotpassword/changePass';
import Error403 from '../pages/Error/403';
import Error404 from '../pages/Error/404';
import Error500 from '../pages/Error/500';
import ProtectedRoute from './ProtectedRoute';

// SystemAdmin Layout + Pages
import SystemAdminLayout from '../pages/systemAdmin/layout/SystemAdminLayout';
import DashBoard from '../pages/systemAdmin/dashBoard';
import DeviceManagement from '../pages/systemAdmin/DeviceManagement';
import AuditLogs from '../pages/systemAdmin/AuditLogs';
import SystemSettings from '../pages/systemAdmin/SystemSettings';
import Profile from '../pages/shared/Profile';
import Notifications from '../pages/systemAdmin/Notifications';
import AvatarSubmissionsReview from '../pages/systemAdmin/AvatarSubmissionsReview';

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
import ManagerInMeeting from '../pages/manager/InMeeting';
import ManagerMeetingApprovals from '../pages/manager/MeetingApprovals';

// Employee Layout + Pages
import EmployeeLayout from '../pages/employee/layout/EmployeeLayout';
import EmployeeHomePage from '../pages/employee/homePage';
import BookMeeting from '../pages/employee/BookMeeting';
import PersonalCalendar from '../pages/employee/PersonalCalendar';
import EmployeeFaceRegistration from '../pages/employee/FaceRegistration';
import EmployeeMeetingDetail from '../pages/employee/MeetingDetail';
import EmployeeInMeeting from '../pages/employee/InMeeting';
import EmployeeRecordings from '../pages/employee/Recordings';

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
                path: 'avatar-submissions',
                element: <AvatarSubmissionsReview />
            },
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
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
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
                element: <PersonalCalendar />
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
                element: <ManagerInMeeting />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
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
                element: <PersonalCalendar />
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
                element: <EmployeeInMeeting />
            },
            {
                path: 'notifications',
                element: <Notifications />
            },
            {
                path: 'recordings',
                element: <EmployeeRecordings />
            },
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
