import type { ConversationStore } from './conversation-store'
import type { Conversation, ConversationId } from './types'

/**
 * Every Lookup outcome a Support Agent can reach.
 *
 * All four live in one union because a Support Agent does not distinguish a bad paste from
 * a Conversation that does not exist: both are simply "I did not get a Transcript".
 * `malformed` and
 * `unknown` stay separate because they need opposite instructions — check what you pasted,
 * versus this Conversation does not exist.
 *
 * Note what is deliberately absent. An Empty Conversation is a `found` result whose
 * Transcript has no Messages, and an In-Progress Conversation is a `found` result with a
 * status. Both are normal End User behaviour, not failures.
 */
export type LookupResult =
  | { kind: 'found'; conversation: Conversation }
  | { kind: 'malformed'; rawInput: string }
  | { kind: 'unknown'; id: ConversationId }
  | { kind: 'unavailable' }

/** A `conv_` prefix followed by a UUID. */
const CONVERSATION_ID_PATTERN =
  /^conv_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const SURROUNDING_QUOTES = ['"', "'", '`']

/**
 * The single public operation of this application, and the only module with tests.
 *
 * The store arrives as a parameter rather than a module-level import so that a test can
 * substitute a fake and drive this function into any outcome without patching modules.
 */
export async function lookupConversation(
  rawInput: string,
  store: ConversationStore,
): Promise<LookupResult> {
  const id = readConversationId(rawInput)

  // A Malformed Conversation ID is detectable from its shape alone, so the store is never
  // consulted for one. A Support Agent who pastes a ticket number while the data source is
  // down is told to check their clipboard, not to escalate.
  if (id === null) {
    return { kind: 'malformed', rawInput }
  }

  let conversation: Conversation | null
  try {
    conversation = await store.findConversation(id)
  } catch {
    // The data source could not be reached. This is a system fault, and distinct from a
    // Conversation that does not exist.
    return { kind: 'unavailable' }
  }

  if (conversation === null) {
    return { kind: 'unknown', id }
  }

  return { kind: 'found', conversation }
}

/**
 * Tolerant parsing, deliberately private.
 *
 * Support Agents copy Conversation IDs out of tickets, logs and chat messages, and that
 * copy arrives dirty. This lives inside the seam rather than beside it, because a Support
 * Agent does not experience "that is not parseable" and "that is not findable" as two
 * different events.
 *
 * Returns null when what was pasted is not a Conversation ID in any form.
 */
function readConversationId(rawInput: string): ConversationId | null {
  let candidate = withoutQueryOrFragment(stripSurroundingQuotes(rawInput.trim()).trim())

  // A colleague sends a link rather than an ID. Any host will do: the Conversation ID it
  // names still has to pass the check below.
  if (candidate.includes('/')) {
    candidate = lastPathSegment(candidate)
  }

  candidate = decodePercentEscapes(candidate)

  // A UUID is case-insensitive, and plenty of databases and log viewers print one in upper
  // case. Canonicalising here is what stops an upper-case paste of a Conversation that
  // exists being reported as an Unknown Conversation, which would send a Support Agent
  // hunting for something that is sitting right there.
  const canonical = candidate.toLowerCase()

  return CONVERSATION_ID_PATTERN.test(canonical) ? canonical : null
}

function stripSurroundingQuotes(value: string): string {
  const first = value.at(0)

  if (first === undefined || !SURROUNDING_QUOTES.includes(first)) return value
  if (value.length < 2 || !value.endsWith(first)) return value

  return value.slice(1, -1)
}

function withoutQueryOrFragment(value: string): string {
  return value.split(/[?#]/)[0] ?? ''
}

function lastPathSegment(value: string): string {
  const segments = value.split('/').filter((segment) => segment !== '')

  return segments.at(-1) ?? ''
}

function decodePercentEscapes(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    // An invalid percent escape is not a Conversation ID, and the check above will say so.
    return value
  }
}
