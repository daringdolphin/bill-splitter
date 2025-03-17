"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import ShareBillClient from "@/app/share/[sessionId]/_components/share-bill-client"
import { Skeleton } from "@/components/ui/skeleton"

interface ShareBillPageProps {
  params: {
    sessionId: string
  }
}

export default async function ShareBillPage({ params }: ShareBillPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Share with Friends
      </h1>

      <Suspense fallback={<ShareBillSkeleton />}>
        <ShareBillFetcher sessionId={params.sessionId} />
      </Suspense>
    </div>
  )
}

async function ShareBillFetcher({ sessionId }: { sessionId: string }) {
  const { isSuccess, data, message } = await getBillBySessionIdAction(sessionId)

  if (!isSuccess) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{message}</p>
      </div>
    )
  }

  return <ShareBillClient billData={data} sessionId={sessionId} />
}

function ShareBillSkeleton() {
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="rounded-lg border p-6 shadow-sm">
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-6 h-20 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-6 border-t pt-4">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
