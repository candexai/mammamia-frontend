"use client";

import { Message } from "@/data/mockConversations";
import { MessageBubble } from "./MessageBubble";

interface MessageThreadProps {
  messages: Message[];
  customerColor: string;
  customerAvatar: string;
}

export function MessageThread({
  messages,
  customerColor,
  customerAvatar,
}: MessageThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            customerColor={customerColor}
            customerAvatar={customerAvatar}
          />
        ))}
      </div>

      {/* Status badge */}
      <div className="flex justify-center my-4">
        <div className="bg-secondary border border-border px-3 py-2 rounded-2xl">
          <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
            🤖 mammam-ia is managing this conversation
          </span>
        </div>
      </div>
    </div>
  );
}

