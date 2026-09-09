import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="استودنت‌ورک">
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z" strokeLinejoin="round" />
          <path d="M6.5 11v4.2c0 1.3 2.5 2.3 5.5 2.3s5.5-1 5.5-2.3V11" strokeLinecap="round" />
        </svg>
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold text-ink-900">استودنت‌ورک</span>
          <span className="block text-[10.5px] font-medium text-ink-400">کارهای دانشجویی</span>
        </span>
      ) : null}
    </Link>
  )
}
