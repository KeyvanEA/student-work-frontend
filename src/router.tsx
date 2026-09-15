import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PublicContentLayout, PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

// ---- سایت عمومی ----
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import TasksPage from '@/pages/TasksPage'
import TaskDetailPage from '@/pages/TaskDetailPage'
import NotFoundPage from '@/pages/NotFoundPage'

// ---- داشبورد کاربر ----
import DashboardPage from '@/pages/DashboardPage'
import TaskCreatePage from '@/pages/TaskCreatePage'
import MyTasksPage from '@/pages/MyTasksPage'
import TaskApplicationsPage from '@/pages/TaskApplicationsPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import DeliveryDetailPage from '@/pages/DeliveryDetailPage'
import ComplaintsPage from '@/pages/ComplaintsPage'
import ComplaintDetailPage from '@/pages/ComplaintDetailPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SatisfactionPage from '@/pages/SatisfactionPage'
import ProfilePage from '@/pages/ProfilePage'
import ProfileEditPage from '@/pages/ProfileEditPage'

/**
 * پنل ادمین — ورود جداگانه ندارد و از همان Authentication پروژه استفاده می‌کند.
 * به‌صورت lazy بارگذاری می‌شود تا حجم باندل سایت عمومی و داشبورد کاربر را زیاد نکند.
 */
import { AdminGuard } from '@/admin/components/AdminGuard'

const AdminLayout = lazy(() =>
  import('@/admin/components/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/admin/pages/AdminUsersPage'))
const AdminTasksPage = lazy(() => import('@/admin/pages/AdminTasksPage'))
const AdminTaskDetailPage = lazy(() => import('@/admin/pages/AdminTaskDetailPage'))
const AdminComplaintsPage = lazy(() => import('@/admin/pages/AdminComplaintsPage'))
const AdminComplaintDetailPage = lazy(() => import('@/admin/pages/AdminComplaintDetailPage'))

/** جلوگیری از پرش صفحه هنگام بارگذاری chunk پنل ادمین */
function AdminChunk({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40dvh] items-center justify-center text-[13px] text-ink-400">
          در حال بارگذاری…
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

/** ریشهٔ همه مسیرها — بازگرداندن موقعیت اسکرول در هر ناوبری */
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
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
      // ---------- سایت عمومی: صفحه اصلی تمام‌عرض ----------
      {
        element: <PublicLayout />,
        children: [{ index: true, element: <HomePage /> }],
      },

      // ---------- سایت عمومی: صفحات تسک ----------
      {
        element: <PublicContentLayout />,
        children: [
          { path: 'tasks', element: <TasksPage /> },
          { path: 'tasks/:taskId', element: <TaskDetailPage /> },
        ],
      },

      // ---------- داشبورد کاربر (نیازمند ورود) ----------
      {
        element: <Guarded />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },

              { path: 'profile', element: <ProfilePage /> },
              { path: 'profile/edit', element: <ProfileEditPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'satisfaction', element: <SatisfactionPage /> },

              { path: 'tasks/new', element: <TaskCreatePage /> },
              { path: 'my-tasks', element: <MyTasksPage /> },
              { path: 'tasks/:taskId/applications', element: <TaskApplicationsPage /> },

              // مسیرهای ثابت پیش از مسیر پویا تعریف شده‌اند تا تداخل نداشته باشند
              { path: 'applications', element: <Navigate to="/applications/sent" replace /> },
              { path: 'applications/sent', element: <ApplicationsPage type="sent" /> },
              { path: 'applications/received', element: <ApplicationsPage type="received" /> },
              { path: 'applications/:applicationId', element: <ApplicationDetailPage /> },

              { path: 'projects', element: <Navigate to="/projects/active/worker" replace /> },
              { path: 'projects/:status/:role', element: <ProjectsPage /> },
              { path: 'projects/:projectId', element: <ProjectDetailPage /> },

              { path: 'deliveries/:deliveryId', element: <DeliveryDetailPage /> },

              { path: 'complaints', element: <Navigate to="/complaints/mine" replace /> },
              { path: 'complaints/mine', element: <ComplaintsPage scope="mine" /> },
              { path: 'complaints/related', element: <ComplaintsPage scope="related" /> },
              { path: 'complaints/:complaintId', element: <ComplaintDetailPage /> },
            ],
          },
        ],
      },

      // ---------- پنل ادمین (داشبورد، کاربران، تسک‌ها و شکایات فعال‌اند) ----------
      {
        path: 'admin',
        element: (
          <AdminGuard>
            <AdminChunk>
              <AdminLayout />
            </AdminChunk>
          </AdminGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <AdminChunk>
                <AdminDashboardPage />
              </AdminChunk>
            ),
          },
          {
            path: 'users',
            element: (
              <AdminChunk>
                <AdminUsersPage />
              </AdminChunk>
            ),
          },
          {
            path: 'tasks',
            element: (
              <AdminChunk>
                <AdminTasksPage />
              </AdminChunk>
            ),
          },
          {
            path: 'tasks/:taskId',
            element: (
              <AdminChunk>
                <AdminTaskDetailPage />
              </AdminChunk>
            ),
          },
          {
            path: 'complaints',
            element: (
              <AdminChunk>
                <AdminComplaintsPage />
              </AdminChunk>
            ),
          },
          {
            path: 'complaints/:complaintId',
            element: (
              <AdminChunk>
                <AdminComplaintDetailPage />
              </AdminChunk>
            ),
          },
          // هر مسیر دیگری زیر /admin هنوز ساخته نشده است
          { path: '*', element: <Navigate to="/admin" replace /> },
        ],
      },

      // ---------- بازماندهٔ مسیرهای قدیمی ----------
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: 'my-work', element: <Navigate to="/my-tasks" replace /> },

      {
        element: <PublicContentLayout />,
        children: [{ path: '*', element: <NotFoundPage /> }],
      },
    ],
  },
])
