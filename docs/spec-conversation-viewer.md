# Spec: Support Conversation Viewer

## Problem Statement

When a Tenant reports that something went wrong in a chat with the Bot, the report reaches
the customer support team as a Conversation ID and nothing else. Today a Support Agent has
no way to turn that ID into the actual Transcript. They have to ask an engineer to query the
database by hand, paste the result into a ticket, and wait. Every support question that
begins "what did the Bot actually say?" is blocked on engineering availability, and the
answer arrives as a raw database dump that is hard to read and easy to misattribute between
the End User and the Bot.

## Solution

A small internal web application whose entire job is Lookup: a Support Agent pastes a
Conversation ID and immediately reads the Transcript, rendered the way the End User saw it.

The Conversation ID is the only way in. There is no search, no browse list, and no account
to log into. Looking up a Conversation puts it at its own URL, so a Support Agent can paste
a link into a ticket instead of an ID plus instructions. The tool is strictly read-only: a
Support Agent reads a Transcript and copies it, and can change nothing.

The first version runs entirely on mock data behind a single swappable interface, so the
display model can be proven before any database work happens.

## User Stories

### Looking a Conversation up

1. As a Support Agent, I want to paste a Conversation ID into a single obvious input, so that I can reach a Transcript without learning a query language.
2. As a Support Agent, I want the input focused the moment the page loads, so that I can paste and press Enter without touching the mouse.
3. As a Support Agent, I want to submit with Enter or with a visible button, so that the tool fits whichever habit I have.
4. As a Support Agent, I want leading and trailing whitespace stripped from what I paste, so that a sloppy copy out of a ticket still works.
5. As a Support Agent, I want surrounding quotes stripped from what I paste, so that an ID copied out of a JSON payload or a log line still works.
6. As a Support Agent, I want a full URL to this tool to be accepted in the input, so that pasting a link a colleague sent me behaves the same as pasting an ID.
7. As a Support Agent, I want to be told that what I pasted is not a Conversation ID at all, so that I check my clipboard rather than concluding the Conversation was deleted.
8. As a Support Agent, I want a well-formed ID that matches nothing to say so explicitly, so that I can tell "this Conversation does not exist" apart from "you pasted the wrong thing".
9. As a Support Agent, I want the last few Conversation IDs I looked up to be offered back to me, so that bouncing between two Conversations does not mean re-pasting from the ticket each time.
10. As a Support Agent, I want my recent Lookups to be mine alone and to survive a page reload, so that the list reflects my work without exposing it to anyone else.

### Reading a Transcript

11. As a Support Agent, I want the Transcript shown as a chat, so that it matches what the End User experienced and I can read it without translation.
12. As a Support Agent, I want End User Messages and Bot Messages to be unmistakably distinguished, so that I never attribute a sentence to the wrong party.
13. As a Support Agent, I want Bot Messages rendered with their formatting applied, so that I see the lists, tables, links and code the End User saw rather than raw markup.
14. As a Support Agent, I want a Bot Message containing a wide table or a code block to stay readable, so that the most information-dense answers are not the ones I cannot read.
15. As a Support Agent, I want Messages in the order they were sent, so that I can follow cause and effect.
16. As a Support Agent, I want the exact time of any Message available on demand rather than cluttering every line, so that the Transcript stays scannable but precise when I need it.
17. As a Support Agent, I want a visible marker when a long pause separates two Messages, so that I can tell a continuous exchange from one the End User abandoned and returned to.
18. As a Support Agent, I want every Message to carry its own identifier, so that I can point a colleague or a bug report at one specific Message.
19. As a Support Agent, I want the Transcript shown verbatim, so that I can trust that what I read is exactly what was said.
20. As a Support Agent, I want to copy the whole Transcript in one action, so that I can paste it into a ticket without a manual selection that loses the author labels.
21. As a Support Agent, I want the copied Transcript to keep its author labels, so that it is still unambiguous once it is out of this tool.

### Confirming I have the right Conversation

22. As a Support Agent, I want the Conversation ID shown on the page I am reading, so that I can confirm it against the ticket at a glance.
23. As a Support Agent, I want to see which Tenant a Conversation belongs to, so that a mistyped ID that happens to resolve does not silently show me an unrelated Tenant's chat.
24. As a Support Agent, I want the Tenant's name rather than an internal identifier, so that the check against the ticket takes no lookup of its own.
25. As a Support Agent, I want to see when the Conversation started, so that I can confirm it against the time window the report describes.
26. As a Support Agent, I want to see how many Messages a Conversation contains, so that I know whether I am about to read three lines or three hundred.

### Edge states

27. As a Support Agent, I want an In-Progress Conversation to be labelled as still ongoing, so that I understand I am reading a snapshot and more may follow.
28. As a Support Agent, I want an Empty Conversation to explain itself, so that I report the End User's behaviour rather than a bug in this tool.
29. As a Support Agent, I want a failure to reach the data to be clearly a system problem, so that I escalate instead of doubting the ID I was given.
30. As a Support Agent, I want every failure state to tell me what to do next, so that I am never left staring at a dead end.
31. As a Support Agent, I want a Conversation to be reachable by its own URL, so that I can bookmark it, share it, and use the browser back button.

### Working on the tool

32. As a developer, I want every Lookup outcome to come from one function, so that there is exactly one place to look when behaviour is wrong.
33. As a developer, I want the data source to sit behind an interface, so that replacing mock data with the real database does not touch the user interface.
34. As a developer, I want the Message renderer isolated, so that changing how Message content is formatted is a single-file change.
35. As a developer, I want named fixture Conversations for every state, so that I can reach any state by hand without editing code.
36. As a developer, I want the fixture IDs listed in the application itself, so that a demo does not require reading the source.

## Implementation Decisions

### Application shape

- A Next.js application using the App Router, in TypeScript, styled with Tailwind. Next.js
  was chosen specifically for its server boundary: the real data source is a database the
  browser must never reach directly, so the Lookup runs server-side from the first commit
  and the eventual swap is invisible to the client.
- Two routes: a landing route carrying the Lookup input, and a per-Conversation route keyed
  by Conversation ID that renders the Transcript server-side.
- No authentication. The design must not assume its permanent absence: layout should
  accommodate a Support Agent identity appearing later without rework.

### The seam

One public operation, which every consumer calls and every test drives:

```
lookupConversation(rawInput: string): Promise<LookupResult>

LookupResult =
  | { kind: 'found';       conversation: Conversation }
  | { kind: 'malformed';   rawInput: string }
  | { kind: 'unknown';     id: ConversationId }
  | { kind: 'unavailable' }
```

- Tolerant parsing of the raw input is internal to this operation, not a separate public
  boundary. A Support Agent does not distinguish a parse failure from a lookup failure, so
  the outcomes belong in one union.
- `Malformed` is deliberately distinct from `Unknown`. They need opposite instructions:
  check your clipboard, versus this Conversation does not exist.
- `Empty Conversation` is not an outcome. It is a `found` result whose Transcript has no
  Messages, because an End User opening the widget and leaving is normal behaviour.
- `In-Progress` is not an outcome either. It is a status on a `found` Conversation.

### The swap point

- A `ConversationStore` interface is the single place the data source is bound. A mock
  implementation backs the prototype; a database implementation replaces it later.
- The store is injected into `lookupConversation` rather than imported by it, so tests
  substitute a fake store without any module-level patching.
- The store interface is the swap point, not the test seam. Tests target
  `lookupConversation`; the store exists so that the thing under test can be driven into
  every outcome.

### Domain shapes

```
Conversation {
  id, tenant: { id, name }, startedAt, endedAt | null,
  status: 'ended' | 'in_progress', messages: Message[]
}

Message { id, author: 'end_user' | 'bot', content, sentAt }
```

- A Conversation has exactly two possible Message authors. Human takeover, tool calls,
  retrieval steps and system prompts are not modelled.
- Conversation IDs are a `conv_` prefix followed by a UUID. The prefix makes a Malformed
  Conversation ID detectable before any store is consulted, and stops a Support Agent
  pasting a ticket number or a user identifier without feedback.

### Presentation

- Chat-bubble layout: End User on one side, Bot on the other.
- Bot bubbles take a generous maximum width, and block-level formatted content such as
  tables and code scrolls horizontally within the bubble rather than being compressed.
- Message content is rendered as Markdown through a single isolated component, so the
  content format can be changed in one place.
- Timestamps are revealed on interaction rather than shown on every Message. A gap marker
  appears between Messages separated by more than roughly five minutes.
- A thin header carries Conversation ID, Tenant name, start time, Message count and status.
- A copy action places the whole Transcript on the clipboard with author labels preserved.
- Recent Lookups are held in browser local storage. This is a personal back-button, not the
  browse list that was explicitly rejected.

### Rendering policy

- Transcripts render verbatim. This tool performs no redaction and no masking of anything an
  End User typed, including data that appears sensitive. Redaction, if it is wanted, belongs
  at the point the data is read, so that every consumer of the database benefits rather than
  this one viewer creating false confidence. This is the decision most likely to be
  questioned by a future reader and should be recorded as an ADR.

### Fixtures

- Roughly eight curated Conversations, each exercising one case: a short ordinary exchange,
  a long one of around sixty Messages, an Empty Conversation, an In-Progress Conversation, a
  Markdown-heavy Bot answer covering table, list, code block and links, one containing a long
  pause, and one in which the End User pastes data that looks sensitive.
- Two reserved IDs trigger `Unknown` and `Unavailable`.
- The sensitive-looking fixture uses obviously synthetic values from documented test
  patterns, because the repository is public.
- Curated cases are preferred to generated volume, because the purpose of the prototype is to
  prove the display model rather than to exercise scale.

## Testing Decisions

A good test here describes behaviour a Support Agent could observe, phrased in the
vocabulary of the glossary, and would survive any rewrite of the internals that preserved
that behaviour. A test that asserts how parsing is split from lookup, which component
rendered what, or the shape of an internal helper is testing implementation and should not
be written.

- **`lookupConversation` is the module the tests are built around.** It is the highest
  point at which every user-visible outcome is observable, and the only public operation
  the application has. The rule is that pure logic is tested and the user interface is
  not: `transcriptForClipboard` was added later on the same grounds, because author labels
  surviving a copy is behaviour a Support Agent depends on.
- Tests drive it with a fake `ConversationStore`, which is what makes every outcome reachable
  without a database and without stubbing modules.
- Coverage: each of the four `LookupResult` kinds; `Empty Conversation` and `In-Progress`
  arriving as `found` rather than as failures; and the tolerant-parsing cases, which are the
  highest-value behaviour in the tool — surrounding whitespace, surrounding quotes, a full
  pasted URL, and an input that is not a Conversation ID in any form.
- **The user interface is not tested.** It is deliberately disposable; the seam is the part
  intended to outlive the prototype.
- The seam's tests double as the specification the eventual database-backed
  `ConversationStore` must satisfy.
- Vitest, run from the repository root. There is no prior art: this is the first test suite
  in the repository, so these tests set the convention.

## Out of Scope

- Searching or browsing Conversations by anything other than a Conversation ID.
- Any write action: replying, taking over a chat, tagging, escalating, adding internal notes,
  or flagging a bad Bot answer.
- Authentication, authorisation and any Support Agent identity.
- Visibility into why the Bot answered as it did: tool calls, retrieved documents, system
  prompts and model metadata are not modelled, so this tool cannot answer that class of
  question.
- Redaction or masking of anything in a Transcript.
- Pagination or virtualisation for very long Transcripts.
- A real database implementation of `ConversationStore`.
- Export formats beyond copying to the clipboard.
- Any user interface tests.

## Further Notes

- The repository is public. No real Transcript data may ever be committed to it.
- Human takeover is out of the model by an explicit decision, not an oversight. If the
  product later supports a Support Agent joining a chat, `Message.author` becomes a
  three-way choice and the bubble layout needs a third treatment.
- The deliberate gap worth revisiting first is Bot reasoning. "The Bot gave a wrong answer,
  what happened?" is a common support question that this tool is built unable to answer.
- The unqualified word "agent" is banned in this project. It means the Bot to one half of the
  industry and the human to the other; the glossary uses Bot and Support Agent.
