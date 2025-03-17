"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

export default function CopyLinkButton({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const url = `${window.location.origin}/join/${sessionId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="size-7 md:size-8"
            aria-label="Copy link"
          >
            <Copy
              className={`size-3.5 md:size-4 ${copied ? "text-green-500" : ""}`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{copied ? "Copied!" : "Copy link"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
