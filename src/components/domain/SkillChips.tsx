import type { Skill } from '@/types/models'

export function SkillChips({ skills, empty }: { skills?: Skill[] | null; empty?: string }) {
  if (!skills || skills.length === 0) {
    return empty ? <p className="text-[13px] text-ink-400">{empty}</p> : null
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className="rounded-lg bg-ink-100 px-2.5 py-1 text-[12px] font-medium text-ink-600"
        >
          {skill.name}
        </li>
      ))}
    </ul>
  )
}
