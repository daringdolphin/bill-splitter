"use client"

import { useState, useEffect } from "react"
import { BillItemWithSelection } from "@/types"
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

interface ItemSelectorProps {
  items: BillItemWithSelection[]
  participantSelections?: string[] // IDs of items already selected by this participant
  onChange: (selectedItemIds: string[]) => void
  className?: string
}

export default function ItemSelector({
  items,
  participantSelections = [],
  onChange,
  className
}: ItemSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    participantSelections
  )

  // Initialize shared items as selected
  useEffect(() => {
    const sharedItemIds = items.filter(item => item.shared).map(item => item.id)

    const initialSelections = [
      ...new Set([...participantSelections, ...sharedItemIds])
    ]
    setSelectedItems(initialSelections)
    onChange(initialSelections)
  }, [items, participantSelections, onChange])

  const handleSelectionChange = (itemId: string, checked: boolean) => {
    let newSelectedItems: string[]

    if (checked) {
      newSelectedItems = [...selectedItems, itemId]
    } else {
      newSelectedItems = selectedItems.filter(id => id !== itemId)
    }

    setSelectedItems(newSelectedItems)
    onChange(newSelectedItems)
  }

  const isItemSelected = (itemId: string) => {
    return selectedItems.includes(itemId)
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="w-[80px] text-right">Qty</TableHead>
            <TableHead className="w-[100px] text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.id}
              className={cn(
                item.shared && "bg-muted/50",
                isItemSelected(item.id) && !item.shared && "bg-primary/10"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={isItemSelected(item.id)}
                  onCheckedChange={checked =>
                    handleSelectionChange(item.id, !!checked)
                  }
                  disabled={item.shared} // Shared items cannot be unselected
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span>{item.name}</span>
                  {item.shared && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      (shared by all)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ${parseFloat(item.price.toString()).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
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
