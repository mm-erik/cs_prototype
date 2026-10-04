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

const UNMATCHED_ID = 'conv_00000000-0000-4000-8000-0000000000ff'

/** A fake store holding exactly the Conversations a test wants the Lookup to find. */
function storeHolding(...conversations: Conversation[]): ConversationStore {
  return {
    async findConversation(id) {
      return conversations.find((conversation) => conversation.id === id) ?? null
    },
  }
}

/** A fake store standing in for a data source that cannot be reached. */
function unreachableStore(): ConversationStore {
  return {
    async findConversation() {
      throw new Error('the data source could not be reached')
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
    const result = await lookupConversation(UNMATCHED_ID, storeHolding(SHORT_CONVERSATION))

    expect(result).toEqual({ kind: 'unknown', id: UNMATCHED_ID })
  })

  it('reports a Malformed Conversation ID when the input is not a Conversation ID at all', async () => {
    const result = await lookupConversation('TICKET-4821', storeHolding(SHORT_CONVERSATION))

    expect(result).toEqual({ kind: 'malformed', rawInput: 'TICKET-4821' })
  })

  it('reports the data source as unavailable when it cannot be reached', async () => {
    const result = await lookupConversation(SHORT_CONVERSATION.id, unreachableStore())

    expect(result).toEqual({ kind: 'unavailable' })
  })
})

describe('Recognising a Malformed Conversation ID', () => {
  it('reports a Malformed Conversation ID even while the data source is down', async () => {
    // Paste something that is not a Conversation ID while the data source is down, and
    // the answer is still "check what you pasted" rather than "the system is broken".
    // That is how a Support Agent observes that the shape is judged first.
    const result = await lookupConversation('not-an-id', unreachableStore())

    expect(result).toEqual({ kind: 'malformed', rawInput: 'not-an-id' })
  })

  it('reports a Malformed Conversation ID when the prefix is right but the UUID is not', async () => {
    const result = await lookupConversation('conv_12345', storeHolding(SHORT_CONVERSATION))

    expect(result).toEqual({ kind: 'malformed', rawInput: 'conv_12345' })
  })

  it('reports a Malformed Conversation ID when nothing was pasted at all', async () => {
    const result = await lookupConversation('   ', storeHolding(SHORT_CONVERSATION))

    expect(result).toEqual({ kind: 'malformed', rawInput: '   ' })
  })
})

describe('Forgiving how a Support Agent pastes a Conversation ID', () => {
  const lookUp = async (rawInput: string) =>
    lookupConversation(rawInput, storeHolding(SHORT_CONVERSATION))

  it('tolerates surrounding whitespace', async () => {
    const result = await lookUp(`  ${SHORT_CONVERSATION.id}\n`)

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('tolerates surrounding double quotes, as copied out of a JSON payload', async () => {
    const result = await lookUp(`"${SHORT_CONVERSATION.id}"`)

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('tolerates surrounding single quotes', async () => {
    const result = await lookUp(`'${SHORT_CONVERSATION.id}'`)

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('tolerates quotes and whitespace together', async () => {
    const result = await lookUp(`  "${SHORT_CONVERSATION.id}"  `)

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('accepts a full URL to this tool, as sent by a colleague', async () => {
    const result = await lookUp(
      `https://viewer.example.com/conversations/${SHORT_CONVERSATION.id}`,
    )

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('accepts a URL with a trailing slash', async () => {
    const result = await lookUp(
      `https://viewer.example.com/conversations/${SHORT_CONVERSATION.id}/`,
    )

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('accepts a URL carrying parameters and a fragment', async () => {
    const result = await lookUp(
      `https://viewer.example.com/conversations/${SHORT_CONVERSATION.id}?from=ticket#top`,
    )

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('tolerates a Conversation ID printed in upper case, as many databases do', async () => {
    const result = await lookUp(SHORT_CONVERSATION.id.toUpperCase())

    expect(result).toEqual({ kind: 'found', conversation: SHORT_CONVERSATION })
  })

  it('still reports an Unknown Conversation when a dirty paste cleans up to an ID that matches nothing', async () => {
    const result = await lookUp(`  "${UNMATCHED_ID}"  `)

    expect(result).toEqual({ kind: 'unknown', id: UNMATCHED_ID })
  })
})

describe('Conversations that are normal rather than failures', () => {
  it('returns an Empty Conversation as found, because the End User simply said nothing', async () => {
    const emptyConversation: Conversation = {
      ...SHORT_CONVERSATION,
      id: 'conv_00000000-0000-4000-8000-00000000000b',
      messages: [],
    }

    const result = await lookupConversation(
      emptyConversation.id,
      storeHolding(emptyConversation),
    )

    expect(result).toEqual({ kind: 'found', conversation: emptyConversation })
  })

  it('returns an In-Progress Conversation as found, because more Messages may still follow', async () => {
    const inProgressConversation: Conversation = {
      ...SHORT_CONVERSATION,
      id: 'conv_00000000-0000-4000-8000-00000000000c',
      endedAt: null,
      status: 'in_progress',
    }

    const result = await lookupConversation(
      inProgressConversation.id,
      storeHolding(inProgressConversation),
    )

    expect(result).toEqual({ kind: 'found', conversation: inProgressConversation })
  })
})
