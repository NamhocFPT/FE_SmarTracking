import Login from '../pages/auth/login/login';
import ForgotPassword from '../pages/auth/forgotpassword/forgotpassword';
import VerifyOTP from '../pages/auth/forgotpassword/vertifyOTP';
import { ChangePass } from '../pages/auth/forgotpassword/changePass';
import Error403 from '../pages/Error/403';
import Error404 from '../pages/Error/404';
import Error500 from '../pages/Error/500';

export const router = [
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
