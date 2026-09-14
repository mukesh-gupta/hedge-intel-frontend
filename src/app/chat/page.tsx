import { backendFetch } from "@/lib/backend";
import type { SignalsResponse } from "@/lib/types";
import ScreenHeader from "@/components/ScreenHeader";
import ChatFeedContent from "@/components/chat/ChatFeedContent";

export default async function ChatPage() {
  let signals: SignalsResponse = { signals: [] };
  try {
    signals = await backendFetch<SignalsResponse>("/api/signals", { revalidateSeconds: 30 });
  } catch {
    // client-side polling will retry
  }

  return (
    <>
      <ScreenHeader title="AI Signal Feed" eyebrow="Categorized by AI, not conversational" />
      <ChatFeedContent initialData={signals} />
    </>
  );
}
