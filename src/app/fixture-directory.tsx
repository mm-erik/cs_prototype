import Link from 'next/link'

import {
  FIXTURE_DIRECTORY,
  MALFORMED_EXAMPLE,
  type FixtureEntry,
} from '@/conversation/mock-conversation-store'

/**
 * The "try these" list: every state of this application, reachable by clicking.
 *
 * Without it, reaching anything at all requires knowing a Conversation ID, which means
 * reading the source. This is what makes the prototype demoable by someone who did not
 * build it.
 *
 * It describes mock data, so it disappears when a real `ConversationStore` arrives.
 */
export function FixtureDirectory() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Try these</h2>
        <p className="text-xs text-slate-600">
          Every state this prototype can reach, one per row. All mock data, and every value
          in it is synthetic.
        </p>
      </div>

      <ul className="space-y-1">
        {FIXTURE_DIRECTORY.map((entry) => (
          <FixtureRow entry={entry} key={entry.input} />
        ))}
      </ul>

      <div>
        <h3 className="text-xs font-semibold tracking-tight text-slate-700">
          Not a Conversation ID
        </h3>
        <ul className="mt-1">
          <FixtureRow entry={MALFORMED_EXAMPLE} />
        </ul>
      </div>
    </section>
  )
}

function FixtureRow({ entry }: { entry: FixtureEntry }) {
  return (
    <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <Link
        className="font-mono text-xs break-all text-sky-800 underline underline-offset-2"
        href={`/conversations/${encodeURIComponent(entry.input)}`}
      >
        {entry.input}
      </Link>
      <span className="text-xs text-slate-600">{entry.demonstrates}</span>
    </li>
  )
}
