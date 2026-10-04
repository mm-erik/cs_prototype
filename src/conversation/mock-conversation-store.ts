import type { ConversationStore } from './conversation-store'
import type { Conversation } from './types'

/**
 * Reserved Conversation IDs, which no Conversation will ever occupy.
 *
 * They exist so that a Support Agent, or whoever demonstrates this tool, can reach every
 * failure state by pasting an ID rather than by editing code. The fixture directory ticket
 * lists these on screen; until then they are documented in `README.md`.
 */
export const RESERVED_UNKNOWN_CONVERSATION_ID =
  'conv_00000000-0000-4000-8000-0000000000ff'
export const RESERVED_UNAVAILABLE_CONVERSATION_ID =
  'conv_00000000-0000-4000-8000-0000000000fe'

/**
 * The one Conversation the prototype can find today: a short, ordinary exchange.
 *
 * This repository is public, so every value here is obviously synthetic. Later tickets add
 * the rest of the curated set — an Empty Conversation, an In-Progress one, a long one, and
 * a Markdown-heavy one.
 */
export const SHORT_HAPPY_PATH_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000001',
  tenant: { id: 'tenant_00000001', name: 'Example Tenant' },
  startedAt: '2026-03-02T10:00:00.000Z',
  endedAt: '2026-03-02T10:02:40.000Z',
  status: 'ended',
  messages: [
    {
      id: 'msg_00000001',
      author: 'end_user',
      content: 'Hello, I cannot sign in to my account.',
      sentAt: '2026-03-02T10:00:00.000Z',
    },
    {
      id: 'msg_00000002',
      author: 'bot',
      content:
        'Sorry about that. Can you tell me whether you see an error message when you try?',
      sentAt: '2026-03-02T10:00:20.000Z',
    },
    {
      id: 'msg_00000003',
      author: 'end_user',
      content: 'It says my password is wrong, but I am sure it is right.',
      sentAt: '2026-03-02T10:01:15.000Z',
    },
    {
      id: 'msg_00000004',
      author: 'bot',
      content:
        'I have sent a password reset link to the address on your account. It expires in one hour.',
      sentAt: '2026-03-02T10:02:00.000Z',
    },
    {
      id: 'msg_00000005',
      author: 'end_user',
      content: 'Got it, that worked. Thank you.',
      sentAt: '2026-03-02T10:02:40.000Z',
    },
  ],
}

const CONVERSATIONS: readonly Conversation[] = [SHORT_HAPPY_PATH_CONVERSATION]

/**
 * The mock implementation of the swap point. A database-backed `ConversationStore`
 * replaces this later and nothing else has to change.
 *
 * Asking for the reserved unavailable Conversation ID throws, which is how a real store
 * will behave when the database cannot be reached. Asking for the reserved unknown one
 * simply finds nothing, because no Conversation holds it.
 */
export function createMockConversationStore(): ConversationStore {
  return {
    async findConversation(id) {
      if (id === RESERVED_UNAVAILABLE_CONVERSATION_ID) {
        throw new Error('the mock data source is pretending to be unreachable')
      }

      // Reserved, so the reservation is enforced here rather than merely documented: no
      // Conversation added later can accidentally occupy it and break the Unknown case.
      if (id === RESERVED_UNKNOWN_CONVERSATION_ID) {
        return null
      }

      return CONVERSATIONS.find((conversation) => conversation.id === id) ?? null
    },
  }
}
