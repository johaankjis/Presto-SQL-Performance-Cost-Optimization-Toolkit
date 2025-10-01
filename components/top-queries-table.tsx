"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Search } from "lucide-react"

interface QueryData {
  query_id: string
  user: string
  latency_ms: number
  bytes_scanned_gb: number
  query_date: string
  query_preview: string
  issues: string[]
}

// Mock data
const generateMockQueries = (): QueryData[] => {
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

  return Array.from({ length: 25 }, (_, i) => ({
    query_id: `20251001_${Math.random().toString(36).substr(2, 9)}`,
    user: users[Math.floor(Math.random() * users.length)],
    latency_ms: 5000 + Math.random() * 50000,
    bytes_scanned_gb: Math.random() * 100 + 10,
    query_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    query_preview: queries[i % queries.length],
    issues: issues[i % issues.length],
  }))
}

type SortField = "latency_ms" | "bytes_scanned_gb" | "query_date"
type SortDirection = "asc" | "desc"

export function TopQueriesTable() {
  const [queries] = useState<QueryData[]>(generateMockQueries())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("latency_ms")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filterIssues, setFilterIssues] = useState<string>("all")

  const filteredAndSortedQueries = useMemo(() => {
    let filtered = queries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.query_preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.query_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by issues
    if (filterIssues !== "all") {
      if (filterIssues === "with-issues") {
        filtered = filtered.filter((q) => q.issues.length > 0)
      } else if (filterIssues === "no-issues") {
        filtered = filtered.filter((q) => q.issues.length === 0)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const multiplier = sortDirection === "asc" ? 1 : -1

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * multiplier
      }
      return ((aVal as number) - (bVal as number)) * multiplier
    })

    return filtered
  }, [queries, searchTerm, sortField, sortDirection, filterIssues])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Performance Catalog</CardTitle>
        <CardDescription>
          Showing {filteredAndSortedQueries.length} of {queries.length} queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search queries, users, or query IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterIssues} onValueChange={setFilterIssues}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by issues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Queries</SelectItem>
              <SelectItem value="with-issues">With Issues</SelectItem>
              <SelectItem value="no-issues">No Issues</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Query ID</TableHead>
                <TableHead>Query Preview</TableHead>
                <TableHead>User</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => toggleSort("latency_ms")}>
                    Latency
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => toggleSort("bytes_scanned_gb")}
                  >
                    Data Scanned
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => toggleSort("query_date")}>
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedQueries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No queries found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedQueries.map((query) => (
                  <TableRow key={query.query_id}>
                    <TableCell className="font-mono text-xs">{query.query_id}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate font-mono text-xs text-muted-foreground">{query.query_preview}</div>
                    </TableCell>
                    <TableCell className="text-sm">{query.user}</TableCell>
                    <TableCell>
                      <span
                        className={
                          query.latency_ms > 30000
                            ? "text-destructive font-semibold"
                            : query.latency_ms > 15000
                              ? "text-chart-3 font-semibold"
                              : ""
                        }
                      >
                        {(query.latency_ms / 1000).toFixed(2)}s
                      </span>
                    </TableCell>
                    <TableCell>{query.bytes_scanned_gb.toFixed(1)} GB</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{query.query_date}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {query.issues.length === 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            No issues
                          </Badge>
                        ) : (
                          query.issues.slice(0, 2).map((issue, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              {issue}
                            </Badge>
                          ))
                        )}
                        {query.issues.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{query.issues.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Latency</CardDescription>
              <CardTitle className="text-2xl">
                {(
                  filteredAndSortedQueries.reduce((sum, q) => sum + q.latency_ms, 0) /
                  filteredAndSortedQueries.length /
                  1000
                ).toFixed(2)}
                s
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Data Scanned</CardDescription>
              <CardTitle className="text-2xl">
                {filteredAndSortedQueries.reduce((sum, q) => sum + q.bytes_scanned_gb, 0).toFixed(0)} GB
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Queries with Issues</CardDescription>
              <CardTitle className="text-2xl">
                {filteredAndSortedQueries.filter((q) => q.issues.length > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
