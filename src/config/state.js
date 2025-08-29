import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { v4 as uuidV4 } from "uuid";

import { createBotInstance } from "@/bots";
import { ALL_BOTS } from "./chatbots";
import cache from "@/lib/cache";

// Utility function to get or create bot instance
export async function getBotInstance(chatAtom, setChat, selectedTools = []) {
  const chat = chatAtom;
  if (!chat.bot) {
    const bot = await createBotInstance(chat.botId, selectedTools);
    setChat(draft => {
      draft.bot = bot;
    });
    return bot;
  }
  
  // Update tools if they've changed
  if (chat.bot.setSelectedTools && selectedTools) {
    chat.bot.setSelectedTools(selectedTools);
  }
  
  return chat.bot;
}

export const chatFamily = atomFamily(
  ({ botId }) => {
    return atomWithImmer({
      botId,
      bot: null, // Will be created lazily
      messages: [],
      generatingMessageId: "",
      abortController: undefined,
      conversationId: uuidV4(),
    });
  },
  (a, b) => a.botId === b.botId && a.page === b.page
);

export const layoutAtom = atomWithStorage("multiPanelLayout", 4, undefined, {
  getOnInit: true,
});
export const themeAtom = atomWithStorage("theme", "dark");

export const sidebarCollapsedAtom = atomWithStorage(
  "sidebarCollapsed",
  false,
  undefined,
  { getOnInit: true }
);
export const showPremiumModalAtom = atom(false);
export const showFreeTrialModalAtom = atom(false);
export const currentUserAtom = atomWithStorage("currentUser", null);
export const showOverlayLoadingAtom = atom(false);
export const chatsAtom = atom([]);
export const speakingTextAtom = atom("");
export const chatMessageInputValueAtom = atom("");
export const individualChatMessageInputValueAtom = atom("");
export const activePromptAtom = atomWithStorage("activePrompt", null);
export const showDownloadExtensionModalAtom = atom(false);
export const showSidebarAtom = atom(false);
export const showAuthModalAtom = atom(false);
export const showInstallAppSheetAtom = atom(false);
export const installPromptAtom = atom(null);
export const shouldSaveChatsAtom = atomWithStorage("shouldSaveChats", true);
export const uploadedFileAtom = atom(null);
export const isProcessingUploadedFileAtom = atom(false);
export const showSupportModalAtom = atom(false);
export const maximizedBotIdAtom = atom(null);
export const selectedMagicActionBotIdAtom = atomWithStorage("selectedMagicActionBotId", "chatgptPro");

// this values is used in MultiBotChatPanel.jsx
const localActiveBots = cache.get("activeBots") || ALL_BOTS.filter((b) => b.active).map((b) => b.botId).slice(0, 6);
export const twoPanelBotsAtom = atomWithStorage("multiPanelBots:2", localActiveBots.slice(0, 2).map(b => b.botId));
export const threePanelBotsAtom = atomWithStorage("multiPanelBots:3", localActiveBots.slice(0, 3).map(b => b.botId));
export const fourPanelBotsAtom = atomWithStorage("multiPanelBots:4", localActiveBots.slice(0, 4).map(b => b.botId));
export const sixPanelBotsAtom = atomWithStorage("multiPanelBots:6", localActiveBots.slice(0, 6).map(b => b.botId));
export const showPricingModalAtom = atom(false);