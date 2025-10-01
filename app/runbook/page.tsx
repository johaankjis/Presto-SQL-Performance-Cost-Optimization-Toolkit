import { RunbookViewer } from "@/components/runbook-viewer"

export default function RunbookPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">SQL Optimization Runbook</h1>
        <p className="text-muted-foreground">Best practices and optimization patterns for Presto/Trino queries</p>
      </div>

      <RunbookViewer />
    </div>
  )
}
