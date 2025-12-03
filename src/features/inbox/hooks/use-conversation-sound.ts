"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { conversationCollection } from "@/features/inbox/collections";

/**
 * Hook that plays a sound when a new incoming message arrives via Electric SQL sync.
 * Only plays for incoming messages synced from remote sources, not for local mutations.
 * Uses TanStack DB's subscribeChanges to detect real-time updates.
 */
export function useConversationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialLoadCompleteRef = useRef(false);
  const seenConversationsRef = useRef<
    Map<number, { last_message_at: string; last_message_direction: string | null }>
  >(new Map());
  const audioUnlockedRef = useRef(false);

  // Initialize audio element on mount
  useEffect(() => {
    audioRef.current = new Audio("/new-message.mp3");
    audioRef.current.volume = 0.5;

    // iOS requires user interaction to unlock audio playback
    const unlockAudio = () => {
      if (audioUnlockedRef.current || !audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          audioUnlockedRef.current = true;
        })
        .catch(() => {
          // Ignore errors - will retry on next interaction
        });
    };

    // TODO: Use AbortController so that in return we can call abort() to cleanup the event listeners.
    document.addEventListener("touchstart", unlockAudio, { once: true });
    document.addEventListener("click", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Subscribe to collection changes to detect synced updates
  useEffect(() => {
    // Mark initial load as complete after a delay to allow all initial data to sync
    const initialLoadTimer = setTimeout(() => {
      initialLoadCompleteRef.current = true;
    }, 2000); // 2 second grace period for initial sync

    // Subscribe to changes in the collection
    // subscribeChanges returns a CollectionSubscription object or function
    const subscription = conversationCollection.subscribeChanges((changes) => {
      for (const change of changes) {
        // Handle both insert and update changes
        if (change.type === "insert" || change.type === "update") {
          const conversationId = Number(change.key);
          const newData = change.type === "insert" ? change.value : change.value;

          // Skip if initial load isn't complete yet (prevents sound on page load/refresh)
          if (!initialLoadCompleteRef.current) {
            // Still track the conversation state for later comparison
            if (newData) {
              seenConversationsRef.current.set(conversationId, {
                last_message_at: String(newData.last_message_at),
                last_message_direction: newData.last_message_direction,
              });
            }
            continue;
          }

          const prevState = seenConversationsRef.current.get(conversationId);

          // For inserts: new conversation with incoming message
          if (change.type === "insert" && newData) {
            if (newData.last_message_direction === "incoming") {
              notifyNewMessage(newData.user_name, newData.last_message_text);
            }
            seenConversationsRef.current.set(conversationId, {
              last_message_at: String(newData.last_message_at),
              last_message_direction: newData.last_message_direction,
            });
            continue;
          }

          // For updates: check if last_message_at changed and direction is incoming
          if (change.type === "update" && newData && prevState) {
            const prevTime = new Date(prevState.last_message_at).getTime();
            const newTime = new Date(String(newData.last_message_at)).getTime();

            if (
              newTime > prevTime &&
              newData.last_message_direction === "incoming"
            ) {
              notifyNewMessage(newData.user_name, newData.last_message_text);
            }

            seenConversationsRef.current.set(conversationId, {
              last_message_at: String(newData.last_message_at),
              last_message_direction: newData.last_message_direction,
            });
          } else if (change.type === "update" && newData && !prevState) {
            // First time seeing this conversation after initial load
            seenConversationsRef.current.set(conversationId, {
              last_message_at: String(newData.last_message_at),
              last_message_direction: newData.last_message_direction,
            });
          }
        }
      }
    });

    function notifyNewMessage(userName: string | null, messageText: string | null) {
      // Play sound
      audioRef.current?.play().catch((error) => {
        console.log("Could not play notification sound:", error);
      });

      // Show toast notification
      toast.info("New message", {
        description: `${userName || "Someone"}: ${messageText?.slice(0, 50) || "Sent a message"}${(messageText?.length || 0) > 50 ? "..." : ""}`,
        duration: 5000,
      });
    }

    return () => {
      clearTimeout(initialLoadTimer);
      // CollectionSubscription has an unsubscribe() method
      subscription?.unsubscribe();
    };
  }, []);
}
