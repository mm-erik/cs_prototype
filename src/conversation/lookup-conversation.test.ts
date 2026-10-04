import { describe, expect, it } from 'vitest'

import type { ConversationStore } from './conversation-store'
import { lookupConversation } from './lookup-conversation'
import type { Conversation } from './types'

const SHORT_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-00000000000a',
  tenant: { id: 'tenant_northwind', name: 'Northwind Supplies' },
  startedAt: '2026-02-11T09:14:00.000Z',
  endedAt: '2026-02-11T09:15:30.000Z',
  status: 'ended',
  messages: [
    {
      id: 'msg_0001',
      author: 'end_user',
      content: 'Where is my order?',
      sentAt: '2026-02-11T09:14:00.000Z',
    },
    {
      id: 'msg_0002',
      author: 'bot',
      content: 'It shipped this morning.',
      sentAt: '2026-02-11T09:15:30.000Z',
    },
  ],
}

/** A fake store holding exactly the Conversations a test wants the Lookup to find. */
function storeHolding(...conversations: Conversation[]): ConversationStore {
  return {
    async findConversation(id) {
      return conversations.find((conversation) => conversation.id === id) ?? null
    },
  }
}

describe('Looking up a Conversation', () => {
  it('finds the Conversation whose Conversation ID was given', async () => {
    const result = await lookupConversation(
      SHORT_CONVERSATION.id,
      storeHolding(SHORT_CONVERSATION),
    )

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('reports an Unknown Conversation when a well-formed Conversation ID matches nothing', async () => {
    const unmatched = 'conv_00000000-0000-4000-8000-0000000000ff'

    const result = await lookupConversation(unmatched, storeHolding(SHORT_CONVERSATION))

    expect(result).toEqual({ kind: 'unknown', id: unmatched })
  })
})
