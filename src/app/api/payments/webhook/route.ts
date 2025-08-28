import { Webhook } from "standardwebhooks";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
  };

  try {
    await webhook.verify(rawBody, headers);
    const payload = JSON.parse(rawBody);

    // Handle subscription event types:
    const subscription = payload.data?.subscription;
    if (!subscription || !subscription.id) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    if (payload.event_type === "subscription.created" || payload.event_type === "subscription.updated" || payload.event_type === "subscription.upgraded") {
      await upsertSubscription(subscription);
    } else if (payload.event_type === "subscription.canceled") {
      await cancelSubscription(subscription.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook verification failed", error);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}

async function upsertSubscription(subscription: any) {
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      id: subscription.id,
      customer_email: subscription.customer.email,
      product_id: subscription.product_id,
      status: subscription.status,
      quantity: subscription.quantity,
      current_period_end: subscription.current_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  
  if (error) {
    console.error("Supabase upsert error:", error);
  }
}

async function cancelSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  
  if (error) {
    console.error("Supabase cancel update error:", error);
  }
}
