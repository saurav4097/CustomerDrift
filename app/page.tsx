import { cookies } from "next/headers";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const isLoggedIn = token ? !!verifyToken(token) : false;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold">
              C
            </div>
            <span className="text-xl font-bold">CustomerDrift</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-medium hover:scale-105 transition"
            >
              Dashboard
            </Link>

            {isLoggedIn && (
              <form action="/api/logout" method="POST">
                <button className="px-5 py-2.5 rounded-xl border border-gray-700 hover:border-red-500 transition">
                  Logout
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 mb-8">
            AI Competitor Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Turn competitor complaints into
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              new customers
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            CustomerDrift helps brands discover unhappy customers of competitors,
            identify switching opportunities, and generate personalized outreach with AI.
          </p>

          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-semibold text-lg hover:scale-105 transition"
            >
              Open Dashboard
            </Link>

            <a
              href="#features"
              className="px-8 py-4 rounded-2xl border border-gray-700 font-semibold text-lg hover:border-purple-500 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="mt-24 rounded-3xl border border-gray-800 bg-gray-950 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Live Opportunity Feed</h2>
              <p className="text-gray-400 mt-1">
                Discover high-intent customers from competitor reviews
              </p>
            </div>

            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
              24 new today
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-800 bg-black p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Pricing complaint</span>
                <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                  High
                </span>
              </div>
              <p className="font-medium">
                “Too expensive for a small team.”
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-black p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Support issue</span>
                <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs">
                  Warm
                </span>
              </div>
              <p className="font-medium">
                “Support never replied to my ticket.”
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-black p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Switch signal</span>
                <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                  Hot
                </span>
              </div>
              <p className="font-medium">
                “Looking for a better alternative.”
              </p>
            </div>
          </div>
        </div>

        <section id="features" className="mt-24 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold">Track competitors</h3>
            <p className="mt-3 text-gray-400">
              Monitor public reviews from selected competitors and brands in one dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold">AI analysis</h3>
            <p className="mt-3 text-gray-400">
              Detect negative sentiment, pricing complaints, support issues, and switching intent.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-950 p-8">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold">Act faster</h3>
            <p className="mt-3 text-gray-400">
              Generate personalized responses and capture opportunities before competitors do.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}