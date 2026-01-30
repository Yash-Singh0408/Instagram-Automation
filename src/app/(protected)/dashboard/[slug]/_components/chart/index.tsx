"use client"
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts'

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#8E2DE2", // stroke fallback
  },
}
const chartData = [
  { month: "January", desktop: 18 },
  { month: "February", desktop: 34 },
  { month: "March", desktop: 27 },
  { month: "April", desktop: 49 },
  { month: "May", desktop: 38 },
  { month: "June", desktop: 62 },
  { month: "July", desktop: 45 },
  { month: "August", desktop: 71 },
  { month: "September", desktop: 53 },
  { month: "October", desktop: 67 },
  { month: "November", desktop: 41 },
  { month: "December", desktop: 78 },
]

const Chart = () => {
  return (
    <Card className="border-none p-0">
      <CardContent className="p-0">
        <ResponsiveContainer height={300} width="100%">
          <ChartContainer config={chartConfig}>
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8E2DE2" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#4A00E0" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />

              <Area
                type="natural"
                dataKey="desktop"
                stroke="#8E2DE2"
                strokeWidth={2.5}
                fill="url(#desktopGradient)"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default Chart