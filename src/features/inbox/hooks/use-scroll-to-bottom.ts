"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseScrollToBottomOptions {
  /** Threshold in pixels to consider "at bottom" */
  threshold?: number;
  /** Delay in ms before scrolling after content changes */
  scrollDelay?: number;
}

interface UseScrollToBottomReturn {
  /** Ref to attach to the scrollable container */
  scrollViewportRef: React.RefObject<HTMLDivElement | null>;
  /** Ref to place at the end of content (scroll target) */
  scrollEndRef: React.RefObject<HTMLDivElement | null>;
  /** Imperatively scroll to bottom */
  scrollToBottom: () => void;
  /** Whether auto-scroll is currently enabled */
  isAutoScrollEnabled: boolean;
}

/**
 * Hook for managing scroll-to-bottom behavior in chat/message interfaces.
 *
 * Features:
 * - Auto-scrolls when new content arrives (if user is at bottom)
 * - Pauses auto-scroll when user scrolls up to read history
 * - Resumes auto-scroll when user scrolls back to bottom
 * - Provides imperative scrollToBottom function
 *
 * @example
 * ```tsx
 * function ChatMessages({ messages }) {
 *   const { scrollViewportRef, scrollEndRef, scrollToBottom } = useScrollToBottom({
 *     contentLength: messages.length,
 *   });
 *
 *   return (
 *     <div ref={scrollViewportRef} className="overflow-y-auto">
 *       {messages.map(msg => <Message key={msg.id} {...msg} />)}
 *       <div ref={scrollEndRef} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollToBottom(
  contentLength: number,
  options: UseScrollToBottomOptions = {}
): UseScrollToBottomReturn {
  const { threshold = 50, scrollDelay = 50 } = options;

  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastContentLengthRef = useRef(contentLength);

  /** Check if the scroll position is at or near the bottom */
  const isAtBottom = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return true;
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold]);

  /** Imperatively scroll to bottom and re-enable auto-scroll */
  const scrollToBottom = useCallback(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShouldAutoScroll(true);
  }, []);

  // Track scroll position to enable/disable auto-scroll
  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      setShouldAutoScroll(isAtBottom());
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [isAtBottom]);

  // Auto-scroll when content length changes (new messages)
  useEffect(() => {
    const contentChanged = contentLength !== lastContentLengthRef.current;
    lastContentLengthRef.current = contentLength;

    if (shouldAutoScroll && contentChanged) {
      const timeoutId = setTimeout(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, scrollDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [contentLength, shouldAutoScroll, scrollDelay]);

  return {
    scrollViewportRef,
    scrollEndRef,
    scrollToBottom,
    isAutoScrollEnabled: shouldAutoScroll,
  };
}
