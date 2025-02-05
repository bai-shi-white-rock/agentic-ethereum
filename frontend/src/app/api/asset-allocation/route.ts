import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON request
    const body = await request.json();

    // Validate that the request has a "data" field
    if (!body.data) {
      return NextResponse.json(
        { error: "Missing data in request body" },
        { status: 400 }
      );
    }

    const agentResponse = await fetch(
      `${process.env.SERVER_URL}/asset-allocation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: body.data }),
      }
    );

    // Extract the JSON response from the agent
    const result = await agentResponse.json();

    // Return the result back to the client using the status from the agent response
    return NextResponse.json(result, { status: agentResponse.status });
  } catch (error) {
    console.error("Asset allocation API route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
