import { Badge } from '@/components/ui/Badge'
import type { StatusMeta } from '@/lib/labels'

export function StatusBadge({ meta, className }: { meta: StatusMeta; className?: string }) {
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  )
}
