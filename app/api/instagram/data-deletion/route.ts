import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "Instagram data deletion request:",
      JSON.stringify(body, null, 2)
    );

    /*
     * Later:
     *
     * 1. Verify the request from Meta.
     * 2. Identify the CustomerDrift user.
     * 3. Delete their Instagram connection.
     * 4. Delete their stored Instagram comments/data.
     * 5. Return the deletion confirmation/status.
     */

    return NextResponse.json(
      {
        success: true,
        message: "Data deletion request received",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Instagram data deletion error:", error);

    return NextResponse.json(
      { error: "Data deletion request failed" },
      { status: 500 }
    );
  }
}