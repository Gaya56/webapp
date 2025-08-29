import { memo, useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  IoCheckmarkSharp,
  IoCopyOutline,
  IoStopCircleOutline,
} from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import { RefreshCcw, PencilLineIcon } from "lucide-react";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useAtom } from "jotai";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/shadcn";
import Markdown from "@/components/Markdown";
import ErrorAction from "./ErrorAction";
import MessageBubble from "./MessageBubble";
import { useChat } from "@/hooks/use-chat";
import tts from "@/lib/tts";
import { speakingTextAtom, chatsAtom } from "@/config/state";
import { CustomTooltip } from "../ui/tooltip";
import { CustomDialog } from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const COPY_ICON_CLASS =
  "self-top cursor-pointer text-primary-text cursor-pointer dark:text-zinc-500";

const ChatMessageCard = ({ botId, message, className, index }) => {
  const chat = useChat(botId);
  const [chatState, setChatState] = useAtom(chatsAtom);
  const [speakingText, setSpeakingText] = useAtom(speakingTextAtom);

  const [copied, setCopied] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedMessage, setEditedMessage] = useState("");

  const imageUrl = useMemo(() => {
    return message.image
      ? typeof message.image == "string"
        ? message.image
        : URL.createObjectURL(message.image)
      : "";
  }, [message.image]);

  const copyText = useMemo(() => {
    if (message.text) {
      return message.text;
    }

    if (message.error) {
      return message.error.message;
    }
  }, [message.error, message.text]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  useEffect(() => {
    if (currentSpeakingText && speakingText !== currentSpeakingText) {
      setCurrentSpeakingText("");
    }
  }, [speakingText]);

  const handleEditMessage = () => {
    setEditedMessage(message.text);
    setShowEditModal(true);
  };

  const handleSubmitEdit = () => {
    chat.removeConversationMessages(index);

    chat.sendMessage(
      editedMessage,
      message?.image || null
    );
    setShowEditModal(false);
  };

  return (
    <div
      className={cn(
        "group flex w-full flex-row",
        className,
        message.author == "user" && "bg-[#f7f7f7] dark:bg-zinc-900"
      )}
    >
      <div className={`w-full py-3 px-3`}>
        <div className="w-full mr-3">
          <p className="font-bold text-[11.5px] mb-1 dark:text-zinc-500">
            {message.author === "user" ? "USER" : "ASSISTANT"}
          </p>

          <MessageBubble color={message.author === "user" ? "primary" : "flat"}>
            {!!imageUrl && (
              <img src={imageUrl} className="max-w-xs my-2 rounded-lg" />
            )}

            {message.text ? (
              <Markdown>{message.text}</Markdown>
            ) : (
              !message.error && (
                <PulseLoader
                  size={10}
                  className="leading-tight"
                  color="#303030"
                />
              )
            )}

            {!!message.error && (
              <p className="text-[#cc0000] dark:text-[#ff0033]">
                {message.error.message}
              </p>
            )}
          </MessageBubble>

          {!!message.error && <ErrorAction error={message.error} />}
        </div>

        <div className="flex mt-2">
          {message.author === "user" && (
            <>
              <CustomTooltip content="Regenerate message">
                <RefreshCcw
                  onClick={() => {
                    chat.removeConversationMessage(index);
                    chat.sendMessage(
                      message.text,
                      message?.image || null,
                      true
                    );
                  }}
                  className="text-gray-700 dark:text-zinc-500 mr-3 cursor-pointer"
                  size={15}
                />
              </CustomTooltip>

              <CustomTooltip content="Edit message">
                <PencilLineIcon
                  onClick={handleEditMessage}
                  className="text-gray-700 dark:text-zinc-500 mr-3 cursor-pointer"
                  size={15}
                />
              </CustomTooltip>
            </>
          )}

          {!!copyText && (
            <>
              {currentSpeakingText ? (
                <IoStopCircleOutline
                  onClick={() => {
                    speechSynthesis.cancel();
                    setCurrentSpeakingText("");
                    setSpeakingText("");
                  }}
                  size={16}
                  className="mr-3 transform translate-y-[-1px] cursor-pointer text-gray-700 dark:text-zinc-500"
                />
              ) : (
                <HiOutlineSpeakerWave
                  onClick={() => {
                    tts(copyText, () => {
                      setCurrentSpeakingText("");
                      speechSynthesis.cancel();
                    });
                    setCurrentSpeakingText(copyText);
                    setSpeakingText(copyText);
                  }}
                  size={16}
                  className="mr-3 transform translate-y-[-1px] cursor-pointer text-gray-700 dark:text-zinc-500"
                />
              )}
            </>
          )}

          {!!copyText && (
            <CopyToClipboard text={copyText} onCopy={() => setCopied(true)}>
              {copied ? (
                <IoCheckmarkSharp size={15} className={COPY_ICON_CLASS} />
              ) : (
                <IoCopyOutline size={15} className={COPY_ICON_CLASS} />
              )}
            </CopyToClipboard>
          )}
        </div>
      </div>

      <CustomDialog
        title="Edit Message"
        open={showEditModal}
        onOpenChange={setShowEditModal}
        className="max-w-[90vw] lg:max-w-[60vw] xl:max-w-[50vw]"
      >
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <TextareaAutosize
              id="message"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              minRows={10}
              maxRows={20}
              className="w-full text-sm resize-none border border-gray-300 dark:border-gray-800 dark:bg-zinc-900 rounded-md p-2"
            />
          </div>
          <Button onClick={handleSubmitEdit}>Submit</Button>
        </div>
      </CustomDialog>
    </div>
  );
};

export default memo(ChatMessageCard);
