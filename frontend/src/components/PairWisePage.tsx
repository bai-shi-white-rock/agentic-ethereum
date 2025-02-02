"use client";

import Image from "next/image";

interface Choice {
    name: string;
    description: string;
    image: string;
    marketCap: string;
    twelveMonthsChange: string;
    country: string;
}

interface PairWisePageProps {
    choice1: Choice;
    choice2: Choice;
    selectedChoice: string;
    setSelectedChoice: (choice: string) => void;
    nextButton: React.ReactNode;
    previousButton: React.ReactNode;
    questionIndex: number;
    setQuestionIndex: (index: number) => void;
    nextPair: () => void;
    previousPair: () => void;
}

export default function PairWisePage({ 
    choice1, 
    choice2, 
    selectedChoice, 
    setSelectedChoice, 
    nextButton, 
    previousButton, 
    questionIndex, 
    setQuestionIndex, 
    nextPair, 
    previousPair 
}: PairWisePageProps) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8 text-gray-800 text-center">Choose Your Preference</h1>
            <div className="flex gap-8 justify-center">
                {/* Choice1 Card */}
                <div
                    onClick={() => setSelectedChoice(choice1.name)}
                    className={`w-96 p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedChoice === choice1.name
                            ? 'bg-purple-100 border-2 border-purple-600 shadow-lg transform -translate-y-1'
                            : 'bg-white border border-gray-200 hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{choice1.name}</h2>
                        <span className="text-sm text-gray-500">{choice1.country}</span>
                    </div>
                    {choice1.image && (
                        <Image 
                            src={choice1.image} 
                            alt={choice1.name}
                            width={384}
                            height={160}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                    )}
                    <p className="text-gray-600 mb-4">{choice1.description}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Market Cap:</span>
                            <span className="text-sm font-medium">{choice1.marketCap}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">12 Months Change:</span>
                            <span className={`text-sm font-medium ${
                                parseFloat(choice1.twelveMonthsChange) >= 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {choice1.twelveMonthsChange}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Choice2 Card */}
                <div
                    onClick={() => setSelectedChoice(choice2.name)}
                    className={`w-96 p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedChoice === choice2.name
                            ? 'bg-purple-100 border-2 border-purple-600 shadow-lg transform -translate-y-1'
                            : 'bg-white border border-gray-200 hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">{choice2.name}</h2>
                        <span className="text-sm text-gray-500">{choice2.country}</span>
                    </div>
                    {choice2.image && (
                        <Image 
                            src={choice2.image} 
                            alt={choice2.name}
                            width={384}
                            height={160}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                    )}
                    <p className="text-gray-600 mb-4">{choice2.description}</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Market Cap:</span>
                            <span className="text-sm font-medium">{choice2.marketCap}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">12 Months Change:</span>
                            <span className={`text-sm font-medium ${
                                parseFloat(choice2.twelveMonthsChange) >= 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                            }`}>
                                {choice2.twelveMonthsChange}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-8">
                {questionIndex === 0 && previousButton}
                <button 
                    onClick={previousPair}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                    hidden={questionIndex === 0}
                >
                    Previous
                </button>
                <button 
                    onClick={nextPair}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
                    hidden={questionIndex === 10}
                >
                    Next
                </button>
                {questionIndex === 10 && nextButton}
            </div>
        </div>
    );
} 