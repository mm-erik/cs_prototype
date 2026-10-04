'use client'

import { useEffect } from 'react'

import { writeRecentLookup } from '@/conversation/recent-lookups-storage'
import type { ConversationId } from '@/conversation/types'

/**
 * Records a Lookup that found a Conversation, so the landing screen can offer it back.
 *
 * Renders nothing. It lives on the Conversation route rather than in the Lookup input
 * because only the server knows the Lookup succeeded — which is also what makes
 * "only Lookups that found a Conversation are recorded" true by construction, since the
 * input never learns the outcome. Arriving by pasting a URL straight into the address bar
 * is recorded too, for the same reason.
 */
export function RecordRecentLookup({
  id,
  tenantName,
}: {
  id: ConversationId
  tenantName: string
}) {
  useEffect(() => {
    writeRecentLookup({ id, tenantName })
  }, [id, tenantName])

  return null
}
