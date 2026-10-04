/**
 * Rendered in UTC and labelled as such.
 *
 * A Support Agent is checking a Conversation against the time window a ticket describes,
 * so an unambiguous reading beats a local one — and a fixed zone means the server and the
 * browser cannot disagree about what to print.
 */
export function formatExactTime(isoTimestamp: string): string {
  const at = new Date(isoTimestamp)

  // A store that hands over something unparseable should not turn the page into a row of
  // NaNs. Showing the value as given is both more honest and more debuggable.
  if (Number.isNaN(at.getTime())) {
    return isoTimestamp
  }

  const pad = (value: number) => String(value).padStart(2, '0')

  const date = `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`
  const time = `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}:${pad(at.getUTCSeconds())}`

  return `${date} ${time} UTC`
}
