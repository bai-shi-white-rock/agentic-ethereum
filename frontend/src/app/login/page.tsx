"use client";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const { address } = useAppKitAccount();
  const [loginStage, setLoginStage] = useState("notLoggedIn");

  const checkUserExists = async () => {
    if (address) {
      console.log("address", address);
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
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="text-center flex flex-col items-center">
        <Image
          src="/logo-purple.png"
          alt="Bai Shi Logo"
          width={200}
          height={200}
        />
        <h1 className="text-2xl font-bold my-4">Hello 白石</h1>
        <appkit-button size="md" balance="hide" />
      </div>
    </div>
  );
}
