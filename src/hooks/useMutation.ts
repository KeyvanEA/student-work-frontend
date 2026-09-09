import { useCallback, useRef, useState } from 'react'
import { ApiError } from '@/api/client'

export interface MutationState<TInput, TResult> {
  run: (input: TInput) => Promise<TResult | null>
  loading: boolean
  error: ApiError | null
  reset: () => void
}

/** اجرای یک عملیات نوشتنی روی API با وضعیت loading/error و جلوگیری از ارسال دوباره */
export function useMutation<TInput = void, TResult = unknown>(
  action: (input: TInput) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult, input: TInput) => void | Promise<void>
    onError?: (error: ApiError, input: TInput) => void
  } = {},
): MutationState<TInput, TResult> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const inFlight = useRef(false)

  const optionsRef = useRef(options)
  optionsRef.current = options
  const actionRef = useRef(action)
  actionRef.current = action

  const run = useCallback(async (input: TInput): Promise<TResult | null> => {
    if (inFlight.current) return null
    inFlight.current = true
    setLoading(true)
    setError(null)
    try {
      const result = await actionRef.current(input)
      await optionsRef.current.onSuccess?.(result, input)
      return result
    } catch (caught) {
      const apiError =
        caught instanceof ApiError ? caught : new ApiError(0, 'خطای غیرمنتظره‌ای رخ داد.')
      setError(apiError)
      optionsRef.current.onError?.(apiError, input)
      return null
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => setError(null), [])

  return { run, loading, error, reset }
}
