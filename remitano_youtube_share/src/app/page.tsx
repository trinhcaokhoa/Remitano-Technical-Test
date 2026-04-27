import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Headbar from "~/app/_components/Headbar";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <Headbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#020617] text-white">
        <div className="container flex flex-col items-center justify-center gap-10 px-4 py-16">
          {/* Title */}
          <h1 className="text-center text-5xl font-extrabold tracking-tight">
            🎥 YouTube Sharing App
          </h1>

          {/* Auth Section */}
          <div className="flex flex-col items-center gap-4">
            {session ? (
              <>
                <p className="text-xl">
                  Welcome,{" "}
                  <span className="font-bold">{session.user?.name}</span>
                </p>

                <div className="flex gap-4">
                  <Link
                    href="/videos"
                    className="rounded-full bg-green-500 px-6 py-2 font-semibold hover:bg-green-600"
                  >
                    Go to Feed
                  </Link>

                  <Link
                    href="/api/auth/signout"
                    className="rounded-full bg-red-500 px-6 py-2 font-semibold hover:bg-red-600"
                  >
                    Logout
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-xl">Please sign in to share videos</p>

                <Link
                  href="/api/auth/signin"
                  className="rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-gray-200"
                >
                  Sign in with Google
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
