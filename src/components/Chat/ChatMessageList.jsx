import React, { useRef, useEffect, useRef as useReactRef } from "react";

import { cn } from "@/lib/shadcn";
import ChatMessageCard from "./ChatMessageCard";
import Loading from "../Loading";

let hadScrolledUp = false;

const ChatMessageList = ({
  botId,
  messages = {},
  className = "",
  chatLoading,
}) => {
  const divRef = useRef(null);
  const prevMessagesLength = useReactRef(messages.length);

  // Always scroll to bottom if a new message is added (user submits a new message)
  useEffect(() => {
    // Only scroll if a new message was added (not just on every messages change)
    if (
      typeof prevMessagesLength.current === "number" &&
      messages.length > prevMessagesLength.current
    ) {
      // Jump to the end of the scroll immediately
      if (divRef.current) {
        divRef.current.scrollTo({
          top: divRef.current.scrollHeight,
          behavior: "auto",
        });
      }
    } else {
      // Fallback: smooth scroll if not a new message (e.g. initial load)
      scrollToBottom();
    }
    prevMessagesLength.current = messages.length;
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    const container = divRef.current;
    let lastScrollTop = container ? container.scrollTop : 0;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // Check if scrolling up
      if (currentScrollTop < lastScrollTop) {
        onScrollUp(currentScrollTop);
      }

      lastScrollTop = currentScrollTop;
    };

    // Add event listener to the container
    container?.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up
    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    if (!divRef.current) return;

    setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = divRef.current;
      if (scrollHeight - scrollTop - clientHeight <= 450 && !hadScrolledUp) {
        divRef.current.scrollTo({
          top: divRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 200);
  };

  const onScrollUp = () => {
    if (hadScrolledUp) return;
    hadScrolledUp = true;

    setTimeout(() => {
      hadScrolledUp = false;
    }, 1500);
  };

  return (
    <div
      ref={divRef}
      className="h-full border-[1.5px] border-zinc-200 dark:border-zinc-900 rounded-lg overflow-auto scroll-smooth"
    >
      <div className={cn("flex flex-col h-full", className)}>
        {chatLoading && <Loading className="my-20 w-full text-center" />}

        {/* Custom alert */}
        {/* {["o1", "o3"].includes(botId) && !messages.length && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <p className="text-gray-500 text-sm px-8 text-center mb-3">
              {botId === "o1" ? "O1" : "O3"} is an expensive model ($15/M tokens input and $60/M tokens
              output) and therefore each prompt will consume 5 credits.
            </p>
          </div>
        )} */}

        {botId === "gpt-4.5-preview" && !messages.length && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <p className="text-gray-500 text-sm px-8 text-center mb-3">
              GPT-4.5 Preview is a super expensive model ($75/M tokens input and
              $150/M tokens output) and therefore each prompt will consume 25
              credits.
            </p>
          </div>
        )}

        {messages.map((message, idx) => (
          <ChatMessageCard
            index={idx}
            botId={botId}
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatMessageList;
