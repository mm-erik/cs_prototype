import { describe, expect, it } from 'vitest'

import { transcriptForClipboard } from './transcript-for-clipboard'
import type { Conversation } from './types'

const CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-00000000000a',
  tenant: { id: 'tenant_northwind', name: 'Northwind Supplies' },
  startedAt: '2026-02-11T09:14:00.000Z',
  endedAt: '2026-02-11T09:16:00.000Z',
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
      sentAt: '2026-02-11T09:15:00.000Z',
    },
    {
      id: 'msg_0003',
      author: 'end_user',
      content: 'Thank you.',
      sentAt: '2026-02-11T09:16:00.000Z',
    },
  ],
}

describe('Copying a Transcript', () => {
  it('keeps the End User and the Bot distinguishable outside this tool', () => {
    const copied = transcriptForClipboard(CONVERSATION)

    expect(copied).toContain('End User')
    expect(copied).toContain('Bot')
  })

  it('attributes every Message, so none can be misread as the other party', () => {
    const copied = transcriptForClipboard(CONVERSATION)

    // Counted on the label words rather than on the bold syntax around them, so that
    // changing how a label is marked up does not fail a test about attribution.
    expect(copied.match(/End User/g)).toHaveLength(2)
    expect(copied.match(/Bot/g)).toHaveLength(1)
  })

  it('separates Messages, so a Bot answer containing bold text cannot read as a label', () => {
    const boldInsideAMessage: Conversation = {
      ...CONVERSATION,
      messages: [
        {
          id: 'msg_0001',
          author: 'bot',
          content: 'The **Bot** field in the payload is unrelated to this.',
          sentAt: '2026-02-11T09:14:00.000Z',
        },
        {
          id: 'msg_0002',
          author: 'end_user',
          content: 'Understood.',
          sentAt: '2026-02-11T09:15:00.000Z',
        },
      ],
    }

    const copied = transcriptForClipboard(boldInsideAMessage)

    expect(copied).toContain('\n\n---\n\n')
  })

  it('preserves the order the Messages were sent in', () => {
    const copied = transcriptForClipboard(CONVERSATION)

    expect(copied.indexOf('Where is my order?')).toBeLessThan(
      copied.indexOf('It shipped this morning.'),
    )
    expect(copied.indexOf('It shipped this morning.')).toBeLessThan(
      copied.indexOf('Thank you.'),
    )
  })

  it('copies the Markdown source of a Bot Message rather than rendered text', () => {
    const withMarkdown: Conversation = {
      ...CONVERSATION,
      messages: [
        {
          id: 'msg_0001',
          author: 'bot',
          content: '| Plan | Price |\n| ---- | ----- |\n| Growth | 40 |\n\n**Note:** see [docs](https://example.com).',
          sentAt: '2026-02-11T09:14:00.000Z',
        },
      ],
    }

    const copied = transcriptForClipboard(withMarkdown)

    expect(copied).toContain('| Plan | Price |')
    expect(copied).toContain('[docs](https://example.com)')
    expect(copied).toContain('**Note:**')
  })

  it('copies what an End User typed verbatim, including anything that looks sensitive', () => {
    const withSensitiveLookingPaste: Conversation = {
      ...CONVERSATION,
      messages: [
        {
          id: 'msg_0001',
          author: 'end_user',
          content: 'My test card is 4111 1111 1111 1111 and it keeps failing.',
          sentAt: '2026-02-11T09:14:00.000Z',
        },
      ],
    }

    const copied = transcriptForClipboard(withSensitiveLookingPaste)

    expect(copied).toContain('4111 1111 1111 1111')
  })

  it('copies an Empty Conversation as nothing at all, rather than failing', () => {
    const emptyConversation: Conversation = { ...CONVERSATION, messages: [] }

    expect(transcriptForClipboard(emptyConversation)).toBe('')
  })
})
