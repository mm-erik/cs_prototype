import type { Conversation, ConversationId } from './types'

/**
 * The swap point, not the test seam.
 *
 * This is the single place the data source is bound. A mock implementation backs the
 * prototype and a database implementation replaces it later, without the user interface
 * noticing. It is injected into `lookupConversation` rather than imported by it, which is
 * what lets tests substitute a fake and drive the seam into any outcome.
 */
export interface ConversationStore {
  /** Resolves to the Conversation with this Conversation ID, or null if none matches. */
  findConversation(id: ConversationId): Promise<Conversation | null>
}
