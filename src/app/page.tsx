import { FixtureDirectory } from './fixture-directory'
import { LookupForm } from './lookup-form'
import { RecentLookupsList } from './recent-lookups-list'

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Look up a Conversation</h1>
        <LookupForm />
      </section>

      <RecentLookupsList />
      <FixtureDirectory />
    </div>
  )
}
