"use client";

import { motion } from "motion/react";
import type { FC } from "react";
import Image from "next/image";

export interface Message {
  id: string;
  name: string;
  message: string;
  timestamp?: string;
  image?: string;
  delay?: number;
}

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  avatar: string;
}

// Helper function to format message text with styled URLs
const formatMessage = (text: string) => {
  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    // Check if part matches URL pattern
    if (part.match(/^https?:\/\//)) {
      return (
        <span
          key={index}
          className="underline cursor-pointer"
          style={{ wordBreak: "break-all" }}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const ChatMessage: FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  avatar,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={`flex mb-2 ${
        isCurrentUser ? "justify-end" : "justify-start"
      } items-end`}
    >
      {!isCurrentUser && (
        <div className="shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={`${message.name}'s avatar`}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div
        className={`w-fit max-w-[190px] px-2 py-1 rounded-2xl ${
          isCurrentUser
            ? "bg-blue-500 text-white rounded-br-none text-right"
            : "bg-gray-200 text-black rounded-bl-none text-left"
        }`}
      >
        {message.image && (
          <div className="my-1 rounded-lg overflow-hidden max-w-[190px]">
            <Image
              src={message.image}
              alt="Attachment"
              width={190}
              height={190}
              className="object-cover w-full h-auto"
            />
          </div>
        )}
        {message.message && (
          <p className="text-sm sm:text-base whitespace-pre-wrap">
            {formatMessage(message.message)}
          </p>
        )}
        {message.timestamp && (
          <p
            className={`text-xs mt-1 ${
              isCurrentUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {message.timestamp}
          </p>
        )}
      </div>

      {isCurrentUser && <div className="w-8 "></div>}
    </motion.div>
  );
};

export default ChatMessage;
