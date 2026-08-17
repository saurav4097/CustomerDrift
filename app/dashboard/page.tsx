import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Competitor from "@/models/Competitor";
import InstagramSetup from "@/models/InstagramSetup";
import InstagramComment from "@/models/InstagramComment";

import { verifyToken } from "@/lib/auth";

export default async function Dashboard() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  await connectDB();

  const competitors = await Competitor.find({
    username: payload.username,
  }).lean();

  const instagram = await InstagramSetup.findOne({
    userId: payload.username,
  }).lean();

  const instagramCommentCount =
    await InstagramComment.countDocuments({
      userId: payload.username,
    });

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-400 mt-1">
              Welcome, {payload.username}
            </p>
          </div>

          <div className="flex items-center gap-3">

            <a
              href="/api/instagram/connect"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-sm font-medium hover:scale-105 transition"
            >
              {instagram
                ? "Reconnect Instagram"
                : "Connect Instagram"}
            </a>

            {instagram && (
              <form
                action="/api/instagram/sync"
                method="POST"
              >
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-gray-700 hover:border-purple-500 transition"
                >
                  Sync Instagram
                </button>
              </form>
            )}

            <form
              action="/api/logout"
              method="POST"
            >
              <button
                className="px-4 py-2 rounded-xl border border-gray-700 hover:border-red-500 transition"
              >
                Logout
              </button>
            </form>

          </div>
        </div>

        {/* Instagram */}
        <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  Instagram
                </h2>

                {instagram && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                    Connected
                  </span>
                )}
              </div>

              {instagram ? (
                <p className="text-gray-400 mt-2">
                  Connected as @{instagram.instagramUsername}
                </p>
              ) : (
                <p className="text-gray-400 mt-2">
                  Connect Instagram to collect customer comments.
                </p>
              )}
            </div>

            {instagram ? (
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {instagramCommentCount}
                </p>

                <p className="text-sm text-gray-400">
                  Comments collected
                </p>
              </div>
            ) : (
              <a
                href="/api/instagram/connect"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-medium hover:scale-105 transition"
              >
                Connect Instagram
              </a>
            )}

          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">

          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">
              Tracked Competitors
            </p>

            <p className="text-3xl font-bold mt-2">
              {competitors.length}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">
              Instagram Comments
            </p>

            <p className="text-3xl font-bold mt-2">
              {instagramCommentCount}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">
            <p className="text-sm text-gray-400">
              Instagram Status
            </p>

            <p
              className={`text-2xl font-bold mt-2 ${
                instagram
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              {instagram ? "Connected" : "Not connected"}
            </p>
          </div>

        </div>

        {/* Instagram Comments */}
        {instagram && (
          <InstagramComments
            username={payload.username}
          />
        )}

        {/* Competitors */}
        <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mt-8">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Your Competitors
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Added manually from MongoDB
            </p>
          </div>

          {competitors.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-400">
                No competitors added yet
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {competitors.map((c: any) => (
                <div
                  key={c._id.toString()}
                  className="rounded-2xl border border-gray-800 bg-black p-5 hover:border-purple-500/40 transition"
                >

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold mb-4">
                    {c.competitorBrand
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <h3 className="font-semibold text-lg">
                    {c.competitorBrand}
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Trustpilot · Active
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                      Tracking
                    </span>

                    <button className="text-sm text-purple-400 hover:text-purple-300">
                      View →
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}

async function InstagramComments({
  username,
}: {
  username: string;
}) {
  const comments = await InstagramComment.find({
    userId: username,
  })
    .sort({ commentCreatedAt: -1 })
    .limit(20)
    .lean();

  return (
    <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Instagram Comments
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          Latest comments collected from Instagram
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
          <p className="text-gray-400">
            No comments collected yet.
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Click "Sync Instagram" to fetch comments.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {comments.map((comment: any) => (
            <div
              key={comment._id.toString()}
              className="rounded-2xl border border-gray-800 bg-black p-4"
            >

              <div className="flex items-center justify-between">

                <p className="font-medium">
                  @{comment.username || "unknown"}
                </p>

                <p className="text-xs text-gray-500">
                  Post: {comment.postId}
                </p>

              </div>

              <p className="text-gray-300 mt-2">
                {comment.comment}
              </p>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}