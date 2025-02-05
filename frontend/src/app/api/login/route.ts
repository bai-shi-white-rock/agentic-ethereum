import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);
const TABLE_NAME = 'users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    console.log("address inside find user check request", address);
    
    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
        { status: 400 }
      );
    }

    // Search for user with matching wallet address
    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{walletAddress} = '${address}'`,
        maxRecords: 1
      })
      .firstPage();

    if (records && records.length > 0) {
      const user = {
        id: records[0].id,
        walletAddress: records[0].fields.walletAddress
      };
      console.log('user found: ', user);
      return NextResponse.json({ user }, { status: 200 });
    }

    return NextResponse.json({ data: "user not exists" }, { status: 404 });
  } catch (err) {
    console.error('Error finding user:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    console.log("create new user request body", address);
    
    if (!address) {
      return NextResponse.json(
        { error: "wallet address is required" },
        { status: 400 }
      );
    }

    // Create new user record
    const createdRecords = await base(TABLE_NAME).create([
      {
        fields: {
          walletAddress: address
        }
      }
    ]);

    if (createdRecords && createdRecords.length > 0) {
      const user = {
        id: createdRecords[0].id,
        walletAddress: createdRecords[0].fields.walletAddress
      };
      console.log('user created: ', user);
      return NextResponse.json({ user }, { status: 200 });
    }

    throw new Error('Failed to create user');
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}