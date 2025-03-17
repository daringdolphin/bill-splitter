"use server"

import { db } from "@/db/db"
import { itemSelectionsTable, participantsTable } from "@/db/schema"
import { InsertItemSelection, SelectItemSelection } from "@/db/schema/item-selections-schema"
import { InsertParticipant, SelectParticipant } from "@/db/schema/participants-schema"
import { ActionState } from "@/types/server-action-types"
import { and, eq } from "drizzle-orm"

// Step 8: Implement addParticipantAction
export async function addParticipantAction(
  participant: InsertParticipant
): Promise<ActionState<SelectParticipant>> {
  try {
    // Check if a participant with the same name already exists for this bill
    const existingParticipant = await db.query.participants.findFirst({
      where: and(
        eq(participantsTable.billId, participant.billId),
        eq(participantsTable.name, participant.name)
      )
    })

    if (existingParticipant) {
      return {
        isSuccess: false,
        message: "A participant with this name already exists"
      }
    }

    // Insert the new participant
    const [newParticipant] = await db
      .insert(participantsTable)
      .values(participant)
      .returning()

    return {
      isSuccess: true,
      message: "Participant added successfully",
      data: newParticipant
    }
  } catch (error) {
    console.error("Error adding participant:", error)
    return { isSuccess: false, message: "Failed to add participant" }
  }
}

// Step 9: Implement updateParticipantSelectionsAction
export async function updateParticipantSelectionsAction(
  participantId: string,
  billItemIds: string[]
): Promise<ActionState<SelectItemSelection[]>> {
  try {
    // Delete all existing selections for this participant
    await db
      .delete(itemSelectionsTable)
      .where(eq(itemSelectionsTable.participantId, participantId))

    // If no items are selected, return empty array
    if (billItemIds.length === 0) {
      return {
        isSuccess: true,
        message: "Participant selections updated successfully",
        data: []
      }
    }

    // Insert new selections
    const selections: InsertItemSelection[] = billItemIds.map(billItemId => ({
      participantId,
      billItemId
    }))

    const newSelections = await db
      .insert(itemSelectionsTable)
      .values(selections)
      .returning()

    return {
      isSuccess: true,
      message: "Participant selections updated successfully",
      data: newSelections
    }
  } catch (error) {
    console.error("Error updating participant selections:", error)
    return { isSuccess: false, message: "Failed to update participant selections" }
  }
}

// Get participant with selections by participant ID
export async function getParticipantWithSelectionsAction(
  participantId: string
): Promise<ActionState<SelectParticipant & { selections: SelectItemSelection[] }>> {
  try {
    const participant = await db.query.participants.findFirst({
      where: eq(participantsTable.id, participantId),
      with: {
        selections: true
      }
    })

    if (!participant) {
      return {
        isSuccess: false,
        message: "Participant not found"
      }
    }

    return {
      isSuccess: true,
      message: "Participant retrieved successfully",
      data: participant
    }
  } catch (error) {
    console.error("Error retrieving participant:", error)
    return { isSuccess: false, message: "Failed to retrieve participant" }
  }
} 