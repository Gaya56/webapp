import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FlaskConicalIcon,
  GitCompareIcon,
  SparklesIcon,
  TextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  CopyIcon,
} from "lucide-react";
import _ from "lodash-es";
import { useAtom, useSetAtom } from "jotai";
import { Drawer } from "vaul";
import { toast } from "react-hot-toast";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { cn } from "@/lib/shadcn";
import { CustomDialog } from "@/components/ui/dialog";
import { ALL_BOTS } from "@/config/chatbots";
import GroupSelect from "@/components/ui/group-select";
import { Button } from "./ui/button";
import { currentUserAtom, selectedMagicActionBotIdAtom } from "@/config/state";
import Markdown from "@/components/Markdown";
import { PulseLoader } from "react-spinners";
import increaseUsage from "@/lib/increaseUsage";

const actions = [
  {
    icon: GitCompareIcon,
    name: "compare",
  },
  {
    icon: TextIcon,
    name: "summarize",
  },
  {
    icon: FlaskConicalIcon,
    name: "mixture",
  },
];

const MagicActions = ({ chats }) => {
  const setCurrentUser = useSetAtom(currentUserAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMagicActionBotId, setSelectedMagicActionBotId] = useAtom(
    selectedMagicActionBotIdAtom
  );
  const [selectedAction, setSelectedAction] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultLoading, setResultLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !event.target.closest(".menu-container") &&
        !event.target.closest(".choose-model-container")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setIsOpen(false);
    handleExecuteAction(action);
  };

  const handleExecuteAction = async (action) => {
    try {
      if (chats.find((c) => !c.messages.length))
        return toast.error("Please send a message first.");

      if (chats.find((c) => c.generating))
        return toast.error("Please wait for the current chats to finish.");

      setResultMessage("");
      setResultLoading(true);
      setIsDrawerOpen(true);
      setIsCopied(false);

      let messages = chats.map((c) => c.messages[c.messages.length - 1]).flat();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/magic-actions`,
        {
          method: "POST",
          body: JSON.stringify({
            messages,
            action: action,
            modelName: ALL_BOTS.find(
              (bot) => bot.botId === selectedMagicActionBotId
            )?.modelName,
          }),
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": window.xAuthToken
          },
        }
      );

      if (!response.body) return toast.error("An error occurred");
      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();

      if (response.status !== 200) {
        setResultLoading(false);
        const { value } = await reader.read();

        const text = textDecoder.decode(value, { stream: true });
        if (!text) return toast.error("Something went wrong");
        return setResultMessage(text);
      }

      let accumulatedResponse = "";
      setResultLoading(false);

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const text = textDecoder.decode(value, { stream: true });
        accumulatedResponse += text;

        setResultMessage(accumulatedResponse);
      }

      increaseUsage("pro", setCurrentUser, 1, selectedMagicActionBotId);
    } catch (error) {
      console.error(error);
      setIsDrawerOpen(false);
      setResultLoading(false);
      return toast.error("An error occurred");
    }
  };

  return (
    <>
      <div className="absolute right-6 bottom-[4.5rem] menu-container">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="magic-actions-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-2 bottom-full mb-2 w-56 rounded-md bg-background ring-1 ring-black dark:ring-zinc-700 ring-opacity-10 shadow-md"
            >
              <div className="pt-1">
                <div className="px-4 py-2 text-sm font-bold">Magic Actions</div>
                <hr className="mx-2 mt-1" />

                {actions.map((action, idx) => (
                  <button
                    key={action.name}
                    onClick={() => handleSelectAction(action.name)}
                    className={cn(
                      "px-4 pt-2 pb-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center w-full",
                      idx == actions.length - 1 &&
                        !showAdvancedOptions &&
                        "!pb-3",
                      idx == 0 && "!pt-3"
                    )}
                  >
                    <action.icon size={16} className="mr-2" />
                    <span className="capitalize">{action.name}</span>
                  </button>
                ))}

                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="px-4 pt-2 pb-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center w-full justify-between"
                >
                  <span className="text-gray-600 font-medium">
                    Advanced Options
                  </span>
                  {showAdvancedOptions ? (
                    <ChevronUpIcon size={14} />
                  ) : (
                    <ChevronDownIcon size={14} />
                  )}
                </button>

                <AnimatePresence>
                  {showAdvancedOptions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-2">
                        <div className="text-xs text-gray-500 mb-1">Model</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm truncate max-w-[80%]">
                            {ALL_BOTS.find(
                              (bot) => bot.botId === selectedMagicActionBotId
                            )?.bot.name || "Select model"}
                          </div>

                          <button
                            onClick={() => {
                              setShowModelDialog(true);
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                          >
                            <PencilIcon size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-b from-slate-50 to-slate-100 w-12 h-12 lg:w-16 lg:h-16 rounded-full shadow-slate-400 shadow-md border-b-4 border-slate-200 hover:shadow-sm transition-all duration-300 flex items-center justify-center active:scale-75"
        >
          <SparklesIcon
            size={24}
            className="text-primary-blue transform translate-y-0.5"
          />
        </button>
      </div>

      <CustomDialog
        open={showModelDialog}
        onOpenChange={setShowModelDialog}
        className="choose-model-container"
      >
        <div className="flex flex-col gap-4">
          <GroupSelect
            value={
              selectedMagicActionBotId
                ? ALL_BOTS.find((bot) => bot.botId === selectedMagicActionBotId)
                    ?.bot.name
                : ""
            }
            onChange={(value) => setSelectedMagicActionBotId(value)}
            label="Select a model"
            groups={Object.entries(
              _.groupBy(
                ALL_BOTS.filter(
                  (bot) => !["code", "image"].includes(bot.group)
                ),
                "group"
              )
            ).map(([key, value]) => ({
              title: key,
              items: value
                .filter((bot) => !["o1", "o1-mini"].includes(bot.botId))
                .map((bot) => ({
                  id: bot.botId,
                  value: bot.bot.name,
                  img: bot.bot.avatar,
                })),
            }))}
          />

          <div className="flex items-center justify-end">
            <Button onClick={() => setShowModelDialog(false)}>
              <span>Save</span>
            </Button>
          </div>
        </div>
      </CustomDialog>

      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="right"
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 dark:bg-black/90" />

          <Drawer.Content
            className="fixed z-50 flex h-[calc(100vh-1rem)] flex-col pr-2 right-0 top-2 w-fit"
            data-vaul-no-drag="true"
          >
            <div
              className={cn(
                "bg-white dark:bg-zinc-900 rounded-xl h-full p-4 overflow-y-scroll custom-scrollbar selectable-content",
                selectedAction == "compare"
                  ? "w-[55vw] 2xl:w-[45vw]"
                  : "w-[55vw] 2xl:w-[40vw]"
              )}
            >
              {resultLoading ? (
                <PulseLoader
                  size={10}
                  className="leading-tight"
                  color="#303030"
                />
              ) : (
                <>
                  <Markdown>{resultMessage}</Markdown>

                  {resultMessage && (
                    <div className="flex items-center justify-end">
                      <CopyToClipboard
                        text={resultMessage}
                        onCopy={() => setIsCopied(true)}
                      >
                        <button className="flex items-center justify-center px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 mt-4 text-sm">
                          <CopyIcon size={16} className="mr-2" />
                          <span>{isCopied ? "Copied!" : "Copy"}</span>
                        </button>
                      </CopyToClipboard>
                    </div>
                  )}
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
};

export default MagicActions;
