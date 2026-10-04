import { createMockConversationStore } from '@/conversation/mock-conversation-store'
import { lookupConversation } from '@/conversation/lookup-conversation'
import type { Conversation, ConversationId, Message } from '@/conversation/types'

/**
 * Rendering here is deliberately plain: correct, not yet pleasant. The chat presentation
 * ticket replaces all of it, so there is nothing to preserve.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  // The Lookup runs on the server. The store is injected here, which is the only place in
  // the application that knows which implementation is in use.
  const result = await lookupConversation(
    decodePathSegment(conversationId),
    createMockConversationStore(),
  )

  if (result.kind === 'unknown') {
    return <UnknownConversation id={result.id} />
  }

  return <Transcript conversation={result.conversation} />
}

/**
 * Next.js hands a dynamic segment over still percent-encoded, so decoding it here is what
 * makes the round-trip from the Lookup input lossless. That matters beyond cosmetics: the
 * tolerant parsing in a later ticket has to see exactly what the Support Agent pasted.
 *
 * `decodeURIComponent` throws on an invalid escape such as `%zz`. Next.js rejects those
 * with a 400 before this route runs, so the guard below is belt-and-braces rather than a
 * path a Support Agent can reach. It returns the segment as given, because deciding that
 * something is a Malformed Conversation ID is the seam's job, not this route's.
 */
function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function UnknownConversation({ id }: { id: ConversationId }) {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Unknown Conversation</h1>
      <p className="text-sm text-slate-600">
        No Conversation has the Conversation ID <code>{id}</code>.
      </p>
    </section>
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
