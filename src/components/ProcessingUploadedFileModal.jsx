import { useAtomValue } from "jotai";

import { isProcessingUploadedFileAtom } from "@/config/state";
import { CustomDialog } from "./ui/dialog";
import Loading from "./Loading";

const ProcessingUploadedFileModal = () => {
  const open = useAtomValue(isProcessingUploadedFileAtom);

  return (
    <CustomDialog title="Processing Uploaded File" open={!!open} showCloseIcon={false}>
      <div className="w-[400px] pt-4 flex items-center justify-center my-5">
        <Loading className="text-black" />
      </div>
    </CustomDialog>
  );
};

export default ProcessingUploadedFileModal;
