import { type NextRequest, NextResponse } from "next/server"

interface ProfileRequest {
  query: string
}

interface OptimizationIssue {
  pattern: string
  suggestion: string
  severity: "high" | "medium" | "low"
}

interface ProfileResult {
  query_id: string
  latency_ms: number
  bytes_scanned: string
  issues: OptimizationIssue[]
  explain_plan: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ProfileRequest = await request.json()
    const { query } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Simulate EXPLAIN ANALYZE execution
    // In production, this would connect to Presto/Trino and run EXPLAIN
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const lowerQuery = query.toLowerCase()
    const issues: OptimizationIssue[] = []

    // Pattern detection logic
    if (lowerQuery.includes("count(distinct")) {
      issues.push({
        pattern: "COUNT(DISTINCT ...)",
        suggestion: "Use approx_distinct() for better performance on large datasets",
        severity: "medium",
      })
    }

    if (lowerQuery.includes("not in")) {
      issues.push({
        pattern: "NOT IN subquery",
        suggestion: "Rewrite with anti-join (LEFT JOIN ... WHERE col IS NULL) for better performance",
        severity: "high",
      })
    }

    if (!lowerQuery.includes("where") || (!lowerQuery.includes("date") && !lowerQuery.includes("partition"))) {
      issues.push({
        pattern: "Missing partition filter",
        suggestion: "Add date or partition column filter to enable partition pruning and reduce scan size",
        severity: "high",
      })
    }

    if (lowerQuery.includes("cross join") || (lowerQuery.match(/join/g) || []).length > 2) {
      issues.push({
        pattern: "Complex join detected",
        suggestion: "Review join order and consider adding join conditions to avoid cartesian products",
        severity: "medium",
      })
    }

    if (lowerQuery.includes("select *")) {
      issues.push({
        pattern: "SELECT *",
        suggestion: "Specify only required columns to reduce data transfer and improve performance",
        severity: "low",
      })
    }

    const result: ProfileResult = {
      query_id: `20251001_${Math.random().toString(36).substr(2, 9)}`,
      latency_ms: 8000 + Math.random() * 40000,
      bytes_scanned: `${(Math.random() * 50 + 10).toFixed(1)} GB`,
      issues,
      explain_plan: `Fragment 0 [SINGLE]
    Output layout: [user_id, count]
    Output partitioning: SINGLE []
    - Aggregate(FINAL)[user_id]
        Layout: [user_id:bigint, count:bigint]
        count := count("count_0")
        - LocalExchange[HASH][$hashvalue] ("user_id")
            - RemoteSource[1]

Fragment 1 [SOURCE]
    Output layout: [user_id, count_0, $hashvalue_1]
    Output partitioning: BROADCAST []
    - Aggregate(PARTIAL)[user_id, $hashvalue_1]
        Layout: [user_id:bigint, count_0:bigint, $hashvalue_1:bigint]
        count_0 := count(*)
        - ScanProject[table = hive:default:events]
            Layout: [user_id:bigint, $hashvalue_1:bigint]
            $hashvalue_1 := combine_hash(bigint '0', COALESCE("$operator$hash_code"("user_id"), 0))
            user_id := user_id:bigint:REGULAR`,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Profile API error:", error)
    return NextResponse.json({ error: "Failed to profile query" }, { status: 500 })
  }
}
