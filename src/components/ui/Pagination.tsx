import { Button } from './Button'
import { toPersianDigits } from '@/lib/format'

export function Pagination({
  currentPage,
  lastPage,
  total,
  onChange,
  disabled,
}: {
  currentPage: number
  lastPage: number
  total?: number
  onChange: (page: number) => void
  disabled?: boolean
}) {
  if (lastPage <= 1) return null

  return (
    <nav className="flex items-center justify-between gap-3 pt-1" aria-label="صفحه‌بندی">
      <Button
        size="sm"
        variant="secondary"
        disabled={disabled || currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
      >
        قبلی
      </Button>

      <p className="text-[12.5px] text-ink-500">
        صفحه {toPersianDigits(currentPage)} از {toPersianDigits(lastPage)}
        {total !== undefined ? ` — ${toPersianDigits(total)} مورد` : ''}
      </p>

      <Button
        size="sm"
        variant="secondary"
        disabled={disabled || currentPage >= lastPage}
        onClick={() => onChange(currentPage + 1)}
      >
        بعدی
      </Button>
    </nav>
  )
}
