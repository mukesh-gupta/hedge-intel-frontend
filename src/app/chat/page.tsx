import ScreenHeader from "@/components/ScreenHeader";
import ChatFeedContent from "@/components/chat/ChatFeedContent";

export default function ChatPage() {
  return (
    <>
      <ScreenHeader title="AI Signal Feed" eyebrow="Categorized by AI, not conversational" />
      <ChatFeedContent />
    </>
  );
}
