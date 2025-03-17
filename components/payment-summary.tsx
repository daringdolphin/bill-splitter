"use client"

import { PaymentSummary, ParticipantShare, UnclaimedItem } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit } from "lucide-react"

interface PaymentSummaryComponentProps {
  summary: PaymentSummary
  className?: string
  sessionId?: string
}

export default function PaymentSummaryComponent({
  summary,
  className,
  sessionId
}: PaymentSummaryComponentProps) {
  const { participantShares, unclaimedItems, totalPaid, totalBill } = summary

  // Calculate remaining amount
  const remaining = (parseFloat(totalBill) - parseFloat(totalPaid)).toFixed(2)

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Total Bill
          </div>
          <div className="mt-1 text-2xl font-bold">
            ${parseFloat(totalBill).toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Total Paid
          </div>
          <div className="mt-1 text-2xl font-bold">${totalPaid}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-sm font-medium">
            Remaining
          </div>
          <div
            className={cn(
              "mt-1 text-2xl font-bold",
              parseFloat(remaining) > 0 ? "text-destructive" : "text-green-600"
            )}
          >
            ${remaining}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Participant Shares</h3>
        {participantShares.length > 0 ? (
          <div className="space-y-4">
            {participantShares.map(share => (
              <Accordion
                key={share.participantId}
                type="single"
                collapsible
                className="rounded-md border"
              >
                <AccordionItem value="items">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex w-full justify-between">
                      <span>{share.participantName}</span>
                      <span className="font-bold">${share.total}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="mb-2">
                      <div className="text-muted-foreground mb-2 text-sm">
                        Items selected by {share.participantName}:
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-[80px] text-right">
                              Qty
                            </TableHead>
                            <TableHead className="w-[100px] text-right">
                              Price
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Group items by shared status */}
                          {/* First show non-shared items */}
                          {share.items
                            .filter(item => !item.shared)
                            .map(item => (
                              <TableRow key={item.itemId}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span>{item.itemName}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  ${item.price}
                                </TableCell>
                              </TableRow>
                            ))}

                          {/* Then show shared items */}
                          {share.items
                            .filter(item => item.shared)
                            .map(item => (
                              <TableRow
                                key={item.itemId}
                                className="bg-muted/30"
                              >
                                <TableCell>
                                  <div className="flex items-center">
                                    <span>{item.itemName}</span>
                                    <span className="text-muted-foreground ml-2 text-xs">
                                      (shared)
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  ${item.sharedCost}
                                </TableCell>
                              </TableRow>
                            ))}

                          {share.items.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="text-muted-foreground py-4 text-center"
                              >
                                No items selected
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {sessionId && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/join/${sessionId}?participantId=${share.participantId}`}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit Selections
                          </Link>
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground rounded-md border py-6 text-center">
            No participant shares available
          </div>
        )}
      </div>

      {unclaimedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Unclaimed Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-[80px] text-right">Qty</TableHead>
                <TableHead className="w-[100px] text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unclaimedItems.map(item => (
                <TableRow key={item.itemId}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
