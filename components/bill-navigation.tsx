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
    <div
      className={cn(
        "flex w-full justify-center gap-2 sm:w-auto sm:justify-end",
        className
      )}
    >
      <Link href={`/join/${sessionId}`} className="w-full sm:w-auto">
        <Button
          variant={isJoinPage ? "default" : "outline"}
          size="sm"
          className="w-full text-xs md:text-sm"
        >
          Join Bill
        </Button>
      </Link>
      <Link href={`/summary/${sessionId}`} className="w-full sm:w-auto">
        <Button
          variant={isSummaryPage ? "default" : "outline"}
          size="sm"
          className="w-full text-xs md:text-sm"
        >
          View Summary
        </Button>
      </Link>
    </div>
  )
}
