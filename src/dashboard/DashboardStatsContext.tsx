import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { fetchDashboard } from '@/api/dashboard'
import { useAuth } from '@/auth/AuthContext'
import { useApiResource } from '@/hooks/useApiResource'
import type { ApiError } from '@/api/client'
import type { DashboardStats } from '@/types/models'

interface DashboardStatsValue {
  stats: DashboardStats | null
  loading: boolean
  error: ApiError | null
  reload: () => void
}

const DashboardStatsContext = createContext<DashboardStatsValue | null>(null)

/**
 * شمارنده‌های داشبورد یک‌بار برای کل پوستهٔ داشبورد گرفته می‌شوند
 * تا هم صفحهٔ /dashboard و هم نشان «اعلان خوانده‌نشده» در نوار بالا از یک منبع بخوانند.
 * هیچ عدد Local یا Fake ای اینجا ساخته نمی‌شود — همه از GET /api/dashboard می‌آید.
 */
export function DashboardStatsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  const loader = useCallback((signal: AbortSignal) => fetchDashboard(signal), [])
  const resource = useApiResource(loader, [isAuthenticated], { enabled: isAuthenticated })

  const value = useMemo<DashboardStatsValue>(
    () => ({
      stats: resource.data,
      loading: resource.loading,
      error: resource.error,
      reload: resource.reload,
    }),
    [resource.data, resource.loading, resource.error, resource.reload],
  )

  return <DashboardStatsContext.Provider value={value}>{children}</DashboardStatsContext.Provider>
}

export function useDashboardStats(): DashboardStatsValue {
  const context = useContext(DashboardStatsContext)
  if (!context) {
    throw new Error('useDashboardStats باید داخل DashboardStatsProvider استفاده شود.')
  }
  return context
}
