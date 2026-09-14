import { backendFetch } from "@/lib/backend";
import type { SignalsResponse } from "@/lib/types";
import ScreenHeader from "@/components/ScreenHeader";
import SignalsFeedList from "@/components/signals/SignalsFeedList";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let signals: SignalsResponse = { signals: [] };
  try {
    signals = await backendFetch<SignalsResponse>("/api/signals", { revalidateSeconds: 30 });
  } catch {
    // client-side polling will retry and surface data once reachable
  }

  return (
    <>
      <ScreenHeader title="Live Signal Feed" eyebrow="Signals" />
      <SignalsFeedList initialData={signals} initialQuery={q ?? ""} />
    </>
  );
}
