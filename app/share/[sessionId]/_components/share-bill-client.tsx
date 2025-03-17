"use client"

import { useState, useEffect } from "react"
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
import { Copy, Share2, ArrowRight, AlertCircle } from "lucide-react"
import { SelectBill } from "@/db/schema/bills-schema"
import { SelectBillItem } from "@/db/schema/bill-items-schema"
import { SelectParticipant } from "@/db/schema/participants-schema"
import { SelectItemSelection } from "@/db/schema/item-selections-schema"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ShareBillClientProps {
  billData: {
    bill: SelectBill
    items: SelectBillItem[]
    participants: (SelectParticipant & { selections: SelectItemSelection[] })[]
  }
  sessionId: string
}

export default function ShareBillClient({
  billData,
  sessionId
}: ShareBillClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [hostHasSelections, setHostHasSelections] = useState(false)

  // Calculate the total amount
  const total = parseFloat(billData.bill.total) || 0
  const tax = parseFloat(billData.bill.tax) || 0
  const tip = parseFloat(billData.bill.tip) || 0
  const totalAmount = total + tax + tip

  // Create the shareable URL
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${sessionId}`
      : ""

  // Check if host has selected any items
  useEffect(() => {
    const hostParticipant = billData.participants.find(
      p => p.name === billData.bill.hostName
    )

    if (hostParticipant && hostParticipant.selections.length > 0) {
      setHostHasSelections(true)
    } else {
      setHostHasSelections(false)
    }
  }, [billData])

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard"
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Split the bill with friends",
          text: `${billData.bill.hostName} is asking you to split the bill for ${billData.bill.restaurantName || "a meal"}`,
          url: shareUrl
        })
      } catch (error) {
        console.error("Error sharing:", error)
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleViewSummary = () => {
    router.push(`/summary/${sessionId}`)
  }

  const handleSelectItems = () => {
    router.push(`/review-bill/${sessionId}`)
  }

  // If host hasn't selected any items, show a message
  if (!hostHasSelections) {
    return (
      <div className="mx-auto max-w-md space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Share Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>You haven't selected your items yet</AlertTitle>
              <AlertDescription>
                Before sharing the bill with others, please select the items you
                ordered.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSelectItems}>
              Select My Items
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Share Bill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">
              Share this link with your friends so they can select their items
            </p>
            <div className="bg-muted rounded-md p-4">
              <p className="break-all font-medium">{shareUrl}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button onClick={handleCopyLink}>
              <Copy className="mr-2 size-4" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 size-4" />
              Share
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-muted-foreground text-sm">
              <strong>Restaurant:</strong>{" "}
              {billData.bill.restaurantName || "Not specified"}
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Participants:</strong> {billData.participants.length}{" "}
              (including host)
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant="default"
            onClick={handleViewSummary}
          >
            View Summary
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
