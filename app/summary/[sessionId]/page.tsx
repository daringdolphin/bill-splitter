"use server"

import { Suspense } from "react"
import { getBillBySessionIdAction } from "@/actions/db/bills-actions"
import PaymentSummary from "@/components/payment-summary"
import { SelectBillItem } from "@/db/schema/bill-items-schema"
import { SelectItemSelection } from "@/db/schema/item-selections-schema"
import { SelectParticipant } from "@/db/schema/participants-schema"
import { SelectBill } from "@/db/schema/bills-schema"
import { formatCurrency } from "@/lib/utils"

interface SummaryPageProps {
  params: {
    sessionId: string
  }
}

export default function SummaryPage({ params }: SummaryPageProps) {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Bill Summary</h1>
      <Suspense fallback={<SummaryPageSkeleton />}>
        <SummaryFetcher sessionId={params.sessionId} />
      </Suspense>
    </div>
  )
}

function SummaryPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-muted h-[400px] w-full animate-pulse rounded-md"></div>
      <div className="bg-muted h-[200px] w-full animate-pulse rounded-md"></div>
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

  // Calculate participant shares and unclaimed items
  const { participantShares, unclaimed } = calculateShares(
    bill,
    items,
    participants
  )

  return (
    <div className="space-y-8">
      <div className="bg-muted rounded-md p-4">
        <h2 className="mb-4 text-xl font-semibold">
          {bill.restaurantName ? bill.restaurantName : "Restaurant Bill"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Host</p>
            <p className="font-medium">{bill.hostName}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Date</p>
            <p className="font-medium">
              {new Date(bill.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Participants</p>
            <p className="font-medium">{participants.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="font-medium">
              {formatCurrency(parseFloat(bill.total))}
            </p>
          </div>
        </div>
      </div>

      <PaymentSummary
        participantShares={participantShares}
        unclaimed={unclaimed}
        restaurantName={bill.restaurantName}
      />

      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>Share this summary with your friends using the link:</p>
        <p className="mt-1 font-medium">
          {typeof window !== "undefined" ? window.location.origin : ""}/join/
          {sessionId}
        </p>
      </div>
    </div>
  )
}

// Helper function to calculate shares and unclaimed items
function calculateShares(
  bill: SelectBill,
  items: SelectBillItem[],
  participants: (SelectParticipant & { selections: SelectItemSelection[] })[]
): {
  participantShares: Record<string, number>
  unclaimed: SelectBillItem[]
} {
  // Initialize shares for each participant
  const participantShares: Record<string, number> = {}
  participants.forEach(participant => {
    participantShares[participant.name] = 0
  })

  // Track unclaimed items
  const unclaimed: SelectBillItem[] = []

  // Create a map of item selections by item ID
  const itemSelections = new Map<string, string[]>()

  // Populate the map with participant selections
  participants.forEach(participant => {
    participant.selections.forEach(selection => {
      const itemId = selection.billItemId
      if (!itemSelections.has(itemId)) {
        itemSelections.set(itemId, [])
      }
      itemSelections.get(itemId)?.push(participant.name)
    })
  })

  // Calculate individual item costs
  items.forEach(item => {
    const selectedBy = itemSelections.get(item.id) || []
    const totalItemCost = parseFloat(item.price) * item.quantity

    if (selectedBy.length === 0) {
      // Item is unclaimed
      unclaimed.push(item)
    } else if (item.shared) {
      // Shared item - split cost among all who selected it
      const costPerPerson = totalItemCost / selectedBy.length
      selectedBy.forEach(person => {
        participantShares[person] += costPerPerson
      })
    } else {
      // Individual item - assign full cost to each person who selected it
      // For non-shared items, divide by the quantity if multiple people selected it
      if (selectedBy.length > 1 && item.quantity >= selectedBy.length) {
        // If quantity allows, split the item cost
        const costPerPerson = totalItemCost / selectedBy.length
        selectedBy.forEach(person => {
          participantShares[person] += costPerPerson
        })
      } else {
        // Otherwise, assign full cost to each selector
        selectedBy.forEach(person => {
          participantShares[person] += totalItemCost / selectedBy.length
        })
      }
    }
  })

  // Get tax and tip from the bill
  const tax = parseFloat(bill.tax)
  const tip = parseFloat(bill.tip)

  // Split tax and tip equally among all participants
  if (participants.length > 0) {
    const taxPerPerson = tax / participants.length
    const tipPerPerson = tip / participants.length

    participants.forEach(participant => {
      participantShares[participant.name] += taxPerPerson + tipPerPerson
    })
  }

  // Round all amounts to 2 decimal places
  Object.keys(participantShares).forEach(person => {
    participantShares[person] = Number.parseFloat(
      participantShares[person].toFixed(2)
    )
  })

  return {
    participantShares,
    unclaimed
  }
}
