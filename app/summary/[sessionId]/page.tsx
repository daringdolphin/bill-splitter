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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { BillData, BillItem } from "@/lib/types"
import { calculateShares } from "@/lib/bill-calculations"

export default function BillSummary() {
  const params = useParams()
  const router = useRouter()
  const { sessionId } = params
  const [billData, setBillData] = useState<BillData | null>(null)
  const [shares, setShares] = useState<Record<string, number>>({})
  const [unclaimedItems, setUnclaimedItems] = useState<BillItem[]>([])

  useEffect(() => {
    // Load bill data from localStorage
    const storedData = localStorage.getItem("billData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.sessionId === sessionId) {
          setBillData(parsedData)

          // Calculate shares and unclaimed items
          const { participantShares, unclaimed } = calculateShares(parsedData)
          setShares(participantShares)
          setUnclaimedItems(unclaimed)
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

  const handleNewBill = () => {
    // Clear the current bill data
    localStorage.removeItem("billData")
    router.push("/create-bill")
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
      <h1 className="mb-8 text-center text-3xl font-bold">Bill Summary</h1>

      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {billData.restaurantName || "Restaurant Bill"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Payment Summary</h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(shares).map(([name, amount]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        {billData.items
                          .filter(item =>
                            (item.selectedBy || []).includes(name)
                          )
                          .map(item => item.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell className="text-right">
                        ${amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {unclaimedItems.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-medium text-amber-600">
                  Unclaimed Items
                </h3>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unclaimedItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Total Bill:</span>
                <span>
                  $
                  {(
                    (billData.total || 0) +
                    (billData.tax || 0) +
                    (billData.tip || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="text-muted-foreground mt-2 flex justify-between text-sm">
                <span>Items Subtotal:</span>
                <span>${(billData.total || 0).toFixed(2)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>Tax:</span>
                <span>${(billData.tax || 0).toFixed(2)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>Tip:</span>
                <span>${(billData.tip || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push(`/share/${sessionId}`)}
            >
              Back to Share Page
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleNewBill}>
              Create New Bill
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
