"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"
import { v4 as uuidv4 } from "@/lib/uuid"

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
const RECEIPTS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_RECEIPTS_BUCKET || "receipts"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function validateImageData(base64Data: string): boolean {
  // Check if it's a valid base64 string
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Invalid image data")
  }
  
  // Estimate file size (base64 is ~4/3 the size of binary)
  const estimatedSize = (base64Data.length * 3) / 4
  if (estimatedSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }
  
  return true
}

export async function uploadReceiptStorage(
  imageData: string,
  sessionId: string
): Promise<ActionState<{ url: string }>> {
  try {
    // Validate the image data
    validateImageData(imageData)
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Extract the MIME type and base64 data
    const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
    
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image data format")
    }
    
    const mimeType = matches[1]
    const base64Data = matches[2]
    
    // Validate MIME type
    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw new Error(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}`)
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")
    
    // Generate a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileId = uuidv4()
    const extension = mimeType.split("/")[1]
    const filename = `${timestamp}-${fileId}.${extension}`
    
    // Calculate expiration date (7 days from now)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)
    
    // Path structure: {bucket}/receipts/{sessionId}/{filename}
    const filePath = `receipts/${sessionId}/${filename}`
    
    // Upload the file with metadata for expiration
    const { data, error } = await supabase
      .storage
      .from(RECEIPTS_BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false,
        // Add metadata for expiration
        duplex: "half",
        cacheControl: "max-age=604800", // 7 days in seconds
        metadata: {
          expires_at: expirationDate.toISOString()
        }
      })
    
    if (error) throw error
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from(RECEIPTS_BUCKET)
      .getPublicUrl(filePath)
    
    return {
      isSuccess: true,
      message: "Receipt uploaded successfully",
      data: { url: urlData.publicUrl }
    }
  } catch (error) {
    console.error("Error uploading receipt:", error)
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to upload receipt" 
    }
  }
}

// Function to clean up expired receipts (to be called by a cron job)
export async function cleanupExpiredReceiptsStorage(): Promise<ActionState<void>> {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get current date
    const now = new Date()
    
    // List all files in the receipts bucket
    const { data: files, error } = await supabase
      .storage
      .from(RECEIPTS_BUCKET)
      .list("receipts", {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "asc" }
      })
    
    if (error) throw error
    
    // Filter files older than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // Get all files to delete
    const filesToDelete: string[] = []
    
    // Process files in batches to handle pagination if needed
    for (const file of files) {
      // Check if file has metadata and is expired
      if (file.metadata && file.metadata.customMetadata?.expires_at) {
        const expiresAt = new Date(file.metadata.customMetadata.expires_at)
        if (expiresAt < now) {
          filesToDelete.push(`receipts/${file.name}`)
        }
      } else {
        // If no expiration metadata, check creation date
        const createdAt = new Date(file.created_at)
        if (createdAt < sevenDaysAgo) {
          filesToDelete.push(`receipts/${file.name}`)
        }
      }
    }
    
    // Delete expired files in batches of 100
    if (filesToDelete.length > 0) {
      // Process in chunks of 100 (Supabase limit)
      for (let i = 0; i < filesToDelete.length; i += 100) {
        const batch = filesToDelete.slice(i, i + 100)
        const { error: deleteError } = await supabase
          .storage
          .from(RECEIPTS_BUCKET)
          .remove(batch)
        
        if (deleteError) throw deleteError
      }
    }
    
    return {
      isSuccess: true,
      message: `Successfully cleaned up ${filesToDelete.length} expired receipts`,
      data: undefined
    }
  } catch (error) {
    console.error("Error cleaning up expired receipts:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to clean up expired receipts"
    }
  }
} 