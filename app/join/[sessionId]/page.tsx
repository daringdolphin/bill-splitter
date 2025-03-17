"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import JoinBillClient from "@/app/join/[sessionId]/_components/join-bill-client"

interface JoinPageProps {
  params: {
    sessionId: string
  }
}

export default function JoinPage({ params }: JoinPageProps) {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Join Bill</h1>
      <Suspense fallback={<JoinPageSkeleton />}>
        <JoinBillFetcher sessionId={params.sessionId} />
      </Suspense>
    </div>
  )
}

function JoinPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-muted h-10 w-full max-w-sm animate-pulse rounded-md"></div>
      <div className="bg-muted h-[400px] w-full animate-pulse rounded-md"></div>
      <div className="bg-muted h-10 w-32 animate-pulse rounded-md"></div>
    </div>
  )
}

async function JoinBillFetcher({ sessionId }: { sessionId: string }) {
  const { isSuccess, data, message } = await getBillBySessionIdAction(sessionId)

  if (!isSuccess || !data) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        <p>Error: {message}</p>
      </div>
    )
  }

  const { bill, items, participants } = data

  return (
    <JoinBillClient
      sessionId={sessionId}
      bill={bill}
      items={items}
      participants={participants}
    />
  )
}
