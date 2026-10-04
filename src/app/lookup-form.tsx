'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * The Lookup input. Submitting by Enter or by the button both navigate to the Conversation
 * route, where the Lookup itself runs server-side.
 *
 * Tolerant parsing of what a Support Agent pastes belongs to a later ticket, as does the
 * list of recent Lookups.
 */
export function LookupForm() {
  const router = useRouter()
  const [rawInput, setRawInput] = useState('')

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (rawInput === '') return
        router.push(`/conversations/${encodeURIComponent(rawInput)}`)
      }}
    >
      <label className="sr-only" htmlFor="conversation-id">
        Conversation ID
      </label>
      <input
        autoFocus
        className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm"
        id="conversation-id"
        name="conversationId"
        onChange={(event) => setRawInput(event.target.value)}
        placeholder="conv_…"
        value={rawInput}
      />
      <button
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        type="submit"
      >
        Look up
      </button>
    </form>
  )
}
