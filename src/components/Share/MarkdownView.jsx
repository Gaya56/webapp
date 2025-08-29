import { FC, useCallback, useMemo, useState } from "react";
import { Copy } from "lucide-react";

import Button from "../Button";

const MarkdownView = ({ messages = [] }) => {
  const [copied, setCopied] = useState(false);

  const content = useMemo(() => {
    return messages
      .filter((m) => !!m.text)
      .map((m) => `**${m.author}**: ` + m.text)
      .join("\n\n");
  }, [messages]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  }, [content]);

  return (
    <div className="px-5 pt-3 pb-4 overflow-hidden flex flex-col h-full">
      <div className="mb-3">
        <Button
          className="bg-zinc-200"
          size="small"
          text={
            copied ? (
              "Copied!"
            ) : (
              <span className="flex items-center">
                <Copy size={15} className="mr-2" />

                <span>Copy</span>
              </span>
            )
          }
          onClick={copy}
        />
      </div>

      <pre className="text-sm whitespace-pre-wrap text-primary-text p-2 rounded-md overflow-auto h-full bg-zinc-200">
        {content}
      </pre>
    </div>
  );
};

export default MarkdownView;
