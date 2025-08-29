import { useSetAtom } from "jotai";
import { memo, useCallback, useEffect, useState } from "react";
import { Globe } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { showPremiumModalAtom } from "@/config/state";
import { checkHasWebAccess, updateWebAccess } from "@/lib/webAccess";
import { cn } from "@/lib/shadcn";
import { CustomTooltip } from "../ui/tooltip";

const WebAccessCheckbox = ({ botId }) => {
  const [checked, setChecked] = useState(null);
  const setPremiumModalOpen = useSetAtom(showPremiumModalAtom);
  const { hasActiveSubscription } = useAuth();

  useEffect(() => {
    if (!hasActiveSubscription) {
      setChecked(false);
      updateWebAccess(botId, false);
    } else if (hasActiveSubscription) {
      setChecked(checkHasWebAccess(botId));
    }
  }, [botId, hasActiveSubscription]);

  const onToggle = useCallback(
    async (newValue) => {
      if (!hasActiveSubscription && newValue) return setPremiumModalOpen(true);

      setChecked(newValue);

      if (botId) updateWebAccess(botId, newValue);
    },
    [botId, hasActiveSubscription, botId, setPremiumModalOpen]
  );

  return (
    <CustomTooltip content="Search the internet for more up-to-date information">
      <div
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer",
          checked ? "bg-blue-100 border-blue-200 dark:bg-blue-800/20 dark:border-blue-500" : "border-gray-300 dark:border-zinc-800"
        )}
        onClick={() => onToggle(!checked)}
      >
        <Globe
          size={15}
          className={cn(checked ? "text-blue-500" : "text-zinc-500")}
        />
      </div>
    </CustomTooltip>
  );
};

export default memo(WebAccessCheckbox);
