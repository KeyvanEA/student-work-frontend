import { useId, useRef } from 'react'
import { cn } from '@/lib/cn'
import { formatBytes, toPersianDigits } from '@/lib/format'

/** پسوندهای مجاز طبق قوانین اعتبارسنجی بک‌اند (mimes:...) */
export const ACCEPTED_FILE_TYPES =
  '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar'

export function FileInput({
  files,
  onChange,
  max = 3,
  maxSizeMb = 10,
  disabled,
  hint,
}: {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
  maxSizeMb?: number
  disabled?: boolean
  hint?: string
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePick = (picked: FileList | null) => {
    if (!picked) return
    const next = [...files]
    for (const file of Array.from(picked)) {
      if (next.length >= max) break
      if (next.some((item) => item.name === file.name && item.size === file.size)) continue
      next.push(file)
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (index: number) => onChange(files.filter((_, i) => i !== index))
  const full = files.length >= max

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/60 px-4 py-6 text-center transition-colors',
          !disabled && !full && 'hover:border-brand-300 hover:bg-brand-50/50',
          (disabled || full) && 'cursor-not-allowed opacity-60',
        )}
      >
        <svg className="size-6 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
          <path d="M12 16V4m0 0L8 8m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] font-semibold text-ink-700">
          {full
            ? `حداکثر ${toPersianDigits(max)} فایل انتخاب شده است`
            : 'برای انتخاب فایل کلیک کنید'}
        </span>
        <span className="text-[11.5px] text-ink-500">
          {hint ?? `حداکثر ${toPersianDigits(max)} فایل، هرکدام تا ${toPersianDigits(maxSizeMb)} مگابایت`}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={max > 1}
          className="sr-only"
          accept={ACCEPTED_FILE_TYPES}
          disabled={disabled || full}
          onChange={(event) => handlePick(event.target.files)}
        />
      </label>

      {files.length > 0 ? (
        <ul className="space-y-1.5">
          {files.map((file, index) => {
            const tooBig = file.size > maxSizeMb * 1024 * 1024
            return (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-3 py-2',
                  tooBig ? 'border-rose-200 bg-rose-50' : 'border-ink-200 bg-white',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink-800">{file.name}</p>
                  <p className={cn('text-[11.5px]', tooBig ? 'text-rose-600' : 'text-ink-500')}>
                    {formatBytes(file.size)}
                    {tooBig ? ` — بیشتر از حد مجاز (${toPersianDigits(maxSizeMb)} مگابایت)` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-semibold text-rose-600 hover:bg-rose-50"
                >
                  حذف
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
