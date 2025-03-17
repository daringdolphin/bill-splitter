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
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        <div className="rounded-lg border p-3 md:p-4">
          <div className="text-muted-foreground text-xs font-medium md:text-sm">
            Total Bill
          </div>
          <div className="mt-1 text-xl font-bold md:text-2xl">
            ${parseFloat(totalBill).toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg border p-3 md:p-4">
          <div className="text-muted-foreground text-xs font-medium md:text-sm">
            Total Paid
          </div>
          <div className="mt-1 text-xl font-bold md:text-2xl">${totalPaid}</div>
        </div>

        <div className="rounded-lg border p-3 sm:col-span-2 md:col-span-1 md:p-4">
          <div className="text-muted-foreground text-xs font-medium md:text-sm">
            Remaining
          </div>
          <div
            className={cn(
              "mt-1 text-xl font-bold md:text-2xl",
              parseFloat(remaining) > 0 ? "text-destructive" : "text-green-600"
            )}
          >
            ${remaining}
          </div>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <h3 className="text-base font-medium md:text-lg">Participant Shares</h3>
        {participantShares.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {participantShares.map(share => (
              <Accordion
                key={share.participantId}
                type="single"
                collapsible
                className="rounded-md border"
              >
                <AccordionItem value="items">
                  <AccordionTrigger className="p-3 hover:no-underline md:px-4">
                    <div className="flex w-full justify-between">
                      <span className="text-sm md:text-base">
                        {share.participantName}
                      </span>
                      <span className="text-sm font-bold md:text-base">
                        ${share.total}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 md:px-4 md:pb-4">
                    <div className="mb-2">
                      <div className="text-muted-foreground mb-2 text-xs md:text-sm">
                        Items selected by {share.participantName}:
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs md:text-sm">
                                Item
                              </TableHead>
                              <TableHead className="w-[60px] text-right text-xs md:w-[80px] md:text-sm">
                                Qty
                              </TableHead>
                              <TableHead className="w-[80px] text-right text-xs md:w-[100px] md:text-sm">
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
                                  <TableCell className="py-2 text-xs md:py-3 md:text-sm">
                                    <div className="flex items-center">
                                      <span>{item.itemName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
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
                                  <TableCell className="py-2 text-xs md:py-3 md:text-sm">
                                    <div className="flex items-center">
                                      <span>{item.itemName}</span>
                                      <span className="text-muted-foreground ml-1 text-[10px] md:ml-2 md:text-xs">
                                        (shared)
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
                                    ${item.sharedCost}
                                  </TableCell>
                                </TableRow>
                              ))}

                            {share.items.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={3}
                                  className="text-muted-foreground py-3 text-center text-xs md:text-sm"
                                >
                                  No items selected
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    {sessionId && (
                      <div className="mt-3 flex justify-end md:mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/join/${sessionId}?participantId=${share.participantId}`}
                            className="text-xs md:text-sm"
                          >
                            <Edit className="mr-1 size-3 md:mr-2 md:size-4" />
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
          <div className="text-muted-foreground rounded-md border py-4 text-center text-xs md:py-6 md:text-sm">
            No participant shares available
          </div>
        )}
      </div>

      {unclaimedItems.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base font-medium md:text-lg">Unclaimed Items</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Item</TableHead>
                  <TableHead className="w-[60px] text-right text-xs md:w-[80px] md:text-sm">
                    Qty
                  </TableHead>
                  <TableHead className="w-[80px] text-right text-xs md:w-[100px] md:text-sm">
                    Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unclaimedItems.map(item => (
                  <TableRow key={item.itemId}>
                    <TableCell className="py-2 text-xs md:py-3 md:text-sm">
                      {item.itemName}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs md:py-3 md:text-sm">
                      ${item.price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
