import type { ConversationId } from './types'

/**
 * Enough to bounce between the Conversations one ticket refers to, and few enough that the
 * list stays scannable. A longer list would start to look like the browse list this
 * project explicitly rejected.
 */
export const MOST_RECENT_LOOKUPS_KEPT = 5

/**
 * One Conversation a Support Agent reached.
 *
 * The Tenant name is kept alongside the Conversation ID because the IDs differ only in
 * their last characters, and a column of near-identical UUIDs would be unreadable — which
 * would defeat a list whose entire purpose is saving a re-paste.
 */
export interface RecentLookup {
  id: ConversationId
  tenantName: string
}

/**
 * The Support Agent's own back-button, not a browse list.
 *
 * It holds only Conversations this person actually reached, in this browser, and it exists
 * because bouncing between two Conversations otherwise means re-pasting from the ticket
 * every time. Only a Lookup that found a Conversation is ever passed here: recording
 * failures would fill the list with typos and defeat the purpose.
 *
 * Pure, so the caller owns where the list is stored.
 */
export function rememberLookup(
  existing: readonly RecentLookup[],
  lookup: RecentLookup,
): RecentLookup[] {
  // Looking the same Conversation up again moves it to the front rather than listing it
  // twice, and takes the Tenant name from the newer Lookup in case it has been renamed.
  const withoutThisConversation = existing.filter((entry) => entry.id !== lookup.id)

  return [lookup, ...withoutThisConversation].slice(0, MOST_RECENT_LOOKUPS_KEPT)
}
