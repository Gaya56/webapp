import { motion } from "framer-motion";
import { useCallback, useMemo, useState, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  CornerDownLeft,
  MaximizeIcon,
  Menu,
  MinimizeIcon,
  MoreVertical,
  StopCircle,
} from "lucide-react";
import OutsideClickHandler from "react-outside-click-handler";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";

import apiClient from "@/lib/apiClient";
import clearIcon from "@/assets/svg/clear.svg";
import historyIcon from "@/assets/svg/history.svg";
import { cn } from "@/lib/shadcn";
import { activeBotsAtom } from "@/config/chatbots";
import { ConversationContext } from "@/config/conversationContext";
import Button from "../Button";
import ChatMessageInput from "./ChatMessageInput";
import ChatMessageList from "./ChatMessageList";
import ChatbotName from "./ChatbotName";
import WebAccessCheckbox from "./WebAccessCheckbox";
import { ToolSelector } from "./ToolSelector";
import {
  activePromptAtom,
  fourPanelBotsAtom,
  isProcessingUploadedFileAtom,
  maximizedBotIdAtom,
  showAuthModalAtom,
  showOverlayLoadingAtom,
  showPremiumModalAtom,
  showSidebarAtom,
  sixPanelBotsAtom,
  threePanelBotsAtom,
  twoPanelBotsAtom,
  uploadedFileAtom,
} from "@/config/state";
import useAuth from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import PromptsModal from "@/components/PromptsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { processUploadedFile } from "@/lib/processUploadedFile";
import { Eye } from "lucide-react";
import { CustomTooltip } from "../ui/tooltip";

const ConversationPanel = (props) => {
  const {
    isSingle,
    botId,
    bot,
    messages,
    onUserSendMessage = () => {},
    resetConversation: propResetConversation = () => {},
    generating = false,
    stopGenerating = () => {},
    mode = "full",
    onSwitchBot = () => {},
    chats = [],
    chatLoading,
    className = "",
    chatHistoryVisible,
    onShowChatHistory = () => {},
  } = props;
  const marginClass = "";
  const fileUrl = chats.length == 1 ? chats[0]?.chatState?.fileUrl : null;

  const popoverRef = useRef(null);

  const { currentUser, hasActiveSubscription } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [activeBots, setActiveBots] = useAtom(activeBotsAtom);
  const setOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const setPremiumModalOpen = useSetAtom(showPremiumModalAtom);
  const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);
  const setShowAuthModal = useSetAtom(showAuthModalAtom);
  const setIsProcessingUploadedFile = useSetAtom(isProcessingUploadedFileAtom);
  const [uploadedFile, setUploadedFile] = useAtom(uploadedFileAtom);
  const setActivePrompt = useSetAtom(activePromptAtom);
  const [maximizedBotId, setMaximizedBotId] = useAtom(maximizedBotIdAtom);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [showPopover, setShowPopover] = useState({
    display: false,
    visible: false,
  });
  const [isHovered, setIsHovered] = useState(false);

  const context = useMemo(() => {
    return {
      reset: propResetConversation,
    };
  }, [propResetConversation]);

  const onSubmit = useCallback(
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

      onUserSendMessage(input, image, false, fileUrl);
    },
    [props]
  );

  const resetConversation = useCallback(
    async (onlyMessage) => {
      if (!generating) {
        if (bot?.messages?.length) {
          setOverlayLoading(true);

          await apiClient.post(
            `/chat-history/chats/${bot.currentChatId}/clear`
          );

          setOverlayLoading(false);
        }

        propResetConversation(onlyMessage);
      }
    },
    [props]
  );

  const botInfo = activeBots.find((b) => b.botId == botId)?.bot;
  if (!botInfo) return null;

  let inputActionButton = null;
  if (generating) {
    inputActionButton = (
      <Button
        text="Stop"
        size={mode === "full" ? "normal" : "tiny"}
        onClick={stopGenerating}
        className="rounded-lg py-1.5 ml-3 my-[1px] px-3 h-full border border-red-600 !text-red-600"
        icon={<StopCircle size={16} className="mr-1 text-red-600" />}
      />
    );
  } else if (mode === "full") {
    inputActionButton = (
      <div className="flex flex-row items-center gap-[10px] shrink-0">
        <Button
          text="Send"
          color="primary"
          type="submit"
          className="rounded-lg py-2.5 ml-3 my-[1px] px-4 h-full text-xs"
          suffixIcon={
            <div className="w-6 h-4 bg-white/20 flex justify-center items-center rounded ml-1">
              <CornerDownLeft size={14} className="text-white" />
            </div>
          }
        />

        {!isMobile && (
          <Button
            text="Prompts"
            type="button"
            className="rounded-lg py-1.5 my-[1px] px-3 h-full border border-primary-blue !text-primary-blue"
            onClick={() => setShowPromptsModal(true)}
          />
        )}
      </div>
    );
  }

  return (
    <ConversationContext.Provider value={context}>
      <div
        className={cn("flex flex-col overflow-hidden h-full w-full", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "flex flex-row items-center gap-2 pb-1 mb-1",
            marginClass
          )}
        >
          {isMobile ? (
            <>
              {mode === "full" && (
                <Menu
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setShowSidebar(!showSidebar)}
                />
              )}

              <div className="flex flex-row items-center bg-background border border-zinc-200 dark:border-zinc-900 pl-2 pr-1 py-1.5 rounded-lg">
                <motion.img
                  src={botInfo.avatar}
                  className="w-[16px] h-[16px] object-contain rounded-sm mr-2"
                  whileHover={{ rotate: 180 }}
                />

                <ChatbotName
                  botId={botId}
                  name={botInfo.name}
                  fullName={bot?.name || botInfo.name}
                  onSwitchBot={mode === "compact" ? onSwitchBot : undefined}
                />
              </div>

              <WebAccessCheckbox botId={botId} />
              <ToolSelector className="hidden sm:flex" />

              <div className="relative ml-auto" ref={popoverRef}>
                <MoreVertical
                  className="w-5 h-5 cursor-pointer"
                  onClick={() =>
                    setShowPopover({ display: true, visible: true })
                  }
                />

                {showPopover.display && (
                  <OutsideClickHandler
                    onOutsideClick={() =>
                      setShowPopover({ ...showPopover, visible: false })
                    }
                  >
                    <motion.div
                      className="absolute right-2 top-full mt-2 w-32 bg-white shadow border border-gray-200 rounded-md overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: showPopover.visible ? 1 : 0,
                        y: showPopover.visible ? 0 : -10,
                      }}
                      transition={{ duration: 0.2 }}
                      onAnimationComplete={() => {
                        if (!showPopover.visible) {
                          setShowPopover({ ...showPopover, display: false });
                        }
                      }}
                    >
                      {(mode == "compact" || !chatHistoryVisible) && (
                        <div
                          className="flex items-center gap-1 cursor-pointer text-sm p-2 hover:bg-gray-100"
                          onClick={() => {
                            onShowChatHistory(botId);
                            setShowPopover({ display: true, visible: false });
                          }}
                        >
                          <img src={historyIcon} className="w-5 h-5 mr-2" />
                          History
                        </div>
                      )}
                      <div
                        className="flex items-center gap-1 cursor-pointer text-sm p-2 hover:bg-gray-100"
                        onClick={() => {
                          setShowClearAlert(true);
                          setShowPopover({ display: true, visible: false });
                        }}
                      >
                        <img src={clearIcon} className="w-5 h-5 mr-2" />
                        Clear
                      </div>
                    </motion.div>
                  </OutsideClickHandler>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center bg-background border border-zinc-200 dark:border-zinc-900 pl-2 pr-1 py-1.5 rounded-lg">
                <motion.img
                  src={botInfo.avatar}
                  className="w-[16px] h-[16px] object-contain rounded-sm mr-2"
                  whileHover={{ rotate: 180 }}
                />

                <ChatbotName
                  botId={botId}
                  name={botInfo.name}
                  fullName={bot?.name || botInfo.name}
                  onSwitchBot={mode === "compact" ? onSwitchBot : undefined}
                />
              </div>

              <WebAccessCheckbox botId={botId} />
              <ToolSelector className="hidden sm:flex" />

              <div className="flex ml-auto">
                {chats.length == 1 && fileUrl && (
                  <Eye
                    size={21}
                    className="cursor-pointer mr-2 text-[#50504E]"
                    onClick={() => {
                      window.open(fileUrl, "_blank");
                    }}
                  />
                )}

                <DropdownMenu>
                  {mode == "compact" && (
                    <>
                      {!maximizedBotId ? (
                        <CustomTooltip content="Maximize Window">
                          <MaximizeIcon
                            size={20}
                            className="cursor-pointer text-gray-600 mt-[1px] mr-2"
                            onClick={() => setMaximizedBotId(botId)}
                          />
                        </CustomTooltip>
                      ) : (
                        <CustomTooltip content="Minimize Window">
                          <MinimizeIcon
                            size={20}
                            className="cursor-pointer text-gray-600 mt-[1px] mr-2"
                            onClick={() => setMaximizedBotId(null)}
                          />
                        </CustomTooltip>
                      )}
                    </>
                  )}

                  <DropdownMenuTrigger>
                    <MoreVertical
                      size={21}
                      className="cursor-pointer text-gray-600"
                    />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="!rounded-xl">
                    {(mode == "compact" || !chatHistoryVisible) && (
                      <DropdownMenuItem
                        className="flex items-center gap-2 rounded-xl cursor-pointer"
                        onClick={() => onShowChatHistory(botId)}
                      >
                        <img
                          src={historyIcon}
                          className="w-4 h-4 cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                        />

                        <span className="text-sm">Chat History</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="flex items-center gap-2 rounded-xl cursor-pointer"
                      onClick={() => setShowClearAlert(true)}
                    >
                      <img
                        src={clearIcon}
                        className={cn(
                          "w-4 h-4",
                          generating ? "cursor-not-allowed" : "cursor-pointer"
                        )}
                        whileHover={{ scale: 1.1 }}
                        // only reset the chatId of the conversation of mode was compact
                      />

                      <span className="text-sm">Clear Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        <ChatMessageList
          botId={botId}
          messages={messages}
          className={marginClass}
          chatLoading={chatLoading}
        />

        {isSingle ? (
          <div
            className={cn(
              "mt-1 flex flex-col rounded-lg",
              marginClass,
              mode === "full" ? "mb-3" : "mb-[5px]"
            )}
          >
            <ChatMessageInput
              mode={mode}
              disabled={generating}
              placeholder={mode === "compact" ? "" : undefined}
              onSubmit={onSubmit}
              autoFocus={mode === "full"}
              supportImageInput={mode === "full" && (bot?.supportsImageInput || false)}
              actionButton={inputActionButton}
              chats={chats}
              fileUrl={fileUrl}
            />
          </div>
        ) : (
          <ChatMessageInput
            chats={chats}
            botId={botId}
            mode={mode}
            disabled={generating}
            placeholder={mode === "compact" ? "" : undefined}
            onSubmit={onSubmit}
            autoFocus={mode === "full"}
            supportImageInput={mode === "full" && (bot?.supportsImageInput || false)}
            actionButton={inputActionButton}
            isPanelHovered={isHovered}
          />
        )}
      </div>

      <Dialog
        open={showClearAlert}
        onOpenChange={() => setShowClearAlert(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently clear your
              conversation and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="border rounded-md text-base px-3 py-2">
              Cancel
            </DialogClose>
            <DialogClose
              className="rounded-md text-base px-3 py-2 bg-red-600 text-white"
              onClick={() => resetConversation(mode == "full")}
            >
              Continue
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PromptsModal
        open={showPromptsModal}
        onClose={() => setShowPromptsModal(false)}
      />
    </ConversationContext.Provider>
  );
};

export default ConversationPanel;
