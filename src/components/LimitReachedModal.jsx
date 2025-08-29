import { useCallback, useEffect } from "react";
import { useAtom } from "jotai";
import { usePostHog } from 'posthog-js/react'
import { useLocation } from 'react-router-dom'
import { BottomSheet } from "react-spring-bottom-sheet";

import { showPremiumModalAtom } from "@/config/state";
import Pricing from "./Pricing";
import useAuth from "@/hooks/useAuth";

const LimitReachedModal = () => {
  const { currentUser } = useAuth();
  const posthog = usePostHog();
  const location = useLocation();

  const [open, setOpen] = useAtom(showPremiumModalAtom);

  useEffect(() => {
    if (open && currentUser?.subscription?.name === "free") {
      posthog.capture("visit-trial-opt-in", {
        distinct_id: currentUser?.email,
      })
    }
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <BottomSheet
      open={!!open}
      onClose={close}
      onDismiss={close}
      snapPoints={({ maxHeight }) => {
        return [maxHeight * .95, maxHeight * .95];
      }}
    >
      <Pricing />
    </BottomSheet>
  );
};

export default LimitReachedModal;
