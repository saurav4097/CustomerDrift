import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InstagramSetup from "@/models/InstagramSetup";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "Instagram deauthorization request:",
      JSON.stringify(body, null, 2)
    );

    await connectDB();

    /*
     * We will identify the Instagram connection from
     * Meta's deauthorization payload and disable/remove it.
     *
     * Do not blindly delete data until we confirm the
     * exact payload Meta sends to your app.
     */

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Instagram deauthorization error:", error);

    return NextResponse.json(
      { error: "Deauthorization failed" },
      { status: 500 }
    );
  }
}