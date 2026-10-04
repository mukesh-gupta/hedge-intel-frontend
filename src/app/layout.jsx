import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import TopTabs from "@/components/TopTabs";
import Sidebar from "@/components/Sidebar";
import DesktopHeader from "@/components/DesktopHeader";
import ThemeInit from "@/components/ThemeInit";
import SplashScreen from "@/components/SplashScreen";
import { backendFetch } from "@/lib/backend";
import { SignalsProvider } from "@/lib/SignalsProvider";
import "./globals.css";

/** @import { Metadata } from "next" */
/** @import { ReactNode } from "react" */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** @type {Metadata} */
export const metadata = {
  title: "Hedge Intelligence Terminal",
  description: "Global macro sentiment & AI-driven trading signal terminal.",
};

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @returns {Promise<T>}
 */
async function safe(fn, fallback) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/** @param {{ children: ReactNode }} props */
export default async function RootLayout({ children }) {
  const [ticker, signals] = await Promise.all([
    safe(() => backendFetch("/api/ticker-bar", { revalidateSeconds: 20 }), { ticker_bar: [] }),
    // Fetched once here and shared app-wide via context — every screen (and
    // the notification bell) reads the same live data instead of each
    // running its own independent poll.
    safe(() => backendFetch("/api/signals", { revalidateSeconds: 20 }), { signals: [] }),
  ]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeInit />
        <SplashScreen />
        <SignalsProvider initialData={signals}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopTabs />
              <DesktopHeader initialTicker={ticker} />
              <main className="mx-auto w-full max-w-md flex-1 border-x border-border bg-background md:max-w-2xl md:border-x-0 lg:max-w-none">
                {children}
              </main>
              <BottomNav />
            </div>
          </div>
        </SignalsProvider>
      </body>
    </html>
  );
}
