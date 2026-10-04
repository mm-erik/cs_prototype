/**
 * The marker between two Messages separated by a long pause.
 *
 * This answers one of the few questions a bare Transcript can actually answer: did the End
 * User walk away and come back, or was this one continuous exchange?
 *
 * It stays an ordinary list item rather than taking `role="separator"`. The pause is
 * information a Support Agent wants read out, not a decorative divider, and an `ol` is
 * meant to contain list items.
 */
export function GapMarker({ minutes }: { minutes: number }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs text-slate-500">{describeGap(minutes)}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </li>
  )
}

/**
 * Rounds down at every step, and works from the original minutes rather than from an
 * already-rounded figure. Rounding up would let the marker claim more time passed than
 * actually did, and rounding twice compounded it: 23 hours 40 minutes became "a day later".
 */
function describeGap(minutes: number): string {
  if (minutes < 60) {
    return minutes === 1 ? 'a minute later' : `${minutes} minutes later`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? 'an hour later' : `${hours} hours later`
  }

  const days = Math.floor(hours / 24)
  return days === 1 ? 'a day later' : `${days} days later`
}
