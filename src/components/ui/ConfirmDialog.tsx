import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

/** دیالوگ تأیید برای عملیات حساس (بند ۸ نیازمندی‌ها) */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger' | 'success'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onCancel}
      title={title}
      description={description}
      size="sm"
      closeOnBackdrop={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="sm:w-auto" block>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading} className="sm:w-auto" block>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
