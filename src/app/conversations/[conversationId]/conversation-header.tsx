import type { Conversation } from '@/conversation/types'

import { formatExactTime } from './format-time'

/**
 * The band that lets a Support Agent confirm, before reading a word, that this is the
 * right Conversation.
 *
 * Without it a mistyped Conversation ID that happens to resolve shows an unrelated
 * Tenant's Conversation and nothing on screen contradicts it. The Tenant name leads because it is
 * the one fact that can be checked against a ticket at a glance; the Conversation ID is
 * repeated beneath it so the paste itself can be checked too.
 *
 * The End User is deliberately not identified here. The Transcript body renders verbatim,
 * but the header does not advertise who the End User is. The Tenant's *name* appears
 * rather than its identifier, so the check costs no second Lookup.
 *
 * This sits below the application bar in `layout.tsx`, whose right-hand side is reserved
 * for a Support Agent identity. Nothing here moves when that arrives.
 */
export function ConversationHeader({ conversation }: { conversation: Conversation }) {
  const inProgress = conversation.status === 'in_progress'

  return (
    <header className="mb-6 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="min-w-0 break-words text-xl font-semibold tracking-tight">
          {conversation.tenant.name}
        </h1>
        {inProgress ? <InProgressLabel /> : null}
      </div>

      <p className="mt-1 font-mono text-xs break-all text-slate-500">{conversation.id}</p>

      <p className="mt-2 text-sm text-slate-600">
        Started{' '}
        <time dateTime={conversation.startedAt}>
          {formatExactTime(conversation.startedAt)}
        </time>
        {' · '}
        {describeMessageCount(conversation.messages.length)}
      </p>
    </header>
  )
}

/**
 * An In-Progress Conversation is labelled rather than treated as a fault. It says what
 * follows from the status: the Transcript below is a snapshot and may already be out of
 * date.
 *
 * An ended Conversation shows nothing here on purpose. Ended is the ordinary case, and
 * labelling it would put a word on every header for the sake of the few that need one.
 */
function InProgressLabel() {
  return (
    <p className="text-sm font-medium text-amber-700">
      Still ongoing — more Messages may follow
    </p>
  )
}

function describeMessageCount(count: number): string {
  if (count === 0) return 'no Messages'
  if (count === 1) return '1 Message'

  return `${count} Messages`
}
