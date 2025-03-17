"use server"

import { cleanupExpiredReceiptsStorage } from "./storage/receipt-storage-actions"
import { ActionState } from "@/types"

/**
 * Cleanup action to be called by a scheduled job
 * This can be triggered by a cron job or a scheduled function
 */
export async function cleanupExpiredDataAction(): Promise<ActionState<void>> {
  try {
    // Clean up expired receipts
    const receiptCleanupResult = await cleanupExpiredReceiptsStorage()
    
    if (!receiptCleanupResult.isSuccess) {
      throw new Error(`Failed to clean up receipts: ${receiptCleanupResult.message}`)
    }
    
    // Add more cleanup tasks here if needed
    
    return {
      isSuccess: true,
      message: "Cleanup completed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error during cleanup:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to complete cleanup",
    }
  }
} 