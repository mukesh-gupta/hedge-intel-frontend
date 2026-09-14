import { backendFetch } from "@/lib/backend";
import type { SignalsResponse } from "@/lib/types";
import SignalDetailContent from "@/components/signals/SignalDetailContent";

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let signals: SignalsResponse = { signals: [] };
  try {
    signals = await backendFetch<SignalsResponse>("/api/signals", { revalidateSeconds: 30 });
  } catch {
    // client-side polling will retry
  }

  return <SignalDetailContent id={id} initialData={signals} />;
}
