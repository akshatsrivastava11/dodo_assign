import { createClient } from "@supabase/supabase-js";
// import { SubscriptionDetails } from "@/types/api-types";
import dotenv from 'dotenv'
dotenv.config()
console.log("process.env.NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SubscriptionDetails = {
  activated_at: string;
  subscription_id: string;
  payment_frequency_interval: 'Day' | 'Week' | 'Month' | 'Year';
  product_id: string;
};
export class DatabaseService {
  static async getUserPurchases(email: string) {
    const { data, error } = await supabase
      .from("user_purchases")
      .select("product_ids, subscription_ids")
      .eq("email", email)
      .single();

    return { data, error };
  }

  static async updatePurchaseRecord(
    email: string,
    updates: {
      product_ids?: string[];
      subscription_ids?: SubscriptionDetails[];
    }
  ) {
    const { data, error } = await supabase
      .from("user_purchases")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select();

    return { data, error };
  }

  static async createPurchaseRecord(
    email: string,
    record: {
      product_ids: string[];
      subscription_ids: SubscriptionDetails[];
    }
  ) {
    const { data, error } = await supabase
      .from("user_purchases")
      .insert([
        {
          email,
          ...record,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    return { data, error };
  }
}
