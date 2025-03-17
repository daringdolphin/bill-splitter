"use server"

import { cleanupExpiredDataAction } from "@/actions/cleanup-actions"
import { NextRequest, NextResponse } from "next/server"

/**
 * API route for scheduled cleanup
 * This can be called by a cron job or a scheduled function
 *
 * Example cron job (using GitHub Actions):
 * ```yaml
 * name: Scheduled Cleanup
 * on:
 *   schedule:
 *     - cron: '0 3 * * *'  # Run at 3 AM UTC daily
 * jobs:
 *   cleanup:
 *     runs-on: ubuntu-latest
 *     steps:
 *       - name: Trigger cleanup
 *         run: |
 *           curl -X POST https://your-app-url.com/api/cleanup \
 *           -H "Authorization: Bearer ${{ secrets.CLEANUP_API_KEY }}"
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuthHeader = `Bearer ${process.env.CLEANUP_API_KEY}`

    // If CLEANUP_API_KEY is set, require authorization
    if (process.env.CLEANUP_API_KEY && authHeader !== expectedAuthHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run the cleanup action
    const result = await cleanupExpiredDataAction()

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json({ message: result.message }, { status: 200 })
  } catch (error) {
    console.error("Error in cleanup API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
