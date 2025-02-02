import { useState } from "react";

export default function RiskAssessmentPage() {
    const [page, setPage] = useState(1);
    const [age, setAge] = useState("");
    const [investmentPerMonth, setInvestmentPerMonth] = useState("");
    const [riskTolerance, setRiskTolerance] = useState("");
    const [pairWiseResponse, setPairWiseResponse] = useState<Array<any>>();

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

    const nextPage = () => {
        if (page < 4) {
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
            disabled={page === 1}
        >
            Previous
        </button>
    );

    const NextButton = () => (
        <button 
            onClick={nextPage}
            className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
            disabled={page === 4}
        >
            Next
        </button>
    );

    const pairWisePage = () => {
        return (
            <div>
                <h1>Pair Wise</h1>
            </div>
        )
    };

    return (
        <div>
            {page === 1 && agePage()}
            {page === 2 && investmentPerMonthPage()}
            {page === 3 && riskTolerancePage()}
            {page === 4 && pairWisePage()}
        </div>
    )
}