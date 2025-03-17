"use client"

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
import { Loader2 } from "lucide-react"
import ReceiptUploader from "@/components/receipt-uploader"
import { BillData } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

export default function ScanReceipt() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<BillData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReceiptProcessed = (data: BillData) => {
    setExtractedData(data)
    toast({
      title: "Receipt Processed",
      description: "Receipt data has been extracted successfully.",
      duration: 5000
    })
  }

  const handleReceiptError = (message: string) => {
    setError(message)
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 5000
    })
  }

  const handleContinue = () => {
    if (!extractedData) return

    setIsLoading(true)

    try {
      // Store the extracted data in localStorage for the create-bill page to use
      localStorage.setItem("billData", JSON.stringify(extractedData))

      // Navigate to the create-bill page
      router.push("/create-bill")
    } catch (error) {
      console.error("Error saving extracted data:", error)
      setError("Failed to save extracted data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">Scan Receipt</h1>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            <CardDescription>
              Upload or capture a photo of your receipt to automatically extract
              the details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ReceiptUploader
              onReceiptProcessed={handleReceiptProcessed}
              onError={handleReceiptError}
            />

            {error && (
              <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {extractedData && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Extracted Data</h3>

                <div className="rounded-md border p-4">
                  <p className="font-medium">
                    Restaurant: {extractedData.restaurantName || "Unknown"}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 font-medium">Items:</p>
                    <ul className="space-y-2">
                      {extractedData.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {item.name}{" "}
                            {item.quantity > 1 ? `(x${item.quantity})` : ""}
                          </span>
                          <span>${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 border-t pt-2">
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${extractedData.tax?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>${extractedData.tip?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t pt-2 font-medium">
                      <span>Total:</span>
                      <span>${extractedData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {extractedData && (
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Edit Bill"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
