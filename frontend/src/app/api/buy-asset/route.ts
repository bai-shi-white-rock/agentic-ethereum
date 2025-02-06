import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const response = await fetch(`${process.env.SERVER_URL}/buy-asset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.error || 'Failed to purchase asset' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Error purchasing asset:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}