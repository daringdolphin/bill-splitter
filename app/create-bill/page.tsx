"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Camera, Loader2 } from "lucide-react"
import { extractReceiptData } from "@/lib/receipt-extraction"
import { useMobile } from "@/hooks/use-mobile"

export default function CreateBill() {
  const router = useRouter()
  const isMobile = useMobile()
  const [isUploading, setIsUploading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const [manualEntry, setManualEntry] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = event => {
        setReceiptImage(event.target?.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = e =>
      handleFileChange(e as React.ChangeEvent<HTMLInputElement>)
    input.click()
  }

  const handleUploadClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = e =>
      handleFileChange(e as React.ChangeEvent<HTMLInputElement>)
    input.click()
  }

  const handleExtractData = async () => {
    if (!receiptImage && !manualEntry) return

    setIsExtracting(true)

    try {
      // In a real app, we would send the image to an API for processing
      // Here we'll simulate the extraction with a timeout
      const billData = await extractReceiptData(receiptImage)

      // Store the extracted data in localStorage for the next page
      localStorage.setItem("billData", JSON.stringify(billData))

      // Navigate to the review page
      router.push("/review-bill")
    } catch (error) {
      console.error("Error extracting receipt data:", error)
      // Handle error
    } finally {
      setIsExtracting(false)
    }
  }

  const handleManualEntry = () => {
    // Create an empty bill template
    const emptyBill = {
      restaurantName: "",
      items: [],
      tax: 0,
      tip: 0,
      total: 0
    }

    localStorage.setItem("billData", JSON.stringify(emptyBill))
    router.push("/review-bill")
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">Create New Bill</h1>

      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            <CardDescription>
              Upload a photo of your receipt or enter bill details manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!manualEntry && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    className="h-20 w-full"
                    onClick={handleUploadClick}
                    disabled={isUploading || isExtracting}
                  >
                    <Upload className="mr-2 size-5" />
                    Upload Receipt Image
                  </Button>

                  {isMobile && (
                    <Button
                      variant="outline"
                      className="h-20 w-full"
                      onClick={handleCameraCapture}
                      disabled={isUploading || isExtracting}
                    >
                      <Camera className="mr-2 size-5" />
                      Capture with Camera
                    </Button>
                  )}
                </div>

                {receiptImage && (
                  <div className="mt-4">
                    <Label>Receipt Preview</Label>
                    <div className="mt-2 overflow-hidden rounded-md border">
                      <img
                        src={receiptImage || "/placeholder.svg"}
                        alt="Receipt preview"
                        className="max-h-[300px] w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="button"
                    className="text-primary text-sm underline"
                    onClick={() => setManualEntry(true)}
                    disabled={isUploading || isExtracting}
                  >
                    Or enter bill details manually
                  </button>
                </div>
              </div>
            )}

            {manualEntry && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  You'll be able to add items on the next screen.
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-primary text-sm underline"
                    onClick={() => setManualEntry(false)}
                    disabled={isExtracting}
                  >
                    Or upload a receipt image
                  </button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!manualEntry ? (
              <Button
                className="w-full"
                onClick={handleExtractData}
                disabled={!receiptImage || isUploading || isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Extracting Data...
                  </>
                ) : (
                  "Extract Receipt Data"
                )}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleManualEntry}
                disabled={isExtracting}
              >
                Continue to Manual Entry
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
