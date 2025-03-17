"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { v4 as uuidv4 } from "@/lib/uuid"
import type { BillData, BillItem } from "@/lib/types"

export default function ReviewBill() {
  const router = useRouter()
  const [billData, setBillData] = useState<BillData | null>(null)
  const [hostName, setHostName] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("1")

  useEffect(() => {
    // Load bill data from localStorage
    const storedData = localStorage.getItem("billData")
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        // Ensure each item has an id and shared property
        const itemsWithIds = parsedData.items.map((item: any) => ({
          ...item,
          id: item.id || uuidv4(),
          shared: item.shared || false,
          selectedBy: item.selectedBy || []
        }))

        setBillData({
          ...parsedData,
          items: itemsWithIds,
          sessionId: parsedData.sessionId || uuidv4()
        })
      } catch (error) {
        console.error("Error parsing bill data:", error)
        router.push("/create-bill")
      }
    } else {
      router.push("/create-bill")
    }
  }, [router])

  const handleAddItem = () => {
    if (!billData || !newItemName || !newItemPrice) return

    const newItem: BillItem = {
      id: uuidv4(),
      name: newItemName,
      price: Number.parseFloat(newItemPrice),
      quantity: Number.parseInt(newItemQuantity) || 1,
      shared: false,
      selectedBy: []
    }

    setBillData({
      ...billData,
      items: [...billData.items, newItem],
      total: billData.total + newItem.price * newItem.quantity
    })

    // Reset form
    setNewItemName("")
    setNewItemPrice("")
    setNewItemQuantity("1")
  }

  const handleDeleteItem = (id: string) => {
    if (!billData) return

    const itemToDelete = billData.items.find(item => item.id === id)
    if (!itemToDelete) return

    const updatedItems = billData.items.filter(item => item.id !== id)
    const updatedTotal =
      billData.total - itemToDelete.price * itemToDelete.quantity

    setBillData({
      ...billData,
      items: updatedItems,
      total: updatedTotal
    })
  }

  const handleToggleShared = (id: string) => {
    if (!billData) return

    const updatedItems = billData.items.map(item => {
      if (item.id === id) {
        return { ...item, shared: !item.shared }
      }
      return item
    })

    setBillData({
      ...billData,
      items: updatedItems
    })
  }

  const handleHostSelection = (id: string, checked: boolean) => {
    if (!billData || !hostName) return

    const updatedItems = billData.items.map(item => {
      if (item.id === id) {
        const currentSelectedBy = item.selectedBy || []
        if (checked) {
          // Add host to selectedBy if not already there
          if (!currentSelectedBy.includes(hostName)) {
            return { ...item, selectedBy: [...currentSelectedBy, hostName] }
          }
        } else {
          // Remove host from selectedBy
          return {
            ...item,
            selectedBy: currentSelectedBy.filter(name => name !== hostName)
          }
        }
      }
      return item
    })

    setBillData({
      ...billData,
      items: updatedItems
    })
  }

  const handleUpdateItem = (id: string, field: keyof BillItem, value: any) => {
    if (!billData) return

    const updatedItems = billData.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    })

    // Recalculate total
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    setBillData({
      ...billData,
      items: updatedItems,
      total: newTotal
    })
  }

  const handleContinue = () => {
    if (!billData || !hostName) return

    // Update bill data with host name
    const updatedBillData = {
      ...billData,
      hostName,
      participants: [hostName]
    }

    // Save updated bill data to localStorage
    localStorage.setItem("billData", JSON.stringify(updatedBillData))

    // Navigate to the share page
    router.push(`/share/${updatedBillData.sessionId}`)
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
      <h1 className="mb-8 text-center text-3xl font-bold">Review Bill</h1>

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
                  value={billData.restaurantName || ""}
                  onChange={e =>
                    setBillData({ ...billData, restaurantName: e.target.value })
                  }
                  placeholder="Enter restaurant name"
                />
              </div>

              <div>
                <Label htmlFor="hostName">Your Name (Host)</Label>
                <Input
                  id="hostName"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="Enter your name"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Shared</TableHead>
                    <TableHead>Your Item</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billData.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={e =>
                            handleUpdateItem(item.id, "name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e =>
                            handleUpdateItem(
                              item.id,
                              "quantity",
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={e =>
                            handleUpdateItem(
                              item.id,
                              "price",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.shared}
                          onCheckedChange={() => handleToggleShared(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={(item.selectedBy || []).includes(hostName)}
                          onCheckedChange={checked =>
                            handleHostSelection(item.id, !!checked)
                          }
                          disabled={!hostName}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
                  value={billData.tax || 0}
                  onChange={e =>
                    setBillData({
                      ...billData,
                      tax: Number.parseFloat(e.target.value) || 0
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
                  value={billData.tip || 0}
                  onChange={e =>
                    setBillData({
                      ...billData,
                      tip: Number.parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-lg font-semibold">
              Total: $
              {(
                (billData.total || 0) +
                (billData.tax || 0) +
                (billData.tip || 0)
              ).toFixed(2)}
            </div>
            <Button
              onClick={handleContinue}
              disabled={!hostName || billData.items.length === 0}
            >
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
