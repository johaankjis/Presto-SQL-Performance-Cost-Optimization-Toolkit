"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, AlertTriangle, CheckCircle2, Lightbulb, Clock, Database } from "lucide-react"

interface ProfileResult {
  query_id: string
  latency_ms: number
  bytes_scanned: string
  issues: Array<{
    pattern: string
    suggestion: string
    severity: "high" | "medium" | "low"
  }>
  explain_plan?: string
}

export function QueryProfiler() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProfileResult | null>(null)

  const handleProfile = async () => {
    if (!query.trim()) return

    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock result based on query patterns
    const mockResult: ProfileResult = {
      query_id: `20251001_${Math.random().toString(36).substr(2, 9)}`,
      latency_ms: 12000 + Math.random() * 40000,
      bytes_scanned: `${(Math.random() * 50 + 10).toFixed(1)} GB`,
      issues: [],
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

    // Detect common patterns
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("count(distinct")) {
      mockResult.issues.push({
        pattern: "COUNT(DISTINCT ...)",
        suggestion: "Use approx_distinct() for better performance on large datasets",
        severity: "medium",
      })
    }

    if (lowerQuery.includes("not in")) {
      mockResult.issues.push({
        pattern: "NOT IN subquery",
        suggestion: "Rewrite with anti-join (LEFT JOIN ... WHERE col IS NULL) for better performance",
        severity: "high",
      })
    }

    if (!lowerQuery.includes("where") || (!lowerQuery.includes("date") && !lowerQuery.includes("partition"))) {
      mockResult.issues.push({
        pattern: "Missing partition filter",
        suggestion: "Add date or partition column filter to enable partition pruning and reduce scan size",
        severity: "high",
      })
    }

    if (lowerQuery.includes("cross join") || (lowerQuery.match(/join/g) || []).length > 2) {
      mockResult.issues.push({
        pattern: "Complex join detected",
        suggestion: "Review join order and consider adding join conditions to avoid cartesian products",
        severity: "medium",
      })
    }

    if (lowerQuery.includes("select *")) {
      mockResult.issues.push({
        pattern: "SELECT *",
        suggestion: "Specify only required columns to reduce data transfer and improve performance",
        severity: "low",
      })
    }

    setResult(mockResult)
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SQL Query Input</CardTitle>
          <CardDescription>Paste your Presto/Trino query below to analyze performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="SELECT user_id, COUNT(*) as query_count
FROM system.runtime.queries
WHERE date >= DATE '2025-01-01'
GROUP BY user_id
ORDER BY query_count DESC
LIMIT 10;"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="font-mono text-sm min-h-[200px]"
          />
          <Button onClick={handleProfile} disabled={loading || !query.trim()} className="w-full sm:w-auto">
            <Play className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Profile Query"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Query ID
                </CardDescription>
                <CardTitle className="text-lg font-mono">{result.query_id}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Execution Time
                </CardDescription>
                <CardTitle className="text-2xl">{(result.latency_ms / 1000).toFixed(2)}s</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Scanned
                </CardDescription>
                <CardTitle className="text-2xl">{result.bytes_scanned}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Optimization Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-secondary" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>
                {result.issues.length === 0
                  ? "No major issues detected"
                  : `Found ${result.issues.length} potential optimization${result.issues.length > 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.issues.length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Your query looks well-optimized! No major performance issues detected.
                  </AlertDescription>
                </Alert>
              ) : (
                result.issues.map((issue, index) => (
                  <Alert key={index} variant={issue.severity === "high" ? "destructive" : "default"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(issue.severity)}>{issue.severity.toUpperCase()}</Badge>
                        <span className="font-semibold">{issue.pattern}</span>
                      </div>
                      <p className="text-sm">{issue.suggestion}</p>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>

          {/* EXPLAIN Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Query Execution Plan</CardTitle>
              <CardDescription>EXPLAIN output showing query execution strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="plan">
                <TabsList>
                  <TabsTrigger value="plan">Execution Plan</TabsTrigger>
                  <TabsTrigger value="tips">Optimization Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="plan" className="mt-4">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                    {result.explain_plan}
                  </pre>
                </TabsContent>
                <TabsContent value="tips" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">General Tips:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Always filter on partition columns (date, app_id) to enable partition pruning</li>
                      <li>Use approx_distinct() instead of COUNT(DISTINCT) for approximate counts</li>
                      <li>Avoid SELECT * - specify only needed columns</li>
                      <li>Use anti-joins instead of NOT IN for better performance</li>
                      <li>Consider bucketing tables on frequently joined columns</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
