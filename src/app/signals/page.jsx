import ScreenHeader from "@/components/ScreenHeader";
import SignalsFeedList from "@/components/signals/SignalsFeedList";

/** @param {{ searchParams: Promise<{ q?: string }>; }} props */
export default async function SignalsPage({ searchParams }) {
  const { q } = await searchParams;

  return (
    <>
      <ScreenHeader title="Live Signal Feed" eyebrow="Signals" />
      <SignalsFeedList initialQuery={q ?? ""} />
    </>
  );
}
