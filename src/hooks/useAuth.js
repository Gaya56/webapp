import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useAtom, useSetAtom } from "jotai";
import Cookies from "js-cookie";
import TagManager from "react-gtm-module";
import ReactPixel from "react-facebook-pixel";

import apiClient from "@/lib/apiClient";
import authStorage from "@/lib/authStorage";
import { currentUserAtom, showAuthModalAtom, showOverlayLoadingAtom } from "@/config/state";
import cache from "@/lib/cache";

export default function useAuth() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const setOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const setShowAuthModal = useSetAtom(showAuthModalAtom);

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
  });

  const logIn = async (data) => {
    const { authToken, user, isRegister } = data;

    authStorage.storeToken(authToken);
    setCurrentUser(user);
    window.xAuthToken = authToken;

    // Debug logging
    console.log("🔍 logIn called with data:", { authToken: !!authToken, user: !!user, isRegister });
    console.log("🔍 ReactPixel available:", typeof ReactPixel);

    if (isRegister) {
      console.log("🔥 Firing registration events...");
      
      // GTM Event with transaction ID for deduplication
      TagManager.dataLayer({
        dataLayer: {
          event: "signup",
          userId: user.id,  // Add user ID for tracking
          transactionId: user.id  // Add transaction ID for Google Ads deduplication
        },
      });
      
      // Meta Pixel Event - Multiple attempts for reliability
      try {
        ReactPixel.track("CompleteRegistration");
        console.log("✅ ReactPixel.track('CompleteRegistration') fired");
      } catch (error) {
        console.error("❌ ReactPixel.track error:", error);
      }

      // Backup: Direct fbq call
      try {
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'CompleteRegistration');
          console.log("✅ window.fbq('track', 'CompleteRegistration') fired");
        } else {
          console.warn("⚠️ window.fbq not available");
        }
      } catch (error) {
        console.error("❌ window.fbq error:", error);
      }

      // Plausible Event
      try {
        window.plausible?.trackEvent("Signup Success");
        console.log("✅ Plausible trackEvent fired");
      } catch (error) {
        console.error("❌ Plausible error:", error);
      }
    } else {
      console.log("⚠️ isRegister is false - no registration events fired");
    }

    setShowAuthModal(false);
  };

  async function handleGoogleLogin({ access_token, setLoading }) {
    console.log("🔍 handleGoogleLogin started");
    setOverlayLoading(true);

    const referralCode = Cookies.get("cp-referralCode");
    const { ok, data } = await apiClient.post("/custom-auth/google", {
      accessToken: access_token,
      referralCode: referralCode || undefined,
      dubId: Cookies.get("dub_id")
    });
    setOverlayLoading(false);

    console.log("🔍 Google auth response:", { ok, isRegister: data?.isRegister });

    if (!ok) return toast.error(data?.error || data);

    logIn(data);
    setShowAuthModal(false);
  }

  const logOut = async () => {
    authStorage.removeToken();
    setCurrentUser(null);
    window.xAuthToken = null;

    toast.success("You are now logged out!");
  };

  const updateUser = async () => {
    if (! authStorage.getToken()) return;

    const response = await apiClient.get('/user');
    if (!response.ok) {
      console.log("Err in updateUser in useAuth:", response.data);
      return toast.error("An error occured. Please try again later.");
    }

    const { user, authToken } = response.data;

    authStorage.storeToken(authToken);
    setCurrentUser(user);
  };

  const checkHasActiveSubscription = () => {
    if (!currentUser) return false;

    // remove the ai model api keys if the user is not having appsumo tier 2 or up license
    let priceId = currentUser?.stripePriceId;
    if (! priceId?.startsWith("appsumo-") || parseInt(priceId?.replace("appsumo-", "") || 0) <= 1) {
      cache.remove("ai-models-apiKeys");
    }
  
    if (currentUser?.team) return true;
    else if (
      currentUser?.proQueriesCount >= currentUser?.subscription?.proMaxQueries
    ) {
      const apiKeys = cache.get("ai-models-apiKeys");
      return apiKeys && Object.values(apiKeys).filter(Boolean).length > 0;
    } else if (
      new Date(currentUser?.stripeCurrentPeriodEnd).valueOf() < Date.now() &&
      new Date(currentUser?.subscription?.periodEnd).valueOf() < Date.now()
    )
      return false;
  
    return true;
  };

  return {
    currentUser,
    setCurrentUser,
    logIn,
    logOut,
    updateUser,
    googleLogin,
    hasActiveSubscription: checkHasActiveSubscription(),
  };
}