import { DatabaseService } from "./supabase/supabase";
import { Payment as BasePayment } from "dodopayments/resources/payments.mjs";
import { Subscription as BaseSubscription } from "dodopayments/resources/subscriptions.mjs";

export type Payment = BasePayment & { payload_type: string };
export type Subscription = BaseSubscription & { payload_type: string };

export type SubscriptionDetails = {
  activated_at: string;
  subscription_id: string;
  payment_frequency_interval: 'Day' | 'Week' | 'Month' | 'Year';
  product_id: string;
};
export type WebhookPayload = {
  type: string;
  data: Payment | Subscription
};


export interface UpdateSubscriptionResult {
  success: boolean;
  error?: {
    message: string;
    status: number;
  };
}


export async function handleSubscription(
  email: string,
  payload: WebhookPayload
) {
  const { data: existingRecord, error: fetchError } =
    await DatabaseService.getUserPurchases(email);

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  let subscriptionDetail;
  if ("payment_frequency_interval" in payload.data) {
    subscriptionDetail = {
      activated_at: new Date().toISOString(),
      payment_frequency_interval: payload.data.payment_frequency_interval,
      product_id: payload.data.product_id!,
      subscription_id: payload.data.subscription_id!,
    };
  } else {
    throw new Error("Invalid payload data for subscription");
  }

  if (existingRecord) {
    const updatedSubscriptions = [
      ...(existingRecord.subscription_ids || []),
      subscriptionDetail,
    ];

    await DatabaseService.updatePurchaseRecord(email, {
      subscription_ids: updatedSubscriptions,
    });
  } else {
    await DatabaseService.createPurchaseRecord(email, {
      product_ids: [],
      subscription_ids: [subscriptionDetail],
    });
  }
}
export async function updateSubscriptionInDatabase(
  email: string,
  subscriptionId: string
): Promise<UpdateSubscriptionResult> {
  try {
    // Fetch current purchases
    const { data: userPurchases, error: fetchError } =
      await DatabaseService.getUserPurchases(email);

    if (fetchError) {
      return {
        success: false,
        error: {
          message: "Failed to fetch user purchases",
          status: 500,
        },
      };
    }

    if (!userPurchases) {
      return {
        success: false,
        error: {
          message: "No purchase records found for user",
          status: 404,
        },
      };
    }

    const parsedPurchases =
      userPurchases?.subscription_ids.map((id: string) => JSON.parse(id)) ?? [];

    // Filter out the cancelled subscription
    const updatedSubscriptions = (
      parsedPurchases as SubscriptionDetails[]
    ).filter((sub) => sub.subscription_id !== subscriptionId);

    // Update the database
    const { error: updateError } = await DatabaseService.updatePurchaseRecord(
      email,
      {
        subscription_ids: updatedSubscriptions,
      }
    );

    if (updateError) {
      return {
        success: false,
        error: {
          message: "Failed to update purchase record",
          status: 500,
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating subscription in database:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        status: 500,
      },
    };
  }
}
