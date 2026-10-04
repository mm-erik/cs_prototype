import { Fragment } from 'react'

import { transcriptForClipboard } from '@/conversation/transcript-for-clipboard'
import type { Conversation } from '@/conversation/types'

import { CopyTranscriptButton } from './copy-transcript-button'
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
  const noMessages = conversation.messages.length === 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-end gap-4">
        {/*
          The visible heading above this area is the Conversation header's, which names
          the Tenant. This names the region itself for anyone navigating by heading, and
          keeps the outline from jumping straight to a Message.
        */}
        <h2 className="sr-only">Transcript</h2>

        {/*
          Formatting happens here, on the server, so the client component carries only the
          finished text and never the Conversation.
        */}
        <CopyTranscriptButton transcript={transcriptForClipboard(conversation)} />
      </div>

      {noMessages ? <EmptyConversation /> : <Messages conversation={conversation} />}
    </section>
  )
}

function Messages({ conversation }: { conversation: Conversation }) {
  return (
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
      <h3 className="text-sm font-medium text-slate-900">This Conversation has no Messages</h3>
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
