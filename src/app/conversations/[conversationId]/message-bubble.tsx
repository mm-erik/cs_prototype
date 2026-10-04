import type { Message } from '@/conversation/types'

import { formatExactTime } from './format-time'
import { MessageContent } from './message-content'

/**
 * One Message, as a chat bubble.
 *
 * Authorship never rests on which side the bubble sits. Each bubble also carries a visible
 * author label and its own colour, because a Support Agent attributing a sentence to the
 * wrong party is the single worst failure this view can have, and side alone disappears the
 * moment the layout narrows.
 */
export function MessageBubble({ message }: { message: Message }) {
  const fromBot = message.author === 'bot'

  return (
    <li
      className={`group flex flex-col ${fromBot ? 'items-start' : 'items-end'}`}
      id={message.id}
    >
      <article
        className={[
          'flex min-w-0 flex-col gap-1 rounded-lg px-3 py-2',
          // The Bot answers with tables and code, so its bubble gets the generous width.
          fromBot ? 'max-w-[90%] bg-white ring-1 ring-slate-200' : 'max-w-[75%] bg-sky-700 text-white',
        ].join(' ')}
      >
        <header className="flex items-baseline gap-2">
          {/*
            `h3` because the Conversation header owns the page's `h1` (the Tenant name)
            and the Transcript region heading is the `h2` above these.
          */}
          <h3
            className={`text-xs font-semibold uppercase tracking-wide ${
              fromBot ? 'text-slate-500' : 'text-sky-100'
            }`}
          >
            {fromBot ? 'Bot' : 'End User'}
          </h3>

          {/*
            The exact time is in the markup but out of the way, so the Transcript stays
            scannable. It appears when a Support Agent hovers the Message or tabs to the
            permalink beside it, which is what makes it reachable without a mouse.
          */}
          <time
            className={`text-xs opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 ${
              fromBot ? 'text-slate-500' : 'text-sky-100'
            }`}
            dateTime={message.sentAt}
          >
            {formatExactTime(message.sentAt)}
          </time>

          {/*
            Every Message is addressable, so a Support Agent can point a colleague or a bug
            report at one specific Message rather than at the whole Transcript.
          */}
          <a
            aria-label={`Link to Message ${message.id}`}
            className={`text-xs opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 ${
              fromBot ? 'text-slate-400' : 'text-sky-100'
            }`}
            href={`#${message.id}`}
          >
            #
          </a>
        </header>

        <MessageContent content={message.content} />
      </article>
    </li>
  )
}
