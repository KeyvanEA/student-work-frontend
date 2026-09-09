import { apiRequest, setToken } from './client'
import { endpoints } from './endpoints'
import type { User } from '@/types/models'

export interface LoginResponse {
  message: string
  user: User
  token: string
}

/**
 * ورود.
 * ⚠️ بک‌اند فعلی فقط `mobile` می‌گیرد و مستقیماً توکن می‌دهد؛
 * جدولِ otp_codes وجود دارد ولی هیچ endpoint ای برای ارسال/تأیید OTP ثبت نشده است.
 */
export async function login(mobile: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>(endpoints.login(), {
    method: 'POST',
    json: { mobile },
    auth: false,
  })
  setToken(data.token)
  return data
}

export async function logout(): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>(endpoints.logout(), { method: 'POST' })
  } finally {
    setToken(null)
  }
}

export async function fetchCurrentUser(signal?: AbortSignal): Promise<User> {
  const data = await apiRequest<{ user: User }>(endpoints.currentUser(), { signal })
  return data.user
}
