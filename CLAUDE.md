# cs_prototype

A read-only internal viewer for SaaS chatbot Conversations. A Support Agent is handed a
Conversation ID, pastes it in, and reads the Transcript. Mock data for now, behind one
swappable interface.

## Read first

- `CONTEXT.md` — the domain glossary. Use these terms in prose, identifiers, types and test
  names. The vocabulary is the design; matching it keeps the code navigable.
- `docs/spec-conversation-viewer.md` — the full spec: problem, user stories, and every
  decision below with its reasoning. Read the sections that bear on your ticket.

Work is tracked as GitHub issues labelled `ready-for-agent`. Each issue states what it
delivers, what is already built when you start, and what later issues will add.

## Vocabulary that bites

Write **Bot** for the chatbot and **Support Agent** for the human using this tool. The
unqualified word "agent" means the Bot to one half of the industry and the human to the
other, so this project always qualifies it.

## The one seam

```
lookupConversation(rawInput: string): Promise<LookupResult>

LookupResult =
  | { kind: 'found';       conversation: Conversation }
  | { kind: 'malformed';   rawInput: string }
  | { kind: 'unknown';     id: ConversationId }
  | { kind: 'unavailable' }
```

Every Lookup outcome a Support Agent can reach comes from this one function, and it is the
only module with tests. Tolerant parsing lives inside it: a Support Agent does not
distinguish a bad paste from a missing Conversation, so the outcomes belong in one union.

`ConversationStore` is the **swap point**, not the test seam. It is an interface, injected
into `lookupConversation`, with a mock implementation today and a database implementation
later. Tests substitute a fake store to drive the seam into every outcome.

Keep these two roles apart: one interface to swap, one function to test.

## Settled decisions

These came out of a design session. They are closed; implement them rather than reopening
them. The reasoning for each is in the spec.

- **Scope is Lookup by Conversation ID, and nothing else.** One ID in, one Transcript out.
- **Read-only.** A Support Agent reads a Transcript and copies it.
- **Two parties.** A Transcript contains End User Messages and Bot Messages. Tool calls,
  retrieval steps and human takeover are outside the model, so this tool answers "what did
  the Bot say" and leaves "why did it say that" to something else.
- **Verbatim rendering.** Transcripts show exactly what was typed, including anything that
  looks sensitive. Redaction belongs where the data is read, so that every consumer of the
  database benefits rather than this one viewer creating false confidence.
- **Chat bubbles**, End User and Bot on opposite sides.
- **Conversation IDs** are a `conv_` prefix followed by a UUID, which makes a Malformed
  Conversation ID detectable before the store is consulted.
- **No authentication**, and layouts should leave room for a Support Agent identity later.
- **Markdown content** renders through one isolated component, so the content format is a
  single-file change.

Decided against, so that it stays decided: search or browsing, any write action, user
interface tests, and pagination for long Transcripts.

## Testing

Vitest. Tests target `lookupConversation` driven by a fake `ConversationStore`, and assert
behaviour a Support Agent could observe, named in glossary vocabulary. The user interface is
deliberately untested: it is disposable, and the seam is the part meant to outlive the
prototype. These tests double as the specification the real database-backed
`ConversationStore` must satisfy.

## This repository is public

Fixtures use obviously synthetic values. Real Transcript data never lands here.
