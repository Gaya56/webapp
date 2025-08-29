import { useCallback, useState } from "react";

import Button from "../Button";
import { Input } from "../ui/input";
import { uploadToShareGPT } from "./sharegpt";

const ShareGPTView = ({ messages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [resultId, setResultId] = useState(undefined);
  const [copied, setCopied] = useState(false);

  const upload = useCallback(async () => {
    setUploading(true);

    try {
      const id = await uploadToShareGPT(messages);
      setResultId(id);
    } finally {
      setUploading(false);
    }
  }, [messages]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(`https://shareg.pt/${resultId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  }, [resultId]);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12">
      <p className="text-center text-primary-text">
        This will upload this conversation to <b>sharegpt.com</b> and generate a
        link to share <b>publicly</b>.
      </p>

      {resultId ? (
        <div className="flex flex-row items-center gap-3">
          <Input
            value={`https://shareg.pt/${resultId}`}
            readOnly
            className="grow"
          />
          <Button
            size="small"
            color="primary"
            text={copied ? "Copied" : "Copy"}
            onClick={copy}
          />
        </div>
      ) : (
        <Button
          text="Share"
          color="primary"
          onClick={upload}
          isLoading={uploading}
        />
      )}
    </div>
  );
};

export default ShareGPTView;
