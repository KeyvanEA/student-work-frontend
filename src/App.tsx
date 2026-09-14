import { RouterProvider } from 'react-router-dom'
import { AdminAccessProvider } from '@/admin/AdminAccessContext'
import { AuthProvider } from '@/auth/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { router } from '@/router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        {/* تشخیص نقش ادمین روی همان نشست کاربر — بدون ورود جداگانه */}
        <AdminAccessProvider>
          <RouterProvider router={router} />
        </AdminAccessProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
