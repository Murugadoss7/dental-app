import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const Treatment = lazy(() => import('./pages/Treatment'));

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Suspense fallback={<div>Loading...</div>}><Dashboard /></Suspense>,
    },
    {
        path: '/patients',
        element: <Suspense fallback={<div>Loading...</div>}><Patients /></Suspense>,
    },
    {
        path: '/patients/:patientId/treatment',
        element: <Suspense fallback={<div>Loading...</div>}><Treatment /></Suspense>,
    }
]);