"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Loader2, X } from "lucide-react"
import { BillData } from "@/lib/types"
import { extractReceiptDataAction } from "@/actions/receipt-actions"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface ReceiptProcessorProps {
  method: "capture" | "upload"
  isOpen: boolean
  onClose: () => void
}

export default function ReceiptProcessor({
  method,
  isOpen,
  onClose
}: ReceiptProcessorProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive"
      })
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

      // Use the server action
      const result = await extractReceiptDataAction(imageData)

      if (result.isSuccess) {
        // Store the extracted data in localStorage for the create-bill page to use
        localStorage.setItem("billData", JSON.stringify(result.data))

        toast({
          title: "Success",
          description: "Receipt processed successfully!"
        })

        // Close the dialog and redirect to create-bill page
        onClose()
        router.push("/create-bill")
      } else {
        // Generate mock data when extraction fails
        const mockData = await extractReceiptDataAction(null)
        if (mockData.isSuccess) {
          localStorage.setItem("billData", JSON.stringify(mockData.data))

          toast({
            title: "Warning",
            description: "Using sample data as we couldn't process your receipt"
          })

          onClose()
          router.push("/create-bill")
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error("Error processing receipt:", error)
      toast({
        title: "Error",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
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

  // Trigger file input when dialog opens
  const triggerFileInput = () => {
    if (isOpen && fileInputRef.current && !isProcessing) {
      setTimeout(() => fileInputRef.current?.click(), 300)
    }
  }

  // Call triggerFileInput when the dialog opens
  if (isOpen) {
    triggerFileInput()
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {method === "capture" ? "Capture Receipt" : "Upload Receipt"}
          </DialogTitle>
          <DialogDescription>
            {method === "capture"
              ? "Take a photo of your receipt to automatically extract the details"
              : "Upload a photo of your receipt to automatically extract the details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture={method === "capture" ? "environment" : undefined}
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />

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

          {!isProcessing && !previewUrl && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
              >
                {method === "capture" ? (
                  <>
                    <Camera className="mr-2 size-4" />
                    Take Photo
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Select File
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
