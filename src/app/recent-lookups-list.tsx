'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { RecentLookup } from '@/conversation/recent-lookups'
import { readRecentLookups } from '@/conversation/recent-lookups-storage'

/**
 * The Conversations this Support Agent reached, most recent first.
 *
 * A personal back-button, not the browse list this project rejected during design: it
 * holds only what this person looked up, in this browser, and it exists because bouncing
 * between the two Conversations a ticket refers to otherwise means re-pasting each time.
 *
 * Read after mount rather than during render, because local storage does not exist on the
 * server. Anything else would be a hydration mismatch — and it is also what keeps the list
 * out of the server-rendered HTML, which is what "visible to nobody else" requires.
 */
export function RecentLookupsList() {
  const [recent, setRecent] = useState<RecentLookup[] | null>(null)

  useEffect(() => {
    setRecent(readRecentLookups())
  }, [])

  // Before the first read there is nothing truthful to show, and an empty list is the
  // ordinary state on a first visit rather than something to apologise for.
  if (recent === null || recent.length === 0) return null

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Recent Lookups</h2>
        <p className="text-xs text-slate-600">
          Yours alone, kept in this browser. Nobody else can see this list.
        </p>
      </div>

      <ul className="space-y-1">
        {recent.map((lookup) => (
          <li key={lookup.id}>
            <Link
              className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"
              href={`/conversations/${encodeURIComponent(lookup.id)}`}
            >
              <span className="text-xs font-medium text-sky-800 underline underline-offset-2">
                {lookup.tenantName}
              </span>
              <span className="font-mono text-xs break-all text-slate-500">{lookup.id}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
