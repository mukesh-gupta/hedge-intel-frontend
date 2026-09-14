import { backendFetch } from "@/lib/backend";
import type { SignalsResponse } from "@/lib/types";
import ScreenHeader from "@/components/ScreenHeader";
import HistoricalLogs from "@/components/logs/HistoricalLogs";

export default async function LogsPage() {
  let signals: SignalsResponse = { signals: [] };
  try {
    signals = await backendFetch<SignalsResponse>("/api/signals", { revalidateSeconds: 30 });
  } catch {
    // client-side polling will retry
  }

  return (
    <>
      <ScreenHeader title="Historical Logs" back="/more" />
      <HistoricalLogs initialData={signals} />
    </>
  );
}
