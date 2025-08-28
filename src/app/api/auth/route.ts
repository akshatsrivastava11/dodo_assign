import { NextRequest, NextResponse } from "next/server";
import { signUpWorkflow } from "./signup";

export async function POST(req: NextRequest) {
  console.log("📨 API route called");
  
  try {
    const body = await req.json();
    console.log("📄 Request body:", { email: body.email, passwordProvided: !!body.password });
    
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const response = await signUpWorkflow(email, password);
    
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error("🚨 API error:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
