"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Zap, Database, GitBranch, Filter, TrendingUp } from "lucide-react"

interface RunbookSection {
  id: string
  title: string
  category: string
  icon: React.ReactNode
  content: React.ReactNode
}

const runbookSections: RunbookSection[] = [
  {
    id: "semi-join",
    title: "Semi-Join vs IN",
    category: "Joins",
    icon: <GitBranch className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          When filtering rows based on existence in another table, use semi-joins instead of IN subqueries for better
          performance.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2 text-destructive">❌ Avoid: IN Subquery</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT *
FROM orders
WHERE customer_id IN (
  SELECT customer_id
  FROM premium_customers
);`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-chart-2">✓ Better: Semi-Join</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT o.*
FROM orders o
WHERE EXISTS (
  SELECT 1
  FROM premium_customers pc
  WHERE pc.customer_id = o.customer_id
);`}
            </pre>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Why?</strong> Semi-joins stop processing as soon as a match is found, while IN subqueries may
            materialize the entire subquery result.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "anti-join",
    title: "Anti-Join vs NOT IN",
    category: "Joins",
    icon: <GitBranch className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          For exclusion queries, use anti-joins (LEFT JOIN with NULL check) instead of NOT IN for better performance and
          NULL handling.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2 text-destructive">❌ Avoid: NOT IN</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT *
FROM orders
WHERE customer_id NOT IN (
  SELECT customer_id
  FROM cancelled_customers
);`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-chart-2">✓ Better: Anti-Join</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT o.*
FROM orders o
LEFT JOIN cancelled_customers cc
  ON o.customer_id = cc.customer_id
WHERE cc.customer_id IS NULL;`}
            </pre>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Why?</strong> NOT IN returns no results if the subquery contains NULL values. Anti-joins handle
            NULLs correctly and are typically faster.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "approx-functions",
    title: "Approximate Aggregations",
    category: "Aggregations",
    icon: <TrendingUp className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Use approximate functions for large-scale aggregations when exact precision is not required.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">approx_distinct()</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`-- Instead of COUNT(DISTINCT user_id)
SELECT approx_distinct(user_id) as unique_users
FROM events
WHERE date >= DATE '2025-01-01';`}
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Provides ~2.3% standard error, much faster than exact COUNT(DISTINCT)
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">approx_percentile()</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`-- Fast percentile calculations
SELECT 
  approx_percentile(latency_ms, 0.5) as p50,
  approx_percentile(latency_ms, 0.95) as p95,
  approx_percentile(latency_ms, 0.99) as p99
FROM query_logs;`}
            </pre>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Performance Impact:</strong> Can be 10-100x faster on large datasets with minimal accuracy loss.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "partition-pruning",
    title: "Partition Pruning",
    category: "Performance",
    icon: <Filter className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Always filter on partition columns to enable partition pruning and dramatically reduce data scanned.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2 text-destructive">❌ Avoid: No Partition Filter</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT user_id, COUNT(*)
FROM events
WHERE event_type = 'click'
GROUP BY user_id;

-- Scans ALL partitions!`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-chart-2">✓ Better: With Partition Filter</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT user_id, COUNT(*)
FROM events
WHERE date >= DATE '2025-01-01'
  AND date < DATE '2025-02-01'
  AND event_type = 'click'
GROUP BY user_id;

-- Only scans January partitions`}
            </pre>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Best Practice:</strong> If your table is partitioned by date, ALWAYS include a date filter. This can
            reduce scan size by 90%+.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "window-functions",
    title: "Window Function Optimization",
    category: "Advanced",
    icon: <Zap className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Optimize window functions by reducing partition size and reusing window definitions.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Reuse Window Definitions</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT 
  user_id,
  event_time,
  ROW_NUMBER() OVER w as row_num,
  RANK() OVER w as rank,
  LAG(event_time) OVER w as prev_event
FROM events
WINDOW w AS (PARTITION BY user_id ORDER BY event_time)
WHERE date = DATE '2025-01-01';`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Filter Before Windowing</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`-- Filter first to reduce window partition size
WITH filtered AS (
  SELECT *
  FROM events
  WHERE date = DATE '2025-01-01'
    AND event_type = 'purchase'
)
SELECT 
  user_id,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_time) as purchase_num
FROM filtered;`}
            </pre>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bucketing",
    title: "Table Bucketing",
    category: "Storage",
    icon: <Database className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Bucket tables on frequently joined columns to enable bucket pruning and faster joins.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Creating Bucketed Tables</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`CREATE TABLE events (
  user_id BIGINT,
  event_type VARCHAR,
  event_time TIMESTAMP,
  date DATE
)
WITH (
  partitioned_by = ARRAY['date'],
  bucketed_by = ARRAY['user_id'],
  bucket_count = 256
);`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Benefits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Faster joins when both tables are bucketed on the same column</li>
              <li>Better data distribution across workers</li>
              <li>Reduced shuffle during aggregations on bucketed columns</li>
            </ul>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Tip:</strong> Choose bucket count as a power of 2 (64, 128, 256) for optimal distribution.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "select-star",
    title: "Avoid SELECT *",
    category: "Performance",
    icon: <Zap className="h-5 w-5" />,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Always specify only the columns you need instead of using SELECT * to reduce data transfer and improve
          performance.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2 text-destructive">❌ Avoid</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT *
FROM large_table
WHERE date = DATE '2025-01-01';

-- Transfers all 50+ columns`}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-chart-2">✓ Better</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {`SELECT user_id, event_type, event_time
FROM large_table
WHERE date = DATE '2025-01-01';

-- Only transfers 3 columns`}
            </pre>
          </div>
        </div>
        <div className="bg-secondary/10 p-4 rounded-lg">
          <p className="text-sm">
            <strong>Impact:</strong> Can reduce query time by 50%+ and network transfer by 90%+ on wide tables.
          </p>
        </div>
      </div>
    ),
  },
]

export function RunbookViewer() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = useMemo(() => {
    const cats = new Set(runbookSections.map((s) => s.category))
    return ["all", ...Array.from(cats)]
  }, [])

  const filteredSections = useMemo(() => {
    return runbookSections.filter((section) => {
      const matchesSearch =
        searchTerm === "" ||
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || section.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Search Optimization Patterns
          </CardTitle>
          <CardDescription>Find best practices and optimization techniques for your queries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search optimization patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All Categories" : cat}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No optimization patterns found matching your search.
            </CardContent>
          </Card>
        ) : (
          filteredSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mt-1">
                        {section.category}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{section.content}</CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Common optimization patterns at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">High Impact</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add partition filters (date, app_id)</li>
                <li>• Use anti-joins instead of NOT IN</li>
                <li>• Avoid SELECT * on wide tables</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Medium Impact</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use approx_distinct() for large datasets</li>
                <li>• Optimize window function partitions</li>
                <li>• Consider table bucketing for joins</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
