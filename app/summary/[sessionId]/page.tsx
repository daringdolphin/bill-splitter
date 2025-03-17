"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import PaymentSummary from "@/components/payment-summary"
import { SelectBillItem } from "@/db/schema/bill-items-schema"
import { SelectItemSelection } from "@/db/schema/item-selections-schema"
import { SelectParticipant } from "@/db/schema/participants-schema"
import { SelectBill } from "@/db/schema/bills-schema"
import { formatCurrency } from "@/lib/utils"
import { calculateShares } from "@/lib/bill-calculations"
import { BillItem } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import BillNavigation from "@/components/bill-navigation"
import CopyLinkButton from "./_components/copy-link-button"

interface SummaryPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { sessionId } = await params

  return (
    <div className="container max-w-4xl px-4 py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Bill Summary</h1>
        <BillNavigation sessionId={sessionId} />
      </div>
      <Suspense fallback={<SummaryPageSkeleton />}>
        <SummaryFetcher sessionId={sessionId} />
      </Suspense>
    </div>
  )
}

function SummaryPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-muted h-[200px] w-full animate-pulse rounded-md md:h-[400px]"></div>
      <div className="bg-muted h-[150px] w-full animate-pulse rounded-md md:h-[200px]"></div>
    </div>
  )
}

async function SummaryFetcher({ sessionId }: { sessionId: string }) {
  const { isSuccess, data, message } = await getBillBySessionIdAction(sessionId)

  if (!isSuccess || !data) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-4">
        <p>Error: {message}</p>
      </div>
    )
  }

  const { bill, items, participants } = data

  // Convert DB data to format expected by calculateShares
  const billData = {
    sessionId: bill.sessionId,
    restaurantName: bill.restaurantName || undefined,
    hostName: bill.hostName,
    items: items.map(item => {
      // Get list of participants who selected this item
      const selectedBy = participants
        .filter(p => p.selections.some(s => s.billItemId === item.id))
        .map(p => p.name)

      return {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        shared: item.shared,
        selectedBy
      } as BillItem
    }),
    tax: parseFloat(bill.tax),
    tip: parseFloat(bill.tip),
    total: parseFloat(bill.total),
    participants: participants.map(p => p.name)
  }

  // Calculate participant shares and unclaimed items
  const { participantShares, participantItems, unclaimed } =
    calculateShares(billData)

  // Format data for PaymentSummary component
  const paymentSummary = {
    participantShares: Object.entries(participantShares).map(
      ([name, total]) => ({
        participantId: participants.find(p => p.name === name)?.id || name,
        participantName: name,
        items:
          participantItems[name]?.map(item => ({
            ...item,
            price:
              typeof item.price === "number"
                ? item.price.toString()
                : item.price
          })) || [],
        total: total.toFixed(2)
      })
    ),
    unclaimedItems: unclaimed.map(item => ({
      itemId: item.id,
      itemName: item.name,
      price: item.price.toString(),
      quantity: item.quantity
    })),
    totalPaid: Object.values(participantShares)
      .reduce((sum, amount) => sum + amount, 0)
      .toFixed(2),
    totalBill: bill.total
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-muted rounded-md p-4">
        <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">
          {bill.restaurantName ? bill.restaurantName : "Restaurant Bill"}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-medium md:text-sm">
              Host
            </p>
            <p className="text-sm font-medium md:text-base">{bill.hostName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium md:text-sm">
              Date
            </p>
            <p className="text-sm font-medium md:text-base">
              {new Date(bill.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium md:text-sm">
              Participants
            </p>
            <p className="text-sm font-medium md:text-base">
              {participants.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium md:text-sm">
              Total
            </p>
            <p className="text-sm font-medium md:text-base">
              {formatCurrency(parseFloat(bill.total))}
            </p>
          </div>
        </div>
      </div>

      <PaymentSummary summary={paymentSummary} sessionId={sessionId} />

      <div className="text-muted-foreground mt-6 rounded-md border p-4 text-center md:mt-8">
        <p className="text-xs md:text-sm">Share the link:</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <p className="break-all text-xs font-medium md:text-sm">
            {typeof window !== "undefined" ? window.location.origin : ""}/join/
            {sessionId}
          </p>
          <CopyLinkButton sessionId={sessionId} />
        </div>
      </div>
    </div>
  )
}
