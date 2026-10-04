'use client'

import { useEffect, useState } from 'react'

/** How long the confirmation stays on screen before the action offers itself again. */
const CONFIRMATION_MILLISECONDS = 2500

type Outcome = { kind: 'copied' | 'failed'; attempt: number }

/**
 * Puts the whole Transcript on the clipboard in one action.
 *
 * A Client Component because the Clipboard API needs one. It receives the already
 * formatted text rather than the Conversation, which keeps the formatting server-side and
 * leaves this component holding nothing but the copy and its confirmation. The cost is
 * that the Transcript travels to the browser twice, once rendered and once as the
 * clipboard text; shipping the formatter to the client instead would be the worse trade.
 *
 * A failed copy says so. A Support Agent who believes they copied and then pastes nothing
 * into a ticket is worse off than one who is told it did not work.
 */
export function CopyTranscriptButton({ transcript }: { transcript: string }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const nothingToCopy = transcript === ''

  // Keyed on the attempt number, not just the kind, so that copying twice in quick
  // succession restarts the countdown instead of letting the first copy's timer cut the
  // second confirmation short.
  useEffect(() => {
    if (outcome === null) return

    const timer = setTimeout(() => setOutcome(null), CONFIRMATION_MILLISECONDS)

    return () => clearTimeout(timer)
  }, [outcome])

  if (nothingToCopy) {
    // A disabled button cannot be focused, so a tooltip on it never reaches a Support
    // Agent using a keyboard or a screen reader. The reason is plain text instead.
    return (
      <p className="text-xs text-slate-500">Nothing to copy — this Conversation has no Messages</p>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(transcript)
            setOutcome((previous) => ({ kind: 'copied', attempt: (previous?.attempt ?? 0) + 1 }))
          } catch {
            setOutcome((previous) => ({ kind: 'failed', attempt: (previous?.attempt ?? 0) + 1 }))
          }
        }}
        type="button"
      >
        Copy Transcript
      </button>

      {/*
        Announced rather than only shown, so the confirmation reaches a Support Agent who
        is not watching this corner of the screen.
      */}
      <span aria-live="polite" className="text-xs text-slate-600">
        {outcome?.kind === 'copied' ? 'Copied, with author labels' : null}
        {outcome?.kind === 'failed' ? 'Copy failed — nothing was put on the clipboard' : null}
      </span>
    </div>
  )
}
