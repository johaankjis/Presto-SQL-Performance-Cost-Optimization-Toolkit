import { type NextRequest, NextResponse } from "next/server"

interface CostTrendData {
  date: string
  median_latency_ms: number
  median_bytes_scanned_gb: number
  query_count: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Generate mock trend data
    const data: CostTrendData[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toISOString().split("T")[0],
        median_latency_ms: 2000 + Math.random() * 3000 + Math.sin(i / 5) * 1000,
        median_bytes_scanned_gb: 500 + Math.random() * 500 + Math.sin(i / 7) * 200,
        query_count: Math.floor(800 + Math.random() * 600 + Math.sin(i / 4) * 300),
      })
    }

    return NextResponse.json({
      trends: data,
      days,
      summary: {
        avg_latency_ms: data.reduce((sum, d) => sum + d.median_latency_ms, 0) / data.length,
        total_bytes_scanned_gb: data.reduce((sum, d) => sum + d.median_bytes_scanned_gb, 0),
        total_queries: data.reduce((sum, d) => sum + d.query_count, 0),
      },
    })
  } catch (error) {
    console.error("[v0] Cost trends API error:", error)
    return NextResponse.json({ error: "Failed to fetch cost trends" }, { status: 500 })
  }
}
