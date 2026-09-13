import { RouterProvider } from 'react-router-dom'
import { AdminAuthProvider } from '@/admin/AdminAuthContext'
import { AuthProvider } from '@/auth/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { router } from '@/router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        {/* نشست ادمین عمداً جدا از نشست کاربر نگه داشته می‌شود */}
        <AdminAuthProvider>
          <RouterProvider router={router} />
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
