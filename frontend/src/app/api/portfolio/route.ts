import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const INVESTMENT_PLANS_TABLE = 'investmentPlans';
const USERS_TABLE = 'users'; 

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

        // If no investment plans found, return empty array
        if (!investmentPlansRecords || !Array.isArray(investmentPlansRecords) || investmentPlansRecords.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Fetch details for each investment plan
        const totalInvestmentPlans = await Promise.all(
            investmentPlansRecords.map(async (recordId) => {
                const plan = await base(INVESTMENT_PLANS_TABLE).find(recordId);
                return {
                    id: plan.id,
                    totalInvestment: plan.get('totalInvestment'),
                    assetAllocation: plan.get('assetAllocation'),
                    investmentPerMonth: plan.get('investmentPerMonth'),
                    createdAt: plan.get('createdAt')
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: totalInvestmentPlans
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}