/**
 * MessageList - Renders the list of chat messages
 */

import type { ChatMessage } from "~/lib/chat.types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
