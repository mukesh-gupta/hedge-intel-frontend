import ScreenHeader from "@/components/ScreenHeader";
import SignalsFeedList from "@/components/signals/SignalsFeedList";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <>
      <ScreenHeader title="Live Signal Feed" eyebrow="Signals" />
      <SignalsFeedList initialQuery={q ?? ""} />
    </>
  );
}
