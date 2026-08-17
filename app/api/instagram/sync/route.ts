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
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    await connectDB();

    const instagramSetup = await InstagramSetup.findOne({
      userId: payload.username,
    }).lean();

    if (!instagramSetup) {
      return NextResponse.json(
        {
          error: "Instagram account not connected",
        },
        { status: 400 }
      );
    }

    const accessToken = instagramSetup.accessToken;
    const instagramUserId = instagramSetup.instagramUserId;

    /*
     * 1. Get Instagram media/posts
     */
    const mediaUrl =
      `https://graph.instagram.com/${instagramUserId}/media` +
      `?fields=id,caption,media_type,media_url,permalink,timestamp` +
      `&limit=100` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const mediaResponse = await fetch(mediaUrl);

    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      console.error("Instagram media error:", mediaData);

      return NextResponse.json(
        {
          error: "Could not fetch Instagram posts",
          details: mediaData,
        },
        { status: 400 }
      );
    }

    const posts = mediaData.data || [];

    let totalComments = 0;

    /*
     * 2. Get comments for every post
     */
    for (const post of posts) {
      const commentsUrl =
        `https://graph.instagram.com/${post.id}/comments` +
        `?fields=id,text,username,timestamp` +
        `&limit=100` +
        `&access_token=${encodeURIComponent(accessToken)}`;

      const commentsResponse = await fetch(commentsUrl);

      const commentsData = await commentsResponse.json();

      if (!commentsResponse.ok) {
        console.error(
          `Comments error for post ${post.id}:`,
          commentsData
        );

        continue;
      }

      const comments = commentsData.data || [];

      /*
       * 3. Save comments
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
            username: comment.username || "",
            comment: comment.text || "",
            commentCreatedAt: comment.timestamp
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

    return NextResponse.json({
      success: true,
      postsFetched: posts.length,
      commentsFetched: totalComments,
    });
  } catch (error) {
    console.error("Instagram sync error:", error);

    return NextResponse.json(
      {
        error: "Instagram sync failed",
      },
      { status: 500 }
    );
  }
}