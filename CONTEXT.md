# Customer Support Conversation Viewer

An internal tool that lets the customer support team read the transcript of a single
chatbot conversation, looked up by its Conversation ID.

## Language

**Conversation**:
One complete chat exchange between an End User and the Bot, identified by a Conversation ID.
_Avoid_: Chat, session, thread

**Conversation ID**:
The identifier a Support Agent is given (from a ticket, an escalation, a bug report) and
types into this tool. It is the only way into a Conversation.
_Avoid_: Chat ID, session ID, ticket ID

**Transcript**:
The ordered sequence of Messages that makes up a Conversation.
_Avoid_: History, log, thread

**Message**:
A single contribution to a Transcript, authored by either the End User or the Bot.
_Avoid_: Turn, utterance, entry

**End User**:
The person who had the conversation with the Bot. Not a user of this tool.
_Avoid_: Customer, user, visitor

**Bot**:
The SaaS chatbot that the End User talked to. The only non-human party in a Transcript.
_Avoid_: Agent, assistant, AI

**Support Agent**:
A member of the customer support team: the person using this tool. "Agent" unqualified is
banned here, because it means the Bot to one half of the industry and the human to the other.
_Avoid_: Agent, operator, CS rep, user

**Lookup**:
Retrieving one Conversation by its Conversation ID. The tool's only operation.
_Avoid_: Search, query, fetch

**Tenant**:
The customer organisation whose chatbot the End User talked to. Every Conversation belongs
to exactly one Tenant.
_Avoid_: Customer, account, client, org

**In-Progress Conversation**:
A Conversation the End User and Bot are still adding to. What a Support Agent reads is a
snapshot, not a finished Transcript.
_Avoid_: Open, live, active

**Empty Conversation**:
A Conversation that exists but has no Messages, because the End User opened the chat and
left without saying anything. A real state, not a fault.
_Avoid_: Blank, null conversation

**Unknown Conversation**:
A well-formed Conversation ID that matches no Conversation. Distinct from a Malformed
Conversation ID, which is not a Conversation ID at all.
_Avoid_: Missing, 404, not found

