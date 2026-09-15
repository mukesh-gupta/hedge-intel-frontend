import ScreenHeader from "@/components/ScreenHeader";
import HistoricalLogs from "@/components/logs/HistoricalLogs";

export default function LogsPage() {
  return (
    <>
      <ScreenHeader title="Historical Logs" back="/more" />
      <HistoricalLogs />
    </>
  );
}
