'use client'
import { useAppKitAccount } from "@reown/appkit/react";
import PortfolioChart from "@/components/portfolioChart";

export default function PortfolioPage() {
  const { address } = useAppKitAccount();

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold my-4">Hello {address}</h1>
        <PortfolioChart />
      </div>
    </div>
  );
}
