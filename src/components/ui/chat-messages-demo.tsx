"use client";

import { useState } from "react";
import Chat, { type User } from "@/components/ui/chat";
import type { Message } from "@/components/ui/chat-message";
import IphoneFrame from "@/components/ui/iphone-frame";

export function ChatMessagesDemo() {
  // Define users with their avatars
  const users: User[] = [
    {
      name: "User1",
      avatar:
        "https://res.cloudinary.com/harshitproject/image/upload/v1746774430/member-five.png", // Replace with actual avatar URL
    },
    {
      name: "User2",
      avatar:
        "https://res.cloudinary.com/harshitproject/image/upload/v1746774430/member-four.png", // Replace with actual avatar URL
    },
  ];

  const [messages] = useState<Message[]>([
    {
      id: "m1",
      name: "User1",
      message: "How much is this lipstick?",
      image: "/lipstick.jpg",
      delay: 1000,
    },
    {
      id: "m2",
      name: "User2",
      message: "This costs P300.",
      delay: 1000,
    },
    {
      id: "m3",
      name: "User1",
      message: "I'll buy it",
      delay: 2500,
    },
    {
      id: "m4",
      name: "User2",
      message: "Great! Here's the checkout link: https://sellerboost.com/payment...",
      delay: 1000,
    },
  ]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Clipping Wrapper */}
      <div className="mx-auto overflow-hidden w-[300px] h-[430px] sm:w-[350px] sm:h-[500px] relative">
        <IphoneFrame>
          <Chat
            messages={messages}
            currentUser="User2"
            users={users} // Pass the users array with avatars
          />
        </IphoneFrame>

        <div
          className="
        absolute bottom-0 left-0 right-0
        h-16 sm:h-20
        bg-linear-to-b from-transparent
        to-white dark:to-[#212121]
        pointer-events-none
      "
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
}
