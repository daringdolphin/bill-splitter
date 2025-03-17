"use client"

import { useState, useEffect, useRef } from "react"
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
  const initialRenderRef = useRef(true)
  const prevSelectedItemsRef = useRef<string[]>(selectedItems)

  // Initialize shared items as selected
  useEffect(() => {
    const sharedItemIds = items.filter(item => item.shared).map(item => item.id)

    const initialSelections = [
      ...new Set([...participantSelections, ...sharedItemIds])
    ]

    setSelectedItems(initialSelections)

    // Only call onChange on initial mount
    if (initialRenderRef.current) {
      onChange(initialSelections)
      initialRenderRef.current = false
    }
  }, [items, participantSelections]) // Remove onChange from dependencies

  // Call onChange only when selectedItems changes due to user interaction
  useEffect(() => {
    // Skip the first render and when selectedItems is updated by the first useEffect
    if (
      !initialRenderRef.current &&
      JSON.stringify(prevSelectedItemsRef.current) !==
        JSON.stringify(selectedItems)
    ) {
      onChange(selectedItems)
      prevSelectedItemsRef.current = [...selectedItems]
    }
  }, [selectedItems, onChange])

  const handleSelectionChange = (itemId: string, checked: boolean) => {
    let newSelectedItems: string[]

    if (checked) {
      newSelectedItems = [...selectedItems, itemId]
    } else {
      newSelectedItems = selectedItems.filter(id => id !== itemId)
    }

    setSelectedItems(newSelectedItems)
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
            <TableHead className="min-w-[120px]">Item</TableHead>
            <TableHead className="w-[60px] text-right">Qty</TableHead>
            <TableHead className="w-[80px] text-right">Price</TableHead>
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
              <TableCell className="p-2">
                <Checkbox
                  checked={isItemSelected(item.id)}
                  onCheckedChange={checked =>
                    handleSelectionChange(item.id, !!checked)
                  }
                  disabled={item.shared} // Shared items cannot be unselected
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <span className="truncate">{item.name}</span>
                  {item.shared && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      (shared)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm">
                {item.quantity}
              </TableCell>
              <TableCell className="text-right text-sm">
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
