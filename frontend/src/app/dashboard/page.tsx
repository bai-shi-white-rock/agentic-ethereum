'use client'
import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  // Sample portfolio value - in a real app, this would come from your backend
  const portfolioValue = 12300;

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold my-4">Your Dashboard</h1>
        
        <div 
          onClick={() => router.push('/portfolio')} 
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <Card className="w-[300px] mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Portfolio 
                <ArrowRight className="h-6 w-6" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${portfolioValue.toLocaleString()}</p>
              <p className="text-sm text-neutral-500 mt-1">Click to view details</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/buy')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Add Investment Plan
          </button>
          <button
            onClick={() => router.push('/sell')} 
            className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors"
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}
