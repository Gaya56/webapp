import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { uniqBy } from "lodash-es";
import { CornerDownLeft, StopCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import { Menu } from "lucide-react";

import { cn } from "@/lib/shadcn";
import Button from "@/components/Button";
import ChatMessageInput from "@/components/Chat/ChatMessageInput";
import LayoutSwitch from "@/components/Chat/LayoutSwitch";
import { useChat } from "@/hooks/use-chat";
import useAuth from "@/hooks/useAuth";
import {
  layoutAtom,
  isProcessingUploadedFileAtom,
  showPremiumModalAtom,
  uploadedFileAtom,
  twoPanelBotsAtom,
  threePanelBotsAtom,
  fourPanelBotsAtom,
  sixPanelBotsAtom,
  activePromptAtom,
  showSidebarAtom,
  showAuthModalAtom,
  maximizedBotIdAtom,
  chatMessageInputValueAtom,
  individualChatMessageInputValueAtom,
} from "@/config/state";
import ConversationPanel from "@/components/Chat/ConversationPanel";
import PromptsModal from "@/components/PromptsModal";
import { processUploadedFile } from "@/lib/processUploadedFile";
import { activeBotsAtom, ALL_BOTS } from "@/config/chatbots";
import cache from "@/lib/cache";
import MagicActions from "@/components/MagicActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MultiBotChatPanelPage = () => {
  return (
    <Suspense>
      <MultiBotChatPanel />
    </Suspense>
  );
};

const GeneralChatPanel = ({ chats, setBots, supportImageInput }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { hasActiveSubscription, currentUser } = useAuth();
  const currentLayout = useAtomValue(layoutAtom);

  const setIndividualChatMessageInputValue = useSetAtom(
    individualChatMessageInputValueAtom
  );
  const setShowAuthModal = useSetAtom(showAuthModalAtom);
  const setShowSidebar = useSetAtom(showSidebarAtom);
  const generating = useMemo(() => chats.some((c) => c.generating), [chats]);
  const [layout, setLayout] = useAtom(layoutAtom);
  const setPremiumModalOpen = useSetAtom(showPremiumModalAtom);
  const setIsProcessingUploadedFile = useSetAtom(isProcessingUploadedFileAtom);
  const [uploadedFile, setUploadedFile] = useAtom(uploadedFileAtom);
  const setActivePrompt = useSetAtom(activePromptAtom);
  const activeBots = useAtomValue(activeBotsAtom);
  const chatMessageInputValue = useAtomValue(chatMessageInputValueAtom);

  const [showPromptsModal, setShowPromptsModal] = useState(false);

  useEffect(() => {
    if (!setBots) return;

    let newBots = [],
      shouldChangeBots = false,
      addedBotIndex = -1;
    const localActiveBots = cache.get("activeBots") || activeBots;

    for (const chat of chats) {
      if (!chat?.bot || !localActiveBots.some((b) => b.botId === chat?.botId)) {
        addedBotIndex++;
        let newBot = localActiveBots[addedBotIndex]?.botId;

        if (!newBot) {
          newBot = localActiveBots[0].botId;
          addedBotIndex = 0;
        }

        newBots.push(newBot);
        shouldChangeBots = true;
      } else newBots.push(chat.botId);
    }

    if (shouldChangeBots) setBots(newBots);
  }, []);

  const sendSingleMessage = useCallback(
    (input, botId) => {
      if (!hasActiveSubscription) {
        if (!currentUser) return setShowAuthModal(true);

        return setPremiumModalOpen(true);
      }

      const chat = chats.find((c) => c.botId === botId);
      chat?.sendMessage(input);
    },
    [chats]
  );

  const sendAllMessage = useCallback(
    async (input, image) => {
      if (!hasActiveSubscription) {
        if (!currentUser) return setShowAuthModal(true);

        return setPremiumModalOpen(true);
      }

      let fileUrl = null;
      if (uploadedFile?.file && !uploadedFile?.fileUrl) {
        const result = await processUploadedFile(
          uploadedFile.file,
          setIsProcessingUploadedFile
        );
        if (!result) {
          return toast.error(
            "Failed to process uploaded file. Check file size and format."
          );
        }

        setUploadedFile({ ...uploadedFile, fileUrl: result.fileUrl });
        fileUrl = result.fileUrl;
      } else if (uploadedFile?.fileUrl) fileUrl = uploadedFile.fileUrl;

      const activePrompt = JSON.parse(localStorage.getItem("activePrompt"));
      if (!input.trim() && !!activePrompt) {
        input = activePrompt.body;
        setActivePrompt(null);
        localStorage.removeItem("activePrompt");
      }

      uniqBy(chats, (c) => c.botId).forEach((c) =>
        c.sendMessage(input, image, false, fileUrl)
      );
    },
    [
      chats,
      hasActiveSubscription,
      layout,
      setPremiumModalOpen,
      uploadedFile,
      setUploadedFile,
    ]
  );

  const onSwitchBot = useCallback(
    (botId, index) => {
      if (!setBots) return;

      setBots((bots) => {
        const newBots = [...bots];
        newBots[index] = botId;
        return newBots;
      });
    },
    [chats.length, setBots]
  );

  const onLayoutChange = useCallback(
    (v) => {
      setLayout(v);
    },
    [setLayout]
  );

  return (
    <>
      <div className="flex flex-col overflow-hidden h-full mx-3 py-3">
        {isMobile && (
          <div className="flex justify-between md:pl-2 mb-2">
            <Menu
              className="cursor-pointer"
              size={25}
              onClick={() => setShowSidebar(true)}
            />

            <LayoutSwitch layout={layout} onChange={onLayoutChange} />
          </div>
        )}

        <div
          className={cn(
            "grid overflow-hidden grow auto-rows-fr md:ml-2",
            chats.length % 3 === 0
              ? "grid-cols-3"
              : chats.length == 1
              ? "grid-cols-1"
              : isMobile
              ? "grid-cols-1"
              : "grid-cols-2",
            chats.length > 3 ? "gap-2" : "gap-3"
          )}
        >
          {chats.map((chat, index) => (
            <ConversationPanel
              key={`${chat.botId}-${index}`}
              botId={chat.botId}
              bot={chat.bot}
              messages={chat.messages}
              onUserSendMessage={(input) =>
                sendSingleMessage(input, chat.botId)
              }
              generating={chat.generating}
              stopGenerating={chat.stopGenerating}
              mode="compact"
              resetConversation={chat.resetConversation}
              onSwitchBot={
                setBots ? (botId) => onSwitchBot(botId, index) : undefined
              }
              chats={[chat]}
              chatHistoryVisible
              onShowChatHistory={(botId) => navigate(`/chat/${botId}`)}
            />
          ))}
        </div>

        <div className="flex flex-row gap-3 md:ml-2">
          <ChatMessageInput
            mode="full"
            disabled={generating}
            onSubmit={sendAllMessage}
            actionButton={
              !generating ? (
                <>
                  <Button
                    text="Send"
                    color="primary"
                    type="submit"
                    className="rounded-lg !py-2 ml-3 my-[1px] px-4 h-fit text-xs"
                    suffixIcon={
                      <div className="w-7 h-5 bg-white/20 flex justify-center items-center rounded ml-1">
                        <CornerDownLeft size={14} className="text-white" />
                      </div>
                    }
                  />

                  {!isMobile && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            text="Send Individually"
                            color="outline"
                            type="submit"
                            className="rounded-lg !py-[9px] ml-3 my-[1px] px-4 h-fit text-xs"
                          />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                          {chats
                            .filter(
                              (c, index, arr) =>
                                arr.findIndex(
                                  (chat) => chat.botId === c.botId
                                ) === index
                            )
                            .map((chat) => {
                              const bot = ALL_BOTS.find(
                                (b) => b.botId === chat.botId
                              );
                              if (!bot) return null;

                              return (
                                <DropdownMenuItem
                                  key={chat.botId}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setIndividualChatMessageInputValue(
                                      chatMessageInputValue
                                    );
                                    navigate(`/chat/${chat.botId}`);
                                  }}
                                >
                                  <img
                                    src={bot.bot.avatar}
                                    className="w-5 h-5 object-contain rounded-sm mr-2"
                                  />

                                  <p>{bot.bot.name}</p>
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        text="Prompts"
                        type="button"
                        className="rounded-lg !py-[0.45rem] my-[1px] px-3 border border-primary-blue !text-primary-blue ml-3 h-fit text-sm"
                        onClick={() => setShowPromptsModal(true)}
                      />
                    </>
                  )}
                </>
              ) : (
                <Button
                  text="Stop"
                  size={"tiny"}
                  onClick={() => {
                    chats.forEach((chat) => {
                      chat.stopGenerating();
                    });
                  }}
                  className="rounded-lg py-1.5 ml-3 my-[1px] px-3 h-full border border-red-600 !text-red-600"
                  icon={<StopCircle size={16} className="mr-1 text-red-600" />}
                />
              )
            }
            autoFocus={true}
            supportImageInput={supportImageInput}
            chats={chats}
            RightSideComponent={
              !isMobile && (
                <LayoutSwitch layout={layout} onChange={onLayoutChange} />
              )
            }
          />
        </div>

        <PromptsModal
          open={showPromptsModal}
          onClose={() => setShowPromptsModal(false)}
        />
      </div>

      {currentLayout !== "imageInput" && <MagicActions chats={chats} />}
    </>
  );
};

const MaximizedBotChatPanel = () => {
  const maximizedBotId = useAtomValue(maximizedBotIdAtom);
  const [bots, setBots] = useAtom(twoPanelBotsAtom);

  const chat1 = useChat(maximizedBotId);

  const chats = useMemo(() => [chat1], [chat1]);

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const OneBotChatPanel = () => {
  const [bots, setBots] = useAtom(twoPanelBotsAtom);
  const multiPanelBotIds = useMemo(() => bots, [bots]);

  const chat1 = useChat(multiPanelBotIds[0]);

  const chats = useMemo(() => [chat1], [chat1]);

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const TwoBotChatPanel = () => {
  const [bots, setBots] = useAtom(twoPanelBotsAtom);
  const multiPanelBotIds = useMemo(() => bots, [bots]);

  const chat1 = useChat(multiPanelBotIds[0]);
  const chat2 = useChat(multiPanelBotIds[1]);

  const chats = useMemo(() => [chat1, chat2], [chat1, chat2]);

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const ThreeBotChatPanel = () => {
  const [bots, setBots] = useAtom(threePanelBotsAtom);
  const multiPanelBotIds = useMemo(() => bots, [bots]);

  const chat1 = useChat(multiPanelBotIds[0]);
  const chat2 = useChat(multiPanelBotIds[1]);
  const chat3 = useChat(multiPanelBotIds[2]);

  const chats = useMemo(() => [chat1, chat2, chat3], [chat1, chat2, chat3]);

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const FourBotChatPanel = () => {
  const [bots, setBots] = useAtom(fourPanelBotsAtom);
  const multiPanelBotIds = useMemo(() => bots, [bots]);

  const chat1 = useChat(multiPanelBotIds[0]);
  const chat2 = useChat(multiPanelBotIds[1]);
  const chat3 = useChat(multiPanelBotIds[2]);
  const chat4 = useChat(multiPanelBotIds[3]);

  const chats = useMemo(
    () => [chat1, chat2, chat3, chat4],
    [chat1, chat2, chat3, chat4]
  );

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const SixBotChatPanel = () => {
  const [bots, setBots] = useAtom(sixPanelBotsAtom);
  const multiPanelBotIds = useMemo(() => bots, [bots]);

  const chat1 = useChat(multiPanelBotIds[0]);
  const chat2 = useChat(multiPanelBotIds[1]);
  const chat3 = useChat(multiPanelBotIds[2]);
  const chat4 = useChat(multiPanelBotIds[3]);
  const chat5 = useChat(multiPanelBotIds[4]);
  const chat6 = useChat(multiPanelBotIds[5]);

  const chats = useMemo(
    () => [chat1, chat2, chat3, chat4, chat5, chat6],
    [chat1, chat2, chat3, chat4, chat5, chat6]
  );

  return <GeneralChatPanel chats={chats} setBots={setBots} />;
};

const ImageInputPanel = () => {
  const [activeBots, setActiveBots] = useAtom(activeBotsAtom);

  let models = ["chatgptPro", "gemini-2.0-flash", "geminiPro"];
  const baseChats = models.map((model) => useChat(model));

  // check if all three models are in the list of active bots
  const localActiveBots = cache.get("activeBots") || activeBots;
  for (const model of models) {
    if (!localActiveBots.some((b) => b.botId === model)) {
      setActiveBots([...activeBots, ALL_BOTS.find((b) => b.botId === model)]);
    }
  }

  const chats = useMemo(() => [...baseChats], [...baseChats]);

  return <GeneralChatPanel chats={chats} supportImageInput={true} />;
};

const MultiBotChatPanel = () => {
  const [layout, setLayout] = useAtom(layoutAtom);
  const [activeBots, setActiveBots] = useAtom(activeBotsAtom);
  const maximizedBotId = useAtomValue(maximizedBotIdAtom);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const setTwoPanelBots = useSetAtom(twoPanelBotsAtom);

  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (isMobile) setLayout(2);

    let models = searchParams.get("models");
    if (models) {
      models = models.split("_");
      const targetBots = ALL_BOTS.filter((bot) => models.includes(bot.botId));

      if (targetBots.length == models.length) {
        const localActiveBots = cache.get("activeBots") || activeBots;

        let addedBots = targetBots.filter(
          (bot) => !localActiveBots.some((b) => b.botId === bot.botId)
        );
        let newActiveBots = [...localActiveBots, ...addedBots];

        setActiveBots(newActiveBots);
        setLayout(2);
        setTwoPanelBots(targetBots.map((t) => t.botId));
      }

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isMobile]);

  if (maximizedBotId) return <MaximizedBotChatPanel />;

  switch (layout) {
    case 6:
      return <SixBotChatPanel />;
    case 4:
      return <FourBotChatPanel />;
    case 3:
      return <ThreeBotChatPanel />;
    case 2:
      return <TwoBotChatPanel />;
    case 1:
      return <OneBotChatPanel />;
    case "imageInput":
      return <ImageInputPanel />;
  }
};

export default MultiBotChatPanelPage;
