import { TopQueriesTable } from "@/components/top-queries-table"

export default function TopQueriesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Top Queries</h1>
        <p className="text-muted-foreground">Identify slowest queries and highest cost operations</p>
      </div>

      <TopQueriesTable />
    </div>
  )
}
