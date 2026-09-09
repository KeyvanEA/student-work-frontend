/**
 * لایه ارتباط با بک‌اند.
 * هیچ کامپوننت UI مستقیماً fetch نمی‌زند؛ همه چیز از اینجا رد می‌شود.
 */

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000') as string
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '')

const TOKEN_STORAGE_KEY = 'studentwork.token'

/** رویداد سراسری برای زمانی که توکن نامعتبر شده و باید کاربر خارج شود */
export const UNAUTHORIZED_EVENT = 'studentwork:unauthorized'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* حالت private mode مرورگر */
  }
}

export type ValidationErrors = Record<string, string[]>

/** خطای یکنواخت برای کل اپ؛ پیام‌ها از خود بک‌اند می‌آیند و در نبود پیام، متن فارسی جایگزین می‌شود. */
export class ApiError extends Error {
  readonly status: number
  readonly errors?: ValidationErrors
  readonly payload?: unknown

  constructor(status: number, message: string, errors?: ValidationErrors, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.payload = payload
  }

  /** اولین خطای اعتبارسنجی یک فیلد */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0]
  }

  get isNetworkError() {
    return this.status === 0
  }
}

/** پیام پیش‌فرض فارسی وقتی بک‌اند پیامی نداده باشد (بند ۹ نیازمندی‌ها) */
export function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 0:
      return 'ارتباط با سرور برقرار نشد. اتصال اینترنت یا اجرای بک‌اند را بررسی کنید.'
    case 401:
      return 'برای انجام این کار باید وارد حساب کاربری شوید.'
    case 403:
      return 'شما دسترسی لازم برای این عملیات را ندارید.'
    case 404:
      return 'مورد درخواستی پیدا نشد.'
    case 409:
      return 'این عملیات در وضعیت فعلی امکان‌پذیر نیست.'
    case 422:
      return 'اطلاعات ارسالی معتبر نیست.'
    case 429:
      return 'تعداد درخواست‌ها زیاد است. کمی صبر کنید.'
    case 500:
    case 502:
    case 503:
      return 'خطای سرور رخ داد. لطفاً دوباره تلاش کنید.'
    default:
      return 'خطای ناشناخته‌ای رخ داد.'
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** بدنه JSON */
  json?: unknown
  /** بدنه multipart (آپلود فایل) */
  form?: FormData
  signal?: AbortSignal
  /** برای مسیرهای عمومی که نیازی به توکن ندارند */
  auth?: boolean
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers({ Accept: 'application/json' })
  if (options.json !== undefined) headers.set('Content-Type', 'application/json')
  // برای FormData هدر Content-Type را دستی ست نمی‌کنیم تا boundary درست تولید شود.

  if (options.auth !== false) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  return headers
}

function toAbsolute(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: unknown
  let message = ''
  let errors: ValidationErrors | undefined

  try {
    payload = await response.json()
    if (payload && typeof payload === 'object') {
      const body = payload as { message?: unknown; errors?: unknown }
      if (typeof body.message === 'string' && body.message.trim()) message = body.message
      if (body.errors && typeof body.errors === 'object') errors = body.errors as ValidationErrors
    }
  } catch {
    /* پاسخ JSON نبود (مثلاً صفحه خطای HTML لاراول) */
  }

  if (!message) message = defaultMessageForStatus(response.status)
  return new ApiError(response.status, message, errors, payload)
}

async function rawRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', json, form, signal } = options

  let response: Response
  try {
    response = await fetch(toAbsolute(path), {
      method,
      headers: buildHeaders(options),
      body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
      signal,
    })
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error
    throw new ApiError(0, defaultMessageForStatus(0))
  }

  if (response.status === 401 && options.auth !== false) {
    setToken(null)
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
  }

  if (!response.ok) throw await parseError(response)
  return response
}

/** درخواست JSON */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await rawRequest(path, options)
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

/** دریافت فایل به صورت Blob (برای preview و download که هدر Authorization لازم دارند) */
export async function apiRequestBlob(
  path: string,
  options: RequestOptions = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await rawRequest(path, options)
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  const filename = match ? decodeURIComponent(match[1]) : null
  return { blob, filename }
}

/** ساخت FormData با پشتیبانی از method spoofing لاراول (PATCH/PUT چندبخشی) */
export function buildFormData(
  values: Record<string, unknown>,
  spoofMethod?: 'PATCH' | 'PUT' | 'DELETE',
): FormData {
  const form = new FormData()
  if (spoofMethod) form.append('_method', spoofMethod)

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    if (value instanceof File) {
      form.append(key, value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue
        form.append(`${key}[]`, item instanceof File ? item : String(item))
      }
    } else if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
    } else {
      form.append(key, String(value))
    }
  }
  return form
}
