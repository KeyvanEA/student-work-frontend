import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/lib/mock/staticData'

/** صفحه Static — بک‌اند هیچ endpoint گفتگو/پیام ثبت‌شده‌ای ندارد. */
export default function MessagesPage() {
  useDocumentTitle('گفتگوها')
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0].id)
  const active = MOCK_CONVERSATIONS.find((item) => item.id === activeId)

  return (
    <div>
      <PageHeader title="گفتگوها" description="ارتباط با کارفرما یا کارجو دربارهٔ یک تسک" />

      <StaticPageNotice>
        جدول‌های <code className="font-mono text-[11px]">conversations</code> و{' '}
        <code className="font-mono text-[11px]">messages</code> در دیتابیس ساخته شده‌اند، اما هیچ
        Controller یا Route ای برای آن‌ها در <code className="font-mono text-[11px]">routes/api.php</code>{' '}
        ثبت نشده است. این صفحه فقط UI است.
      </StaticPageNotice>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <ul className="divide-y divide-ink-100">
            {MOCK_CONVERSATIONS.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={cn(
                    'flex w-full items-start gap-3 p-3.5 text-start transition-colors',
                    conversation.id === activeId ? 'bg-brand-50' : 'hover:bg-ink-50',
                  )}
                >
                  <Avatar name={conversation.peerName} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-ink-800">
                        {conversation.peerName}
                      </span>
                      <span className="shrink-0 text-[10.5px] text-ink-400">{conversation.lastAt}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-ink-400">
                      {conversation.taskTitle}
                    </span>
                    <span className="mt-1 block truncate text-[12px] text-ink-500">
                      {conversation.lastMessage}
                    </span>
                  </span>
                  {conversation.unread > 0 ? (
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {conversation.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex min-h-[420px] flex-col">
          <div className="flex items-center gap-3 border-b border-ink-100 p-4">
            <Avatar name={active?.peerName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-ink-800">{active?.peerName}</p>
              <p className="truncate text-[11.5px] text-ink-400">{active?.taskTitle}</p>
            </div>
          </div>

          <CardBody className="flex-1 space-y-3 overflow-y-auto">
            {MOCK_MESSAGES.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.fromMe ? 'justify-start' : 'justify-end')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3.5 py-2.5',
                    message.fromMe
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-800',
                  )}
                >
                  <p className="text-[13px] leading-7">{message.text}</p>
                  <p className={cn('mt-1 text-[10px]', message.fromMe ? 'text-brand-100' : 'text-ink-400')}>
                    {message.at}
                  </p>
                </div>
              </div>
            ))}
          </CardBody>

          <div className="flex items-center gap-2 border-t border-ink-100 p-3">
            <Input placeholder="پیام خود را بنویسید…" disabled aria-label="متن پیام" />
            <Button disabled className="shrink-0">
              ارسال
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
