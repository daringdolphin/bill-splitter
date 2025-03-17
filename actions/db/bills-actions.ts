"use server"

import { db } from "@/db/db"
import { billItemsTable, billsTable, itemSelectionsTable, participantsTable } from "@/db/schema"
import { InsertBillItem, SelectBillItem } from "@/db/schema/bill-items-schema"
import { InsertBill, SelectBill } from "@/db/schema/bills-schema"
import { SelectItemSelection } from "@/db/schema/item-selections-schema"
import { InsertParticipant, SelectParticipant } from "@/db/schema/participants-schema"
import { ActionState } from "@/types/server-action-types"
import { and, eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"

// Step 5: Implement createBillAction
export async function createBillAction(
  data: {
    hostName: string;
    restaurantName?: string;
    items: { name: string; price: number; quantity: number; shared: boolean }[];
    tax: number;
    tip: number;
    total: number;
  }
): Promise<ActionState<{ sessionId: string }>> {
  try {
    // Generate a unique session ID
    const sessionId = uuidv4()

    // Insert the bill
    const [bill] = await db
      .insert(billsTable)
      .values({
        sessionId,
        restaurantName: data.restaurantName || null,
        hostName: data.hostName,
        total: data.total.toString(),
        tax: data.tax.toString(),
        tip: data.tip.toString()
      })
      .returning()

    // Insert bill items
    await Promise.all(
      data.items.map(item =>
        db.insert(billItemsTable).values({
          billId: bill.id,
          name: item.name,
          price: item.price.toString(),
          quantity: item.quantity,
          shared: item.shared
        })
      )
    )

    // Add the host as the first participant
    await db.insert(participantsTable).values({
      billId: bill.id,
      name: data.hostName
    })

    return {
      isSuccess: true,
      message: "Bill created successfully",
      data: { sessionId }
    }
  } catch (error) {
    console.error("Error creating bill:", error)
    return { isSuccess: false, message: "Failed to create bill" }
  }
}

// Step 6: Implement getBillBySessionIdAction
export async function getBillBySessionIdAction(
  sessionId: string
): Promise<ActionState<{
  bill: SelectBill;
  items: SelectBillItem[];
  participants: (SelectParticipant & { selections: SelectItemSelection[] })[];
}>> {
  try {
    // Get the bill by session ID
    const bill = await db.query.bills.findFirst({
      where: eq(billsTable.sessionId, sessionId)
    })

    if (!bill) {
      return {
        isSuccess: false,
        message: "Bill not found"
      }
    }

    // Get all bill items
    const items = await db.query.billItems.findMany({
      where: eq(billItemsTable.billId, bill.id)
    })

    // Get all participants
    const participants = await db.query.participants.findMany({
      where: eq(participantsTable.billId, bill.id)
    })

    // Get all item selections for each participant
    const participantsWithSelections = await Promise.all(
      participants.map(async (participant) => {
        const selections = await db.query.itemSelections.findMany({
          where: eq(itemSelectionsTable.participantId, participant.id)
        })
        return { ...participant, selections }
      })
    )

    return {
      isSuccess: true,
      message: "Bill retrieved successfully",
      data: {
        bill,
        items,
        participants: participantsWithSelections
      }
    }
  } catch (error) {
    console.error("Error retrieving bill:", error)
    return { isSuccess: false, message: "Failed to retrieve bill" }
  }
}

// Step 7: Implement updateBillItemsAction
export async function updateBillItemsAction(
  items: (Partial<InsertBillItem> & { id: string })[]
): Promise<ActionState<SelectBillItem[]>> {
  try {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const { id, ...data } = item
        const [updatedItem] = await db
          .update(billItemsTable)
          .set(data)
          .where(eq(billItemsTable.id, id))
          .returning()
        return updatedItem
      })
    )

    return {
      isSuccess: true,
      message: "Bill items updated successfully",
      data: updatedItems
    }
  } catch (error) {
    console.error("Error updating bill items:", error)
    return { isSuccess: false, message: "Failed to update bill items" }
  }
} 