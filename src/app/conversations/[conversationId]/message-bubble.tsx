import type { Message } from '@/conversation/types'

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
          <h2
            className={`text-xs font-semibold uppercase tracking-wide ${
              fromBot ? 'text-slate-500' : 'text-sky-100'
            }`}
          >
            {fromBot ? 'Bot' : 'End User'}
          </h2>

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

/**
 * Rendered in UTC and labelled as such. A Support Agent is checking a Transcript against
 * the time window in a ticket, so an unambiguous reading beats a local one — and a fixed
 * zone means the server and the browser cannot disagree.
 */
function formatExactTime(sentAt: string): string {
  const at = new Date(sentAt)

  // A store that hands over something unparseable should not turn the Transcript into a
  // row of NaNs. Showing the value as given is both more honest and more debuggable.
  if (Number.isNaN(at.getTime())) {
    return sentAt
  }

  const pad = (value: number) => String(value).padStart(2, '0')

  const date = `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`
  const time = `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}:${pad(at.getUTCSeconds())}`

  return `${date} ${time} UTC`
}
