import { describe, expect, it } from 'vitest'

import { rememberLookup } from './recent-lookups'
import type { RecentLookup } from './recent-lookups'

const lookup = (n: number): RecentLookup => ({
  id: `conv_00000000-0000-4000-8000-00000000000${n}`,
  tenantName: `Example Tenant ${n}`,
})

describe('Offering back the Conversations a Support Agent looked up', () => {
  it('offers the most recent Lookup first', () => {
    const remembered = rememberLookup([lookup(1)], lookup(2))

    expect(remembered.map((entry) => entry.id)).toEqual([lookup(2).id, lookup(1).id])
  })

  it('moves a Conversation back to the front rather than listing it twice', () => {
    const remembered = rememberLookup([lookup(3), lookup(2), lookup(1)], lookup(1))

    expect(remembered.map((entry) => entry.id)).toEqual([
      lookup(1).id,
      lookup(3).id,
      lookup(2).id,
    ])
  })

  it('keeps the list short enough to scan, dropping the oldest Lookup', () => {
    const full = [lookup(5), lookup(4), lookup(3), lookup(2), lookup(1)]

    const remembered = rememberLookup(full, lookup(6))

    expect(remembered).toHaveLength(5)
    expect(remembered.map((entry) => entry.id)).not.toContain(lookup(1).id)
    expect(remembered[0]?.id).toBe(lookup(6).id)
  })

  it('starts from nothing the first time a Support Agent looks a Conversation up', () => {
    expect(rememberLookup([], lookup(1))).toEqual([lookup(1)])
  })

  it('keeps the Tenant name, so the list can be read without opening each Conversation', () => {
    const remembered = rememberLookup([], lookup(1))

    expect(remembered[0]?.tenantName).toBe('Example Tenant 1')
  })

  it('refreshes the Tenant name when the same Conversation is looked up again', () => {
    const renamed: RecentLookup = { id: lookup(1).id, tenantName: 'Example Tenant Renamed' }

    const remembered = rememberLookup([lookup(1)], renamed)

    expect(remembered).toEqual([renamed])
  })
})
