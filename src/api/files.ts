import { apiRequestBlob } from './client'
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

/** چون این مسیرها هدر Authorization لازم دارند، نمی‌توان از <a href> ساده استفاده کرد. */
export async function openDeliveryFilePreview(file: DeliveryFile, deliveryId: number | string) {
  const { blob } = await apiRequestBlob(previewUrlOf(file, deliveryId))
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) {
    // مسدود شدن پاپ‌آپ: به‌جای آن فایل را ذخیره می‌کنیم
    triggerBrowserSave(url, file.original_name)
  }
  // اجازه می‌دهیم تب جدید فرصت بارگذاری داشته باشد
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

export function isPreviewableMime(mime: string): boolean {
  return /^image\//.test(mime) || mime === 'application/pdf' || /^text\//.test(mime)
}
