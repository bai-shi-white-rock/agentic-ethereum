import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PortfolioDataPoint {
  date: string;
  portfolioValue: number;
}

const chartData: PortfolioDataPoint[] = [
  { date: "2024-01", portfolioValue: 10000 },
  { date: "2024-02", portfolioValue: 10450 },
  { date: "2024-03", portfolioValue: 10200 },
  { date: "2024-04", portfolioValue: 11100 },
  { date: "2024-05", portfolioValue: 11500 },
  { date: "2024-06", portfolioValue: 12300 },
]

const chartConfig = {
  portfolioValue: {
    label: "Portfolio Value",
    color: "#22c55e", // Green color for finance
  },
} satisfies ChartConfig

const calculatePerformance = (): number => {
  const firstValue = chartData[0].portfolioValue;
  const lastValue = chartData[chartData.length - 1].portfolioValue;
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
  return Number(percentageChange.toFixed(1));
}

export default function PortfolioChart() {
  const performanceChange = calculatePerformance();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>+{performanceChange}% total return</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return date.toLocaleString('default', { month: 'short' });
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="var(--color-portfolioValue)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {performanceChange > 0 ? "Up" : "Down"} {Math.abs(performanceChange)}% since January 
          <TrendingUp className={`h-4 w-4 ${performanceChange > 0 ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing portfolio value over the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}