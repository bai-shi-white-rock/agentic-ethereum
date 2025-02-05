"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Lottie from "lottie-react";
import baishiMonster from "../../public/lottie/baishi_monster.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Globe, UserCog } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-screen">
      <Navbar />
      {/* Hero Section */}
      <div className="py-20 mt-20">
        <div className="flex flex-row items-center justify-center w-full max-w-4xl mx-auto">
          <div className="flex-1 flex justify-center">
            <div className="w-80 h-80">
              <Lottie animationData={baishiMonster} loop={true} />
            </div>
          </div>
          <div className="flex-1 text-center flex flex-col items-center ml-8">
            <h1 className="text-4xl font-bold my-4">Your Personal Financial Advisory Agent</h1>
            <p className="text-xl font-medium my-4">Helping you reach your investing goals through on-chain economy</p>
            <Link href="/login">
              <Button
                className="bg-primary hover:bg-secondary font-bold text-white text-xl"
                size="lg"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AUM Section */}
      <div className="w-full bg-secondary/5 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Assets Under Management</h2>
          <div className="flex justify-center items-center space-x-12">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">$142M+</p>
              <p className="text-gray-600">Total Assets Managed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">25+</p>
              <p className="text-gray-600">Active Portfolios</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">24.5%</p>
              <p className="text-gray-600">Average Annual Return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div className="w-full py-16 mx-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 5x Less Fee Card */}
            <Card className="border-2 hover:border-primary transition-all duration-300 bg-gray-50/50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>5x Less Fee</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Because we use blockchain and AI, we can offer 5x lower fees than traditional financial advisors</p>
              </CardContent>
            </Card>

            {/* Global Asset Card */}
            <Card className="border-2 hover:border-primary transition-all duration-300 bg-gray-50/50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Global Assets</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Reach real-world assets through on-chain economy since your first investment</p>
              </CardContent>
            </Card>

            {/* Personalized Allocation Card */}
            <Card className="border-2 hover:border-primary transition-all duration-300 bg-gray-50/50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserCog className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Personalized Allocation</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Get tailored investment strategies based on your goals and risk profile</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* add how it works section to show the process */}
      <div className="w-full py-16 bg-secondary/5 mx-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="relative">
            {/* Steps container */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">DIY Your Profile</h3>
                <p className="text-sm text-muted-foreground max-w-[150px]">Our agent will guide you to financial goals</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Get Allocation</h3>
                <p className="text-sm text-muted-foreground max-w-[150px]">Customized strategy asset allocation</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Pay with USDC</h3>
                <p className="text-sm text-muted-foreground max-w-[150px]">Start your investment with stablecoin</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="font-semibold mb-2">Track Growth</h3>
                <p className="text-sm text-muted-foreground max-w-[150px]">Monitor your performance</p>
              </div>
            </div>

            {/* Connecting line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-primary/20 hidden md:block" />
          </div>
        </div>
      </div>

      {/* add footer section to show the footer */}
      <Footer />
    </div>
  );
}
