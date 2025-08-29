import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MoreVertical, PencilLine, SquarePen, Trash2, X } from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import moment from "moment";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";

import { useChat } from "@/hooks/use-chat";
import ConversationPanel from "@/components/Chat/ConversationPanel";
import apiClient from "@/lib/apiClient";
import Loading from "@/components/Loading";
import { cn } from "@/lib/shadcn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  chatsAtom,
  chatMessageInputValueAtom,
  individualChatMessageInputValueAtom,
  showOverlayLoadingAtom,
} from "@/config/state";
import { activeBotsAtom } from "@/config/chatbots";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CustomAlertDialog } from "@/components/ui/alert-dialog";
import SearchCommand from "@/components/Chat/SearchCommand";
import useAuth from "@/hooks/useAuth";

const SingleBotChatPanel = ({ botId }) => {
  const chat = useChat(botId);
  const { currentUser } = useAuth();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [individualChatMessageInputValue, setIndividualChatMessageInputValue] =
    useAtom(individualChatMessageInputValueAtom);
  const setChatMessageInputValue = useSetAtom(chatMessageInputValueAtom);
  const setOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const [chats, setChats] = useAtom(chatsAtom);
  const activeBots = useAtomValue(activeBotsAtom);
  const [loading, setLoading] = useState(false);
  const [renameChat, setRenameChat] = useState(null);
  const [removeChat, setRemoveChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(!isMobile);
  const [selectedChats, setSelectedChats] = useState([]);
  const [showBulkDeleteAlert, setShowBulkDeleteAlert] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    fetch();
  }, [botId]);

  useEffect(() => {
    if (!individualChatMessageInputValue) return;

    setTimeout(() => {
      chat.sendMessage(individualChatMessageInputValue);
      setIndividualChatMessageInputValue("");
      setChatMessageInputValue("");
    }, 500);
  }, [individualChatMessageInputValue]);

  const fetch = async () => {
    setLoading(true);

    const { data, ok } = await apiClient.get(`/chat-history/${botId}`);
    setLoading(false);

    if (!ok) return toast.error("Failed to fetch chat history");

    setChats(data.chats);
  };

  const rename = async () => {
    setOverlayLoading(true);

    const { ok } = await apiClient.post(
      `/chat-history/chats/${renameChat.id}/rename`,
      {
        title: renameChat.title,
      }
    );
    setOverlayLoading(false);

    if (!ok) return toast.error("Failed to rename chat");

    setRenameChat(null);

    let newChats = chats.map((chat) => ({
      ...chat,
      title: chat.id === renameChat.id ? renameChat.title : chat.title,
    }));
    setChats(newChats);

    toast.success("Chat renamed successfully");
  };

  const remove = async () => {
    setOverlayLoading(true);

    const { ok } = await apiClient.delete(
      `/chat-history/chats/${removeChat.id}/remove`
    );
    setOverlayLoading(false);

    if (!ok) return toast.error("Failed to remove chat");

    setRemoveChat(null);

    if (removeChat.selected) {
      chat.setChatState({ ...chat.chatState, messages: [] });
    }

    let newChats = chats.filter((chat) => chat.id !== removeChat.id);
    setChats(newChats);
    const bot = await chat.getBot();
    bot.resetConversation();

    toast.success("Chat removed successfully");
  };

  const bulkRemove = async () => {
    setOverlayLoading(true);

    const { ok } = await apiClient.post(`/chat-history/chats/remove`, {
      chatIds: selectedChats,
    });
    setOverlayLoading(false);

    if (!ok) return toast.error("Failed to remove chats");

    // Check if any selected chat was the active one
    const hasSelectedActive = selectedChats.some((id) =>
      chats.find((chat) => chat.id === id && chat.selected)
    );

    if (hasSelectedActive) {
      chat.setChatState({ ...chat.chatState, messages: [] });
      const bot = await chat.getBot();
      bot.resetConversation();
    }

    let newChats = chats.filter((chat) => !selectedChats.includes(chat.id));
    setChats(newChats);
    setSelectedChats([]);

    toast.success("Chats removed successfully");
  };

  const handleSelectChat = async (newChat) => {
    console.log(newChat);
    chat.setChatState({
      ...chat.chatState,
      messages: [],
    });
    setChats(
      chats.map((chat) => ({ ...chat, selected: chat.id === newChat.id }))
    );
    setChatLoading(true);

    const { data, ok } = await apiClient.get(
      `/chat-history/chats/${newChat.id}/messages`
    );
    setChatLoading(false);

    if (!ok) return toast.error("Failed to fetch chat history");

    let messages = [];
    for (let msg of data.messages) {
      messages.push({
        id: msg.id,
        text: msg.text,
        image: msg.image,
        author: "user",
      });

      messages.push({
        id: msg.id + "-response",
        text: msg.response,
        author: botId,
      });
    }

    chat.setChatState({
      ...chat.chatState,
      messages,
      fileUrl: newChat.fileUrl,
    });
    const bot = await chat.getBot();
    bot.setConversationMessages(newChat.id, messages);
  };

  const toggleChatSelection = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter((id) => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const getGroupedChats = () => {
    // we should group the chats into three categories
    // 1. Today
    // 2. Yesterday
    // 3. previouse 7 days
    // 4. previous 30 days
    const groupedChats = {
      today: [],
      yesterday: [],
      prev7Days: [],
      prev30Days: [],
    };

    chats.forEach((chat) => {
      const createdAt = moment(chat.createdAt);
      let field = "";

      if (createdAt.isAfter(moment().startOf("day"))) {
        field = "today";
      } else if (
        createdAt.isAfter(moment().startOf("day").subtract(1, "day"))
      ) {
        field = "yesterday";
      } else if (
        createdAt.isAfter(moment().startOf("day").subtract(7, "day"))
      ) {
        field = "prev7Days";
      } else {
        field = "prev30Days";
      }

      groupedChats[field].push(chat);
    });

    for (let field of Object.keys(groupedChats)) {
      groupedChats[field].sort((a, b) =>
        moment(b.createdAt).diff(moment(a.createdAt))
      );
    }

    return groupedChats;
  };

  const ChatGroup = ({ title, groupedChat }) => {
    if (!groupedChat.length) return null;

    return (
      <div className="mt-4">
        <p className="text-[12px] text-gray-500 font-medium">{title}</p>

        <div>
          {groupedChat.map((chat, index) => (
            <div key={index} className="flex items-center">
              <Checkbox
                checked={selectedChats.includes(chat.id)}
                onCheckedChange={() => toggleChatSelection(chat.id)}
                className="mr-2 mt-2"
              />

              <div
                className={cn(
                  "flex items-center border mt-2 rounded-lg w-full",
                  chat.selected ? "shadow-md border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900" : "dark:border-zinc-900"
                )}
              >
                <div
                  className={cn("p-2 rounded-md cursor-pointer w-full")}
                  onClick={() => handleSelectChat(chat)}
                >
                  <p className="text-sm font-medium line-clamp-1">
                    {chat.title}
                  </p>
                </div>

                <div className="w-8 flex justify-end">
                  <Popover>
                    <PopoverTrigger>
                      <MoreVertical
                        size={17}
                        className="text-zinc-500 cursor-pointer ml-2 w-6 z-10"
                      />
                    </PopoverTrigger>

                    <PopoverContent className="!w-32 !p-0 !rounded-xl">
                      <div
                        className="text-sm cursor-pointer flex items-center hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-t-xl"
                        onClick={() => setRenameChat(chat)}
                      >
                        <PencilLine size={17} className="mr-3 text-gray-500" />
                        <span>Rename</span>
                      </div>

                      <div
                        className="text-sm cursor-pointer flex items-center hover:bg-gray-200 dark:hover:bg-zinc-800 p-2 rounded-b-xl"
                        onClick={() => setRemoveChat(chat)}
                      >
                        <Trash2 size={17} className="mr-3 text-red-500" />
                        <span>Delete</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const groupedChats = getGroupedChats();

  return (
    <div
      className={cn(
        "flex overflow-hidden h-full",
        isMobile && !historyVisible ? "mx-3" : "mr-3"
      )}
    >
      <AnimatePresence>
        {historyVisible && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setHistoryVisible(false)}
              />
            )}

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "p-4 pl-6 mr-2 w-96 overflow-auto scrollbar-thin h-screen",
                isMobile ? "fixed top-0 left-0 z-50 bg-white" : ""
              )}
            >
              <div className="flex items-center">
                <p className="font-bold text-xl whitespace-nowrap">
                  Chat History
                </p>

                <SearchCommand
                  open={searchOpen}
                  setOpen={setSearchOpen}
                  className="ml-auto"
                  aiModel={chat.botId}
                  onSelect={(chat) => handleSelectChat(chat)}
                />

                <X
                  size={20}
                  className="cursor-pointer text-gray-500 ml-3"
                  onClick={() => setHistoryVisible(false)}
                />
              </div>

              <div
                className="p-2 rounded-lg border border-gray-300 dark:border-zinc-800 flex items-center mt-5 cursor-pointer active:scale-95"
                onClick={async () => {
                  setChats((prev) =>
                    prev.map((chat) => ({ ...chat, selected: false }))
                  );
                  chat.setChatState({
                    ...chat.chatState,
                    messages: [],
                    fileUrl: "",
                  });
                  const bot = await chat.getBot();
                  bot.resetConversation();
                }}
              >
                <div className="w-6 h-6 bg-white flex justify-center items-center rounded mr-2">
                  <img
                    src={activeBots.find((b) => b.botId == botId)?.bot.avatar}
                    className="w-4 h-4"
                  />
                </div>
                <p className="text-sm font-medium">New Chat</p>

                <SquarePen size={20} className="ml-auto text-gray-500" />
              </div>

              {selectedChats.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {selectedChats.length} chat
                    {selectedChats.length > 1 ? "s" : ""} selected
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteAlert(true)}
                    className="text-xs"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete Selected
                  </Button>
                </div>
              )}

              <div className="mt-4">
                {loading && <Loading className="text-center w-full my-20" />}

                <ChatGroup title="Today" groupedChat={groupedChats.today} />
                <ChatGroup
                  title="Yesterday"
                  groupedChat={groupedChats.yesterday}
                />
                <ChatGroup
                  title="Previous 7 Days"
                  groupedChat={groupedChats.prev7Days}
                />
                <ChatGroup
                  title="Previous 30 Days"
                  groupedChat={groupedChats.prev30Days}
                />

                {!loading &&
                  !groupedChats.today.length &&
                  !groupedChats.yesterday.length &&
                  !groupedChats.prev7Days.length &&
                  !groupedChats.prev30Days.length && (
                    <p className="text-gray-400 text-center mt-32 text-sm">
                      No chat history available
                    </p>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!isMobile && !historyVisible && <div className="ml-6" />}

      <ConversationPanel
        isSingle
        botId={botId}
        bot={chat.bot}
        messages={chat.messages}
        onUserSendMessage={chat.sendMessage}
        generating={chat.generating}
        stopGenerating={chat.stopGenerating}
        resetConversation={chat.resetConversation}
        chats={[chat]}
        chatLoading={chatLoading}
        className="pt-3"
        chatHistoryVisible={historyVisible}
        onShowChatHistory={() => setHistoryVisible(true)}
        mode="full"
      />

      <Dialog open={!!renameChat} onOpenChange={() => setRenameChat(null)}>
        <DialogContent>
          <DialogTitle>Rename Chat</DialogTitle>

          <div className="mt-1">
            <DialogDescription className="mb-1">New Title</DialogDescription>
            <Input
              placeholder="Enter new title"
              className="w-full"
              value={renameChat?.title || ""}
              onChange={(e) =>
                setRenameChat({ ...renameChat, title: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <DialogClose
              className="rounded-md text-base px-3 py-2 bg-blue-600 text-white"
              onClick={() => rename()}
            >
              Save Changes
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeChat} onOpenChange={() => setRemoveChat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="border rounded-md text-base px-3 py-2">
              Cancel
            </DialogClose>
            <DialogClose
              className="rounded-md text-base px-3 py-2 bg-red-600 text-white"
              onClick={() => remove()}
            >
              Continue
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        open={showBulkDeleteAlert}
        onOpenChange={setShowBulkDeleteAlert}
        title="Delete selected chats?"
        description={`You are about to delete ${selectedChats.length} chat${
          selectedChats.length > 1 ? "s" : ""
        }. This action cannot be undone and will permanently remove the selected chats from our servers.`}
        onConfirm={bulkRemove}
        confirmBtnClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default SingleBotChatPanel;
