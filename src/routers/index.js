import Login from '../pages/auth/login/login';

export const router = [
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <Login />
    }
];