import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { acceptApplication, fetchTaskApplications, rejectApplication } from '@/api/applications'
import { fetchTask } from '@/api/tasks'
import { ApplicationCard } from '@/components/domain/ApplicationCard'
import { UserProfileDialog, type ProfilePeek } from '@/components/domain/UserProfileDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { metaOf, taskStatusMeta } from '@/lib/labels'
import type { Application } from '@/types/models'

export default function TaskApplicationsPage() {
  useDocumentTitle('درخواست‌های همکاری')
  const { taskId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [page, setPage] = useState(1)
  const [peek, setPeek] = useState<ProfilePeek | null>(null)
  const [target, setTarget] = useState<{ application: Application; action: 'accept' | 'reject' } | null>(
    null,
  )

  const taskLoader = useCallback((signal: AbortSignal) => fetchTask(taskId, signal), [taskId])
  const task = useApiResource(taskLoader, [taskId])

  const listLoader = useCallback(
    (signal: AbortSignal) => fetchTaskApplications(taskId, page, signal),
    [taskId, page],
  )
  const applications = useApiResource(listLoader, [taskId, page])

  const acceptMutation = useMutation((applicationId: number) => acceptApplication(applicationId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setTarget(null)
      // پاسخ accept شامل پروژهٔ تازه‌ساخته‌شده است؛ کاربر دیگر شناسه را دستی وارد نمی‌کند.
      if (result.project?.id) {
        navigate(`/projects/${result.project.id}`)
        return
      }
      applications.reload()
      task.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setTarget(null)
    },
  })

  const rejectMutation = useMutation((applicationId: number) => rejectApplication(applicationId), {
    onSuccess: (result) => {
      toast.success(result.message)
      setTarget(null)
      applications.reload()
    },
    onError: (error) => {
      toast.error(error.message)
      setTarget(null)
    },
  })

  const busy = acceptMutation.loading || rejectMutation.loading

  return (
    <div>
      <PageHeader
        title="درخواست‌های همکاری"
        description={
          task.data
            ? `تسک: ${task.data.title}`
            : 'درخواست‌هایی که برای این تسک ارسال شده‌اند'
        }
        backTo={`/tasks/${taskId}`}
        backLabel="بازگشت به تسک"
      />

      <Alert tone="info" className="mb-4">
        بک‌اند فقط درخواست‌های <b>در انتظار بررسی</b> را در این فهرست برمی‌گرداند؛ درخواست‌های
        پذیرفته‌شده یا رد‌شده اینجا نمایش داده نمی‌شوند.
      </Alert>

      {applications.loading ? (
        <SkeletonList count={3} />
      ) : applications.error ? (
        <ErrorState error={applications.error} onRetry={applications.reload} />
      ) : (applications.data?.data.length ?? 0) === 0 ? (
        <EmptyState
          title="هنوز درخواستی ثبت نشده"
          description="وقتی کارجویی برای این تسک درخواست همکاری بفرستد، اینجا می‌بینید."
          action={
            <Button size="sm" variant="secondary" onClick={applications.reload}>
              بررسی دوباره
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {applications.data?.data.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                busy={busy}
                onOpen={() => navigate(`/applications/${application.id}`)}
                onOpenProfile={() =>
                  setPeek(
                    application.user
                      ? { ...application.user, id: application.user.id ?? application.user_id }
                      : { id: application.user_id },
                  )
                }
                onAccept={
                  application.status === 'pending'
                    ? () => setTarget({ application, action: 'accept' })
                    : undefined
                }
                onReject={
                  application.status === 'pending'
                    ? () => setTarget({ application, action: 'reject' })
                    : undefined
                }
              />
            ))}
          </div>

          {applications.data ? (
            <div className="mt-5">
              <Pagination
                currentPage={applications.data.current_page}
                lastPage={applications.data.last_page}
                total={applications.data.total}
                disabled={applications.refreshing}
                onChange={setPage}
              />
            </div>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={target?.action === 'accept'}
        title="پذیرش درخواست همکاری"
        description={
          target
            ? `با پذیرش درخواست «${target.application.user?.full_name ?? 'کارجو'}» یک پروژه ساخته می‌شود، تسک به حالت «واگذار شده» می‌رود و بقیه درخواست‌ها به‌صورت خودکار رد می‌شوند.`
            : undefined
        }
        confirmLabel="بله، بپذیر"
        tone="success"
        loading={acceptMutation.loading}
        onConfirm={() => target && void acceptMutation.run(target.application.id)}
        onCancel={() => setTarget(null)}
      />

      <ConfirmDialog
        open={target?.action === 'reject'}
        title="رد کردن درخواست همکاری"
        description={
          target
            ? `درخواست «${target.application.user?.full_name ?? 'کارجو'}» رد می‌شود. این کار قابل بازگشت نیست.`
            : undefined
        }
        confirmLabel="بله، رد کن"
        tone="danger"
        loading={rejectMutation.loading}
        onConfirm={() => target && void rejectMutation.run(target.application.id)}
        onCancel={() => setTarget(null)}
      />

      {task.data && task.data.status !== 'open' ? (
        <Alert tone="info" className="mt-4">
          وضعیت این تسک اکنون «{metaOf(taskStatusMeta, task.data.status).label}» است، بنابراین
          پذیرش یا رد درخواست جدید امکان‌پذیر نیست.
        </Alert>
      ) : null}
      {/*
        پروفایل متقاضی — ApplicationController::index برای صاحب تسک
        user:id,full_name,mobile,avatar را برمی‌گرداند.
      */}
      <UserProfileDialog
        open={peek !== null}
        onClose={() => setPeek(null)}
        user={peek}
        title="پروفایل متقاضی"
      />

    </div>
  )
}
