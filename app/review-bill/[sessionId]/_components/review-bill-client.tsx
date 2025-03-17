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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, ArrowRight, Trash2, Check } from "lucide-react"
import BillTable from "@/components/bill-table"
import { BillItemWithSelection } from "@/types"
import { updateBillItemsAction } from "@/actions/db/bills-actions"
import { updateParticipantSelectionsAction } from "@/actions/db/participants-actions"
import { SelectBill } from "@/db/schema/bills-schema"
import { SelectBillItem } from "@/db/schema/bill-items-schema"
import { SelectParticipant } from "@/db/schema/participants-schema"
import { SelectItemSelection } from "@/db/schema/item-selections-schema"
import { toast } from "@/components/ui/use-toast"
import ItemSelector from "@/components/item-selector"
import { formatCurrency } from "@/lib/utils"

interface ReviewBillClientProps {
  billData: {
    bill: SelectBill
    items: SelectBillItem[]
    participants: (SelectParticipant & { selections: SelectItemSelection[] })[]
  }
  sessionId: string
}

export default function ReviewBillClient({
  billData,
  sessionId
}: ReviewBillClientProps) {
  const router = useRouter()
  const [bill, setBill] = useState<SelectBill>(billData.bill)
  const [items, setItems] = useState<BillItemWithSelection[]>([])
  const [hostParticipant, setHostParticipant] =
    useState<SelectParticipant | null>(null)
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("1")
  const [isSaving, setIsSaving] = useState(false)

  // New states for the item selection step
  const [currentStep, setCurrentStep] = useState<
    "review" | "select" | "success"
  >("select")
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [isSubmittingSelections, setIsSubmittingSelections] = useState(false)

  // Process the bill data
  useEffect(() => {
    // Find the host participant
    const host = billData.participants.find(
      p => p.name === billData.bill.hostName
    )
    setHostParticipant(host || null)

    // Process items to include selectedBy information
    const processedItems = billData.items.map(item => {
      // Find all selections for this item
      const selectedBy = billData.participants
        .filter(participant =>
          participant.selections.some(
            selection => selection.billItemId === item.id
          )
        )
        .map(participant => participant.name)

      return {
        ...item,
        selectedBy,
        selected: selectedBy.includes(billData.bill.hostName)
      }
    })

    setItems(processedItems)

    // Initialize selected items based on host's current selections
    if (host) {
      const hostSelections =
        billData.participants
          .find(p => p.id === host.id)
          ?.selections.map(s => s.billItemId) || []

      // Also include shared items
      const sharedItemIds = billData.items
        .filter(item => item.shared)
        .map(item => item.id)

      setSelectedItemIds([...new Set([...hostSelections, ...sharedItemIds])])
    }
  }, [billData])

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return

    // Create a new item with temporary ID (will be replaced on save)
    const newItem: BillItemWithSelection = {
      id: `temp-${Date.now()}`,
      billId: bill.id,
      name: newItemName,
      price: newItemPrice,
      quantity: Number.parseInt(newItemQuantity) || 1,
      shared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      selectedBy: [],
      selected: false
    }

    setItems([...items, newItem])

    // Reset form
    setNewItemName("")
    setNewItemPrice("")
    setNewItemQuantity("1")
  }

  const handleUpdateItem = (
    id: string,
    field: keyof BillItemWithSelection,
    value: any
  ) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })

    setItems(updatedItems)
  }

  const handleToggleShared = (id: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, shared: !item.shared }
      }
      return item
    })

    setItems(updatedItems)
  }

  const handleHostSelection = (id: string, checked: boolean) => {
    if (!hostParticipant) return

    const updatedItems = items.map(item => {
      if (item.id === id) {
        const currentSelectedBy = item.selectedBy || []
        if (checked) {
          // Add host to selectedBy if not already there
          if (!currentSelectedBy.includes(bill.hostName)) {
            return {
              ...item,
              selectedBy: [...currentSelectedBy, bill.hostName],
              selected: true
            }
          }
        } else {
          // Remove host from selectedBy
          return {
            ...item,
            selectedBy: currentSelectedBy.filter(
              (name: string) => name !== bill.hostName
            ),
            selected: false
          }
        }
      }
      return item
    })

    setItems(updatedItems)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleSaveAndContinue = async () => {
    if (!hostParticipant) return

    setIsSaving(true)

    try {
      // Filter out temporary items (they will be created in the next step)
      const existingItems = items.filter(item => !item.id.startsWith("temp-"))
      const newItems = items.filter(item => item.id.startsWith("temp-"))

      // Update existing items
      if (existingItems.length > 0) {
        // Remove the selectedBy and selected properties before sending to the server
        const itemsToUpdate = existingItems.map(
          ({ selectedBy, selected, ...item }) => item
        )
        const { isSuccess, message } =
          await updateBillItemsAction(itemsToUpdate)

        if (!isSuccess) {
          toast({
            title: "Error",
            description: message,
            variant: "destructive"
          })
          return
        }
      }

      // We're already in the selection step, so no need to set it here
    } catch (error) {
      console.error("Error saving bill:", error)
      toast({
        title: "Error",
        description: "Failed to save bill. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectionChange = (itemIds: string[]) => {
    setSelectedItemIds(itemIds)
  }

  const handleSubmitSelections = async () => {
    if (!hostParticipant) return

    setIsSubmittingSelections(true)

    try {
      // Update host's selections
      const { isSuccess, message } = await updateParticipantSelectionsAction(
        hostParticipant.id,
        selectedItemIds.filter(id => !id.startsWith("temp-")) // Filter out temporary IDs
      )

      if (!isSuccess) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        })
        return
      }

      // Show success state
      setCurrentStep("success")
    } catch (error) {
      console.error("Error saving selections:", error)
      toast({
        title: "Error",
        description: "Failed to save your selections. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingSelections(false)
    }
  }

  const handleGoToShare = () => {
    router.push(`/share/${sessionId}`)
  }

  // Calculate total
  const calculateTotal = () => {
    const itemsTotal = items.reduce(
      (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
      0
    )
    const tax = parseFloat(bill.tax?.toString() || "0")
    const tip = parseFloat(bill.tip?.toString() || "0")
    return (itemsTotal + tax + tip).toFixed(2)
  }

  // If we're in the selection step, show the item selection UI
  if (currentStep === "select") {
    return (
      <div className="mx-auto max-w-md space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Select What You Ate</CardTitle>
            <CardDescription>
              Choose the items you ordered at{" "}
              {bill.restaurantName || "the restaurant"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-medium">Bill Items</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Shared items are pre-selected. Select all items that you
                personally ordered.
              </p>

              <ItemSelector
                items={items.map(item => ({
                  ...item,
                  selected: selectedItemIds.includes(item.id)
                }))}
                participantSelections={selectedItemIds}
                onChange={handleSelectionChange}
                className=""
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full"
              onClick={handleSubmitSelections}
              disabled={selectedItemIds.length === 0 || isSubmittingSelections}
            >
              {isSubmittingSelections ? "Saving..." : "Save My Selections"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCurrentStep("review")}
            >
              Back to Review
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

  // If we're in the success step, show the success UI
  if (currentStep === "success") {
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
              Now you can share the bill with your friends so they can select
              their items.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleGoToShare}>
              Share Bill
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Default view (review step)
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={bill.restaurantName || ""}
                onChange={e =>
                  setBill({ ...bill, restaurantName: e.target.value })
                }
                placeholder="Enter restaurant name"
              />
            </div>

            <div>
              <Label htmlFor="hostName">Host Name</Label>
              <Input
                id="hostName"
                value={bill.hostName}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bill Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <BillTable
              items={items}
              editable={true}
              onItemsChange={updatedItems => {
                setItems(updatedItems)
                // Process any updates that need to be handled
                updatedItems.forEach((item, index) => {
                  const originalItem = items[index]
                  if (originalItem && originalItem.id === item.id) {
                    // Check if shared status changed
                    if (originalItem.shared !== item.shared) {
                      handleToggleShared(item.id)
                    }

                    // Check if selection changed
                    if (originalItem.selected !== item.selected) {
                      handleHostSelection(item.id, !!item.selected)
                    }
                  }
                })
              }}
            />

            {/* Item deletion buttons */}
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Delete Items</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {items.map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="text-destructive mr-2 size-4" />
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="newItemName">Item Name</Label>
                <Input
                  id="newItemName"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="newItemQuantity">Quantity</Label>
                <Input
                  id="newItemQuantity"
                  type="number"
                  min="1"
                  value={newItemQuantity}
                  onChange={e => setNewItemQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newItemPrice">Price</Label>
                <Input
                  id="newItemPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemPrice}
                  onChange={e => setNewItemPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-4">
                <Button
                  onClick={handleAddItem}
                  disabled={!newItemName || !newItemPrice}
                  className="w-full"
                >
                  <Plus className="mr-2 size-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="tax">Tax</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={parseFloat(bill.tax?.toString() || "0")}
                onChange={e =>
                  setBill({
                    ...bill,
                    tax: e.target.value
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="tip">Tip</Label>
              <Input
                id="tip"
                type="number"
                step="0.01"
                min="0"
                value={parseFloat(bill.tip?.toString() || "0")}
                onChange={e =>
                  setBill({
                    ...bill,
                    tip: e.target.value
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-lg font-semibold">
            Total: ${calculateTotal()}
          </div>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving || items.length === 0}
          >
            {isSaving ? "Saving..." : "Continue"}
            {!isSaving && <ArrowRight className="ml-2 size-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
