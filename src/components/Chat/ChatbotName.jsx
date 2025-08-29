import { memo } from "react";
import { ChevronsUpDown } from "lucide-react";

import SwitchBotDropdown from "../SwitchBotDropdown";
import { CustomTooltip } from "@/components/ui/tooltip";

const ChatbotName = ({
  botId = "",
  name = "",
  fullName = "",
  onSwitchBot = () => {},
}) => {
  const node = (
    <CustomTooltip content={fullName || name} side="bottom">
      <span className="font-semibold text-primary-text text-[12px] cursor-pointer mr-1 mt-[2px] line-clamp-1">
        {name}
      </span>
    </CustomTooltip>
  );

  if (!onSwitchBot) {
    return node;
  }

  const triggerNode = (
    <div className="flex flex-row items-center gap-[2px]">
      {node}
      <ChevronsUpDown size={16} className="text-zinc-500 ml-1" />
    </div>
  );

  return (
    <SwitchBotDropdown
      selectedBotId={botId}
      onChange={onSwitchBot}
      triggerNode={triggerNode}
    />
  );
};

export default memo(ChatbotName);
