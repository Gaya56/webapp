import { useAtom } from "jotai";
import { Download } from "lucide-react";

import { showDownloadExtensionModalAtom } from "@/config/state";
import { CustomDialog, DialogDescription } from "./ui/dialog";

const DownloadExtensionModal = () => {
  const [showDownloadExtensionModal, setShowDownloadExtensionModal] = useAtom(showDownloadExtensionModalAtom);

  return (
    <CustomDialog
      title="Download Extension"
      open={showDownloadExtensionModal}
      onOpenChange={() => setShowDownloadExtensionModal(false)}
      className="!max-w-[95%] md:!max-w-lg lg:!max-w-xl xl:!max-w-2xl"
    >
      <div>
        <div>
          <DialogDescription className="mb-6 text-gray-500 text-[15px]">
            Download our Chrome extension to access additional features including our Browser Copilot.
          </DialogDescription>

          <div className="rounded-lg overflow-hidden mb-6 mt-3">
            <iframe
              src="https://www.youtube.com/embed/RcZC-UppVUc"
              width="100%"
              height="300"
              allowFullScreen
            />
          </div>

          <a
            className="w-full"
            href="https://chromewebstore.google.com/detail/combochat-access-and/bmheaicmcnedjkbkidcfegibipknddga"
            target="_blank"
          >
            <div className="flex justify-center items-center gap-[10px] rounded-[10px] px-4 py-2.5 cursor-pointer bg-gradient-to-r from-amber-500 to-amber-400 text-white">
              <Download size={18} />

              <span className="text-base mb-0.5 mr-1">
                Download Chrome Extension
              </span>
            </div>
          </a>
        </div>
      </div>
    </CustomDialog>
  );
};

export default DownloadExtensionModal;
