"use client"

import { SelectBillItem } from "@/db/schema/bill-items-schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

interface ItemSelectorProps {
  items: SelectBillItem[]
  selectedItemIds: string[]
  onSelectionChange: (selectedItemIds: string[]) => void
  disabled?: boolean
}

export default function ItemSelector({
  items,
  selectedItemIds,
  onSelectionChange,
  disabled = false
}: ItemSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedItemIds)

  const handleToggleItem = (itemId: string) => {
    const newSelected = selected.includes(itemId)
      ? selected.filter(id => id !== itemId)
      : [...selected, itemId]

    setSelected(newSelected)
    onSelectionChange(newSelected)
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => {
            const isShared = item.shared
            const isSelected = selected.includes(item.id)
            const itemTotal = parseFloat(item.price) * item.quantity

            return (
              <TableRow key={item.id} className={isShared ? "bg-muted/50" : ""}>
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleItem(item.id)}
                    disabled={disabled}
                    aria-label={`Select ${item.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {item.name}
                  {isShared && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      (shared)
                    </span>
                  )}
                </TableCell>
                <TableCell>{formatCurrency(parseFloat(item.price))}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(itemTotal)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
