import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/api/client'

export interface ApiResourceState<T> {
  data: T | null
  error: ApiError | null
  loading: boolean
  /** بارگذاری مجدد در پس‌زمینه (داده قبلی حفظ می‌شود) */
  refreshing: boolean
  reload: () => void
  setData: (updater: T | ((previous: T | null) => T | null)) => void
}

/**
 * واکشی یک منبع از API با مدیریت loading / error / reload.
 * عمداً ساده نگه داشته شده — بند ۱۱ نیازمندی‌ها: بدون پیچیدگی اضافه.
 */
export function useApiResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  options: { enabled?: boolean } = {},
): ApiResourceState<T> {
  const enabled = options.enabled ?? true

  const [data, setDataState] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [refreshing, setRefreshing] = useState(false)
  const [nonce, setNonce] = useState(0)

  const hasDataRef = useRef(false)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    if (hasDataRef.current) setRefreshing(true)
    else setLoading(true)
    setError(null)

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (cancelled) return
        hasDataRef.current = true
        setDataState(result)
      })
      .catch((caught: unknown) => {
        if (cancelled || (caught as Error)?.name === 'AbortError') return
        setError(
          caught instanceof ApiError ? caught : new ApiError(0, 'خطای غیرمنتظره در دریافت اطلاعات.'),
        )
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
        setRefreshing(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  const setData = useCallback((updater: T | ((previous: T | null) => T | null)) => {
    setDataState((previous) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T | null)(previous) : updater,
    )
  }, [])

  return { data, error, loading, refreshing, reload, setData }
}
