export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">Conversation</h1>
      <p className="text-sm text-slate-600">
        Route reached with <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">{conversationId}</code>.
        The Lookup and the Transcript arrive in the next ticket.
      </p>
    </section>
  )
}
