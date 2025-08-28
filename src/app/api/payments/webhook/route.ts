import { Webhook } from "standardwebhooks";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize clients inside the handler to ensure env vars are available at runtime
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    const webhookKey = process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!webhookKey || !supabaseUrl || !supabaseKey) {
      console.error("Missing required environment variables:", {
        webhookKey: !!webhookKey,
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Initialize clients with validated environment variables
    const webhook = new Webhook(webhookKey);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rawBody = await request.text();
    const headers = {
      "webhook-id": request.headers.get("webhook-id") || "",
      "webhook-signature": request.headers.get("webhook-signature") || "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
    };

    // Verify webhook signature
    try {
      await webhook.verify(rawBody, headers);
    } catch (verificationError) {
      console.error("Webhook verification failed:", verificationError);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    // Handle subscription event types
    const subscription = payload.data?.subscription;
    if (!subscription || !subscription.id) {
      console.error("Invalid subscription payload:", payload);
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    console.log(`Processing webhook event: ${payload.event_type} for subscription: ${subscription.id}`);

    if (
      payload.event_type === "subscription.created" ||
      payload.event_type === "subscription.updated" ||
      payload.event_type === "subscription.upgraded"
    ) {
      await upsertSubscription(supabase, subscription);
    } else if (payload.event_type === "subscription.canceled") {
      await cancelSubscription(supabase, subscription.id);
    } else {
      console.log(`Unhandled event type: ${payload.event_type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function upsertSubscription(supabase: any, subscription: any) {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          id: subscription.id,
          customer_email: subscription.customer?.email,
          product_id: subscription.product_id,
          status: subscription.status,
          quantity: subscription.quantity || 1,
          current_period_end: subscription.current_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    console.log(`Successfully upserted subscription: ${subscription.id}`);
  } catch (error) {
    console.error("Failed to upsert subscription:", error);
    throw error;
  }
}

async function cancelSubscription(supabase: any, subscriptionId: string) {
  try {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    if (error) {
      console.error("Supabase cancel update error:", error);
      throw error;
    }

    console.log(`Successfully canceled subscription: ${subscriptionId}`);
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    throw error;
  }
}