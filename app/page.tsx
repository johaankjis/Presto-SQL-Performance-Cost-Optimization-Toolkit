import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Zap, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import { LatencyTrendChart } from "@/components/charts/latency-trend-chart"
import { ScanCostChart } from "@/components/charts/scan-cost-chart"
import { QueryVolumeChart } from "@/components/charts/query-volume-chart"

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">SQL Optimization Toolkit</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Monitor query performance, identify bottlenecks, and optimize your Presto/Trino workloads with data-driven
          insights and automated recommendations.
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Queries Today</CardDescription>
            <CardTitle className="text-3xl font-bold">1,247</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="text-chart-2 font-medium">↑ 12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Median Latency</CardDescription>
            <CardTitle className="text-3xl font-bold">2.4s</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="text-chart-2 font-medium">↓ 8%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Data Scanned</CardDescription>
            <CardTitle className="text-3xl font-bold">847 GB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <span className="text-chart-4 font-medium">↑ 5%</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Query Latency Trend</CardTitle>
            <CardDescription>Median latency over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <LatencyTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Scan Cost</CardTitle>
            <CardDescription>Daily data scanned in GB</CardDescription>
          </CardHeader>
          <CardContent>
            <ScanCostChart />
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Query Volume</CardTitle>
            <CardDescription>Number of queries executed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <QueryVolumeChart />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <Search className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Query Profiler</CardTitle>
            <CardDescription>Analyze queries with EXPLAIN and get optimization tips</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-between">
                Profile Query
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Top Queries</CardTitle>
            <CardDescription>Identify slowest queries and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/queries/top">
              <Button variant="ghost" className="w-full justify-between">
                View Top Queries
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <BookOpen className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Optimization Runbook</CardTitle>
            <CardDescription>Learn best practices and optimization patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/runbook">
              <Button variant="ghost" className="w-full justify-between">
                View Runbook
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Cost Analysis</CardTitle>
            <CardDescription>Track scan costs and resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between" disabled>
              Coming Soon
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
