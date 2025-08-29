import { useState } from "react";
import { AiFillCloud, AiFillFileMarkdown } from "react-icons/ai";

import { cn } from "@/lib/shadcn";
import Button from "../Button";
import { CustomDialog } from "../ui/dialog";
import MarkdownView from "./MarkdownView";
import ShareGPTView from "./ShareGPTView";

const ShareDialog = ({
  open = boolean,
  onClose = () => {},
  messages = [],
}) => {
  const [mode, setMode] = useState();

  return (
    <CustomDialog
      title="Share Chat"
      open={open}
      onOpenChange={onClose}
      className={cn("rounded-xl")}
    >
      {(() => {
        if (mode === "markdown")
          return <MarkdownView messages={messages} />;
        if (mode === "sharegpt")
          return <ShareGPTView messages={messages} />;

        return (
          <div className="flex flex-col gap-5 justify-center items-center p-5 h-full">
            <Button
              text="Markdown"
              color="primary"
              icon={<AiFillFileMarkdown className="mr-1" />}
              onClick={() => setMode("markdown")}
            />

            <Button
              text="ShareGPT"
              color="primary"
              icon={<AiFillCloud className="mr-1" />}
              onClick={() => setMode("sharegpt")}
            />
          </div>
        );
      })()}
    </CustomDialog>
  );
};

export default ShareDialog;
