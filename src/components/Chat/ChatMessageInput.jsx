import { memo, useCallback, useRef, useState } from "react";
import { fileOpen } from "browser-fs-access";
import { RiDeleteBackLine } from "react-icons/ri";
import {
  ChevronDown,
  ChevronUp,
  Delete,
  Image,
  Paperclip,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { LiaBroomSolid } from "react-icons/lia";

import Button from "../Button";
import TextInput from "./TextInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  activePromptAtom,
  chatMessageInputValueAtom,
  uploadedFileAtom,
} from "@/config/state";
import CustomizeActivePrompt from "../PromptLibrary/CustomizeActivePrompt";
import { cn } from "@/lib/shadcn";

const ChatMessageInput = (props) => {
  const {
    botId,
    mode = "full",
    onSubmit = () => {},
    className = "",
    disabled,
    placeholder = "Use Shift+Enter to add new line",
    actionButton = null,
    autoFocus,
    supportImageInput,
    textInputClassName = "",
    chats = [],
    RightSideComponent = null,
    fileUrl,
    isPanelHovered = false,
  } = props;

  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const singleMessageFormRef = useRef(null);
  const inputRef = useRef(null);

  const [value, setValue] = useAtom(chatMessageInputValueAtom);
  const activePrompt = useAtomValue(activePromptAtom);
  const [uploadedFile, setUploadedFile] = useAtom(uploadedFileAtom);
  const [showInput, setShowInput] = useState(false);
  const [singleMessage, setSingleMessage] = useState("");
  const [image, setImage] = useState(undefined);

  const onFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (value.trim() || !!activePrompt) onSubmit(value, image);

      setValue("");
      setImage(undefined);
    },
    [image, props, value]
  );

  const onValueChange = useCallback((v) => {
    setValue(v);
  }, []);

  const selectImage = useCallback(async () => {
    const file = await fileOpen({
      mimeTypes: ["image/jpg", "image/jpeg", "image/png", "image/gif"],
      extensions: [".jpg", ".jpeg", ".png", ".gif"],
    });

    setImage(file);
    inputRef.current?.focus();
  }, []);

  const onPaste = useCallback((event) => {
    const files = event.clipboardData.files;
    if (!files.length) {
      return;
    }

    const imageFile = Array.from(files).find((file) =>
      file.type.startsWith("image/")
    );
    if (imageFile) {
      event.preventDefault();
      setImage(imageFile);
      inputRef.current?.focus();
    }
  }, []);

  const resetChats = () => {
    for (let chat of chats || []) {
      chat.resetConversation();
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      {!!activePrompt && mode === "full" && <CustomizeActivePrompt />}

      {mode === "full" ? (
        <form
          ref={formRef}
          className="flex items-end w-full mt-2"
          onSubmit={onFormSubmit}
        >
          {RightSideComponent}

          <div
            className={cn(
              "flex flex-row items-center gap-3 border border-zinc-200 dark:border-zinc-900 rounded-lg px-3 py-2 grow",
              className
            )}
          >
            {(chats?.length || 0) > 1 &&
              !!chats?.find((c) => c.messages.length > 1) && (
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger>
                      <LiaBroomSolid
                        size={20}
                        color="#707070"
                        className="cursor-pointer"
                        onClick={() => resetChats()}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Reset Chats</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

            {supportImageInput && (
              <div title="Image input">
                <Image
                  size={18}
                  color="#707070"
                  className="cursor-pointer"
                  onClick={selectImage}
                />
              </div>
            )}

            {!fileUrl && (
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger type="button">
                    <Paperclip
                      size={17}
                      color="#707070"
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (!e.target.files?.length) return;

                        setUploadedFile({ file: e.target.files[0] });
                      }}
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
                    />
                  </TooltipTrigger>

                  <TooltipContent className="text-center">
                    <p>
                      Upload files upto 10MB in pdf, doc, docx, txt, xlsx, xls,
                      csv.
                    </p>
                    <p>Files will be deleted 3 days after upload.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <div className="w-full flex flex-col justify-center">
              {image && (
                <div className="flex flex-row items-center w-fit mb-1 gap-1">
                  <span className="text-[11.5px] text-primary-text font-semibold cursor-default">
                    {image.name}
                  </span>

                  <RiDeleteBackLine
                    size={10}
                    className="cursor-pointer"
                    onClick={() => setImage(undefined)}
                  />
                </div>
              )}

              {uploadedFile && (
                <div className="flex flex-row items-center w-fit mb-1 gap-1">
                  <span className="text-xs text-primary-text font-semibold cursor-default max-w-96 truncate">
                    {uploadedFile.file.name}
                  </span>

                  <Delete
                    size={13}
                    className="cursor-pointer ml-1"
                    onClick={() => setUploadedFile(null)}
                  />
                </div>
              )}

              <TextInput
                ref={inputRef}
                formref={formRef}
                name="input"
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onValueChange={onValueChange}
                autoFocus={autoFocus}
                onPaste={supportImageInput ? onPaste : undefined}
                className={textInputClassName}
                maxRows={15}
              />
            </div>
          </div>

          {actionButton || (
            <Button
              text="-"
              className="invisible"
              size={mode === "full" ? "normal" : "tiny"}
            />
          )}
        </form>
      ) : (
        <div>
          <div className="flex flex-col items-center w-full absolute bottom-0 left-1/2 -translate-x-1/2">
            <div
              className={cn(
                "transition-opacity chpX-duration-200 w-full flex justify-center",
                isPanelHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <div
                className="bg-gray-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-800 rounded-t-lg px-5 cursor-pointer text-center w-fit"
                onClick={() => setShowInput(!showInput)}
              >
                {showInput ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronUp size={18} />
                )}
              </div>
            </div>

            {showInput && (
              <form
                ref={singleMessageFormRef}
                className="w-full border border-zinc-200 dark:border-zinc-800 px-4 pt-2 rounded-b-lg bg-background"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!singleMessage.trim()) return;

                  const chat = chats.find((c) => c.botId === botId);
                  chat?.sendMessage(singleMessage);
                  setSingleMessage("");
                  setShowInput(false);
                }}
              >
                <TextInput
                  formref={singleMessageFormRef}
                  name="input"
                  disabled={disabled}
                  placeholder="Shift+Enter to add new line"
                  value={singleMessage}
                  onValueChange={(e) => setSingleMessage(e)}
                  autoFocus={autoFocus}
                  className={textInputClassName}
                  maxRows={5}
                />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ChatMessageInput);
