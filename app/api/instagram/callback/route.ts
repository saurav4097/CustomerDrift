import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import InstagramSetup from "@/models/InstagramSetup";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard?instagram_error=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/dashboard?instagram_error=no_code",
          request.url
        )
      );
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.json(
        {
          error: "Instagram environment variables are missing",
        },
        { status: 500 }
      );
    }

    /*
     * Exchange authorization code
     */

    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "Instagram token error:",
        tokenData
      );

      return NextResponse.json(
        {
          error:
            "Could not exchange Instagram authorization code",
          details: tokenData,
        },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    /*
     * Business Login gives us the Instagram user ID.
     */

   

    /*
     * Get Instagram profile
     */


const profileResponse = await fetch(
  `https://graph.instagram.com/v23.0/me` +
    `?fields=id,username` +
    `&access_token=${encodeURIComponent(accessToken)}`
);

const profileData = await profileResponse.json();

if (
  !profileResponse.ok ||
  !profileData.id ||
  !profileData.username
) {
  console.error(
    "Instagram profile error:",
    profileData
  );

  return NextResponse.json(
    {
      error: "Could not get Instagram profile",
      details: profileData,
    },
    { status: 400 }
  );
}

const instagramUserId = String(profileData.id);
const instagramUsername = profileData.username;
    /*
     * Save connection
     */

    await connectDB();

    await InstagramSetup.findOneAndUpdate(
      {
        userId: payload.username,
      },
      {
        userId: payload.username,
        instagramUserId,
        instagramUsername,
        accessToken,
        connectedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.redirect(
      new URL(
        "/dashboard?instagram=connected",
        request.url
      )
    );
  } catch (error) {
    console.error(
      "Instagram callback error:",
      error
    );

    return NextResponse.json(
      {
        error: "Instagram connection failed",
      },
      { status: 500 }
    );
  }
}