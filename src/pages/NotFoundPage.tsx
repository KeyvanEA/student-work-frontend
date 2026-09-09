import { LinkButton } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('صفحه پیدا نشد')

  return (
    <div className="py-10">
      <EmptyState
        title="این صفحه وجود ندارد"
        description="ممکن است نشانی اشتباه باشد یا صفحه حذف شده باشد."
        action={<LinkButton to="/" size="sm">بازگشت به خانه</LinkButton>}
      />
    </div>
  )
}
