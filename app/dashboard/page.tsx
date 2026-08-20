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
  })
    .lean();

  const instagram =
    await InstagramSetup.findOne({
      userId: payload.username,
    }).lean();

  const comments =
    await InstagramComment.find({
      userId: payload.username,
    })
      .sort({ commentCreatedAt: -1 })
      .limit(20)
      .lean();

  const commentCount =
    await InstagramComment.countDocuments({
      userId: payload.username,
    });

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm text-gray-500">
              CustomerDrift
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Customer Intelligence
            </h1>

            <p className="text-gray-400 mt-2">
              See what your customers are saying,
              what patterns are appearing and what
              you should do next.
            </p>
          </div>

          <div className="flex gap-3">

            {instagram ? (
              <form
                action="/api/instagram/sync"
                method="POST"
              >
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition"
                >
                  Sync Instagram
                </button>
              </form>
            ) : (
              <a
                href="/api/instagram/connect"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-medium"
              >
                Connect Instagram
              </a>
            )}

            <form
              action="/api/logout"
              method="POST"
            >
              <button
                className="px-5 py-2.5 rounded-xl border border-gray-800 text-gray-300 hover:border-gray-600"
              >
                Logout
              </button>
            </form>

          </div>

        </div>


        {/* SMALL SUMMARY */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

          <SummaryCard
            title="Competitors"
            value={competitors.length}
          />

          <SummaryCard
            title="Comments analyzed"
            value={commentCount}
          />

          <SummaryCard
            title="Instagram"
            value={instagram ? "Connected" : "Not connected"}
          />

        </div>


        {/* CUSTOMER VOICE */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <div className="mb-6">

            <p className="text-sm text-purple-400">
              CUSTOMER VOICE
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              What people are saying
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Recent conversations collected from
              Instagram.
            </p>

          </div>


          {comments.length === 0 ? (

            <EmptyState
              text="No customer comments collected yet."
              subtext="Connect Instagram and sync your account to start collecting customer conversations."
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

                    <p className="text-gray-300 mt-2">
                      {comment.comment}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* PATTERNS */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <div className="mb-6">

            <p className="text-sm text-purple-400">
              PATTERNS
            </p>

            <h2 className="text-2xl font-semibold mt-1">
              What CustomerDrift is seeing
            </h2>

          </div>


          <div className="grid md:grid-cols-2 gap-4">

            <PatternCard
              icon="🔴"
              title="Customer complaints"
              text="Once comment analysis is enabled, repeated complaints will appear here."
            />

            <PatternCard
              icon="🟠"
              title="Repeated questions"
              text="Questions customers keep asking will be grouped into patterns."
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


        {/* WHAT CUSTOMERS WANT */}

        <section className="rounded-3xl border border-gray-800 bg-gray-950 p-6 mb-6">

          <p className="text-sm text-purple-400">
            CUSTOMER NEEDS
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            What customers want
          </h2>

          <p className="text-gray-500 mt-2">
            Customer requests will be automatically
            grouped here.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-6">

            <NeedCard text="Common product requests" />

            <NeedCard text="Pricing requests" />

            <NeedCard text="Support problems" />

            <NeedCard text="Feature requests" />

          </div>

        </section>


        {/* GUIDE */}

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


        {/* INSTAGRAM STATUS */}

        {instagram && (
          <div className="text-center text-sm text-gray-600">
            Connected to Instagram as
            {" "}
            @{instagram.instagramUsername}
          </div>
        )}

      </div>
    </main>
  );
}


/* COMPONENTS */


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

        <p className="text-sm text-gray-500 mt-1">
          {text}
        </p>

      </div>

    </div>
  );
}


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