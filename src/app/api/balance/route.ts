import { NextResponse } from "next/server";

export async function GET() {
  // TEMP FIX (mock data)
  return NextResponse.json({
    balance: "$200",
  });
}

