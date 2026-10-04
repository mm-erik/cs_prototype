import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { createMockConversationStore } from '@/conversation/mock-conversation-store'
import { lookupConversation } from '@/conversation/lookup-conversation'
import type { Conversation, ConversationId, Message } from '@/conversation/types'

/**
 * Rendering the Transcript here is deliberately plain: correct, not yet pleasant. The chat
 * presentation ticket replaces it. The failure states below are this ticket's own, and each
 * one names the next action a Support Agent should take.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const rawInput = decodePathSegment(conversationId)

  // The Lookup runs on the server. The store is injected here, which is the only place in
  // the application that knows which implementation is in use.
  const result = await lookupConversation(rawInput, createMockConversationStore())

  switch (result.kind) {
    case 'malformed':
      return <MalformedConversationId rawInput={result.rawInput} />
    case 'unknown':
      return <UnknownConversation id={result.id} />
    case 'unavailable':
      return <Unavailable />
    case 'found':
      // A Support Agent who pasted a whole URL, or an ID wrapped in quotes, arrived at a
      // URL carrying all of that. Send them to the Conversation's own URL so the address
      // bar is worth bookmarking and sharing.
      if (conversationId !== result.conversation.id) {
        redirect(`/conversations/${result.conversation.id}`)
      }

      return <Transcript conversation={result.conversation} />
  }
}

/**
 * Next.js hands a dynamic segment over still percent-encoded, so decoding it here is what
 * makes the round-trip from the Lookup input lossless. That matters beyond cosmetics: the
 * tolerant parsing inside the seam has to see exactly what the Support Agent pasted.
 *
 * `decodeURIComponent` throws on an invalid escape such as `%zz`. Next.js rejects those
 * with a 400 before this route runs, so the guard below is belt-and-braces rather than a
 * path a Support Agent can reach.
 */
function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function FailureState({
  heading,
  children,
  nextAction,
}: {
  heading: string
  children: ReactNode
  nextAction: string
}) {
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
      <p className="text-sm text-slate-600">{children}</p>
      <p className="text-sm font-medium text-slate-900">{nextAction}</p>
    </section>
  )
}

function MalformedConversationId({ rawInput }: { rawInput: string }) {
  const pastedNothing = rawInput.trim() === ''

  return (
    <FailureState
      heading="That is not a Conversation ID"
      nextAction="Check what you copied, then paste it again. A Conversation ID looks like conv_ followed by a UUID."
    >
      {pastedNothing ? (
        <>Nothing was pasted, so no Conversation was looked up.</>
      ) : (
        <>
          What you pasted — <code>{rawInput}</code> — is not a Conversation ID, so no
          Conversation was looked up.
        </>
      )}
    </FailureState>
  )
}

function UnknownConversation({ id }: { id: ConversationId }) {
  return (
    <FailureState
      heading="Unknown Conversation"
      nextAction="Confirm the Conversation ID against the ticket it came from. If it is right, this Conversation does not exist."
    >
      <code>{id}</code> is a well-formed Conversation ID, but no Conversation has it.
    </FailureState>
  )
}

function Unavailable() {
  return (
    <FailureState
      heading="The Conversation data source cannot be reached"
      nextAction="Escalate this to engineering. There is nothing wrong with the Conversation ID you were given."
    >
      This is a fault in this tool, not in what you pasted. No Lookup can succeed until the
      data source is back.
    </FailureState>
  )
}

function Transcript({ conversation }: { conversation: Conversation }) {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Transcript</h1>
      <ol className="space-y-3">
        {conversation.messages.map((message) => (
          <li key={message.id}>
            <TranscriptMessage message={message} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function TranscriptMessage({ message }: { message: Message }) {
  return (
    <article>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {message.author === 'bot' ? 'Bot' : 'End User'}
      </h2>
      {/* Content is Markdown source, shown as plain text until the presentation ticket. */}
      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
    </article>
  )
}
