"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for last 30 days
const generateLatencyData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      latency: 2000 + Math.random() * 3000 + Math.sin(i / 5) * 1000,
    })
  }
  return data
}

const data = generateLatencyData()

export function LatencyTrendChart() {
  return (
    <ChartContainer
      config={{
        latency: {
          label: "Latency (ms)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="latency"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            name="Latency (ms)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
