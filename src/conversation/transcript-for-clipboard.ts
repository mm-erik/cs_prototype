import type { Conversation, MessageAuthor } from './types'

/**
 * The whole Transcript as Markdown, ready to paste into a ticket.
 *
 * Author labels surviving the copy is the entire point of this. The alternative a Support
 * Agent has is a manual drag-selection, which drops the attribution and produces a wall of
 * text in which nobody can tell the End User from the Bot.
 *
 * Markdown *source* is copied rather than the rendered output, because tickets and bug
 * reports are usually Markdown-aware, so the source arrives closer to what the Support
 * Agent saw than scraped text would.
 *
 * Content is passed through untouched. This tool performs no redaction or masking of
 * anything an End User typed, and the clipboard is no exception to that.
 *
 * An Empty Conversation produces an empty string. There is nothing to copy, which is not
 * an error — the caller decides what to do about it.
 */
export function transcriptForClipboard(conversation: Conversation): string {
  return conversation.messages
    .map((message) => `**${labelFor(message.author)}**\n\n${message.content}`)
    .join('\n\n---\n\n')
}

/**
 * The same words the Transcript shows on screen, so the copy reads as the same document
 * the Support Agent was just looking at.
 *
 * A bold line rather than a Markdown heading: Message content is itself Markdown and may
 * contain its own headings, tables or code fences, and a `##` label would compete with
 * that structure where a bold line cannot.
 *
 * Message content can itself contain bold text, so the rule between Messages is what
 * actually marks where one Message ends and the next begins. Without it, a Bot answer
 * containing its own bold line would be hard to tell from an author label on paste.
 */
function labelFor(author: MessageAuthor): string {
  return author === 'bot' ? 'Bot' : 'End User'
}
