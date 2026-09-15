import SignalDetailContent from "@/components/signals/SignalDetailContent";

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SignalDetailContent id={id} />;
}
