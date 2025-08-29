import React, { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { installPromptAtom, showAuthModalAtom, showInstallAppSheetAtom } from "@/config/state";

import Android from "./Android";
import IOS from "./IOS";

import "react-spring-bottom-sheet/dist/style.css";

const InstallSheet = () => {
  const showInstallAppSheet = useAtomValue(showInstallAppSheetAtom);
  const installPrompt = useAtomValue(installPromptAtom);
  const authModalVisible = useAtomValue(showAuthModalAtom);

  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Check if mobile
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));

      // Check if iOS
      const iosRegex = /iPad|iPhone|iPod/i;
      setIsIOS(iosRegex.test(userAgent));
    };

    checkDevice();
  }, []);

  if(! isMobile) return null;
  let visible = showInstallAppSheet && (isIOS || installPrompt) && ! authModalVisible;

  return isIOS ? <IOS visible={visible} /> : <Android visible={visible} />;
};

export default InstallSheet;
