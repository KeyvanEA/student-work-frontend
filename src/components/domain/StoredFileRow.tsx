import { storedFileName, storedFileUrl } from '@/api/files'
import { IconDownload, IconFile } from '@/components/ui/Icons'
import { formatBytes } from '@/lib/format'

export interface StoredFile {
  id: number
  file_path?: string | null
  /** بک‌اند گاهی مطلق و گاهی نسبی می‌دهد؛ هر دو پشتیبانی می‌شوند */
  download_url?: string | null
  original_name?: string | null
  mime_type?: string | null
  size?: number | null
}

/**
 * یک ردیف فایل ذخیره‌شده روی Storage (تسک، درخواست همکاری، شکایت).
 *
 * چرا لینک ساده و نه fetch؟
 * مسیر `/storage/*` بک‌اند زیر middleware `HandleCors` نیست (پیش‌فرض لاراول فقط
 * `api/*` را CORS می‌دهد)، بنابراین یک fetch بین‌مبدأ از فرانت مسدود می‌شود؛ ولی
 * ناوبری ساده به آن مشکلی ندارد.
 *
 * چرا `target="_blank"` و نه `download`؟
 * ویژگی `download` برای نشانی‌های بین‌مبدأ توسط مرورگر نادیده گرفته می‌شود و صفحه
 * از اپ خارج می‌شد. باز کردن در تب جدید هم فایل را در دسترس می‌گذارد و هم کاربر را
 * داخل اپ نگه می‌دارد.
 */
export function StoredFileRow({ file }: { file: StoredFile }) {
  const url = storedFileUrl(file.download_url ?? file.file_path)
  const name = storedFileName(file)

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3">
      <span className="flex min-w-0 items-center gap-2.5">
        <IconFile className="size-5 shrink-0 text-ink-400" />
        <span className="min-w-0">
          <span className="block truncate text-[13px] text-ink-700" dir="ltr">
            {name}
          </span>
          {file.size || file.mime_type ? (
            <span className="block text-[11.5px] text-ink-400">
              {file.size ? formatBytes(file.size) : null}
              {file.size && file.mime_type ? ' · ' : null}
              {file.mime_type ?? null}
            </span>
          ) : null}
        </span>
      </span>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-brand-600 hover:bg-brand-50 hover:underline"
        >
          <IconDownload className="size-4" />
          باز کردن
        </a>
      ) : (
        <span className="shrink-0 text-[12px] text-ink-400">نشانی فایل موجود نیست</span>
      )}
    </div>
  )
}

/** فهرست فایل‌ها با حالت خالی یکسان در همهٔ صفحات */
export function StoredFileList({
  files,
  empty = 'فایلی پیوست نشده است.',
}: {
  files: StoredFile[]
  empty?: string
}) {
  if (files.length === 0) return <p className="text-[13px] text-ink-400">{empty}</p>
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <StoredFileRow key={file.id} file={file} />
      ))}
    </div>
  )
}
