import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * The single isolated component that knows Message content is Markdown.
 *
 * Everything about the content format lives here, so moving to another format later is a
 * one-file change. Nothing else in the application parses or interprets Message content.
 *
 * Two rules pull in opposite directions and both hold:
 *
 * - **Verbatim.** Nothing an End User typed is masked or redacted, including anything that
 *   looks sensitive. Redaction belongs where the data is read, so that every consumer of
 *   the database benefits rather than this one viewer creating false confidence.
 * - **Not executed.** Raw HTML arriving in a Transcript is rendered as visible text rather
 *   than as markup. `react-markdown` does this by default: raw HTML would require adding
 *   `rehype-raw`, which this project deliberately does not. End User Message content is
 *   untrusted input from the public internet.
 *
 * Showing `<script>` as text satisfies both at once. Nothing is removed; it is shown
 * rather than run.
 */
export function MessageContent({ content }: { content: string }) {
  return (
    // `break-words` matters for the verbatim rule: an End User can paste an unbroken
    // token or URL longer than the bubble, and without it that content spills out of the
    // bubble and scrolls the whole page sideways.
    <div className="space-y-3 break-words text-sm leading-relaxed">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Deliberately no `whitespace-pre-wrap`: in Markdown a single newline is a soft
          // break that reflows, and forcing it to a hard break showed the Support Agent a
          // paragraph chopped at the source's line endings rather than the one the End
          // User saw.
          p: ({ children }) => <p>{children}</p>,
          a: ({ children, href }) => (
            <a
              className="underline underline-offset-2"
              href={href}
              rel="noreferrer noopener"
              target="_blank"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-5">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-current/25 pl-3 italic">
              {children}
            </blockquote>
          ),
          // A bubble is a bad container for wide content, so a table scrolls inside it
          // rather than being compressed or pushing the page sideways.
          table: ({ children }) => (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-max border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-current/20 px-2 py-1 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-current/20 px-2 py-1 align-top">{children}</td>
          ),
          // `pre` carries the scroll because a code block must keep its line breaks; the
          // inline case has no `pre` ancestor and should wrap with the surrounding text.
          // The `[&>code]` resets stop the inline `code` styling below from applying a
          // second time to the `code` element a fenced block always nests inside `pre`.
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded bg-black/10 p-3 text-xs [&>code]:bg-transparent [&>code]:p-0">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-black/10 px-1 py-0.5 text-xs">{children}</code>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
