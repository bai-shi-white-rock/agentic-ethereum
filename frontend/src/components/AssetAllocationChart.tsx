"use client";

import React from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AssetAllocationChartProps {
  allocation: Record<string, string | number>;
}

// Define a set of default colors to cycle through
const defaultColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

export function AssetAllocationChart({
  allocation,
}: AssetAllocationChartProps) {
  console.log("allocation", allocation);
  // Convert the allocation object into an array for recharts
  const chartData = Object.entries(allocation).map(
    ([asset, percentage], index) => ({
      asset,
      // Convert the allocation percentage (which might come as a string) to a number
      percentage: Number(percentage),
      fill: defaultColors[index % defaultColors.length],
    })
  );

  // Create a simple chart config object (if your ChartContainer requires one)
  const assetMap = Object.keys(allocation).reduce((acc, asset, index) => {
    acc[asset] = {
      label: asset.charAt(0).toUpperCase() + asset.slice(1),
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);
  const chartConfig = {
    ...assetMap,
    percentage: { label: "Allocation" },
  };

  return (
    <Card className="flex flex-col w-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Your investment distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square min-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="percentage"
              nameKey="asset"
              label
              outerRadius={80}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="asset" />}
              className=" flex-wrap gap-2 [&>*]:basis-1/8 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* Optionally: add further details or legends */}
      </CardFooter>
    </Card>
  );
}
