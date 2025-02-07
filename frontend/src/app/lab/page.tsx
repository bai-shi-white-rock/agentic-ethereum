"use client";
import { usePayWithUSDC } from "@/utils/PayWithUSDC";
import { Button } from "@/components/ui/button";

export default function LabPage() {
  const { payWithUSDC, isConfirming, isConfirmed } = usePayWithUSDC();
  const walletAddress = "0x89A3Ad1266dd99bb2b474F0E30ABeF0F0334A66D";
  const investmentPerMonth = 0.1;

  const UsePayWithUSDCButton = () => {
    return (
      <>
        <Button onClick={() => payWithUSDC(walletAddress, investmentPerMonth)}>
          Pay with USDC
        </Button>
        <div>
          {isConfirming && <p>Confirming...</p>}
          {isConfirmed && <p>Confirmed!</p>}
        </div>
      </>
    );
  };

  return (
    <div>
      <h1>Lab Page</h1>
        <UsePayWithUSDCButton />
    </div>
  );
}
