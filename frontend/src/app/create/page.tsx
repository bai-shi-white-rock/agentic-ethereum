"use client";

import { useState, useEffect } from "react";
import PairWisePage from "@/components/PairWisePage";
import { investment_assets } from "@/utils/investment_asset_list";
import { useRouter } from "next/navigation";

interface Choice {
  name: string;
  description: string;
  image: string;
  marketCap: string;
  twelveMonthsChange: string;
  country: string;
}

export default function RiskAssessmentPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [age, setAge] = useState("");
  const [investmentPerMonth, setInvestmentPerMonth] = useState("");
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
    country: ""
  });

  const [choice2, setChoice2] = useState<Choice>({
    name: "",
    description: "",
    image: "",
    marketCap: "",
    twelveMonthsChange: "",
    country: ""
  });
  
  const [selectedChoice, setSelectedChoice] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);

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
      country: initialChoice1.country
    });

    setChoice2({
      name: initialChoice2.name, 
      description: initialChoice2.description,
      image: initialChoice2.imageURL,
      marketCap: initialChoice2.marketCap,
      twelveMonthsChange: initialChoice2["12monthsChange"],
      country: initialChoice2.country
    });
  }, []);

  const nextPage = () => {
    if (page < 5) {
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
      className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
      hidden={page === 5}
    >
      Next
    </button>
  );

  const ConfirmButton = () => (
    <button
      onClick={confirm}
      className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
    >
      Confirm
    </button>
  );

  const confirm = async () => {
    try {
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age,
          investmentPerMonth,
          riskTolerance,
          pairWiseResponse,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // You can add a toast notification here or redirect to another page
        console.log('Risk assessment submitted successfully');
        // Optionally redirect to dashboard or another page
        window.location.href = '/dashboard';
      } else {
        console.error('Failed to submit risk assessment');
      }
    } catch (error) {
      console.error('Error submitting risk assessment:', error);
    }
    router.push('/pay');
  };

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
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

  const investmentPerMonthPage = () => {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          How much can you invest monthly?
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
              className="w-full p-3 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          What is your risk tolerance?
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
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-purple-500 hover:text-white transition-colors`}
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
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Review Your Information
        </h1>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-gray-600">Age</p>
            <p className="text-lg font-semibold">{age || "Not specified"}</p>
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
          <div className="border-b pb-4">
            <p className="text-gray-600">Pair-wise Comparisons</p>
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
                          ? "font-bold text-purple-600"
                          : ""
                      }`}
                    >
                      {response.choice1}
                    </span>
                    <span className="text-gray-400">vs</span>
                    <span
                      className={`text-sm ${
                        response.selectedChoice === response.choice2
                          ? "font-bold text-purple-600"
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
          <div className="flex justify-between mt-6">
            <PreviousButton />
            <ConfirmButton />
          </div>
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
      country: newChoice1.country
    });
    setChoice2({
      name: newChoice2.name,
      description: newChoice2.description,
      image: newChoice2.imageURL,
      marketCap: newChoice2.marketCap,
      twelveMonthsChange: newChoice2["12monthsChange"],
      country: newChoice2.country
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
      country: newChoice1.country
    });
    setChoice2({
      name: newChoice2.name,
      description: newChoice2.description,
      image: newChoice2.imageURL,
      marketCap: newChoice2.marketCap,
      twelveMonthsChange: newChoice2["12monthsChange"],
      country: newChoice2.country
    });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-6">
      <button
        onClick={() => {
          console.log({
            age,
            investmentPerMonth,
            riskTolerance,
            pairWiseResponse,
          });
        }}
        className="fixed bottom-4 right-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
      >
        Debug State
      </button>
      {page === 1 && agePage()}
      {page === 2 && investmentPerMonthPage()}
      {page === 3 && riskTolerancePage()}
      {page === 4 && (
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
      {page === 5 && confirmPage()}
    </div>
  );
}
