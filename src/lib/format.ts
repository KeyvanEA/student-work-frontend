const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)])
}

export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

/** مبلغ به تومان با جداکنندهٔ هزارگان و ارقام فارسی */
export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return `${toPersianDigits(amount.toLocaleString('en-US'))} تومان`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return toPersianDigits(value.toLocaleString('en-US'))
}

function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const jalaliDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const jalaliDateTime = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** تاریخ شمسی (بدون وابستگی خارجی، از Intl مرورگر) */
export function formatDate(value: string | null | undefined): string {
  const date = safeDate(value)
  return date ? jalaliDate.format(date) : '—'
}

export function formatDateTime(value: string | null | undefined): string {
  const date = safeDate(value)
  return date ? jalaliDateTime.format(date) : '—'
}

/** «۳ روز پیش» / «۲ ساعت دیگر» */
export function formatRelative(value: string | null | undefined): string {
  const date = safeDate(value)
  if (!date) return '—'

  const diffMs = date.getTime() - Date.now()
  const abs = Math.abs(diffMs)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  const units: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [day * 365, 'year'],
    [day * 30, 'month'],
    [day, 'day'],
    [hour, 'hour'],
    [minute, 'minute'],
  ]

  const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' })
  for (const [ms, unit] of units) {
    if (abs >= ms) return rtf.format(Math.round(diffMs / ms), unit)
  }
  return 'همین حالا'
}

/** فاصله تا مهلت — برای نمایش هشدار */
export function deadlineInfo(value: string | null | undefined): {
  label: string
  tone: 'neutral' | 'warning' | 'danger'
  expired: boolean
} {
  const date = safeDate(value)
  if (!date) return { label: '—', tone: 'neutral', expired: false }

  const diffMs = date.getTime() - Date.now()
  const days = Math.ceil(diffMs / 86_400_000)

  if (diffMs <= 0) return { label: 'مهلت به پایان رسیده', tone: 'danger', expired: true }
  if (days <= 1) return { label: 'کمتر از یک روز مانده', tone: 'danger', expired: false }
  if (days <= 3) return { label: `${toPersianDigits(days)} روز مانده`, tone: 'warning', expired: false }
  return { label: `${toPersianDigits(days)} روز مانده`, tone: 'neutral', expired: false }
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return '—'
  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  const rounded = unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10
  return `${toPersianDigits(rounded)} ${units[unitIndex]}`
}

/** حرف اول نام برای آواتار متنی */
export function initialsOf(name: string | null | undefined): string {
  if (!name) return '؟'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '؟'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`
}

/** تبدیل ورودی <input type="datetime-local"> به فرمتی که Laravel قبول می‌کند */
export function toLaravelDateTime(localValue: string): string {
  if (!localValue) return ''
  // "2026-09-10T14:30" -> "2026-09-10 14:30:00"
  const normalized = localValue.replace('T', ' ')
  return normalized.length === 16 ? `${normalized}:00` : normalized
}
