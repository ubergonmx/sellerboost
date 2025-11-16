"use client";

import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatMessagesDemo } from "@/components/ui/chat-messages-demo";

interface Hero47Props {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

const Hero47 = ({
  heading = "Your Entire Facebook Sales Process, in One Inbox",
  subheading = "",
  description = "See all messages from all your Facebook Pages in a single, unified view. Reply faster, close more sales, and never lose a customer in the chat chaos again.",
  buttons = {
    primary: {
      text: "Get Started",
      url: "/login",
    },
    secondary: {
      text: "Watch Demo",
      url: "#",
    },
  },
  image = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-7-tall.svg",
    alt: "Placeholder",
  },
}: Hero47Props) => {
  return (
    <section className="bg-background pt-24 pb-20 lg:pt-32 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center text-center gap-10 lg:flex-row lg:items-center lg:text-left lg:gap-20">
          <div className="flex flex-col gap-7 w-full lg:w-1/2 lg:max-w-xl">
            <h2 className="text-foreground text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              {heading}
              {subheading && (
                <span className="text-muted-foreground">{subheading}</span>
              )}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed md:text-lg lg:text-xl">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 lg:justify-start">
              <Button asChild size="lg">
                <a href={buttons.primary?.url}>
                  <span className="whitespace-nowrap pr-2">
                    {buttons.primary?.text}
                  </span>
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              {buttons.secondary && (
                <Button asChild variant="outline" size="lg">
                  <a href={buttons.secondary?.url}>{buttons.secondary?.text}</a>
                </Button>
              )}
            </div>
          </div>
          <ChatMessagesDemo />
        </div>
      </div>
    </section>
  );
};

export { Hero47 };
