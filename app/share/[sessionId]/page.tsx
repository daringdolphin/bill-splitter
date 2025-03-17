"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Copy, Share2, ArrowRight } from "lucide-react"
import type { BillData } from "@/lib/types"

export default function ShareBill() {
  const params = useParams()
  const router = useRouter()
  const { sessionId } = params
  const [billData, setBillData] = useState<BillData | null>(null)
  const [copied, setCopied] = useState(false)
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${sessionId}`
      : ""

  useEffect(() => {
    // Load bill data from localStorage
    const storedData = localStorage.getItem("billData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.sessionId === sessionId) {
          setBillData(parsedData)
        } else {
          router.push("/create-bill")
        }
      } catch (error) {
        console.error("Error parsing bill data:", error)
        router.push("/create-bill")
      }
    } else {
      router.push("/create-bill")
    }
  }, [sessionId, router])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Split the bill with SplitEase",
          text: `${billData?.hostName} is asking you to split the bill for ${billData?.restaurantName}`,
          url: shareUrl
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleViewSummary = () => {
    router.push(`/summary/${sessionId}`)
  }

  if (!billData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-6">
        <p>Loading bill data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Share with Friends
      </h1>

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
                {billData.restaurantName || "Not specified"}
              </p>
              <p className="text-muted-foreground text-sm">
                <strong>Total Amount:</strong> $
                {(
                  (billData.total || 0) +
                  (billData.tax || 0) +
                  (billData.tip || 0)
                ).toFixed(2)}
              </p>
              <p className="text-muted-foreground text-sm">
                <strong>Participants:</strong>{" "}
                {billData.participants?.length || 1} (including you)
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
    </div>
  )
}
