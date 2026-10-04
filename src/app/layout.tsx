import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'Support Conversation Viewer',
  description: 'Read the Transcript of a single Conversation by its Conversation ID.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
            {/*
              The right-hand side of this bar is deliberately empty. The spec expects a
              Support Agent identity to appear here later, and `justify-between` means it
              can without the rest of the header moving.
            */}
            <span className="text-sm font-semibold tracking-tight">
              Support Conversation Viewer
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      </body>
    </html>
  )
}
