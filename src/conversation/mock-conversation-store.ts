import type { ConversationStore } from './conversation-store'
import type { Conversation } from './types'

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
 */
export function createMockConversationStore(): ConversationStore {
  return {
    async findConversation(id) {
      return CONVERSATIONS.find((conversation) => conversation.id === id) ?? null
    },
  }
}
