"use client";

import { useState, useEffect } from "react";
import PairWisePage from "@/components/PairWisePage";
import { investment_assets } from "@/utils/investment_asset_list";
import { useAppKitAccount } from "@reown/appkit/react";
import { AssetAllocationChart } from "@/components/AssetAllocationChart";

interface Choice {
  name: string;
  description: string;
  image: string;
  marketCap: string;
  twelveMonthsChange: string;
  country: string;
}

export default function RiskAssessmentPage() {
  const { address } = useAppKitAccount();
  const [page, setPage] = useState(1);
  const [age, setAge] = useState("");
  const [investmentPerMonth, setInvestmentPerMonth] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("");
  const [pairWiseResponse, setPairWiseResponse] = useState<
    Array<{
      index: number;
      choice1: string;
      choice2: string;
      selectedChoice: string;
    }>
  >([]);

  const [choice1, setChoice1] = useState<Choice>({
    name: "",
    description: "",
    image: "",
    marketCap: "",
    twelveMonthsChange: "",
    country: "",
  });

  const [choice2, setChoice2] = useState<Choice>({
    name: "",
    description: "",
    image: "",
    marketCap: "",
    twelveMonthsChange: "",
    country: "",
  });

  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [assetAllocation, setAssetAllocation] = useState<
    Record<string, string | number>
  >({
    AAPL: 10,
    "US bonds": 20,
    gold: 30,
    "Vanguard S&P 500 ETF": 10,
    "Fidelity Total Market Index Fund": 30,
  });
  const getRandomNumber = () => {
    return Math.floor(Math.random() * 20);
  };

  const getTwoUniqueRandomNumbers = () => {
    const first = getRandomNumber();
    let second;
    do {
      second = getRandomNumber();
    } while (second === first);
    return [first, second];
  };

  useEffect(() => {
    const [firstIndex, secondIndex] = getTwoUniqueRandomNumbers();
    const initialChoice1 = investment_assets[firstIndex];
    const initialChoice2 = investment_assets[secondIndex];

    setChoice1({
      name: initialChoice1.name,
      description: initialChoice1.description,
      image: initialChoice1.imageURL,
      marketCap: initialChoice1.marketCap,
      twelveMonthsChange: initialChoice1["12monthsChange"],
      country: initialChoice1.country,
    });

    setChoice2({
      name: initialChoice2.name,
      description: initialChoice2.description,
      image: initialChoice2.imageURL,
      marketCap: initialChoice2.marketCap,
      twelveMonthsChange: initialChoice2["12monthsChange"],
      country: initialChoice2.country,
    });
  }, []);

  const nextPage = () => {
    if (page < 6) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const PreviousButton = () => (
    <button
      onClick={prevPage}
      className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
      hidden={page === 1}
    >
      Previous
    </button>
  );

  const NextButton = () => (
    <button
      onClick={nextPage}
      className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
      hidden={page === 6}
    >
      Next
    </button>
  );

  const confirm = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const summaryRiskPreference = {
      age,
      investmentPerMonth,
      investmentGoal,
      riskTolerance,
      pairWiseResponse,
    };
    try {
      const response = await fetch("/api/risk-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          investmentPerMonth,
          summaryRiskPreference,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Now call the asset allocation API after the risk assessment is successful.
        const assetAllocationResponse = await fetch("/api/asset-allocation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: summaryRiskPreference,
          }),
        });
        const assetAllocationData = await assetAllocationResponse.json();
        if (assetAllocationResponse.ok) {
          console.log("Suggested asset allocation", assetAllocationData);
          // Mock first - Use real data after the API is ready
          setAssetAllocation(assetAllocationData);
          setPage(7);
        } else {
          console.error(
            "Failed to submit asset allocation:",
            assetAllocationData.message
          );
          alert(
            assetAllocationData.message ||
              "Failed to submit asset allocation. Please try again."
          );
        }
      } else {
        console.error("Failed to submit risk assessment:", data.message);
        alert(
          data.message || "Failed to submit risk assessment. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting risk assessment:", error);
      alert(
        "An error occurred while submitting your risk assessment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAssets = async () => {
    // create a wallet
    createAIWalletAPI();

    // Call API to buy assets
    buyAssetAPI();
  };

  const createAIWalletAPI = async () => {
    if (isLoading) return;
    
    // create a wallet
    try {
      setIsLoading(true);
      
      if (!address) {
        alert("Please connect your wallet first");
        return;
      }

      const createWalletResponse = await fetch('/api/create-ai-wallet', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      const walletData = await createWalletResponse.json();
      
      if (!createWalletResponse.ok) {
        console.error("Failed to create AI wallet:", walletData.error);
        alert(walletData.error || "Failed to create AI wallet. Please try again.");
        return;
      }

      console.log("AI wallet created successfully", walletData);
      alert("AI wallet created successfully!");
      
    } catch (error) {
      console.error("Error creating AI wallet:", error);
      alert("An error occurred while creating your AI wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const buyAssetAPI = async () => {
    // Call API to buy assets
    try {
      const buyAssetResponse = await fetch("/api/buy-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          purchaseOrder: assetAllocation,
        }),
      });

      if (!buyAssetResponse.ok) {
        const errorData = await buyAssetResponse.json();
        console.error("Failed to buy assets:", errorData);
        alert(errorData.error || "Failed to buy assets. Please try again.");
        return;
      }

      const buyAssetData = await buyAssetResponse.json();
      console.log("Assets purchased successfully", buyAssetData);
      alert("Assets purchased successfully!");
      
    } catch (error) {
      console.error("Error buying assets:", error);
      alert("An error occurred while buying assets. Please try again.");
    }
  };

  const ConfirmButton = () => (
    <button
      onClick={confirm}
      disabled={isLoading}
      className={`px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 ${
        isLoading ? "cursor-not-allowed" : "hover:bg-secondary"
      }`}
    >
      {isLoading ? "Submitting..." : "Confirm"}
    </button>
  );


  const BuyAssetButton = () => (
    <button
      onClick={handleBuyAssets}
      disabled={isLoading}
      className={`px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 ${
        isLoading ? "cursor-not-allowed" : "hover:bg-secondary"
      }`}
    >
      {isLoading ? "Submitting..." : "Buy Assets"}
    </button>
  );

  const agePage = () => {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          What is your age?
        </h1>
        <div className="space-y-4">
          <input
            type="number"
            value={age}
            onChange={(e) => {
              const value = e.target.value;
              if (parseInt(value) >= 0 && parseInt(value) <= 120) {
                setAge(value);
              }
            }}
            placeholder="Enter your age"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            max="120"
            required
          />
          <div className="flex justify-between mt-6">
            <PreviousButton />
            <NextButton />
          </div>
        </div>
      </div>
    );
  };

  const investmentGoalPage = () => {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-3 text-gray-800 text-center">
          What is your investment goal?
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Choose the option that best matches your financial objectives
        </p>
        <div className="space-y-6">
          <button
            onClick={() => setInvestmentGoal("retirement")}
            className={`w-full group ${
              investmentGoal === "retirement"
                ? "bg-primary/10 border-primary"
                : "bg-white hover:bg-gray-50 border-gray-200"
            } border-2 rounded-xl p-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="flex items-center gap-6">
              <div
                className={`${
                  investmentGoal === "retirement"
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
                } p-4 rounded-full transition-colors duration-200`}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  ></path>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Retirement Planning
                </h3>
                <p className="text-gray-600">
                  Build a secure retirement nest egg with a balanced approach to
                  risk and returns
                </p>
              </div>
              <div
                className={`${
                  investmentGoal === "retirement"
                    ? "border-primary bg-primary"
                    : "border-gray-300 bg-white"
                } w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200`}
              >
                {investmentGoal === "retirement" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => setInvestmentGoal("aggressive growth")}
            className={`w-full group ${
              investmentGoal === "aggressive growth"
                ? "bg-primary/10 border-primary"
                : "bg-white hover:bg-gray-50 border-gray-200"
            } border-2 rounded-xl p-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="flex items-center gap-6">
              <div
                className={`${
                  investmentGoal === "aggressive growth"
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
                } p-4 rounded-full transition-colors duration-200`}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  ></path>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Aggressive Growth
                </h3>
                <p className="text-gray-600">
                  Maximize potential returns with a high-risk, high-reward
                  investment strategy
                </p>
              </div>
              <div
                className={`${
                  investmentGoal === "aggressive growth"
                    ? "border-primary bg-primary"
                    : "border-gray-300 bg-white"
                } w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200`}
              >
                {investmentGoal === "aggressive growth" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => setInvestmentGoal("steady growth")}
            className={`w-full group ${
              investmentGoal === "steady growth"
                ? "bg-primary/10 border-primary"
                : "bg-white hover:bg-gray-50 border-gray-200"
            } border-2 rounded-xl p-6 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md`}
          >
            <div className="flex items-center gap-6">
              <div
                className={`${
                  investmentGoal === "steady growth"
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
                } p-4 rounded-full transition-colors duration-200`}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Steady Growth
                </h3>
                <p className="text-gray-600">
                  Focus on consistent, stable returns with a moderate risk
                  approach
                </p>
              </div>
              <div
                className={`${
                  investmentGoal === "steady growth"
                    ? "border-primary bg-primary"
                    : "border-gray-300 bg-white"
                } w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200`}
              >
                {investmentGoal === "steady growth" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={prevPage}
            className={`px-6 py-3 rounded-lg font-medium ${
              page === 1
                ? "hidden"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={!investmentGoal}
            className={`px-6 py-3 rounded-lg font-medium ${
              investmentGoal
                ? "bg-primary text-white hover:bg-secondary"
                : "bg-primary/20 text-white cursor-not-allowed"
            } transition-colors duration-200`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const investmentPerMonthPage = () => {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          How much do you want to invest monthly?
        </h1>
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={investmentPerMonth}
              onChange={(e) => {
                const value = e.target.value;
                if (parseInt(value) >= 0) {
                  setInvestmentPerMonth(value);
                }
              }}
              placeholder="Enter amount"
              className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              required
            />
          </div>
          <div className="flex justify-between mt-6">
            <PreviousButton />
            <NextButton />
          </div>
        </div>
      </div>
    );
  };

  const riskTolerancePage = () => {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          How much risk are you comfortable with?
        </h1>
        <p className="text-gray-600 mb-4">
          On a scale of 1-7, where 1 is very conservative and 7 is very
          aggressive
        </p>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => setRiskTolerance(value.toString())}
                className={`w-10 h-10 rounded-full ${
                  riskTolerance === value.toString()
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-primary hover:text-white transition-colors`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 px-1 mt-2">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
          <div className="flex justify-between mt-6">
            <PreviousButton />
            <NextButton />
          </div>
        </div>
      </div>
    );
  };

  const confirmPage = () => {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Review Your Information
        </h1>
        <div className="flex flex-col">
          {/* Top Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <PreviousButton />
            <ConfirmButton />
          </div>

          <div className="flex gap-8 items-start">
            {/* Left Card */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-gray-600">Age</p>
                  <p className="text-lg font-semibold">
                    {age || "Not specified"}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-600">Investment Goal</p>
                  <p className="text-lg font-semibold">
                    {investmentGoal
                      ? investmentGoal.charAt(0).toUpperCase() +
                        investmentGoal.slice(1)
                      : "Not specified"}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-600">Monthly Investment</p>
                  <p className="text-lg font-semibold">
                    ${investmentPerMonth || "Not specified"}
                  </p>
                </div>
                <div className="border-b pb-4">
                  <p className="text-gray-600">Risk Tolerance</p>
                  <p className="text-lg font-semibold">
                    {riskTolerance || "Not specified"} / 7
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 mb-4 font-semibold">
                Pair-wise Comparisons
              </p>
              <div className="space-y-3">
                {pairWiseResponse.map((response, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500">
                      Comparison {index + 1}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-sm ${
                          response.selectedChoice === response.choice1
                            ? "font-bold text-primary"
                            : ""
                        }`}
                      >
                        {response.choice1}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span
                        className={`text-sm ${
                          response.selectedChoice === response.choice2
                            ? "font-bold text-primary"
                            : ""
                        }`}
                      >
                        {response.choice2}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const confirmAssetAllocationPage = () => {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Your Personalized Asset Allocation
        </h1>
        <div className="flex justify-center">
          <AssetAllocationChart allocation={assetAllocation} />
        </div>
        <div className="flex justify-center">
          <BuyAssetButton />
        </div>
      </div>
    );
  };

  const nextPair = () => {
    setPairWiseResponse([
      ...pairWiseResponse,
      {
        index: questionIndex,
        choice1: choice1.name,
        choice2: choice2.name,
        selectedChoice: selectedChoice,
      },
    ]);
    setQuestionIndex(questionIndex + 1);

    const [firstIndex, secondIndex] = getTwoUniqueRandomNumbers();
    const newChoice1 = investment_assets[firstIndex];
    const newChoice2 = investment_assets[secondIndex];
    setChoice1({
      name: newChoice1.name,
      description: newChoice1.description,
      image: newChoice1.imageURL,
      marketCap: newChoice1.marketCap,
      twelveMonthsChange: newChoice1["12monthsChange"],
      country: newChoice1.country,
    });
    setChoice2({
      name: newChoice2.name,
      description: newChoice2.description,
      image: newChoice2.imageURL,
      marketCap: newChoice2.marketCap,
      twelveMonthsChange: newChoice2["12monthsChange"],
      country: newChoice2.country,
    });
  };

  const previousPair = () => {
    setQuestionIndex(questionIndex - 1);
    const [firstIndex, secondIndex] = getTwoUniqueRandomNumbers();
    const newChoice1 = investment_assets[firstIndex];
    const newChoice2 = investment_assets[secondIndex];
    setChoice1({
      name: newChoice1.name,
      description: newChoice1.description,
      image: newChoice1.imageURL,
      marketCap: newChoice1.marketCap,
      twelveMonthsChange: newChoice1["12monthsChange"],
      country: newChoice1.country,
    });
    setChoice2({
      name: newChoice2.name,
      description: newChoice2.description,
      image: newChoice2.imageURL,
      marketCap: newChoice2.marketCap,
      twelveMonthsChange: newChoice2["12monthsChange"],
      country: newChoice2.country,
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-6">
      {page === 1 && agePage()}
      {page === 2 && investmentGoalPage()}
      {page === 3 && investmentPerMonthPage()}
      {page === 4 && riskTolerancePage()}
      {page === 5 && (
        <PairWisePage
          choice1={choice1}
          choice2={choice2}
          selectedChoice={selectedChoice}
          setSelectedChoice={setSelectedChoice}
          nextButton={<NextButton />}
          previousButton={<PreviousButton />}
          nextPair={nextPair}
          previousPair={previousPair}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
        />
      )}
      {page === 6 && confirmPage()}
      {page === 7 && confirmAssetAllocationPage()}
    </div>
  );
}
