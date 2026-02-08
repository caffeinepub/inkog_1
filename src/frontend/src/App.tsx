import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import EntryPage from './pages/EntryPage';
import StudentReportPage from './pages/StudentReportPage';
import StaffGatePage from './pages/StaffGatePage';
import AdminGatePage from './pages/AdminGatePage';
import AppShell from './components/layout/AppShell';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EntryPage,
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentReportPage,
});

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff',
  component: StaffGatePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminGatePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  studentRoute,
  staffRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <RouterProvider router={router} />;
}
