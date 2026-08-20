import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

import InstagramSetup from "@/models/InstagramSetup";
import InstagramComment from "@/models/InstagramComment";

export async function POST(request: NextRequest) {
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

    await connectDB();

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

    /*
     * Get Instagram posts
     */

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

    if (!mediaResponse.ok) {
      console.error(
        "Instagram media error:",
        mediaData
      );

      return NextResponse.redirect(
        new URL(
          `/dashboard?instagram_error=${encodeURIComponent(
            "Could not fetch Instagram posts"
          )}`,
          request.url
        )
      );
    }

    const posts = mediaData.data || [];

    let totalComments = 0;

    /*
     * Get comments
     */

    for (const post of posts) {
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

      if (!commentsResponse.ok) {
        console.error(
          `Comments error for post ${post.id}:`,
          commentsData
        );

        continue;
      }

      const comments =
        commentsData.data || [];

      /*
       * Save comments in MongoDB
       */

      for (const comment of comments) {
        await InstagramComment.findOneAndUpdate(
          {
            commentId: String(comment.id),
          },
          {
            userId: payload.username,

            instagramUserId,

            postId: String(post.id),

            commentId: String(comment.id),

            username:
              comment.username || "",

            comment:
              comment.text || "",

            commentCreatedAt:
              comment.timestamp
                ? new Date(comment.timestamp)
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
    }

    /*
     * Redirect back to dashboard
     */

    return NextResponse.redirect(
      new URL(
        `/dashboard?instagram_synced=true&posts=${posts.length}&comments=${totalComments}`,
        request.url
      )
    );

  } catch (error) {
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