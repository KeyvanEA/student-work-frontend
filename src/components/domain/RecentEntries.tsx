import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listEntries, subscribeRecent, type RecentEntry, type RecentKind } from '@/lib/recent'
import { formatRelative, toPersianDigits } from '@/lib/format'
import { IconBack } from '@/components/ui/Icons'
import { EmptyState } from '@/components/ui/EmptyState'

const BASE_PATH: Record<RecentKind, string> = {
  task: '/tasks',
  application: '/applications',
  project: '/projects',
  delivery: '/deliveries',
}

/** فهرست شناسه‌هایی که در همین مرورگر واقعاً از API باز شده‌اند */
export function RecentEntries({
  kind,
  emptyTitle,
  emptyDescription,
}: {
  kind: RecentKind
  emptyTitle: string
  emptyDescription: string
}) {
  const [entries, setEntries] = useState<RecentEntry[]>(() => listEntries(kind))

  useEffect(() => {
    const sync = () => setEntries(listEntries(kind))
    sync()
    return subscribeRecent(sync)
  }, [kind])

  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={`${entry.kind}-${entry.id}`}>
          <Link
            to={
              entry.kind === 'delivery' && entry.parentId
                ? `${BASE_PATH[entry.kind]}/${entry.id}?project=${entry.parentId}`
                : `${BASE_PATH[entry.kind]}/${entry.id}`
            }
            className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-bold text-ink-800">
                {entry.title}
              </span>
              <span className="block truncate text-[11.5px] text-ink-400">
                شناسه {toPersianDigits(entry.id)}
                {entry.subtitle ? ` · ${entry.subtitle}` : ''} ·{' '}
                {formatRelative(new Date(entry.seenAt).toISOString())}
              </span>
            </span>
            <IconBack className="size-4 shrink-0 text-ink-300" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
