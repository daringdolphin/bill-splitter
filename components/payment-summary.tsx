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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface PaymentSummaryProps {
  participantShares: Record<string, number>
  unclaimed: SelectBillItem[]
  restaurantName?: string | null
}

export default function PaymentSummary({
  participantShares,
  unclaimed,
  restaurantName
}: PaymentSummaryProps) {
  const hasUnclaimed = unclaimed.length > 0
  const participants = Object.keys(participantShares)
  const totalShared = Object.values(participantShares).reduce(
    (sum, amount) => sum + amount,
    0
  )

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            {restaurantName
              ? `How much each person owes for ${restaurantName}`
              : "How much each person owes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length > 0 ? (
                participants.map(person => (
                  <TableRow key={person}>
                    <TableCell className="font-medium">{person}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(participantShares[person])}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-muted-foreground text-center"
                  >
                    No participants have joined yet
                  </TableCell>
                </TableRow>
              )}

              {participants.length > 0 && (
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalShared)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {hasUnclaimed && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-500" />
              <CardTitle className="text-lg text-amber-700">
                Unclaimed Items
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              These items haven't been claimed by anyone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-100/50">
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unclaimed.map(item => {
                  const itemTotal = parseFloat(item.price) * item.quantity

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {formatCurrency(parseFloat(item.price))}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(itemTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })}

                <TableRow className="border-t-2 border-amber-200">
                  <TableCell colSpan={3} className="font-bold">
                    Total Unclaimed
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      unclaimed.reduce(
                        (sum, item) =>
                          sum + parseFloat(item.price) * item.quantity,
                        0
                      )
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
