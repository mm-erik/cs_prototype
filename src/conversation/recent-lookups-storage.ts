import {
  MOST_RECENT_LOOKUPS_KEPT,
  rememberLookup,
  type RecentLookup,
} from './recent-lookups'

/**
 * Where this browser keeps the Support Agent's own recent Lookups.
 *
 * Local storage, deliberately: the list is personal and must stay in this browser, visible
 * to nobody else. Nothing here is ever sent anywhere.
 */
const STORAGE_KEY = 'cs_prototype.recent_lookups'

/**
 * Reads the list, treating anything unreadable as no list at all.
 *
 * A stale or hand-edited key should never leave a Support Agent facing a broken landing
 * screen. Losing a convenience list is the right trade against throwing.
 */
export function readRecentLookups(): RecentLookup[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return []

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    // Capped on the way out as well as on the way in. The cap is what keeps this a
    // personal back-button rather than the browse list this project rejected, and a key
    // written by an older version or edited by hand must not be able to defeat it.
    return parsed.filter(isRecentLookup).slice(0, MOST_RECENT_LOOKUPS_KEPT)
  } catch {
    return []
  }
}

/** Records a Lookup that found a Conversation. Failures are never passed here. */
export function writeRecentLookup(lookup: RecentLookup): void {
  try {
    const updated = rememberLookup(readRecentLookups(), lookup)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Local storage can be full or disabled outright. A Support Agent losing their recent
    // list is a far smaller problem than a Transcript page that throws, so this is quiet.
  }
}

/**
 * A shape check, not the authoritative parser — that lives in the seam. It only has to be
 * strict enough that a junk entry cannot become a link straight into the Malformed
 * Conversation ID state, which would be a confusing thing to find in your own history.
 */
function isRecentLookup(value: unknown): value is RecentLookup {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Partial<RecentLookup>

  return (
    typeof candidate.id === 'string' &&
    candidate.id.startsWith('conv_') &&
    typeof candidate.tenantName === 'string' &&
    candidate.tenantName !== ''
  )
}
