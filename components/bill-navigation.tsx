"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BillNavigationProps {
  sessionId: string
  className?: string
}

export default function BillNavigation({
  sessionId,
  className
}: BillNavigationProps) {
  const pathname = usePathname()

  const isJoinPage = pathname.includes(`/join/${sessionId}`)
  const isSummaryPage = pathname.includes(`/summary/${sessionId}`)

  return (
    <div className={cn("flex space-x-2", className)}>
      <Link href={`/join/${sessionId}`}>
        <Button variant={isJoinPage ? "default" : "outline"} size="sm">
          Join Bill
        </Button>
      </Link>
      <Link href={`/summary/${sessionId}`}>
        <Button variant={isSummaryPage ? "default" : "outline"} size="sm">
          View Summary
        </Button>
      </Link>
    </div>
  )
}
