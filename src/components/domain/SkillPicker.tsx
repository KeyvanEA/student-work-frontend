import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Input } from '@/components/ui/Input'
import { toPersianDigits } from '@/lib/format'
import type { Skill } from '@/types/models'

/** انتخاب چندتایی مهارت — داده از GET /api/skills می‌آید */
export function SkillPicker({
  skills,
  selected,
  onChange,
  max = 10,
  disabled,
}: {
  skills: Skill[]
  selected: number[]
  onChange: (ids: number[]) => void
  max?: number
  disabled?: boolean
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return skills
    return skills.filter((skill) => skill.name.toLowerCase().includes(term))
  }, [skills, query])

  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((item) => item !== id))
    else if (selected.length < max) onChange([...selected, id])
  }

  return (
    <div className="space-y-2.5">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجوی مهارت…"
        disabled={disabled}
        aria-label="جستجوی مهارت"
      />

      <p className="text-[11.5px] text-ink-400">
        {toPersianDigits(selected.length)} از {toPersianDigits(max)} مهارت انتخاب شده
      </p>

      <div className="scrollbar-none max-h-52 overflow-y-auto rounded-xl border border-ink-200 bg-ink-50/50 p-2">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-ink-400">مهارتی با این نام پیدا نشد.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {filtered.map((skill) => {
              const active = selected.includes(skill.id)
              const blocked = !active && selected.length >= max
              return (
                <li key={skill.id}>
                  <button
                    type="button"
                    disabled={disabled || blocked}
                    onClick={() => toggle(skill.id)}
                    aria-pressed={active}
                    className={cn(
                      'rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ring-1 ring-inset transition-colors',
                      active
                        ? 'bg-brand-600 text-white ring-brand-600'
                        : 'bg-white text-ink-600 ring-ink-200 hover:ring-brand-300',
                      blocked && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    {skill.name}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
