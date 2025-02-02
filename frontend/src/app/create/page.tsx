"use client";

import { useState } from "react";
import PairWisePage from "@/components/PairWisePage";
import { investment_assets } from "@/utils/investment_asset_list";

export default function RiskAssessmentPage() {
    const [page, setPage] = useState(1);
    const [age, setAge] = useState("");
    const [investmentPerMonth, setInvestmentPerMonth] = useState("");
    const [riskTolerance, setRiskTolerance] = useState("");
    const [pairWiseResponse, setPairWiseResponse] = useState<Array<{
        index: number;
        choice1: string;
        choice2: string;
        selectedChoice: string;
    }>>([]);
    const [choice1, setChoice1] = useState<string>("High-Yield Savings Account");
    const [choice2, setChoice2] = useState<string>("US Treasury Bonds");
    const [selectedChoice, setSelectedChoice] = useState<string>("");
    const [questionIndex, setQuestionIndex] = useState<number>(0);

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

    const confirm = () => {
        console.log({
            pairWiseResponse
        });
    }

    const agePage = () => {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">What is your age?</h1>
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
        )
    };

    const investmentPerMonthPage = () => {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">How much can you invest monthly?</h1>
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
        )
    };

    const riskTolerancePage = () => {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">What is your risk tolerance?</h1>
                <p className="text-gray-600 mb-4">On a scale of 1-7, where 1 is very conservative and 7 is very aggressive</p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                            <button
                                key={value}
                                onClick={() => setRiskTolerance(value.toString())}
                                className={`w-10 h-10 rounded-full ${
                                    riskTolerance === value.toString()
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700'
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
        )
    };

    const confirmPage = () => {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Review Your Information</h1>
                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <p className="text-gray-600">Age</p>
                        <p className="text-lg font-semibold">{age || "Not specified"}</p>
                    </div>
                    <div className="border-b pb-4">
                        <p className="text-gray-600">Monthly Investment</p>
                        <p className="text-lg font-semibold">${investmentPerMonth || "Not specified"}</p>
                    </div>
                    <div className="border-b pb-4">
                        <p className="text-gray-600">Risk Tolerance</p>
                        <p className="text-lg font-semibold">{riskTolerance || "Not specified"} / 7</p>
                    </div>
                    <div className="border-b pb-4">
                        <p className="text-gray-600">Pair-wise Comparisons</p>
                        <div className="space-y-3">
                            {pairWiseResponse.map((response, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm text-gray-500">Comparison {index + 1}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-sm ${response.selectedChoice === response.choice1 ? 'font-bold text-purple-600' : ''}`}>
                                            {response.choice1}
                                        </span>
                                        <span className="text-gray-400">vs</span>
                                        <span className={`text-sm ${response.selectedChoice === response.choice2 ? 'font-bold text-purple-600' : ''}`}>
                                            {response.choice2}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Selected: <span className="font-medium">{response.selectedChoice}</span>
                                    </p>
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
        )
    }

    const nextPair = () => {
        setPairWiseResponse([...pairWiseResponse, {
            index: questionIndex,
            choice1: choice1,
            choice2: choice2,
            selectedChoice: selectedChoice
        }]);
        setQuestionIndex(questionIndex + 1);
        setChoice1(investment_assets[questionIndex + 1].name);
        setChoice2(investment_assets[questionIndex + 2].name);
    }

    const previousPair = () => {
        setQuestionIndex(questionIndex - 1);
        setChoice1(investment_assets[questionIndex - 1].name);
        setChoice2(investment_assets[questionIndex - 2].name);
    }

    return (
        <div>
            <button
                onClick={() => {
                    console.log({
                        age,
                        investmentPerMonth,
                        riskTolerance,
                        pairWiseResponse
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
    )
}