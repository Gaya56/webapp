import { useCallback, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { v4 as uuidV4 } from "uuid";

import {
  activePromptAtom,
  chatFamily,
  chatsAtom,
  currentUserAtom,
  showPremiumModalAtom,
  uploadedFileAtom,
  getBotInstance,
} from "@/config/state";
import { selectedToolsAtom } from "@/config/tools";
import { compressImageFile } from "@/lib/image-compression";
import increaseUsage from "@/lib/increaseUsage";
import { AbstractBot } from "@/bots/abstract-bot";
import cache from "@/lib/cache";

const abstractBot = new AbstractBot();

export function useChat(botId) {
  const chatAtom = useMemo(
    () => chatFamily({ botId, page: "singleton" }),
    [botId]
  );
  const [chatState, setChatState] = useAtom(chatAtom);
  const [, setChats] = useAtom(chatsAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setActivePrompt = useSetAtom(activePromptAtom);
  const uploadedFile = useAtomValue(uploadedFileAtom);
  const setShowPremiumModal = useSetAtom(showPremiumModalAtom);
  const selectedTools = useAtomValue(selectedToolsAtom);

  const updateMessage = useCallback(
    (messageId, updater) => {
      setChatState((draft) => {
        const message = draft.messages.find((m) => m.id === messageId);
        if (message) {
          updater(message);
        }
      });
    },
    [setChatState]
  );

  const sendMessage = useCallback(
    async (input, image, isRegenerate, fileUrl) => {
      const botMessageId = uuidV4();
      setChatState((draft) => {
        draft.messages.push(
          { id: uuidV4(), text: input, image, author: "user" },
          { id: botMessageId, text: "", author: botId }
        );
      });

      const abortController = new AbortController();
      setChatState((draft) => {
        draft.generatingMessageId = botMessageId;
        draft.abortController = abortController;
      });

      let compressedImage = undefined;
      if (image) compressedImage = await compressImageFile(image);

      // Ensure bot instance is created
      const bot = await getBotInstance(chatState, setChatState, selectedTools);

      const resp = await bot.sendMessage({
        prompt: input,
        image: compressedImage,
        signal: abortController.signal,
        isRegenerate,
        fileUrl,
        botId,
      });

      try {
        let chatId = "",
          allText = "";

        for await (const answer of resp) {
          allText += answer.text;

          if (
            answer.text ==
            "You have exceed your query limit. To continue using Combochat AI, start or upgrade your subscription."
          ) {
            // let currentUser = cache.get("currentUser");

            // if (currentUser?.subscription?.name == "free") {
            //   setShowFreeTrialModal(true);
            // } else {
            //   setShowPremiumModal(true);
            // }
            setShowPremiumModal(true);
          }

          updateMessage(botMessageId, (message) => {
            if (answer.text.endsWith("</s>"))
              answer.text = answer.text.slice(0, -4);

            if (abstractBot.hasChatId(answer.text)) {
              chatId = abstractBot.extractChatId(answer.text);
              answer.text = abstractBot.removeChatId(answer.text);
            }

            message.text = answer.text;
          });
        }

        if (abstractBot.hasChatId(allText)) {
          chatId = abstractBot.extractChatId(allText);
        }

        const shouldSaveChats = localStorage.getItem("shouldSaveChats");
        if (shouldSaveChats == "true" || shouldSaveChats == null) {
          setChats((chats) => {
            if (chatId && !chats.find((chat) => chat.id === chatId)) {
              chats.unshift({
                id: chatId,
                title: input,
                createdAt: new Date(),
                selected: true,
              });
            }

            return chats;
          });
        }

        increaseUsage(
          "pro",
          setCurrentUser,
          botId == "o1" ? 5 : botId == "gpt-4.5-preview" ? 25 : 1,
          botId
        );

        setActivePrompt(null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          abortController.abort();
        }

        const error = err;
        console.error("sendMessage error", error.code, error);
        updateMessage(botMessageId, (message) => {
          message.error = error;
        });

        setChatState((draft) => {
          draft.abortController = undefined;
          draft.generatingMessageId = "";
        });
      }

      setChatState((draft) => {
        draft.abortController = undefined;
        draft.generatingMessageId = "";
      });
    },
    [botId, chatState.bot, setChatState, updateMessage, uploadedFile, selectedTools]
  );

  const resetConversation = useCallback(
    async (onlyMessage) => {
      const bot = await getBotInstance(chatState, setChatState, selectedTools);
      bot.resetConversation(onlyMessage);

      setChatState((draft) => {
        draft.abortController = undefined;
        draft.generatingMessageId = "";
        draft.messages = [];
      });
    },
    [chatState, setChatState, selectedTools]
  );

  const removeConversationMessage = useCallback(
    async (msgIndex) => {
      const bot = await getBotInstance(chatState, setChatState, selectedTools);
      bot.removeConversationMessage(msgIndex);

      setChatState((draft) => {
        draft.abortController = undefined;
        draft.generatingMessageId = "";
        draft.messages = draft.messages.splice(0, msgIndex);
      });
    },
    [chatState, setChatState, selectedTools]
  );

  const removeConversationMessages = useCallback(
    async (fromIndex) => {
      const bot = await getBotInstance(chatState, setChatState, selectedTools);
      bot.removeConversationMessages(fromIndex);

      setChatState((draft) => {
        draft.abortController = undefined;
        draft.generatingMessageId = "";
        draft.messages.splice(fromIndex);
      });
    },
    [chatState, setChatState, selectedTools]
  );

  const stopGenerating = useCallback(() => {
    chatState.abortController?.abort();
    if (chatState.generatingMessageId) {
      updateMessage(chatState.generatingMessageId, (message) => {
        if (!message.text && !message.error) {
          message.text = "Cancelled";
        }
      });
    }
    setChatState((draft) => {
      draft.generatingMessageId = "";
    });
  }, [
    chatState.abortController,
    chatState.generatingMessageId,
    setChatState,
    updateMessage,
  ]);

  const getBot = useCallback(async () => {
    return await getBotInstance(chatState, setChatState, selectedTools);
  }, [chatState, setChatState, selectedTools]);

  const chat = useMemo(
    () => ({
      botId,
      bot: chatState.bot,
      getBot,
      messages: chatState.messages,
      sendMessage,
      resetConversation,
      generating: !!chatState.generatingMessageId,
      stopGenerating,
      removeConversationMessage,
      removeConversationMessages,
      setChatState,
      chatState,
    }),
    [
      botId,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      getBot,
      resetConversation,
      sendMessage,
      stopGenerating,
      removeConversationMessage,
      setChatState,
      chatState,
    ]
  );

  return chat;
}
