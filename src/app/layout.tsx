import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "~/app/_utils/provider";
import NotificationBanner from "~/app/_components/NotificationBanner";

export const metadata: Metadata = {
  title: "REMITANO YOUTUBE SHARE",
  description: "AN APP TO SHARE YOUTUBE VIDEOS WITH YOUR FRIENDS",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`font-sans ${geist.variable}`}
      >
        <TRPCReactProvider>
          <Providers>
            <main>
              <NotificationBanner />
              {children}
            </main>
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
