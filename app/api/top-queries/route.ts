import { type NextRequest, NextResponse } from "next/server"

interface QueryData {
  query_id: string
  user: string
  latency_ms: number
  bytes_scanned_gb: number
  query_date: string
  query_preview: string
  issues: string[]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "25")
    const sortBy = searchParams.get("sortBy") || "latency_ms"
    const order = searchParams.get("order") || "desc"

    // Generate mock data
    const users = ["alice@company.com", "bob@company.com", "charlie@company.com", "data-eng@company.com"]
    const issues = [
      ["Missing partition filter", "SELECT *"],
      ["COUNT(DISTINCT)", "No partition filter"],
      ["NOT IN subquery"],
      ["Complex join", "Missing partition filter"],
      [],
      ["SELECT *"],
      ["COUNT(DISTINCT)"],
    ]

    const queries = [
      "SELECT user_id, COUNT(*) FROM events WHERE date >= '2025-01-01' GROUP BY user_id",
      "SELECT * FROM large_table JOIN another_table ON id = user_id",
      "SELECT COUNT(DISTINCT user_id) FROM events",
      "SELECT a.*, b.* FROM table_a a CROSS JOIN table_b b WHERE a.id NOT IN (SELECT id FROM table_c)",
      "SELECT date, SUM(revenue) FROM sales GROUP BY date ORDER BY date DESC",
      "SELECT * FROM events WHERE user_id = 12345",
      "SELECT user_id, COUNT(DISTINCT session_id) FROM events GROUP BY user_id",
    ]

    const data: QueryData[] = Array.from({ length: limit }, (_, i) => ({
      query_id: `20251001_${Math.random().toString(36).substr(2, 9)}`,
      user: users[Math.floor(Math.random() * users.length)],
      latency_ms: 5000 + Math.random() * 50000,
      bytes_scanned_gb: Math.random() * 100 + 10,
      query_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      query_preview: queries[i % queries.length],
      issues: issues[i % issues.length],
    }))

    // Sort data
    data.sort((a, b) => {
      const aVal = a[sortBy as keyof QueryData]
      const bVal = b[sortBy as keyof QueryData]
      const multiplier = order === "asc" ? 1 : -1

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * multiplier
      }
      return ((aVal as number) - (bVal as number)) * multiplier
    })

    return NextResponse.json({
      queries: data,
      total: data.length,
      limit,
      sortBy,
      order,
    })
  } catch (error) {
    console.error("[v0] Top queries API error:", error)
    return NextResponse.json({ error: "Failed to fetch top queries" }, { status: 500 })
  }
}
