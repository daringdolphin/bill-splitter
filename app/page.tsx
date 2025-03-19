"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, Users, DollarSign, Receipt } from "lucide-react"
import ReceiptProcessor from "@/components/receipt-processor"

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [method, setMethod] = useState<"capture" | "upload">("capture")

  const handleCaptureClick = () => {
    setMethod("capture")
    setIsDialogOpen(true)
  }

  const handleUploadClick = () => {
    setMethod("upload")
    setIsDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto p-4 md:px-6">
          <h1 className="text-primary text-3xl font-bold">SplitEase</h1>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Split Restaurant Bills Effortlessly
              </h2>
              <p className="text-muted-foreground max-w-[700px] md:text-xl">
                Upload a receipt, let AI extract the details, and share a link
                with your friends to split the bill fairly.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={handleUploadClick}>
                  <Upload className="mr-2 size-4" />
                  Upload Receipt
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                  <Receipt className="text-primary size-8" />
                </div>
                <h3 className="text-xl font-bold">Upload Receipt</h3>
                <p className="text-muted-foreground">
                  Capture or upload a receipt image and let our AI extract all
                  the details automatically.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                  <Users className="text-primary size-8" />
                </div>
                <h3 className="text-xl font-bold">Select Items</h3>
                <p className="text-muted-foreground">
                  Share a unique link with your friends so they can select the
                  items they ordered.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                  <DollarSign className="text-primary size-8" />
                </div>
                <h3 className="text-xl font-bold">Split Fairly</h3>
                <p className="text-muted-foreground">
                  See who owes what with taxes and tips split equally among all
                  participants.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 md:px-6">
          <p className="text-muted-foreground text-center text-sm">
            © {new Date().getFullYear()} SplitEase. All rights reserved.
          </p>
        </div>
      </footer>

      <ReceiptProcessor
        method={method}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  )
}
