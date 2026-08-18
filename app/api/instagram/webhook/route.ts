import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import InstagramComment from "@/models/InstagramComment";

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "Instagram webhook received:",
      JSON.stringify(body, null, 2)
    );

    if (body.object !== "instagram") {
      return NextResponse.json(
        { error: "Invalid object" },
        { status: 400 }
      );
    }

    await connectDB();

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        console.log("Instagram change:", change);

        /*
         * We will add the exact comment-processing logic
         * after we confirm the webhook payload produced by Meta.
         */

        if (change.field === "comments") {
          const value = change.value;

          console.log("New Instagram comment:", value);

          // We will map the exact Meta fields here
          // once we test the webhook.
        }
      }
    }

    // Meta expects a successful response quickly.
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Instagram webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}