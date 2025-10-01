"use client"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for last 30 days
const generateVolumeData = () => {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      queries: 800 + Math.random() * 600 + Math.sin(i / 4) * 300,
    })
  }
  return data
}

const data = generateVolumeData()

export function QueryVolumeChart() {
  return (
    <ChartContainer
      config={{
        queries: {
          label: "Queries",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toFixed(0)}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="queries"
            stroke="hsl(var(--chart-2))"
            fillOpacity={1}
            fill="url(#colorQueries)"
            strokeWidth={2}
            name="Queries"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
