import { QueryProfiler } from "@/components/query-profiler"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Query Profiler</h1>
        <p className="text-muted-foreground">
          Analyze SQL queries with EXPLAIN and receive optimization recommendations
        </p>
      </div>

      <QueryProfiler />
    </div>
  )
}
