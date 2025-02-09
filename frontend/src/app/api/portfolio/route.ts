import { NextResponse } from "next/server";
import Airtable from "airtable";
import { gql, request as graphqlRequest } from "graphql-request";

interface RateSet {
  id: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
}

interface TokenSwapped {
  id: string;
  user: string;
  tokenFrom: string;
  tokenTo: string;
  amountFrom: string;
  amountTo: string;
  blockTimestamp: string;
}

interface GraphQLResponse {
  rateSets: RateSet[];
  tokensSwappeds: TokenSwapped[];
}

interface InvestmentPlan {
  id: string;
  totalInvestment: number;
  assetAllocation: Record<string, string>;
  investmentPerMonth: number;
  createdAt: string;
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);
const INVESTMENT_PLANS_TABLE = "investmentPlans";
const USERS_TABLE = "users";

const query = gql`
  {
    tokensSwappeds {
      id
      user
      tokenFrom
      tokenTo
      amountFrom
      amountTo
      blockTimestamp
    }
  }
`;

const url =
  "https://api.studio.thegraph.com/query/103189/bai-shi-2/version/latest";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch data from The Graph
    const graphData = await graphqlRequest<GraphQLResponse>(url, query);

    // First, find all the investment plans of that wallet address
    const records = await base(USERS_TABLE)
      .select({
        filterByFormula: `{walletAddress} = '${address}'`,
        fields: ["investmentPlans", "agentWalletAddress"],
      })
      .firstPage();

    // Check if records exist first
    if (!records || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const agentWalletAddress = records[0].get("agentWalletAddress") || null;
    console.log("agentWalletAddress: ", agentWalletAddress);
    console.log("graphData: ", graphData);

    // Filter swaps for the current user if agent wallet exists
    const userSwaps = agentWalletAddress
      ? graphData.tokensSwappeds.filter(
          (swap: TokenSwapped) =>
            swap.user.toLowerCase() ===
            agentWalletAddress.toString().toLowerCase()
        )
      : [];

    console.log("userSwaps: ", userSwaps);

    const investmentPlansRecords = records[0].get("investmentPlans");
    console.log("investmentPlansRecords: ", investmentPlansRecords);

    // If no investment plans found, return empty array for plans and graph data
    if (
      !investmentPlansRecords ||
      !Array.isArray(investmentPlansRecords) ||
      investmentPlansRecords.length === 0
    ) {
      return NextResponse.json({
        success: true,
        data: {
          investmentPlans: [],
          graphData: userSwaps,
        },
      });
    }

    // Fetch details for each investment plan
    const totalInvestmentPlans = await Promise.all(
      investmentPlansRecords.map(async (recordId) => {
        try {
          const plan = await base(INVESTMENT_PLANS_TABLE).find(recordId);
          return {
            id: plan.id,
            assetAllocation: JSON.parse(
              String(plan.get("assetAllocation")) || "{}"
            ),
            investmentPerMonth: Number(plan.get("investmentPerMonth")) || 0,
            createdAt: String(plan.get("createdAt")),
          } as InvestmentPlan;
        } catch (err) {
          console.error(`Error fetching investment plan ${recordId}:`, err);
          return null;
        }
      })
    );

    // Filter out any null plans from failed fetches
    const validInvestmentPlans = totalInvestmentPlans.filter(
      (plan) => plan !== null
    );

    return NextResponse.json({
      success: true,
      data: {
        investmentPlans: validInvestmentPlans,
        graphData: userSwaps ,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching portfolio:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
