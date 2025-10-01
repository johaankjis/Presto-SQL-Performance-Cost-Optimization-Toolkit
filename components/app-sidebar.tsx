"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Search, ListOrdered, BookOpen, Database, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Query Profiler", href: "/profile", icon: Search },
  { name: "Top Queries", href: "/queries/top", icon: ListOrdered },
  { name: "Optimization Runbook", href: "/runbook", icon: BookOpen },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
            <Database className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground">SQL Optimizer</h1>
            <p className="text-xs text-muted-foreground">Presto/Trino Toolkit</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Monitoring Active</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
