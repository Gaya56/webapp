import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { LoadingOverlay } from "@achmadk/react-loading-overlay";
import { useMediaQuery } from "react-responsive";
import Plausible from "plausible-tracker";
import Cookies from "js-cookie";
import TagManager from "react-gtm-module";
import ReactPixel from "react-facebook-pixel";

import LimitReachedModal from "./LimitReachedModal";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/shadcn";
import {
  currentUserAtom,
  installPromptAtom,
  showAuthModalAtom,
  showInstallAppSheetAtom,
  showOverlayLoadingAtom,
  themeAtom,
} from "@/config/state";
import DownloadExtensionModal from "./DownloadExtensionModal";
import AuthModal from "./AuthModal";
import InstallSheet from "./InstallSheet";
import ProcessingUploadedFileModal from "./ProcessingUploadedFileModal";
import SupportModal from "./SupportModal";
import useAuth from "@/hooks/useAuth";
import { FreeTrialModal } from "./FreeTrialModal";
import authStorage from "@/lib/authStorage";
import apiClient from "@/lib/apiClient";

const plausible = Plausible({
  domain: window.location.hostname,
  hashMode: false,
});
window.plausible = plausible;

function Layout() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { updateUser, logIn } = useAuth();
  const theme = useAtomValue(themeAtom);

  const [showOverlayLoading, setShowOverlayLoading] = useAtom(showOverlayLoadingAtom);
  const setShowInstallAppSheet = useSetAtom(showInstallAppSheetAtom);
  const setInstallPrompt = useSetAtom(installPromptAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setShowAuthModal = useSetAtom(showAuthModalAtom);
  const [isReady, setIsReady] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    setVH();
    checkPaymentStatus();
    sendPaymentToGTM();
    saveReferralCode();
    setupScripts();
    restoreUser();
    customLogin();

    const cleanup = plausible.enableAutoPageviews();

    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);

      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (!window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallAppSheet(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const checkPaymentStatus = async () => {
    await new Promise((r) => setTimeout(r, 500));

    const paymentStatus = searchParams.get("paymentStatus");
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      ReactPixel.track("Purchase");
      plausible.trackEvent("Complete Checkout");
      
      toast.success("Payment successful!");
    } else {
      toast.error("Payment failed!");
    }

    window.history.replaceState({}, "", window.location.pathname);
  };

  const sendPaymentToGTM = async () => {
    const trialFirstPaymentValue = searchParams.get("trialFirstPaymentValue");
    const trialPlanMRR = searchParams.get("trialPlanMRR");
    const trialPlanARR = searchParams.get("trialPlanARR");
    const trialPlanType = searchParams.get("trialPlanType");
    const trialPlanFrequency = searchParams.get("trialPlanFrequency");

    if (!trialFirstPaymentValue || !trialPlanMRR || !trialPlanARR || !trialPlanType || !trialPlanFrequency) return;

    TagManager.dataLayer({
      dataLayer: {
        event: "trialStart",
        trialFirstPaymentValue,
        trialPlanMRR,
        trialPlanARR,
        trialPlanType,
        trialPlanFrequency,
      },
    });

    // clear search params
    window.history.replaceState({}, "", window.location.pathname);
  };

  const saveReferralCode = () => {
    const referralCode = new URLSearchParams(window.location.search).get(
      "referralCode"
    );
    
    if (referralCode) {
      Cookies.set("cp-referralCode", referralCode, {
        expires: 5,
        domain: import.meta.env.VITE_API_URL.includes("localhost")
          ? "localhost"
          : ".combochat.ai",
      });
    }
  };

  const setVH = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  const setupScripts = () => {
    const toltScript = document.createElement("script");
    toltScript.async = true;
    toltScript.src = "https://cdn.tolt.io/tolt.js";
    toltScript.dataset.tolt = "pk_ouKGB81AbPRsSH7u87WMt7sq";
    document.head.appendChild(toltScript);

    const conversionScript = document.createElement("script");
    conversionScript.src = "https://p.conversion.ai";
    conversionScript.defer = true;
    document.head.appendChild(conversionScript);
  };

  const restoreUser = async () => {
    try {
      const user = authStorage.getUser();
      if (user) {
        setCurrentUser(user);
        updateUser();
        window.xAuthToken = authStorage.getToken();
      } else {
        authStorage.removeToken();
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        setShowAuthModal(true);

        plausible.trackEvent("Unauthenticated Visitor");
      }
    } catch (err) {
      setCurrentUser(null);
      authStorage.removeToken();
    } finally {
      setIsReady(true);
    }
  };
  
  const customLogin = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const loginToken = searchParams.get("loginToken");
    if (!loginToken) return;

    setShowOverlayLoading(true);

    const { data, ok } = await apiClient.post("/custom-auth/token", {
      loginToken,
    });

    setShowOverlayLoading(false);

    if (!ok) return toast.error(data?.error || data);

    logIn(data);
  };

  if (!isReady) return null;

  return (
    <main
      className={`${isMobile ? "" : "grid grid-cols-[auto_1fr]"}`}
      style={{
        height: "calc(var(--vh, 1vh) * 100)",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <div className="h-full overflow-hidden bg-background">
        <Outlet />

        <LoadingOverlay
          spinner
          active={showOverlayLoading}
          text="Please wait..."
          fadeSpeed={200}
          styles={{
            overlay: (base) => ({
              ...base,
              position: "fixed",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 99999999,
            }),
          }}
        />
      </div>

      <LimitReachedModal />
      <DownloadExtensionModal />
      <AuthModal />
      <InstallSheet />
      <Toaster />
      <ProcessingUploadedFileModal />
      <SupportModal />
      <FreeTrialModal />
    </main>
  );
}

export default Layout;
