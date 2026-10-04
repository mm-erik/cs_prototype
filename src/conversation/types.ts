/**
 * The identifier a Support Agent is given and types into this tool: a `conv_` prefix
 * followed by a UUID. It stays a plain string: the only thing that produces one is
 * `lookupConversation`, which validates the shape before any store is consulted, so a
 * branded type would add ceremony without adding a guarantee.
 */
export type ConversationId = string

/** The customer organisation whose chatbot the End User talked to. */
export interface Tenant {
  id: string
  name: string
}

/** Who authored a Message. A Transcript has exactly these two parties. */
export type MessageAuthor = 'end_user' | 'bot'

/** A single contribution to a Transcript. */
export interface Message {
  id: string
  author: MessageAuthor
  /** Markdown source, rendered through a single isolated component. */
  content: string
  /** ISO 8601 timestamp. */
  sentAt: string
}

/** Whether the End User and the Bot are still adding to a Conversation. */
export type ConversationStatus = 'ended' | 'in_progress'

/** One complete chat exchange between an End User and the Bot. */
export interface Conversation {
  id: ConversationId
  tenant: Tenant
  /** ISO 8601 timestamp. */
  startedAt: string
  /** ISO 8601 timestamp, or null while the Conversation is still In-Progress. */
  endedAt: string | null
  status: ConversationStatus
  /** The Transcript: Messages in the order they were sent. */
  messages: Message[]
}
