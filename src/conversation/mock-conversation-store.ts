import type { ConversationStore } from './conversation-store'
import type { Conversation, Message } from './types'

/**
 * Reserved Conversation IDs, which no Conversation will ever occupy.
 *
 * They exist so that a Support Agent, or whoever demonstrates this tool, can reach every
 * failure state by pasting an ID rather than by editing code. They appear in
 * `FIXTURE_DIRECTORY` below, which is what puts them on the landing screen.
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

/**
 * A Conversation long enough to be worth scrolling, built by repeating a fixed exchange.
 * Curated cases are preferred to generated volume everywhere else in this file; this one
 * exists only to prove the Transcript stays readable at length, so a loop earns its place.
 */
function longConversationMessages(): Message[] {
  const MESSAGE_PAIRS = [
    ['My invoice total looks wrong this month.', 'Let me pull that invoice up for you.'],
    ['It says 240 but I expected 180.', 'I can see three seats billed rather than two.'],
    ['We removed someone in January.', 'The seat was removed on the 29th, after the billing date.'],
    ['So we paid for a seat we had stopped using?', 'For two days of the cycle, yes.'],
    ['Can that be refunded?', 'I can raise a pro-rata credit for those two days.'],
    ['Please do.', 'Raised. It will appear on next month’s invoice.'],
  ] as const

  const START = Date.UTC(2026, 2, 5, 14, 0, 0)
  const ONE_MINUTE = 60_000

  return Array.from({ length: 30 }, (_, pair) => {
    const [fromEndUser, fromBot] = MESSAGE_PAIRS[pair % MESSAGE_PAIRS.length]!
    const askedAt = START + pair * 2 * ONE_MINUTE

    return [
      {
        id: `msg_long_${String(pair * 2 + 1).padStart(3, '0')}`,
        author: 'end_user' as const,
        content: fromEndUser,
        sentAt: new Date(askedAt).toISOString(),
      },
      {
        id: `msg_long_${String(pair * 2 + 2).padStart(3, '0')}`,
        author: 'bot' as const,
        content: fromBot,
        sentAt: new Date(askedAt + ONE_MINUTE).toISOString(),
      },
    ]
  }).flat()
}

/** Roughly sixty Messages, for reading a Transcript that does not fit on one screen. */
export const LONG_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000002',
  tenant: { id: 'tenant_00000002', name: 'Example Logistics' },
  startedAt: '2026-03-05T14:00:00.000Z',
  endedAt: '2026-03-05T14:59:00.000Z',
  status: 'ended',
  messages: longConversationMessages(),
}

/**
 * A Bot answer using every block-level thing the Bot can emit: a table, a list, a code
 * block and links. The End User Message deliberately contains literal HTML, which must
 * appear as text. Showing it is verbatim; running it would not be.
 */
export const MARKDOWN_HEAVY_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000003',
  tenant: { id: 'tenant_00000003', name: 'Example Analytics' },
  startedAt: '2026-03-06T08:30:00.000Z',
  endedAt: '2026-03-06T08:33:10.000Z',
  status: 'ended',
  messages: [
    {
      id: 'msg_md_001',
      author: 'end_user',
      content:
        'Which plans include the export API? Also I tried pasting <script>alert("hi")</script> into the name field and it did something odd.',
      sentAt: '2026-03-06T08:30:00.000Z',
    },
    {
      id: 'msg_md_002',
      author: 'bot',
      content: [
        'Here is how the **export API** is licensed across plans:',
        '',
        '| Plan       | Export API | Rows per call | Calls per hour | Retention | Scheduled exports | Destinations                      | Support response | Sandbox |',
        '| ---------- | ---------- | ------------- | -------------- | --------- | ----------------- | --------------------------------- | ---------------- | ------- |',
        '| Starter    | No         | —             | —              | 30 days   | No                | —                                 | 2 business days  | No      |',
        '| Growth     | Yes        | 10,000        | 60             | 180 days  | Daily             | S3, GCS                           | 1 business day   | No      |',
        '| Scale      | Yes        | 100,000       | 600            | 395 days  | Hourly            | S3, GCS, Azure Blob, Snowflake    | 4 hours          | Yes     |',
        '| Enterprise | Yes        | Unlimited     | Negotiated     | Custom    | Every 15 minutes  | S3, GCS, Azure Blob, Snowflake, BigQuery, Redshift | 1 hour | Yes     |',
        '',
        'To call it you will need:',
        '',
        '1. An API token with the `export:read` scope',
        '2. The workspace identifier, which is on your settings page',
        '3. A plan from the table above that actually includes it',
        '',
        'A minimal request looks like this:',
        '',
        '```bash',
        'curl --request POST https://api.example.com/v1/exports \\',
        '  --header "Authorization: Bearer $EXAMPLE_API_TOKEN" \\',
        '  --header "Content-Type: application/json" \\',
        '  --data \'{"workspace":"ws_000001","format":"ndjson","since":"2026-01-01"}\'',
        '```',
        '',
        'The full reference is in the [export API guide](https://docs.example.com/export) '
          + 'and the [rate limit policy](https://docs.example.com/limits).',
        '',
        '> Exports run asynchronously. You will receive a webhook when the file is ready.',
      ].join('\n'),
      sentAt: '2026-03-06T08:33:10.000Z',
    },
  ],
}

/** An exchange the End User abandoned and came back to, two hours later. */
export const LONG_PAUSE_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000004',
  tenant: { id: 'tenant_00000004', name: 'Example Travel' },
  startedAt: '2026-03-07T09:12:00.000Z',
  endedAt: '2026-03-07T11:41:30.000Z',
  status: 'ended',
  messages: [
    {
      id: 'msg_pause_001',
      author: 'end_user',
      content: 'I need to change the date on booking 4471.',
      sentAt: '2026-03-07T09:12:00.000Z',
    },
    {
      id: 'msg_pause_002',
      author: 'bot',
      content: 'I can help with that. Which date would you like to move it to?',
      sentAt: '2026-03-07T09:12:25.000Z',
    },
    {
      id: 'msg_pause_003',
      author: 'end_user',
      content: 'Sorry, I had to step away. The 14th, if that is still available.',
      sentAt: '2026-03-07T11:40:00.000Z',
    },
    {
      id: 'msg_pause_004',
      author: 'bot',
      content: 'The 14th is available and I have moved the booking. No change fee applied.',
      sentAt: '2026-03-07T11:41:30.000Z',
    },
  ],
}

/**
 * An End User opened the chat widget and left without saying anything. This is normal
 * behaviour, not a fault, and the Transcript has to say so rather than look broken.
 */
export const EMPTY_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000005',
  tenant: { id: 'tenant_00000005', name: 'Example Health' },
  startedAt: '2026-03-08T16:20:00.000Z',
  endedAt: '2026-03-08T16:24:00.000Z',
  status: 'ended',
  messages: [],
}

/**
 * A Conversation the End User and the Bot are still adding to. What a Support Agent reads
 * is a snapshot: `endedAt` is null and more Messages may follow after the page was
 * rendered. This is a status on a normal `found` result, never an error.
 */
export const IN_PROGRESS_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000006',
  tenant: { id: 'tenant_00000006', name: 'Example Utilities' },
  startedAt: '2026-03-09T13:05:00.000Z',
  endedAt: null,
  status: 'in_progress',
  messages: [
    {
      id: 'msg_in_progress_001',
      author: 'end_user',
      content: 'My meter reading was rejected as implausible. Reading is 014872.',
      sentAt: '2026-03-09T13:05:00.000Z',
    },
    {
      id: 'msg_in_progress_002',
      author: 'bot',
      content:
        'Thank you. That is lower than your last reading of 015003, which is why it was rejected. Let me check whether the meter was replaced.',
      sentAt: '2026-03-09T13:05:40.000Z',
    },
    {
      id: 'msg_in_progress_003',
      author: 'end_user',
      content: 'Yes, it was swapped out in February.',
      sentAt: '2026-03-09T13:06:15.000Z',
    },
  ],
}

/**
 * An End User pastes what looks like account data while asking for help, and this tool
 * shows it exactly as typed.
 *
 * That is the point of the fixture. Transcripts render verbatim: no masking, no redaction,
 * however sensitive the content looks. Redaction belongs where the data is read, so that
 * every consumer of the database benefits, rather than this one viewer creating false
 * confidence. It is the decision most likely to be questioned by a future reader, so it
 * gets a fixture that makes it impossible to miss.
 *
 * This repository is public, so every value below is drawn from somewhere documented as
 * unusable, and the list is exhaustive:
 *
 * - `4111 1111 1111 1111` is the published Visa test card number.
 * - `example.com` is reserved by RFC 2606.
 * - `555-0142` sits in the `555-0100`–`555-0199` block NANPA reserves for fiction, here
 *   with the `212` area code so it is a well-formed number that can never be dialled.
 * - The API key is deliberately not shaped like any real vendor's. An earlier draft used
 *   a Stripe test-mode prefix, and GitHub's push protection rejected it on sight even
 *   with an all-zero body. That was the right call for a public repository, and the
 *   lesson is kept here: a fixture only has to *look* credential-shaped to a reader, not
 *   to a secret scanner.
 *
 * Nothing resembling real data goes in this repository, ever.
 */
export const SENSITIVE_LOOKING_CONVERSATION: Conversation = {
  id: 'conv_00000000-0000-4000-8000-000000000007',
  tenant: { id: 'tenant_00000007', name: 'Example Insurance' },
  startedAt: '2026-03-10T11:48:00.000Z',
  endedAt: '2026-03-10T11:51:20.000Z',
  status: 'ended',
  messages: [
    {
      id: 'msg_sensitive_001',
      author: 'end_user',
      content:
        'My payment keeps bouncing. Card is 4111 1111 1111 1111, expiry 01/30, and the account email is a.taylor@example.com. Phone is +1 212 555 0142 if you need to call.',
      sentAt: '2026-03-10T11:48:00.000Z',
    },
    {
      id: 'msg_sensitive_002',
      author: 'bot',
      content:
        'Thanks. Please avoid sending card details over chat in future — I only need the last four digits. I can see the payment was declined by the issuing bank rather than by us.',
      sentAt: '2026-03-10T11:49:05.000Z',
    },
    {
      id: 'msg_sensitive_003',
      author: 'end_user',
      content:
        'Understood, sorry. I also tried the API with key EXAMPLE-API-KEY-0000-0000-0000 and got a 402 back.',
      sentAt: '2026-03-10T11:50:30.000Z',
    },
    {
      id: 'msg_sensitive_004',
      author: 'bot',
      content:
        'A 402 there means the same declined payment. Your bank will need to authorise it before the API call can succeed.',
      sentAt: '2026-03-10T11:51:20.000Z',
    },
  ],
}

/** One row of the "try these" list on the landing screen. */
export interface FixtureEntry {
  /** What a Support Agent pastes, which for the Malformed row is not a Conversation ID. */
  input: string
  demonstrates: string
}

/**
 * Every state of this application, reachable by clicking rather than by reading source.
 * That is what makes the prototype demoable by someone who did not build it.
 *
 * The Conversation IDs are taken from the fixtures themselves rather than retyped, so a
 * renamed or renumbered fixture cannot leave this list pointing at nothing.
 *
 * This belongs to the mock store and disappears with it: a database-backed
 * `ConversationStore` has no fixtures to advertise.
 */
export const FIXTURE_DIRECTORY: readonly FixtureEntry[] = [
  { input: SHORT_HAPPY_PATH_CONVERSATION.id, demonstrates: 'A short, ordinary exchange' },
  { input: LONG_CONVERSATION.id, demonstrates: 'A long Conversation of sixty Messages' },
  {
    input: MARKDOWN_HEAVY_CONVERSATION.id,
    demonstrates: 'A Bot answer with a table, a list, a code block and links',
  },
  {
    input: LONG_PAUSE_CONVERSATION.id,
    demonstrates: 'A long pause, so the gap marker appears',
  },
  {
    input: EMPTY_CONVERSATION.id,
    demonstrates: 'An Empty Conversation, which explains itself',
  },
  {
    input: IN_PROGRESS_CONVERSATION.id,
    demonstrates: 'An In-Progress Conversation, still being added to',
  },
  {
    input: SENSITIVE_LOOKING_CONVERSATION.id,
    demonstrates: 'Sensitive-looking content, shown verbatim rather than masked',
  },
  {
    input: RESERVED_UNKNOWN_CONVERSATION_ID,
    demonstrates: 'An Unknown Conversation: well-formed, but no Conversation has it',
  },
  {
    input: RESERVED_UNAVAILABLE_CONVERSATION_ID,
    demonstrates: 'The data source cannot be reached',
  },
]

/**
 * Not a Conversation ID at all, which is exactly the point: pasting a ticket number is how
 * a Support Agent reaches the Malformed Conversation ID state.
 *
 * It is kept apart from the list above because everything there is a well-formed
 * Conversation ID — including the two reserved ones, which are well-formed but match no
 * Conversation. That is the distinction a Support Agent is being shown: a bad paste versus
 * a Conversation that does not exist.
 */
export const MALFORMED_EXAMPLE: FixtureEntry = {
  input: 'TICKET-4821',
  demonstrates: 'Not a Conversation ID at all',
}

const CONVERSATIONS: readonly Conversation[] = [
  SHORT_HAPPY_PATH_CONVERSATION,
  LONG_CONVERSATION,
  MARKDOWN_HEAVY_CONVERSATION,
  LONG_PAUSE_CONVERSATION,
  EMPTY_CONVERSATION,
  IN_PROGRESS_CONVERSATION,
  SENSITIVE_LOOKING_CONVERSATION,
]

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
