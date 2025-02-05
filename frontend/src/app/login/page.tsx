"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Lottie from "lottie-react";
import baishiMonster from "../../../public/lottie/baishi_monster.json";
import { Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const [loginStage, setLoginStage] = useState("notLoggedIn");
  const [isLoading, setIsLoading] = useState(false);

  const checkUserExists = async () => {
    if (address) {
      setIsLoading(true);
      console.log("address", address);
      try {
        // Check if user already exists or not
        const res = await fetch(`/api/login/?address=${address}`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        });
        const result = await res.json();
        console.log("result from checking user by wallet address", result);

        // if it's a new user, then register new account
        if (res.status === 404) {
          const res = await fetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ address }),
          });
          console.log("result from creating new user", res);
          document.cookie = `walletAddress=${address}; path=/; max-age=3600; SameSite=Strict`;
          setLoginStage("loggedIn");
          router.push("/dashboard");
        } else {
          setLoginStage("loggedIn");
          document.cookie = `walletAddress=${address}; path=/; max-age=3600; SameSite=Strict`;
        }
      } catch (error) {
        console.error("Error during login:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("not logged in");
    }
  };

  useEffect(() => {
    checkUserExists();
  }, [address]);

  useEffect(() => {
    if (loginStage === "loggedIn") {
      router.push("/dashboard");
    }
  }, [loginStage]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-tertiary/30 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-40 h-40 mb-2">
            <Lottie animationData={baishiMonster} loop={true} />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Welcome to Bai Shi</CardTitle>
          <CardDescription className="text-gray-600">
            Connect your wallet to start your investment journey with personal financial advisory agent
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="w-full flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-gray-600">Connecting...</span>
              </div>
            ) : (
              <appkit-button size="md" balance="hide" />
            )}
          </div>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            By connecting, you agree to being rich without any effort
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
