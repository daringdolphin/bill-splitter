"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import ReviewBillClient from "@/app/review-bill/[sessionId]/_components/review-bill-client"
import { Skeleton } from "@/components/ui/skeleton"

interface ReviewBillPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function ReviewBillPage({ params }: ReviewBillPageProps) {
  const { sessionId } = await params

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:px-6">
      <h1 className="mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">
        Review Bill
      </h1>

      <Suspense fallback={<ReviewBillSkeleton />}>
        <ReviewBillFetcher sessionId={sessionId} />
      </Suspense>
    </div>
  )
}

async function ReviewBillFetcher({ sessionId }: { sessionId: string }) {
  const { isSuccess, data, message } = await getBillBySessionIdAction(sessionId)

  if (!isSuccess) {
    return (
      <div className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:p-6">
        <p className="text-red-700">{message}</p>
      </div>
    )
  }

  return <ReviewBillClient billData={data} sessionId={sessionId} />
}

function ReviewBillSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="rounded-lg border p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-7 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <div className="rounded-lg border p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-7 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-7 w-1/3" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Skeleton className="h-6 w-full sm:w-24" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </div>
    </div>
  )
}
