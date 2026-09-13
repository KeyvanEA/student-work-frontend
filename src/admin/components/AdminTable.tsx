import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface AdminColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** ستون‌هایی که در موبایل حذف می‌شوند تا جدول قابل استفاده بماند */
  hideOnMobile?: boolean
  className?: string
}

/**
 * جدول ادمین.
 * در دسکتاپ جدول واقعی و پهن است؛ در موبایل هر ردیف به یک کارت تبدیل می‌شود تا
 * پنل روی گوشی هم قابل استفاده بماند.
 */
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
}: {
  columns: Array<AdminColumn<T>>
  rows: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
}) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>

  return (
    <>
      {/* دسکتاپ */}
      <div className="hidden overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] md:block">
        <table className="w-full border-collapse text-start">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-start text-[12px] font-bold text-ink-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-ink-100 last:border-b-0',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-brand-50/40',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-4 py-3 align-middle text-[13px] text-ink-700', column.className)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* موبایل */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              'rounded-2xl border border-ink-200 bg-white p-4 shadow-[var(--shadow-soft)]',
              onRowClick && 'cursor-pointer',
            )}
          >
            <dl className="space-y-2">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-[11.5px] font-semibold text-ink-400">
                      {column.header}
                    </dt>
                    <dd className="min-w-0 text-end text-[12.5px] text-ink-700">
                      {column.render(row)}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}

/** نوار فیلتر بالای فهرست‌های ادمین */
export function AdminFilters({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}
