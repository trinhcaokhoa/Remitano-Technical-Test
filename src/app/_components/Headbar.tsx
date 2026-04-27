"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Headbar() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isLoggedIn = !!session?.user;

  return (
    <header className="w-full border-b border-gray-800 bg-gray-950 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          🎥 VideoShare
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isLoading && <p className="text-sm text-gray-400">...</p>}

          {!isLoading && !isLoggedIn && (
            <button
              onClick={() => signIn("google")}
              className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
            >
              Login
            </button>
          )}

          {!isLoading && isLoggedIn && (
            <>
              <span className="text-sm text-gray-300">
                {session.user.name ?? session.user.email}
              </span>

              <button
                onClick={() => signOut()}
                className="rounded bg-red-500 px-4 py-2 hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
