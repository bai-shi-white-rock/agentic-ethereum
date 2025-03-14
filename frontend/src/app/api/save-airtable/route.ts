import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const INVESTMENT_PLANS_TABLE = 'investmentPlans';
const USERS_TABLE = 'users';

interface AirtableError {
  error: string;
  message: string;
  statusCode: number;
}

export async function POST(request: Request) {
  try {
    const { address, investmentPerMonth, summaryRiskPreference, assetAllocation } = await request.json()

    // First, find the user record ID by wallet address
    const userRecords = await base(USERS_TABLE)
      .select({
        filterByFormula: `{walletAddress} = '${address}'`,
        maxRecords: 1
      })
      .firstPage();

    if (!userRecords || userRecords.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found with the provided wallet address' },
        { status: 404 }
      )
    }

    const userRecordId = userRecords[0].id;

    // Create investment plan record with the found user record ID
    const record = await base(INVESTMENT_PLANS_TABLE).create([
      {
        fields: {
          users: [userRecordId],
          investmentPerMonth: parseFloat(investmentPerMonth),
          riskPreference: JSON.stringify(summaryRiskPreference),
          assetAllocation: JSON.stringify(assetAllocation),
        }
      }
    ]);

    if (!record || record.length === 0) {
      throw new Error('Failed to create record in Airtable')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Risk assessment data saved successfully',
      recordId: record[0].id
    })
  } catch (error) {
    console.error('Error processing risk assessment:', error)
    const airtableError = error as AirtableError;
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process risk assessment',
        error: airtableError.message,
        details: airtableError.error || ''
      },
      { status: 500 }
    )
  }
} 