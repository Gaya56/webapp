import React from "react";
import { useAtom } from "jotai";

import { showSupportModalAtom } from "@/config/state";
import { CustomDialog } from "./ui/dialog";

function SupportModal() {
  const [showSupportModal, setShowSupportModal] = useAtom(showSupportModalAtom);

  return (
    <CustomDialog
      open={!!showSupportModal}
      onOpenChange={() => setShowSupportModal(false)}
      className="max-w-[90vw] lg:max-w-auto h-[80vh] overflow-y-auto"
      showCloseButton={false}
    >
      <iframe
        src="https://go.crisp.chat/chat/embed/?website_id=f0685988-0197-4ba9-9eb8-868c048a0f4e"
        className="w-full h-full overflow-hidden rounded-lg"
      />
    </CustomDialog>
  );
}

export default SupportModal;
