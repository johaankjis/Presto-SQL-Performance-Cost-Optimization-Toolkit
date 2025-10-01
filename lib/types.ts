// Shared types for the SQL Optimizer toolkit

export interface QueryData {
  query_id: string
  user: string
  latency_ms: number
  bytes_scanned_gb: number
  query_date: string
  query_preview: string
  issues: string[]
}

export interface OptimizationIssue {
  pattern: string
  suggestion: string
  severity: "high" | "medium" | "low"
}

export interface ProfileResult {
  query_id: string
  latency_ms: number
  bytes_scanned: string
  issues: OptimizationIssue[]
  explain_plan?: string
}

export interface CostTrendData {
  date: string
  median_latency_ms: number
  median_bytes_scanned_gb: number
  query_count: number
}

export interface CostTrendsResponse {
  trends: CostTrendData[]
  days: number
  summary: {
    avg_latency_ms: number
    total_bytes_scanned_gb: number
    total_queries: number
  }
}

export interface TopQueriesResponse {
  queries: QueryData[]
  total: number
  limit: number
  sortBy: string
  order: string
}
