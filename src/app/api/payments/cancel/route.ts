import { updateSubscriptionInDatabase } from "@/utils/api-functions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    const subscriptionId: string = body.subscriptionId;

    if (!email || !subscriptionId) {
      return NextResponse.json(
        { error: "Email and subscription ID are required" },
        { status: 400 }
      );
    }

    // Validate environment variable exists
    const apiKey = process.env.NEXT_DODO_PAYMENT_KEY;
    if (!apiKey) {
      console.error("NEXT_DODO_PAYMENT_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Construct URL more explicitly
    const apiUrl = `https://test.dodopayments.com/subscriptions/${subscriptionId}`;
    
    console.log("Making request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        cancel_at_next_billing_date: true,
      })
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    // Check if the API call was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dodo Payments API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 }
      );
    }

    // Step 2: Update database
    const result = await updateSubscriptionInDatabase(email, subscriptionId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || "Database update failed" },
        { status: result.error?.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled and database updated successfully",
    });

  } catch (error) {
    console.error("Error during subscription cancellation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}