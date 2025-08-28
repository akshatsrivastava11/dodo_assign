
import { dodo } from "@/utils/dodopay/dodo";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CountryCode } from "dodopayments/resources/misc.mjs";


const paymentRequestSchema = z.object({
  formData: z.object({
    city: z.string(),
    country: z.string(),
    state: z.string(),
    addressLine: z.string(),
    zipCode: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  cartItems: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("The body is ",body)  
    // Validate request body
    const { formData, cartItems } = paymentRequestSchema.parse(body);
    console.log("The form data  and cart items is ",formData,cartItems)
    console.log("the countrycode is ",formData.country as CountryCode)
    
    const response = await fetch(`https://test.dodopayments.com/subscriptions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_DODO_PAYMENT_KEY}`, 
  },
  body: JSON.stringify({
    billing: {
      city: formData.city,
      country: formData.country,
      state: formData.state,
      street: formData.addressLine,
      zipcode: parseInt(formData.zipCode),
    },
    customer: {
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      phone_number: "8111321319", 
      customer_id:"cus_z3asDovM0gWKsCSzvuBNj"
    },
    product_id:"pdt_t9wHQdZXFemOrBtPOnN5l",
    quantity:1,
    payment_link:true,
    
  }),
});

  console.log("the response is ",await response.json())
  console.log("the payment link is",response.payment_link)
    return NextResponse.json({ paymentLink: response.payment_link });
    
  } catch (err) {
    console.error("Payment link creation failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
