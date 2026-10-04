import type { ConversationStore } from './conversation-store'
import type { Conversation, ConversationId } from './types'

/**
 * Every Lookup outcome a Support Agent can reach.
 *
 * Later tickets add `malformed`, for input that is not a Conversation ID at all, and
 * `unavailable`, for a store that cannot be reached. They belong in this one union because
 * a Support Agent does not distinguish a bad paste from a missing Conversation.
 */
export type LookupResult =
  | { kind: 'found'; conversation: Conversation }
  | { kind: 'unknown'; id: ConversationId }

/**
 * The single public operation of this application, and the only module with tests.
 *
 * The store arrives as a parameter rather than a module-level import so that a test can
 * substitute a fake and drive this function into any outcome without patching modules.
 *
 * Tolerant parsing of `rawInput` lands here in a later ticket; for now the input is taken
 * as the Conversation ID as typed.
 */
export async function lookupConversation(
  rawInput: string,
  store: ConversationStore,
): Promise<LookupResult> {
  const id: ConversationId = rawInput

  const conversation = await store.findConversation(id)

  if (conversation === null) {
    return { kind: 'unknown', id }
  }

  return { kind: 'found', conversation }
}
