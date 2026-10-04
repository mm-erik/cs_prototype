import { Fragment } from 'react'

import type { Conversation } from '@/conversation/types'

import { GapMarker } from './gap-marker'
import { MessageBubble } from './message-bubble'

/** Messages further apart than this get a visible gap marker between them. */
const LONG_PAUSE_MINUTES = 5

/**
 * The Transcript: Messages in the order they were sent, as a chat.
 *
 * Chat bubbles were chosen over a document-style log deliberately. A Support Agent is not a
 * participant — they are reading evidence, usually scanning for the one moment it went
 * wrong — and seeing roughly what the End User saw is what makes that scan possible.
 */
export function Transcript({ conversation }: { conversation: Conversation }) {
  if (conversation.messages.length === 0) {
    return <EmptyConversation />
  }

  return (
    <section>
      {/*
        The page needs a top-level heading, and the Conversation header ticket owns the
        visible one above this area. Until that lands, this keeps the document outline
        from starting partway down at a Message's own heading.
      */}
      <h1 className="sr-only">Transcript</h1>

      <ol className="flex flex-col gap-3">
        {conversation.messages.map((message, index) => {
          const previous = conversation.messages[index - 1]
          const pause =
            previous === undefined ? 0 : minutesBetween(previous.sentAt, message.sentAt)

          return (
            <Fragment key={message.id}>
              {pause > LONG_PAUSE_MINUTES ? <GapMarker minutes={pause} /> : null}
              <MessageBubble message={message} />
            </Fragment>
          )
        })}
      </ol>
    </section>
  )
}

/**
 * An Empty Conversation is a real state: an End User opened the chat and left without
 * saying anything. Rendered without explanation it looks like a fault in this tool and gets
 * reported as one, so it says what actually happened.
 */
function EmptyConversation() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center">
      <h1 className="text-sm font-medium text-slate-900">This Conversation has no Messages</h1>
      <p className="mt-1 text-sm text-slate-600">
        The End User opened the chat and left without saying anything. Nothing has gone
        wrong here, and there is nothing further to read.
      </p>
    </div>
  )
}

function minutesBetween(earlier: string, later: string): number {
  const gap = new Date(later).getTime() - new Date(earlier).getTime()

  return Math.round(gap / 60_000)
}
