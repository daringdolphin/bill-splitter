"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Loader2 } from "lucide-react"
import { extractReceiptData } from "@/lib/receipt-extraction"
import { BillData } from "@/lib/types"

interface ReceiptUploaderProps {
  onReceiptProcessed: (data: BillData) => void
  onError: (message: string) => void
}

export default function ReceiptUploader({
  onReceiptProcessed,
  onError
}: ReceiptUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      onError("Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError("File size should be less than 5MB")
      return
    }

    try {
      // Create a preview
      const reader = new FileReader()
      reader.onload = event => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Process the image
      setIsProcessing(true)
      const imageData = await fileToBase64(file)
      const billData = await extractReceiptData(imageData)
      onReceiptProcessed(billData)
    } catch (error) {
      console.error("Error processing receipt:", error)
      onError("Failed to process receipt. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUploadClick = () => {
    console.log("Upload button clicked")
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCaptureClick}
            disabled={isProcessing}
          >
            <Camera className="mr-2 size-4" />
            Capture Receipt
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isProcessing}
          >
            <Upload className="mr-2 size-4" />
            Upload Receipt
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="text-primary size-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">
            Processing receipt...
          </p>
        </div>
      )}

      {previewUrl && !isProcessing && (
        <div className="flex flex-col items-center">
          <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-md border">
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="size-full object-contain"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Receipt processed successfully!
          </p>
        </div>
      )}
    </div>
  )
}
