"use client"

import { useState } from "react"
import { BillItemWithSelection } from "@/types"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface BillTableProps {
  items: BillItemWithSelection[]
  editable?: boolean
  selectable?: boolean
  onItemsChange?: (items: BillItemWithSelection[]) => void
  onSelectionChange?: (items: BillItemWithSelection[]) => void
  className?: string
}

export default function BillTable({
  items,
  editable = false,
  selectable = false,
  onItemsChange,
  onSelectionChange,
  className
}: BillTableProps) {
  const [billItems, setBillItems] = useState<BillItemWithSelection[]>(items)

  const handleItemChange = (
    index: number,
    field: keyof BillItemWithSelection,
    value: any
  ) => {
    const updatedItems = [...billItems]

    if (field === "price" && typeof value === "string") {
      // Ensure price is a valid number
      const numericValue = value.replace(/[^0-9.]/g, "")
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue }
    } else if (field === "quantity" && typeof value === "string") {
      // Ensure quantity is a valid integer
      const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 1
      updatedItems[index] = { ...updatedItems[index], [field]: numericValue }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value }
    }

    setBillItems(updatedItems)
    onItemsChange?.(updatedItems)
  }

  const handleSelectionChange = (index: number, selected: boolean) => {
    const updatedItems = [...billItems]
    updatedItems[index] = { ...updatedItems[index], selected }
    setBillItems(updatedItems)
    onSelectionChange?.(updatedItems)
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Item</TableHead>
            <TableHead className="w-[60px] text-right">Qty</TableHead>
            <TableHead className="w-[80px] text-right">Price</TableHead>
            {editable && (
              <TableHead className="w-[70px] text-center">Shared</TableHead>
            )}
            {selectable && (
              <TableHead className="w-[70px] text-center">Select</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {billItems.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {editable ? (
                  <Input
                    value={item.name}
                    onChange={e =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="flex items-center">
                    <span className="truncate">{item.name}</span>
                    {item.shared && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        (shared)
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editable ? (
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="h-8 w-14 text-right text-sm"
                  />
                ) : (
                  item.quantity
                )}
              </TableCell>
              <TableCell className="text-right">
                {editable ? (
                  <Input
                    value={item.price}
                    onChange={e =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    className="h-8 w-20 text-right text-sm"
                    placeholder="0.00"
                  />
                ) : (
                  `$${parseFloat(item.price.toString()).toFixed(2)}`
                )}
              </TableCell>
              {editable && (
                <TableCell className="p-2 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={item.shared}
                      onCheckedChange={checked =>
                        handleItemChange(index, "shared", checked)
                      }
                    />
                  </div>
                </TableCell>
              )}
              {selectable && (
                <TableCell className="p-2 text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={checked =>
                        handleSelectionChange(index, !!checked)
                      }
                      disabled={item.shared} // Shared items are automatically selected
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {billItems.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={editable ? 4 : selectable ? 4 : 3}
                className="text-muted-foreground py-6 text-center"
              >
                No items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
