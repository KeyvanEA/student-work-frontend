import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import TasksPage from '@/pages/TasksPage'
import TaskDetailPage from '@/pages/TaskDetailPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import TaskApplicationsPage from '@/pages/TaskApplicationsPage'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import DeliveryDetailPage from '@/pages/DeliveryDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import ProfileEditPage from '@/pages/ProfileEditPage'
import MyWorkPage from '@/pages/MyWorkPage'
import NotFoundPage from '@/pages/NotFoundPage'

import MessagesPage from '@/pages/static/MessagesPage'
import NotificationsPage from '@/pages/static/NotificationsPage'
import SettingsPage from '@/pages/static/SettingsPage'
import PublicProfilePage from '@/pages/static/PublicProfilePage'
import SearchPage from '@/pages/static/SearchPage'
import ComplaintPage from '@/pages/static/ComplaintPage'

/** ریشهٔ همه مسیرها — بازگرداندن موقعیت اسکرول در هر ناوبری، از جمله صفحه ورود */
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function Guarded() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ShellLayout />,
        children: [
          // ---- عمومی ----
          { index: true, element: <HomePage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'tasks/:taskId', element: <TaskDetailPage /> },
          { path: 'users/:userId', element: <PublicProfilePage /> },
          { path: 'search', element: <SearchPage /> },

          // ---- نیازمند ورود ----
          {
            element: <Guarded />,
            children: [
              { path: 'tasks/new', element: <TaskCreatePage /> },
              { path: 'tasks/:taskId/applications', element: <TaskApplicationsPage /> },
              { path: 'applications/:applicationId', element: <ApplicationDetailPage /> },
              { path: 'projects', element: <ProjectsPage /> },
              { path: 'projects/:projectId', element: <ProjectDetailPage /> },
              { path: 'deliveries/:deliveryId', element: <DeliveryDetailPage /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'profile/edit', element: <ProfileEditPage /> },
              { path: 'my-work', element: <MyWorkPage /> },
              { path: 'messages', element: <MessagesPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'settings', element: <SettingsPage /> },
              { path: 'complaints', element: <ComplaintPage /> },
            ],
          },

          { path: 'home', element: <Navigate to="/" replace /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
