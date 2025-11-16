"use client";

import { type FC, useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ChatMessage, { type Message } from "./chat-message";

export interface User {
  name: string;
  avatar: string;
}

interface ChatProps {
  messages: Message[];
  currentUser: string;
  users: User[];
}

const Chat: FC<ChatProps> = ({ messages, currentUser, users }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (messages.length === 0) return;

    setVisibleMessages([]);
    let cancelled = false;

    (async () => {
      for (const msg of messages) {
        if (cancelled) return; // guard before delay
        await new Promise((r) => setTimeout(r, msg.delay ?? 1700));
        if (cancelled) return; // guard after delay
        setVisibleMessages((prev) => [...prev, msg]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) {
      // Scroll to bottom smoothly when new messages appear
      el.scrollTop = el.scrollHeight;
    }
  }, [visibleMessages]);

  const getUserAvatar = (name: string) =>
    users.find((u) => u.name === name)?.avatar ??
    "/placeholder.svg?height=40&width=40";

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto p-2 bg-white dark:bg-[#212121] flex flex-col py-4 pb-6"
      style={{ scrollBehavior: "smooth" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {visibleMessages.map((message) => (
          <motion.div
            key={message.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className={`flex mb-2 ${
              message.name === currentUser ? "justify-end" : "justify-start"
            } items-end`}
          >
            <ChatMessage
              message={message}
              isCurrentUser={message.name === currentUser}
              avatar={getUserAvatar(message.name)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {visibleMessages.length > 0 &&
        visibleMessages[visibleMessages.length - 1].name === currentUser && (
          <div className="text-xs text-right -mt-4 mr-8 dark:text-white text-gray-500 opacity-0 animate-fade-in">
            Delivered
          </div>
        )}
    </div>
  );
};

export default Chat;
