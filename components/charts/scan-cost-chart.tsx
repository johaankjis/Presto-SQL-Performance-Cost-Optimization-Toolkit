"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for last 30 days
const generateScanData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      scanned: 500 + Math.random() * 500 + Math.sin(i / 7) * 200,
    })
  }
  return data
}

const data = generateScanData()

export function ScanCostChart() {
  return (
    <ChartContainer
      config={{
        scanned: {
          label: "Data Scanned (GB)",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(0)} GB`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="scanned" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Data Scanned (GB)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
