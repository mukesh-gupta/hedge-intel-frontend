import SignalDetailContent from "@/components/signals/SignalDetailContent";

/** @param {{ params: Promise<{ id: string }>; }} props */
export default async function SignalDetailPage({ params }) {
  const { id } = await params;

  return <SignalDetailContent id={id} />;
}
