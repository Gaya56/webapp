import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import VerificationInput from "react-verification-input";
import Cookies from "js-cookie";
import { usePostHog } from "posthog-js/react";

import { showAuthModalAtom } from "@/config/state";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import apiClient from "@/lib/apiClient";
import useAuth from "@/hooks/useAuth";
import { CustomDialog } from "./ui/dialog";

const AuthModal = () => {
  const { googleLogin, logIn } = useAuth();
  const posthog = usePostHog();

  const [open, setOpen] = useAtom(showAuthModalAtom);

  const [formValues, setFormValues] = useState({
    email: "",
    verifyCode: "",
  });
  const [showVerifyCodeForm, setShowVerifyCodeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) posthog?.capture("visit-signup");
  }, [open]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!formValues.email) {
      setLoading(false);
      return toast.error("Email is required");
    }

    const { data, ok } = await apiClient.post("/custom-auth/code/send", {
      email: formValues.email,
    });
    setLoading(false);

    if (!ok)
      return toast.error(data?.message || data?.error || "An error occurred");

    setShowVerifyCodeForm(true);
  };

  const checkVerficationCode = async (code) => {
    if (!code) return toast.error("Please enter the verification code");

    setLoading(true);

    // check for referral code
    const referralCode = Cookies.get("cp-referralCode");
    const { data, ok } = await apiClient.post("/custom-auth/code/check", {
      ...formValues,
      verifyCode: code,
      referralCode: referralCode || undefined,
    });
    setLoading(false);

    if (!ok)
      return toast.error(data?.error || data || "An unknown error occurred");

    setShowVerifyCodeForm(false);
    setFormValues({
      ...formValues,
      verifyCode: "",
    });
    logIn(data);
    setOpen(false);
  };

  function ChromeIcon(props) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.64 9.20456C17.64 8.56637 17.5827 7.95274 17.4764 7.36365H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20456Z"
          fill="#4285F4"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
          fill="#34A853"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9.00001C3.68182 8.40683 3.78409 7.83001 3.96409 7.29001V4.95819H0.957273C0.347727 6.17319 0 7.54774 0 9.00001C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
          fill="#FBBC05"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  return (
    <CustomDialog
      title=""
      className="!max-w-[80%] md:!max-w-md"
      open={!!open}
      onOpenChange={() => setOpen(false)}
      canClose={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 2xl:gap-12">
        <div>
          <h2 className="text-xl font-extrabold">
            Sign in to continue
          </h2>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
            {showVerifyCodeForm
              ? `Enter the code we sent to ${formValues.email}`
              : "Join 38,907+ users comparing AI models"}
          </p>

          <form action="#" className="mt-8" method="POST">
            {!showVerifyCodeForm ? (
              <>
                <button
                  className="flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 text-sm w-full mt-4"
                  onClick={async () => {
                    googleLogin();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loading className="text-black" />
                  ) : (
                    <>
                      <ChromeIcon className="mr-3" />
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative flex items-center py-2 my-5">
                  <div className="flex-grow border-t border-zinc-300" />
                  <span className="mx-4 flex-shrink text-sm text-zinc-500">
                    Or continue with email
                  </span>

                  <div className="flex-grow border-t border-zinc-300" />
                </div>

                <Input
                  type="email"
                  className="w-full"
                  placeholder="name@example.com"
                  name="email"
                  value={formValues.email}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      email: e.target.value,
                    });
                  }}
                  disabled={loading}
                  required
                />

                <button
                  className="flex justify-center px-4 py-2 rounded-lg bg-primary-blue text-sm w-full text-white mt-4"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <Loading /> : "Send Verification Code"}
                </button>
              </>
            ) : (
              <>
                <VerificationInput
                  length={4}
                  classNames={{
                    character:
                      "rounded-xl outline-none border-2 flex items-center justify-center py-12",
                    characterSelected: "!border-primary",
                    characterInactive: "border-none",
                    characterFilled: "border-gray-300",
                    container: "w-full",
                  }}
                  validChars="0987654321"
                  placeholder=""
                  value={formValues.verifyCode}
                  onChange={(value) =>
                    setFormValues({
                      ...formValues,
                      verifyCode: value,
                    })
                  }
                  onComplete={checkVerficationCode}
                />

                <div className="flex justify-center">
                  <p
                    className="text-sm text-zinc-500 mt-20 underline cursor-pointer"
                    onClick={() => {
                      setShowVerifyCodeForm(false);
                      setFormValues({
                        ...formValues,
                        verifyCode: "",
                      });
                    }}
                  >
                    Use a Different Email
                  </p>
                </div>

                <button
                  className="flex justify-center px-4 py-2 rounded-lg bg-primary-blue text-sm w-full text-white mt-8"
                  onClick={() => checkVerficationCode(formValues.verifyCode)}
                  disabled={loading}
                >
                  {loading ? <Loading /> : "Submit Verification Code"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </CustomDialog>
  );
};

export default AuthModal;
