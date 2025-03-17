import type { BillData, BillItem } from "./types"

export interface ParticipantItem {
  itemId: string
  itemName: string
  price: number | string
  quantity: number
  shared: boolean
  sharedCost: string
}

export function calculateShares(billData: BillData): {
  participantShares: Record<string, number>
  participantItems: Record<string, ParticipantItem[]>
  unclaimed: BillItem[]
} {
  const { items, tax = 0, tip = 0, participants = [] } = billData

  // Initialize shares for each participant
  const participantShares: Record<string, number> = {}
  const participantItems: Record<string, ParticipantItem[]> = {}

  participants.forEach(name => {
    participantShares[name] = 0
    participantItems[name] = []
  })

  // Track unclaimed items
  const unclaimed: BillItem[] = []

  // Calculate individual item costs
  items.forEach(item => {
    const { id, name, price, quantity, shared, selectedBy = [] } = item
    const totalItemCost = price * quantity

    if (selectedBy.length === 0) {
      // Item is unclaimed
      unclaimed.push(item)
    } else if (shared) {
      // Shared item - split cost among all who selected it
      const costPerPerson = totalItemCost / selectedBy.length
      const sharedCost = costPerPerson.toFixed(2)

      selectedBy.forEach(person => {
        participantShares[person] =
          (participantShares[person] || 0) + costPerPerson

        // Add item to participant's items
        participantItems[person] = participantItems[person] || []
        participantItems[person].push({
          itemId: id,
          itemName: name,
          price: price,
          quantity: quantity,
          shared: true,
          sharedCost
        })
      })
    } else {
      // Individual item - assign full cost to each person who selected it
      // For non-shared items, divide by the quantity if multiple people selected it
      // This handles cases where an item might be selected by multiple people but isn't marked as shared
      if (selectedBy.length > 1 && quantity >= selectedBy.length) {
        // If quantity allows, split the item cost
        const costPerPerson = totalItemCost / selectedBy.length
        const sharedCost = costPerPerson.toFixed(2)

        selectedBy.forEach(person => {
          participantShares[person] =
            (participantShares[person] || 0) + costPerPerson

          // Add item to participant's items
          participantItems[person] = participantItems[person] || []
          participantItems[person].push({
            itemId: id,
            itemName: name,
            price: price,
            quantity: quantity,
            shared: false,
            sharedCost
          })
        })
      } else {
        // Otherwise, assign full cost to each selector
        const costPerPerson = totalItemCost / selectedBy.length
        const sharedCost = costPerPerson.toFixed(2)

        selectedBy.forEach(person => {
          participantShares[person] =
            (participantShares[person] || 0) + costPerPerson

          // Add item to participant's items
          participantItems[person] = participantItems[person] || []
          participantItems[person].push({
            itemId: id,
            itemName: name,
            price: price,
            quantity: quantity,
            shared: false,
            sharedCost
          })
        })
      }
    }
  })

  // Split tax and tip equally among all participants
  if (participants.length > 0) {
    const taxPerPerson = tax / participants.length
    const tipPerPerson = tip / participants.length

    participants.forEach(person => {
      participantShares[person] += taxPerPerson + tipPerPerson
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
    participantItems,
    unclaimed
  }
}

/**
 * Calculates the total bill amount including items, tax, and tip
 */
export function calculateTotal(
  items: BillItem[],
  tax: number = 0,
  tip: number = 0
): number {
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  return Number.parseFloat((itemsTotal + tax + tip).toFixed(2))
}
