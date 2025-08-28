export interface CustomerReturnDodoType {
  customer_id: string;
  business_id: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

// signup.ts - Fixed version
import dotenv from "dotenv";
import { createCustomer } from "@/utils/dodopay/dodo";
import { supabase } from "@/utils/supabase/supabase";

dotenv.config();

export async function signUpWorkflow(email: string, password: string) {
  try {
    console.log("🚀 Starting signup workflow for:", email);
    
    // Refresh session before signup
    await supabase.auth.refreshSession();
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    // Step 1: Sign up user in Supabase - USE THE PARAMETERS!
    console.log("📝 Attempting to sign up user with:", email);
    const { data, error } = await supabase.auth.signUp({ 
      email: email,  // Use parameter instead of hardcoded
      password: password  // Use parameter instead of hardcoded
    });
    
    console.log("📋 Signup response:", { data: !!data, error: error?.message });

    if (error) {
      console.error("❌ Signup error details:", error);
      throw new Error("Signup failed: " + error.message);
    }

    const user = data.user;
    console.log("👤 Supabase user created:", user?.id);

    if (!user) {
      console.error("❌ No user in response");
      throw new Error("User not found in signup response");
    }

    // Step 2: Create customer in DodoPay
    console.log("🔧 Creating customer in DodoPay...");
    const dodoCustomer = await createCustomer(email) as CustomerReturnDodoType;
    
    if (!dodoCustomer || !dodoCustomer.customer_id) {
      throw new Error("Failed to create customer in DodoPay");
    }

    // Step 3: Insert into customers table
    console.log("💾 Inserting customer data into database...");
    const { error: insertError } = await supabase.from("customers").insert({
      user_id: user.id,
      dodo_customer_id: dodoCustomer.customer_id,
      email: dodoCustomer.email
    });

    if (insertError) {
      console.error("❌ Database insert error:", insertError);
      throw new Error("Failed to save customer data: " + insertError.message);
    }

    console.log("✅ Signup workflow completed successfully");
    
    return {
      success: true,
      user_id: user.id,
      customer_id: dodoCustomer.customer_id,
      message: "User registered successfully"
    };

  } catch (error) {
    console.error("💥 Workflow failed with error:", error);
    throw error;
  }
}

