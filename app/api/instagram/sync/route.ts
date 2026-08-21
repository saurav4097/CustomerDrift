import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import InstagramSetup from "@/models/InstagramSetup";
import InstagramComment from "@/models/InstagramComment";

export async function POST(request: NextRequest) {
  try {
    // =========================
    // 1. CHECK LOGIN
    // =========================

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

    // =========================
    // 2. CONNECT DATABASE
    // =========================

    await connectDB();

    // =========================
    // 3. GET INSTAGRAM CONNECTION
    // =========================

    const instagramSetup =
      await InstagramSetup.findOne({
        userId: payload.username,
      }).lean();

    if (!instagramSetup) {
      return NextResponse.redirect(
        new URL(
          "/dashboard?instagram_error=not_connected",
          request.url
        )
      );
    }

    const accessToken =
      instagramSetup.accessToken;

    const instagramUserId =
      instagramSetup.instagramUserId;

    if (!accessToken || !instagramUserId) {
      return NextResponse.redirect(
        new URL(
          "/dashboard?instagram_error=invalid_connection",
          request.url
        )
      );
    }

    // =========================
    // 4. GET INSTAGRAM POSTS
    // =========================

    const mediaResponse = await fetch(
      `https://graph.instagram.com/v23.0/${instagramUserId}/media` +
        `?fields=id,caption,media_type,media_url,permalink,timestamp` +
        `&limit=100` +
        `&access_token=${encodeURIComponent(
          accessToken
        )}`
    );

    const mediaData =
      await mediaResponse.json();

    // =========================
    // 5. CHECK INSTAGRAM TOKEN
    // =========================

    if (!mediaResponse.ok) {
      console.error(
        "Instagram media error:",
        mediaData
      );

      const errorCode =
        mediaData?.error?.code;

      const errorMessage =
        mediaData?.error?.message || "";

      /*
       * Instagram access token expired
       * or is invalid.
       */

      if (
        errorCode === 190 ||
        errorMessage
          .toLowerCase()
          .includes("access token") ||
        errorMessage
          .toLowerCase()
          .includes("session has expired")
      ) {
        return NextResponse.redirect(
          new URL(
            "/dashboard?instagram_error=token_expired",
            request.url
          )
        );
      }

      // Other Instagram API error

      return NextResponse.redirect(
        new URL(
          `/dashboard?instagram_error=${encodeURIComponent(
            "Instagram could not fetch your posts. Please try again."
          )}`,
          request.url
        )
      );
    }

    // =========================
    // 6. POSTS
    // =========================

    const posts =
      Array.isArray(mediaData.data)
        ? mediaData.data
        : [];

    let totalComments = 0;

    // =========================
    // 7. GET COMMENTS
    // =========================

    for (const post of posts) {
      try {
        const commentsResponse =
          await fetch(
            `https://graph.instagram.com/v23.0/${post.id}/comments` +
              `?fields=id,text,username,timestamp` +
              `&limit=100` +
              `&access_token=${encodeURIComponent(
                accessToken
              )}`
          );

        const commentsData =
          await commentsResponse.json();

        // If comments fail for one post,
        // continue with the other posts.

        if (!commentsResponse.ok) {
          console.error(
            `Comments error for post ${post.id}:`,
            commentsData
          );

          // If token expired while fetching comments
          if (
            commentsData?.error?.code === 190
          ) {
            return NextResponse.redirect(
              new URL(
                "/dashboard?instagram_error=token_expired",
                request.url
              )
            );
          }

          continue;
        }

        const comments =
          Array.isArray(
            commentsData.data
          )
            ? commentsData.data
            : [];

        // =========================
        // 8. SAVE COMMENTS
        // =========================

        for (const comment of comments) {
          await InstagramComment.findOneAndUpdate(
            {
              commentId: String(
                comment.id
              ),
            },
            {
              userId: payload.username,

              instagramUserId,

              postId: String(post.id),

              commentId: String(
                comment.id
              ),

              username:
                comment.username || "",

              comment:
                comment.text || "",

              commentCreatedAt:
                comment.timestamp
                  ? new Date(
                      comment.timestamp
                    )
                  : undefined,

              syncedAt: new Date(),
            },
            {
              upsert: true,
              new: true,
            }
          );

          totalComments++;
        }
      } catch (postError) {
        console.error(
          `Error processing post ${post.id}:`,
          postError
        );

        // Continue processing remaining posts
        continue;
      }
    }

    // =========================
    // 9. SUCCESS
    // =========================

    return NextResponse.redirect(
      new URL(
        `/dashboard?instagram_synced=true&posts=${posts.length}&comments=${totalComments}`,
        request.url
      )
    );
  } catch (error) {
    // =========================
    // 10. UNKNOWN ERROR
    // =========================

    console.error(
      "Instagram sync error:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/dashboard?instagram_error=sync_failed",
        request.url
      )
    );
  }
}