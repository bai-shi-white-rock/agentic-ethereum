'use client'
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAppKitAccount();
  
  useEffect(() => {
    if (isConnected && address) {
      router.push('/portfolio');
    }
  }, [address, isConnected, router])

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold my-4">Hello 白石</h1>
        <appkit-button size='md' balance='hide'/>
      </div>
    </div>
  );
}
