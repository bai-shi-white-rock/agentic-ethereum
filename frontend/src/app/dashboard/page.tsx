"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PortfolioChart from "@/components/portfolioChart";
import { DonutChart } from "@/components/donutChart";

interface RateSet {
  id: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
}

interface TokenSwapped {
  id: string;
  user: string;
  tokenFrom: string;
  tokenTo: string;
  amountFrom: string;
  amountTo: string;
  blockTimestamp: string;
}

interface InvestmentPlan {
  id: string;
  totalInvestment: number;
  assetAllocation: string;
  investmentPerMonth: number;
  createdAt: string;
}

interface PortfolioData {
  investmentPlans: InvestmentPlan[];
  graphData: {
    rateSets: RateSet[];
    swapHistory: TokenSwapped[];
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const { address } = useAppKitAccount();
  const [isOpenPortfolio, setIsOpenPortfolio] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvestmentPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/portfolio?address=${address}`);
        const result = await response.json();
        const data = result.data as PortfolioData;
        const totalPortfolioValue = data.graphData.swapHistory.reduce(
          (sum: number, swap: TokenSwapped) =>
            sum + parseFloat(swap.amountFrom) / 1000000, // 6 decimals in USDC 
          0
        );
        setPortfolioValue(totalPortfolioValue);
        setInvestmentPlans(data.investmentPlans);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (address) {
      fetchInvestmentPlans();
    }
  }, [address]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600">Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        {isOpenPortfolio ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Portfolio Details</h1>
              <Button
                variant="ghost"
                onClick={() => setIsOpenPortfolio(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <PortfolioChart />
              <DonutChart />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold my-4">Your Dashboard</h1>
            <div className="my-8 flex gap-4 justify-center">
              <button
                onClick={() => router.push("/create")}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Investment Plan</span>
              </button>
            </div>

            <div
              onClick={() => setIsOpenPortfolio(true)}
              className="cursor-pointer transition-transform hover:scale-105 my-4"
            >
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Portfolio
                    <ArrowRight className="h-6 w-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${portfolioValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Click to view details
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="my-4">
              <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Your Investment Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {investmentPlans.length === 0 ? (
                      <p className="text-gray-500 py-4">
                        You need to + Add Investment Plan first
                      </p>
                    ) : (
                      investmentPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                Plan {investmentPlans.indexOf(plan) + 1}
                              </p>
                              <p className="text-sm text-gray-500">
                                Created at{" "}
                                {new Date(plan.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                ${plan.totalInvestment.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Total Investment
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <p className="text-gray-600">
                              Asset Allocation: {plan.assetAllocation}
                            </p>
                          </div>
                          <div className="mt-4">
                            <Button
                              className="w-full bg-primary text-white my-4"
                              onClick={() => {
                                alert("This feature is not available yet in the hackathon. Coming soon!");
                              }}
                            >
                              Sell
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
