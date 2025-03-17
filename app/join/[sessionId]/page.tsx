"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import JoinBillClient from "@/app/join/[sessionId]/_components/join-bill-client"
import BillNavigation from "@/components/bill-navigation"

interface JoinPageProps {
  params: {
    sessionId: string
  }
}

export default async function JoinPage({ params }: JoinPageProps) {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Join Bill</h1>
        <BillNavigation sessionId={params.sessionId} />
      </div>
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
