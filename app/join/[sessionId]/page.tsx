"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import JoinBillClient from "@/app/join/[sessionId]/_components/join-bill-client"
import BillNavigation from "@/components/bill-navigation"

interface JoinPageProps {
  params: Promise<{
    sessionId: string
  }>
  searchParams: Promise<{ participantId?: string }>
}

export default async function JoinPage({
  params,
  searchParams
}: JoinPageProps) {
  const { sessionId } = await params
  const { participantId } = await searchParams

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Join Bill</h1>
        <BillNavigation sessionId={sessionId} />
      </div>
      <Suspense fallback={<JoinPageSkeleton />}>
        <JoinBillFetcher sessionId={sessionId} participantId={participantId} />
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

async function JoinBillFetcher({
  sessionId,
  participantId
}: {
  sessionId: string
  participantId?: string
}) {
  const { isSuccess, data, message } = await getBillBySessionIdAction(sessionId)

  if (!isSuccess || !data) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        <p>Error: {message}</p>
      </div>
    )
  }

  const { bill, items, participants } = data
  console.log("JoinBillFetcher - participantId:", participantId)
  console.log("JoinBillFetcher - participantId type:", typeof participantId)

  // Check if the participantId exists in the participants list
  if (participantId) {
    const participantExists = participants.some(p => p.id === participantId)
    console.log("Participant exists in list:", participantExists)
  }

  return (
    <JoinBillClient
      sessionId={sessionId}
      bill={bill}
      items={items}
      participants={participants}
      participantId={participantId}
    />
  )
}
