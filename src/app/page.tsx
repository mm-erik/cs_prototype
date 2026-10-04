import { LookupForm } from './lookup-form'

export default function LandingPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Look up a Conversation</h1>
      <LookupForm />
    </section>
  )
}
