"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { SelectBillItem } from "@/db/schema/bill-items-schema"

export interface BillTableItem extends SelectBillItem {
  selectedBy?: string[]
}

interface BillTableProps {
  items: BillTableItem[]
  hostName?: string
  isEditable?: boolean
  onUpdateItem?: (id: string, field: keyof BillTableItem, value: any) => void
  onToggleShared?: (id: string) => void
  onHostSelection?: (id: string, checked: boolean) => void
  onDeleteItem?: (id: string) => void
}

export default function BillTable({
  items,
  hostName,
  isEditable = true,
  onUpdateItem,
  onToggleShared,
  onHostSelection,
  onDeleteItem
}: BillTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Shared</TableHead>
            {hostName && <TableHead>Your Item</TableHead>}
            {isEditable && onDeleteItem && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                {isEditable && onUpdateItem ? (
                  <Input
                    value={item.name}
                    onChange={e =>
                      onUpdateItem(item.id, "name", e.target.value)
                    }
                  />
                ) : (
                  <span>{item.name}</span>
                )}
              </TableCell>
              <TableCell>
                {isEditable && onUpdateItem ? (
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e =>
                      onUpdateItem(
                        item.id,
                        "quantity",
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                    className="w-20"
                  />
                ) : (
                  <span>{item.quantity}</span>
                )}
              </TableCell>
              <TableCell>
                {isEditable && onUpdateItem ? (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={parseFloat(item.price.toString())}
                    onChange={e =>
                      onUpdateItem(
                        item.id,
                        "price",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-24"
                  />
                ) : (
                  <span>${parseFloat(item.price.toString()).toFixed(2)}</span>
                )}
              </TableCell>
              <TableCell>
                {isEditable && onToggleShared ? (
                  <Switch
                    checked={item.shared}
                    onCheckedChange={() => onToggleShared(item.id)}
                  />
                ) : (
                  <span>{item.shared ? "Yes" : "No"}</span>
                )}
              </TableCell>
              {hostName && (
                <TableCell>
                  {onHostSelection ? (
                    <Checkbox
                      checked={(item.selectedBy || []).includes(hostName)}
                      onCheckedChange={checked =>
                        onHostSelection(item.id, !!checked)
                      }
                      disabled={!hostName}
                    />
                  ) : (
                    <span>
                      {(item.selectedBy || []).includes(hostName)
                        ? "Yes"
                        : "No"}
                    </span>
                  )}
                </TableCell>
              )}
              {isEditable && onDeleteItem && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
