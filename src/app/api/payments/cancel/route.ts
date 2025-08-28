import { updateSubscriptionInDatabase } from "@/utils/api-functions";
import { dodo } from "@/utils/dodopay/dodo";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    const subscriptionId = body.subscriptionId;

    // const response = await dodo.subscriptions.update(subscriptionId, {
    //   status: "cancelled",
    //   metadata: {} // metadata can be sent here 
    // })
    const response=await fetch(`https://test.dodopayments.com/subscriptions/${subscriptionId}`,{
method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_DODO_PAYMENT_KEY}`, 
  },
  body: JSON.stringify({
    cancel_at_next_billing_date: true,
  })
})
  console.log("the response is ",response)    
    // Step 2: Update database
    const result = await updateSubscriptionInDatabase(email!, subscriptionId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: result.error?.status }
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