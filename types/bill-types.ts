/*
Contains types for bill-related components.
*/

import { SelectBill } from "@/db/schema"
import { SelectBillItem } from "@/db/schema"
import { SelectParticipant } from "@/db/schema"
import { SelectItemSelection } from "@/db/schema"

export interface BillItemWithSelection extends SelectBillItem {
  selected?: boolean
  selectedBy?: string[]
}

export interface BillWithItems extends SelectBill {
  items: SelectBillItem[]
}

export interface BillWithItemsAndParticipants extends BillWithItems {
  participants: SelectParticipant[]
  itemSelections: SelectItemSelection[]
}

export interface ParticipantShare {
  participantId: string
  participantName: string
  items: {
    itemId: string
    itemName: string
    price: string
    quantity: number
    shared: boolean
    sharedCost: string
  }[]
  total: string
}

export interface UnclaimedItem {
  itemId: string
  itemName: string
  price: string
  quantity: number
}

export interface PaymentSummary {
  participantShares: ParticipantShare[]
  unclaimedItems: UnclaimedItem[]
  totalPaid: string
  totalBill: string
}
