import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import connectDB from "@/lib/mongodb";

import Competitor from "@/models/Competitor";
import InstagramSetup from "@/models/InstagramSetup";
import InstagramComment from "@/models/InstagramComment";

import { verifyToken } from "@/lib/auth";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    instagram_synced?: string;
    posts?: string;
    comments?: string;
    instagram_error?: string;
  }>;
}) {
  const params = await searchParams;

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

  /* ============================= */
  /* GET USER DATA */
  /* ============================= */

  const competitors = await Competitor.find({
    username: payload.username,
  }).lean();

  const instagram = await InstagramSetup.findOne({
    userId: payload.username,
  }).lean();

  const comments = await InstagramComment.find({
    userId: payload.username,
  })
    .sort({ commentCreatedAt: -1 })
    .limit(20)
    .lean();

  const commentCount =
    await InstagramComment.countDocuments({
      userId: payload.username,
    });

  /* ============================= */
  /* INSTAGRAM ERROR */
  /* ============================= */

  let instagramErrorMessage = "";

  if (params.instagram_error) {
    switch (params.instagram_error) {
      case "expired":
        instagramErrorMessage =
          "Your Instagram connection has expired. Please reconnect your Instagram account to continue collecting data.";
        break;

      case "invalid_token":
        instagramErrorMessage =
          "Your Instagram connection is no longer valid. Please reconnect your Instagram account.";
        break;

      case "no_code":
        instagramErrorMessage =
          "Instagram authorization was not completed. Please try connecting again.";
        break;

      case "access_denied":
        instagramErrorMessage =
          "Instagram access was denied. Please reconnect and allow the required permissions.";
        break;

      default:
        instagramErrorMessage =
          "Something went wrong with your Instagram connection. Please try reconnecting your account.";
        break;
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <p className="text-sm text-gray-500">
              CustomerDrift
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Customer Intelligence
            </h1>

            <p className="text-gray-400 mt-2 max-w-2xl">
              Connect your customer channels, collect
              conversations and understand what your
              customers are really saying.
            </p>

          </div>


          {/* LOGOUT */}

          <form
            action="/api/logout"
            method="POST"
          >

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl border border-gray-800 text-gray-300 hover:border-gray-600 hover:text-white transition"
            >
              Logout
            </button>

          </form>

        </div>


        {/* ================================= */}
        {/* INSTAGRAM ERROR */}
        {/* ================================= */}

        {instagramErrorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

            <div className="flex gap-3">

              <div className="text-red-400 text-lg">
                ⚠
              </div>

              <div>

                <p className="text-red-400 font-semibold">
                  Instagram connection problem
                </p>

                <p className="text-sm text-gray-400 mt-1 leading-6">
                  {instagramErrorMessage}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ================================= */}
        {/* INSTAGRAM SYNC SUCCESS */}
        {/* ================================= */}

        {params.instagram_synced === "true" && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">

            <div className="flex gap-3">

              <div className="text-green-400 text-lg">
                ✓
              </div>

              <div>

                <p className="text-green-400 font-semibold">
                  Instagram data collected successfully
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {params.posts || 0} posts checked ·{" "}
                  {params.comments || 0} comments found
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ================================= */}
        {/* CONNECTIONS */}
        {/* ================================= */}

        <section className="mb-8">

          <div className="mb-5">

            <p className="text-sm text-purple-400 font-medium">
              DATA SOURCES
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              Connect your customer channels
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              CustomerDrift collects customer conversations
              from the platforms you connect.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-4">


            {/* ============================= */}
            {/* INSTAGRAM */}
            {/* ============================= */}

            <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6">

              <div className="flex items-start justify-between">

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center text-xl">
                  ◎
                </div>

                {instagram ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    Connected
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
                    Not connected
                  </span>
                )}

              </div>


              <h3 className="text-lg font-semibold mt-5">
                Instagram
              </h3>

              <p className="text-sm text-gray-500 mt-2 min-h-[48px]">
                Collect posts and customer comments
                from your Instagram account.
              </p>


              {/* INSTAGRAM CONNECTION BUTTON */}

              <div className="mt-5">

                {instagram ? (

                  <div className="space-y-2">

                    <button
                      type="button"
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 cursor-not-allowed"
                    >
                      ✓ Instagram Connected
                    </button>


                    <a
                      href="/api/instagram/connect"
                      className="block w-full text-center px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white transition"
                    >
                      Reconnect Instagram
                    </a>

                  </div>

                ) : (

                  <a
                    href="/api/instagram/connect"
                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 transition"
                  >
                    Connect Instagram
                  </a>

                )}

              </div>


              {/* COLLECT DATA */}

              {instagram && (
                <form
                  action="/api/instagram/sync"
                  method="POST"
                  className="mt-3"
                >

                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition"
                  >
                    Collect Instagram Data
                  </button>

                </form>
              )}


              {/* ACCOUNT */}

              {instagram && (
                <p className="text-xs text-gray-600 mt-4">
                  Connected as @{instagram.instagramUsername}
                </p>
              )}

            </div>


            {/* ============================= */}
            {/* LINKEDIN */}
            {/* ============================= */}

            <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6 opacity-80">

              <div className="flex items-start justify-between">

                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl">
                  in
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-500">
                  Coming soon
                </span>

              </div>


              <h3 className="text-lg font-semibold mt-5">
                LinkedIn
              </h3>

              <p className="text-sm text-gray-500 mt-2 min-h-[48px]">
                Collect posts, comments and customer
                conversations from LinkedIn.
              </p>


              <button
                type="button"
                disabled
                className="w-full mt-5 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-600 cursor-not-allowed"
              >
                LinkedIn Connection Coming Soon
              </button>

            </div>


            {/* ============================= */}
            {/* YOUTUBE */}
            {/* ============================= */}

            <div className="rounded-3xl border border-gray-800 bg-gray-950 p-6 opacity-80">

              <div className="flex items-start justify-between">

                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center font-bold text-lg">
                  ▶
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-500">
                  Coming soon
                </span>

              </div>


              <h3 className="text-lg font-semibold mt-5">
                YouTube
              </h3>

              <p className="text-sm text-gray-500 mt-2 min-h-[48px]">
                Collect video comments and understand
                what your audience is saying.
              </p>


              <button
                type="button"
                disabled
                className="w-full mt-5 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-600 cursor-not-allowed"
              >
                YouTube Connection Coming Soon
              </button>

            </div>

          </div>

        </section>


        {/* ================================= */}
        {/* SMALL SUMMARY */}
        {/* ================================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <SummaryCard
            title="Competitors"
            value={competitors.length}
          />

          <SummaryCard
            title="Comments"
            value={commentCount}
          />

          <SummaryCard
            title="Instagram Posts"
            value={params.posts || "—"}
          />

          <SummaryCard
            title="Data Source"
            value={instagram ? "Instagram" : "None"}
          />

        </div>


        {/* ================================= */}
        {/* INSTAGRAM DETAILS */}
        {/* ================================= */}

        {instagram && (
          <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <p className="text-sm text-purple-400">
                  INSTAGRAM DATA
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  Your Instagram connection
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  CustomerDrift is connected to your
                  Instagram account.
                </p>

              </div>


              <div className="text-left md:text-right">

                <p className="text-2xl font-bold">
                  {commentCount}
                </p>

                <p className="text-sm text-gray-500">
                  comments collected
                </p>

              </div>

            </div>


            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

              <DetailCard
                title="Account"
                value={`@${instagram.instagramUsername}`}
              />

              <DetailCard
                title="Comments"
                value={commentCount}
              />

              <DetailCard
                title="Posts checked"
                value={params.posts || "—"}
              />

              <DetailCard
                title="Status"
                value="Connected"
              />

            </div>

          </section>
        )}

                {/* ================================= */}
        {/* CUSTOMER VOICE */}
        {/* ================================= */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <div className="mb-6">

            <p className="text-sm text-purple-400">
              CUSTOMER VOICE
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              What people are saying
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Recent customer conversations collected
              from your connected channels.
            </p>

          </div>


          {comments.length === 0 ? (

            <EmptyState
              text="No customer comments collected yet."
              subtext={
                instagram
                  ? "Click 'Collect Instagram Data' to check your Instagram account."
                  : "Connect Instagram to start collecting customer conversations."
              }
            />

          ) : (

            <div className="space-y-3">

              {comments.slice(0, 8).map(
                (comment: any) => (

                  <div
                    key={comment._id.toString()}
                    className="rounded-2xl border border-gray-800 bg-black p-4"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <p className="font-medium">
                        @{comment.username || "customer"}
                      </p>

                      <p className="text-xs text-gray-600">
                        {comment.commentCreatedAt
                          ? new Date(
                              comment.commentCreatedAt
                            ).toLocaleDateString()
                          : ""}
                      </p>

                    </div>

                    <p className="text-gray-300 mt-2 leading-6">
                      {comment.comment}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ================================= */}
        {/* PATTERNS */}
        {/* ================================= */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <div className="mb-6">

            <p className="text-sm text-purple-400">
              PATTERNS
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              What CustomerDrift is seeing
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Repeated signals from customer conversations
              will appear here.
            </p>

          </div>


          <div className="grid md:grid-cols-2 gap-4">

            <PatternCard
              icon="🔴"
              title="Customer complaints"
              text="Repeated complaints will be identified from customer conversations."
            />

            <PatternCard
              icon="🟠"
              title="Repeated questions"
              text="Questions customers repeatedly ask will be grouped together."
            />

            <PatternCard
              icon="🟡"
              title="Customer requests"
              text="Common requests and things customers want will appear here."
            />

            <PatternCard
              icon="🟢"
              title="Positive signals"
              text="Repeated positive reactions and things customers love will appear here."
            />

          </div>

        </section>


        {/* ================================= */}
        {/* CUSTOMER NEEDS */}
        {/* ================================= */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <p className="text-sm text-purple-400">
            CUSTOMER NEEDS
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            What customers want
          </h2>

          <p className="text-gray-500 mt-2">
            Customer requests will be automatically
            grouped here once enough data is available.
          </p>


          <div className="grid md:grid-cols-2 gap-4 mt-6">

            <NeedCard
              text="Common product requests"
            />

            <NeedCard
              text="Pricing requests"
            />

            <NeedCard
              text="Support problems"
            />

            <NeedCard
              text="Feature requests"
            />

          </div>

        </section>


        {/* ================================= */}
        {/* GUIDE */}
        {/* ================================= */}

        <section className="rounded-3xl border border-purple-500/20 bg-purple-950/10 p-6 mb-8">

          <p className="text-sm text-purple-400">
            GUIDE
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            What you should do next
          </h2>

          <p className="text-gray-500 mt-2">
            CustomerDrift will turn customer
            conversations into practical actions.
          </p>


          <div className="space-y-3 mt-6">

            <GuideItem
              number="01"
              title="Understand the biggest problem"
              text="Identify the issue appearing most frequently in customer conversations."
            />

            <GuideItem
              number="02"
              title="Find the opportunity"
              text="Look for repeated requests, unmet needs and positive signals."
            />

            <GuideItem
              number="03"
              title="Take action"
              text="Turn the strongest customer signal into a business action."
            />

          </div>

        </section>


        {/* ================================= */}
        {/* FOOTER INSTAGRAM STATUS */}
        {/* ================================= */}

        {instagram && (
          <div className="text-center text-sm text-gray-600 pb-4">

            Instagram connected as{" "}

            <span className="text-gray-400">
              @{instagram.instagramUsername}
            </span>

          </div>
        )}

      </div>
    </main>
  );
}


/* ================================= */
/* SUMMARY CARD */
/* ================================= */

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}


/* ================================= */
/* DETAIL CARD */
/* ================================= */

function DetailCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black p-4">

      <p className="text-xs text-gray-600">
        {title}
      </p>

      <p className="text-sm text-gray-300 mt-1 truncate">
        {value}
      </p>

    </div>
  );
}


/* ================================= */
/* PATTERN CARD */
/* ================================= */

function PatternCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black p-5">

      <div className="text-xl mb-3">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-2 leading-6">
        {text}
      </p>

    </div>
  );
}


/* ================================= */
/* NEED CARD */
/* ================================= */

function NeedCard({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black p-5">

      <p className="text-gray-300">
        {text}
      </p>

      <p className="text-xs text-gray-600 mt-2">
        Waiting for enough customer data
      </p>

    </div>
  );
}


/* ================================= */
/* GUIDE ITEM */
/* ================================= */

function GuideItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-800 bg-black p-5">

      <div className="text-purple-400 font-mono">
        {number}
      </div>

      <div>

        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-1 leading-6">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ================================= */
/* EMPTY STATE */
/* ================================= */

function EmptyState({
  text,
  subtext,
}: {
  text: string;
  subtext: string;
}) {
  return (
    <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">

      <p className="text-gray-400">
        {text}
      </p>

      <p className="text-sm text-gray-600 mt-2">
        {subtext}
      </p>

    </div>
  );
}