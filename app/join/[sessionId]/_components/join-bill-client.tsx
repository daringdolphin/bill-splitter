"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectBill } from "@/db/schema/bills-schema"
import { SelectBillItem } from "@/db/schema/bill-items-schema"
import {
  SelectParticipant,
  SelectItemSelection
} from "@/db/schema/participants-schema"
import {
  addParticipantAction,
  updateParticipantSelectionsAction
} from "@/actions/db/participants-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ItemSelector from "@/components/item-selector"
import { Check } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface JoinBillClientProps {
  sessionId: string
  bill: SelectBill
  items: SelectBillItem[]
  participants: (SelectParticipant & { selections: SelectItemSelection[] })[]
}

export default function JoinBillClient({
  sessionId,
  bill,
  items,
  participants
}: JoinBillClientProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    // Pre-select shared items
    items.filter(item => item.shared).map(item => item.id)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [participant, setParticipant] = useState<SelectParticipant | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setNameError("")
  }

  const handleSelectionChange = (itemIds: string[]) => {
    setSelectedItemIds(itemIds)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError("Please enter your name")
      return
    }

    // Check if name already exists
    const nameExists = participants.some(
      p => p.name.toLowerCase() === name.trim().toLowerCase()
    )

    if (nameExists) {
      setNameError("This name is already taken. Please use a different name.")
      return
    }

    setIsSubmitting(true)

    try {
      // Add participant
      const participantResult = await addParticipantAction({
        billId: bill.id,
        name: name.trim()
      })

      if (!participantResult.isSuccess) {
        setNameError(participantResult.message)
        setIsSubmitting(false)
        return
      }

      // Save participant for later use
      setParticipant(participantResult.data)

      // Update selections
      const selectionsResult = await updateParticipantSelectionsAction(
        participantResult.data.id,
        selectedItemIds
      )

      if (!selectionsResult.isSuccess) {
        setNameError(selectionsResult.message)
        setIsSubmitting(false)
        return
      }

      // Success!
      setIsSuccess(true)
    } catch (error) {
      console.error("Error joining bill:", error)
      setNameError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess && participant) {
    return (
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
              {bill.restaurantName || "the restaurant"}.
            </p>
            <p className="text-muted-foreground text-sm">
              The host will be able to see your selections in the bill summary.
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
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{bill.restaurantName || "Restaurant Bill"}</CardTitle>
          <CardDescription>
            Select the items you ordered to split the bill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className={nameError ? "border-destructive" : ""}
            />
            {nameError && (
              <p className="text-destructive mt-1 text-sm">{nameError}</p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">Bill Items</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Shared items are pre-selected. Uncheck any shared items you didn't
              have.
            </p>

            <ItemSelector
              items={items}
              selectedItemIds={selectedItemIds}
              onSelectionChange={handleSelectionChange}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              !name.trim() || selectedItemIds.length === 0 || isSubmitting
            }
          >
            {isSubmitting ? "Saving..." : "Save My Selections"}
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-muted rounded-md p-4">
        <h3 className="mb-2 font-medium">Bill Summary</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {formatCurrency(
                parseFloat(bill.total) -
                  parseFloat(bill.tax) -
                  parseFloat(bill.tip)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(parseFloat(bill.tax))}</span>
          </div>
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>{formatCurrency(parseFloat(bill.tip))}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatCurrency(parseFloat(bill.total))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
