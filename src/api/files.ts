import { apiRequestBlob, ApiError } from './client'
import { endpoints } from './endpoints'
import type { DeliveryFile } from '@/types/models'

/**
 * فرانت هرگز مسیر داخلی Storage را حدس نمی‌زند.
 * `preview_url` را عیناً از پاسخ بک‌اند می‌گیریم؛
 * برای دانلود، از همان URL استفاده می‌کنیم و فقط پسوند route را عوض می‌کنیم
 * (هر دو در routes/api.php ثبت شده‌اند: deliveries.files.preview و deliveries.files.download).
 */
export function previewUrlOf(file: DeliveryFile, deliveryId: number | string): string {
  return file.preview_url || endpoints.deliveryFilePreview(deliveryId, file.id)
}

export function downloadUrlOf(file: DeliveryFile, deliveryId: number | string): string {
  if (file.preview_url && /\/preview\/?$/.test(file.preview_url)) {
    return file.preview_url.replace(/\/preview\/?$/, '/download')
  }
  return endpoints.deliveryFileDownload(deliveryId, file.id)
}

/** خطای اختصاصی مسدود شدن پاپ‌آپ تا UI بتواند پیام درست بدهد */
export class PopupBlockedError extends Error {
  constructor() {
    super('مرورگر اجازهٔ باز کردن پنجرهٔ پیش‌نمایش را نداد. پاپ‌آپ این سایت را مجاز کنید.')
    this.name = 'PopupBlockedError'
  }
}

/**
 * پیش‌نمایش فایل تحویل.
 *
 * ترتیب کار عمداً این‌گونه است:
 *   کلیک کاربر → window.open() فوری → fetch با هدر Authorization → Blob URL →
 *   ست کردن location پنجرهٔ از قبل باز شده.
 *
 * پنجره باید *قبل از* هر await باز شود؛ اگر بعد از await باز شود مرورگر آن را
 * خارج از user gesture می‌بیند و پاپ‌آپ‌بلاکر جلویش را می‌گیرد.
 *
 * ⚠️ اگر پاپ‌آپ مسدود شد، Preview به Download تبدیل نمی‌شود. دانلود فقط کار دکمهٔ
 * «دانلود» است (که قانون دسترسی جداگانهٔ خودش را دارد).
 * بک‌اند برای preview هدر Content-Disposition: inline می‌فرستد؛ این رفتار حفظ می‌شود.
 */
export async function openDeliveryFilePreview(file: DeliveryFile, deliveryId: number | string) {
  const opened = window.open('', '_blank', 'noopener,noreferrer')
  if (!opened) throw new PopupBlockedError()

  // یک نشانهٔ سادهٔ «در حال بارگذاری» تا پنجره خالی و گیج‌کننده نماند
  try {
    opened.document.write(
      '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">' +
        '<title>در حال بارگذاری پیش‌نمایش…</title></head>' +
        '<body style="font-family:system-ui;display:flex;align-items:center;' +
        'justify-content:center;height:100vh;margin:0;color:#475569">' +
        'در حال بارگذاری پیش‌نمایش…</body></html>',
    )
    opened.document.close()
  } catch {
    /* برخی مرورگرها اجازهٔ document.write روی پنجرهٔ about:blank نمی‌دهند */
  }

  let url: string
  try {
    const { blob } = await apiRequestBlob(previewUrlOf(file, deliveryId))
    url = URL.createObjectURL(blob)
  } catch (error) {
    opened.close()
    throw error instanceof ApiError ? error : new ApiError(0, 'دریافت فایل پیش‌نمایش ناموفق بود.')
  }

  opened.location.href = url
  // فرصت بارگذاری به تب جدید می‌دهیم و بعد آبجکت را آزاد می‌کنیم
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export async function downloadDeliveryFile(file: DeliveryFile, deliveryId: number | string) {
  const { blob, filename } = await apiRequestBlob(downloadUrlOf(file, deliveryId))
  const url = URL.createObjectURL(blob)
  triggerBrowserSave(url, filename ?? file.original_name)
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

function triggerBrowserSave(objectUrl: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

/** فقط همین MIMEها سمت فرانت قابل پیش‌نمایش در نظر گرفته می‌شوند */
export function isPreviewableMime(mime: string): boolean {
  return /^image\//.test(mime) || mime === 'application/pdf' || /^text\//.test(mime)
}
