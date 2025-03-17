"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Check } from "lucide-react"
import type { BillData } from "@/lib/types"

export default function JoinBill() {
  const params = useParams()
  const router = useRouter()
  const { sessionId } = params
  const [billData, setBillData] = useState<BillData | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Try to load bill data from localStorage first
    const storedData = localStorage.getItem("billData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (parsedData.sessionId === sessionId) {
          setBillData(parsedData)
          return
        }
      } catch (error) {
        console.error("Error parsing stored bill data:", error)
      }
    }

    // If we don't have the data locally, we would fetch it from an API in a real app
    // For this demo, we'll just show an error
    if (!storedData) {
      alert("Bill data not found. Please ask the host to share the link again.")
      router.push("/")
    }
  }, [sessionId, router])

  useEffect(() => {
    // Pre-select shared items
    if (billData) {
      const sharedItemIds = billData.items
        .filter(item => item.shared)
        .map(item => item.id)

      setSelectedItems(sharedItemIds)
    }
  }, [billData])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantName(e.target.value)
  }

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleSubmit = () => {
    if (!billData || !participantName) return

    setIsSubmitting(true)

    // Update the bill data with the participant's selections
    const updatedItems = billData.items.map(item => {
      if (selectedItems.includes(item.id)) {
        const currentSelectedBy = item.selectedBy || []
        if (!currentSelectedBy.includes(participantName)) {
          return {
            ...item,
            selectedBy: [...currentSelectedBy, participantName]
          }
        }
      }
      return item
    })

    const updatedParticipants = billData.participants || []
    if (!updatedParticipants.includes(participantName)) {
      updatedParticipants.push(participantName)
    }

    const updatedBillData = {
      ...billData,
      items: updatedItems,
      participants: updatedParticipants
    }

    // Save updated bill data to localStorage
    localStorage.setItem("billData", JSON.stringify(updatedBillData))

    // In a real app, we would send this data to a server
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setBillData(updatedBillData)
    }, 1000)
  }

  if (!billData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center md:px-6">
        <p>Loading bill data...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Thank You!</CardTitle>
              <CardDescription className="text-center">
                Your selections have been saved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-primary/10 rounded-full p-4">
                  <Check className="text-primary size-8" />
                </div>
              </div>
              <p>
                You've successfully selected your items for the bill at{" "}
                {billData.restaurantName || "the restaurant"}.
              </p>
              <p className="text-muted-foreground text-sm">
                The host will be able to see your selections in the bill
                summary.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push(`/summary/${sessionId}`)}
              >
                View Bill Summary
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">Select Your Items</h1>

      <div className="mx-auto max-w-2xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {billData.restaurantName || "Restaurant Bill"}
            </CardTitle>
            <CardDescription>
              Select the items you ordered to split the bill
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="participantName">Your Name</Label>
              <Input
                id="participantName"
                value={participantName}
                onChange={handleNameChange}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <h3 className="mb-2 text-lg font-medium">Bill Items</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Shared items are pre-selected. Uncheck any shared items you
                didn't have.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Select</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Shared</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billData.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={checked =>
                            handleItemSelect(item.id, !!checked)
                          }
                          disabled={!participantName}
                        />
                      </TableCell>
                      <TableCell>
                        {item.name}{" "}
                        {item.quantity > 1 ? `(x${item.quantity})` : ""}
                      </TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.shared ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !participantName || selectedItems.length === 0 || isSubmitting
              }
            >
              {isSubmitting ? "Saving..." : "Save My Selections"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
