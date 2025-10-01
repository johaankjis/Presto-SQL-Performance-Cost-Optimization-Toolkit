import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Performance Dashboard</h1>
        <p className="text-muted-foreground">Monitor query latency, scan costs, and performance trends over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Coming Soon</CardTitle>
          <CardDescription>Charts and metrics will be added in the next step</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will display latency trends, scan cost metrics, and daily performance rollups.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
