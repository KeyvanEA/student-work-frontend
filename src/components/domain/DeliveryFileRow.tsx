import { useState } from 'react'
import { ApiError } from '@/api/client'
import { downloadDeliveryFile, isPreviewableMime, openDeliveryFilePreview } from '@/api/files'
import { Button } from '@/components/ui/Button'
import { IconDownload, IconEye, IconFile } from '@/components/ui/Icons'
import { useToast } from '@/components/ui/Toast'
import { formatBytes } from '@/lib/format'
import type { DeliveryFile } from '@/types/models'

export function DeliveryFileRow({
  file,
  deliveryId,
  canDownload,
  downloadBlockedReason,
}: {
  file: DeliveryFile
  deliveryId: number
  canDownload: boolean
  downloadBlockedReason?: string
}) {
  const toast = useToast()
  const [pending, setPending] = useState<'preview' | 'download' | null>(null)

  const handle = async (kind: 'preview' | 'download') => {
    setPending(kind)
    try {
      if (kind === 'preview') await openDeliveryFilePreview(file, deliveryId)
      else {
        await downloadDeliveryFile(file, deliveryId)
        toast.success('دانلود فایل آغاز شد.')
      }
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null
      toast.error(apiError?.message ?? 'دریافت فایل ناموفق بود.')
    } finally {
      setPending(null)
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-500">
          <IconFile className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-ink-800">{file.original_name}</p>
          <p className="text-[11.5px] text-ink-400">
            {formatBytes(file.size)} · {file.mime_type}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {isPreviewableMime(file.mime_type) ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<IconEye className="size-4" />}
            loading={pending === 'preview'}
            disabled={pending !== null}
            onClick={() => handle('preview')}
          >
            پیش‌نمایش
          </Button>
        ) : null}

        <Button
          size="sm"
          variant={canDownload ? 'outline' : 'secondary'}
          icon={<IconDownload className="size-4" />}
          loading={pending === 'download'}
          disabled={pending !== null || !canDownload}
          title={!canDownload ? downloadBlockedReason : undefined}
          onClick={() => handle('download')}
        >
          دانلود
        </Button>
      </div>

      {!canDownload && downloadBlockedReason ? (
        <p className="w-full text-[11.5px] font-medium text-amber-700">{downloadBlockedReason}</p>
      ) : null}
    </li>
  )
}
