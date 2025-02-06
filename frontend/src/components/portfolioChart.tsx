import { CartesianGrid, Bar, XAxis, YAxis, ResponsiveContainer, BarChart } from "recharts"
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

const chartConfig = {
  portfolioValue: {
    label: "Portfolio Value",
    color: "#424874", // Green color for finance
  },
} satisfies ChartConfig

interface PortfolioChartProps {
  portfolioValue: number;
}

export default function PortfolioChart({ portfolioValue }: PortfolioChartProps) {
  // Create chart data using the current portfolio value
  const chartData: PortfolioDataPoint[] = [
    { date: new Date().toISOString().slice(0, 7), portfolioValue: portfolioValue }
  ];
  
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>${portfolioValue.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <BarChart
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
                <Bar
                  dataKey="portfolioValue"
                  fill="var(--color-portfolioValue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}