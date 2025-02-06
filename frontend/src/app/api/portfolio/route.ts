import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import { gql, request as graphqlRequest } from 'graphql-request'

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

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const INVESTMENT_PLANS_TABLE = 'investmentPlans';
const USERS_TABLE = 'users'; 

const query = gql`
{
  rateSets {
    id
    tokenA
    tokenB
    amountA
    amountB
  }
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

const url = "https://api.studio.thegraph.com/query/103189/bai-shi/version/latest";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get("address");

        if (!address) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Fetch data from The Graph
        const graphData = await graphqlRequest<GraphQLResponse>(url, query);
        
        // Filter swaps for the current user
        const userSwaps = graphData.tokensSwappeds.filter((swap: TokenSwapped) => 
            swap.user.toLowerCase() === address.toLowerCase()
        );

        // First, find all the investment plans of that wallet address
        const records = await base(USERS_TABLE)
            .select({
                filterByFormula: `{walletAddress} = '${address}'`,
                fields: ['investmentPlans']
            })
            .firstPage();

        if (!records || records.length === 0) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const investmentPlansRecords = records[0].get('investmentPlans');
        console.log('investmentPlansRecords: ', investmentPlansRecords);

        // If no investment plans found, return empty array for plans but still include graph data
        if (!investmentPlansRecords || !Array.isArray(investmentPlansRecords) || investmentPlansRecords.length === 0) {
            return NextResponse.json({ 
                success: true, 
                data: {
                    investmentPlans: [],
                    graphData: {
                        rateSets: graphData.rateSets,
                        swapHistory: userSwaps
                    }
                }
            });
        }

        // Fetch details for each investment plan
        const totalInvestmentPlans = await Promise.all(
            investmentPlansRecords.map(async (recordId) => {
                const plan = await base(INVESTMENT_PLANS_TABLE).find(recordId);
                return {
                    id: plan.id,
                    assetAllocation: JSON.parse(String(plan.get('assetAllocation')) || '{}'),
                    investmentPerMonth: Number(plan.get('investmentPerMonth')) || 0,
                    createdAt: String(plan.get('createdAt'))
                } as InvestmentPlan;
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                investmentPlans: totalInvestmentPlans,
                graphData: {
                    rateSets: graphData.rateSets,
                    swapHistory: userSwaps
                }
            }
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}