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
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createBillAction } from "@/actions/db/bills-actions"
import { BillData } from "@/lib/types"

export default function CreateBill() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [hostName, setHostName] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [items, setItems] = useState([
    { name: "", price: "", quantity: 1, shared: false }
  ])
  const [tax, setTax] = useState("")
  const [tip, setTip] = useState("")
  const [subtotalInput, setSubtotalInput] = useState("")
  const [totalInput, setTotalInput] = useState("")

  // Check for bill data in localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("billData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as BillData

        // Update form state with the stored data
        setRestaurantName(parsedData.restaurantName || "")

        // Format items for the form
        const formattedItems = parsedData.items.map(item => ({
          name: item.name,
          price: item.price.toString(),
          quantity: item.quantity,
          shared: item.shared
        }))

        setItems(formattedItems)
        setTax(parsedData.tax?.toString() || "")
        setTip(parsedData.tip?.toString() || "")

        // Clear the stored data to prevent it from being used again
        localStorage.removeItem("billData")
      } catch (error) {
        console.error("Error parsing stored bill data:", error)
      }
    }
  }, [])

  // Calculate subtotal and total
  const calculatedSubtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = item.quantity || 1
    return sum + price * quantity
  }, 0)

  const taxAmount = parseFloat(tax) || 0
  const tipAmount = parseFloat(tip) || 0

  // Use input values if provided, otherwise use calculated values
  const subtotal = subtotalInput
    ? parseFloat(subtotalInput)
    : calculatedSubtotal
  const total = totalInput
    ? parseFloat(totalInput)
    : subtotal + taxAmount + tipAmount

  // Update inputs when calculated values change (if empty)
  useEffect(() => {
    if (subtotalInput === "") {
      setSubtotalInput(calculatedSubtotal.toFixed(2))
    }

    if (totalInput === "") {
      const calculatedTotal = (subtotal + taxAmount + tipAmount).toFixed(2)
      setTotalInput(calculatedTotal)
    }
  }, [calculatedSubtotal, taxAmount, tipAmount, subtotal])

  // Add a new empty item
  const addItem = () => {
    setItems([...items, { name: "", price: "", quantity: 1, shared: false }])
  }

  // Remove an item at a specific index
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Update an item at a specific index
  const updateItem = (
    index: number,
    field: "name" | "price" | "quantity" | "shared",
    value: string | number | boolean
  ) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate form
    if (!hostName.trim()) {
      setError("Host name is required")
      setIsSubmitting(false)
      return
    }

    if (items.some(item => !item.name.trim() || !item.price)) {
      setError("All items must have a name and price")
      setIsSubmitting(false)
      return
    }

    try {
      // Format data for the action
      const formattedItems = items.map(item => ({
        name: item.name.trim(),
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
        shared: item.shared
      }))

      // Call the server action
      const result = await createBillAction({
        hostName: hostName.trim(),
        restaurantName: restaurantName.trim() || undefined,
        items: formattedItems,
        tax: taxAmount,
        tip: tipAmount,
        total
      })

      if (result.isSuccess) {
        // Redirect to the review page with the session ID
        router.push(`/review-bill/${result.data.sessionId}`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <h1 className="mb-8 text-center text-3xl font-bold">Create New Bill</h1>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>
                Enter the bill details to split with your friends
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hostName">Your Name (Host) *</Label>
                  <Input
                    id="hostName"
                    value={hostName}
                    onChange={e => setHostName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="Enter restaurant name"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                  >
                    <Plus className="mr-1 size-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="text-muted-foreground grid grid-cols-12 gap-2 px-3 text-sm font-medium">
                    <div className="col-span-12 md:col-span-5">Item</div>
                    <div className="col-span-4 md:col-span-2">Qty</div>
                    <div className="col-span-6 md:col-span-3">Price</div>
                    <div className="col-span-1 text-center">Shared</div>
                    <div className="col-span-1"></div>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 rounded-md border p-3"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <Input
                          value={item.name}
                          onChange={e =>
                            updateItem(index, "name", e.target.value)
                          }
                          placeholder="Item name"
                        />
                      </div>

                      <div className="col-span-4 md:col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          placeholder="Qty"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={e =>
                              updateItem(index, "price", e.target.value)
                            }
                            placeholder="0.00"
                            className="pl-7"
                          />
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`shared-${index}`}
                            checked={item.shared}
                            onCheckedChange={value =>
                              updateItem(index, "shared", value)
                            }
                          />
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="text-muted-foreground size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm">
                  <span>
                    Shared items will be split among those who select them
                  </span>
                </div>
              </div>

              {/* Tax and Tip */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      id="tax"
                      type="number"
                      step="0.01"
                      min="0"
                      value={tax}
                      onChange={e => setTax(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tip">Tip</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      id="tip"
                      type="number"
                      step="0.01"
                      min="0"
                      value={tip}
                      onChange={e => setTip(e.target.value)}
                      placeholder="0.00"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted rounded-md p-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={subtotalInput}
                      onChange={e => setSubtotalInput(e.target.value)}
                      className="h-8 pl-7 text-right"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Tip:</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t pt-2 font-medium">
                  <span>Total:</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalInput}
                      onChange={e => setTotalInput(e.target.value)}
                      className="h-8 pl-7 text-right font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Bill...
                  </>
                ) : (
                  "Create Bill"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
