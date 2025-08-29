import { useAtom, useSetAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { CustomDialog } from "@/components/ui/dialog";
import { showFreeTrialModalAtom, showPremiumModalAtom } from "@/config/state";

export function FreeTrialModal() {
  const [isOpen, setIsOpen] = useAtom(showFreeTrialModalAtom);
  const setShowPremiumModal = useSetAtom(showPremiumModalAtom);

  const handleRedirect = () => {
    // window.location.href = "https://www.combochat.ai/onboarding/pricing";
    setShowPremiumModal(true);
    setIsOpen(false);
  };

  return (
    <CustomDialog open={isOpen} className="max-w-md" showCloseButton={false}>
      <div>
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
          Free Trial Required
        </h3>

        <p className="mb-6 text-center text-gray-600">
          To access all features and continue using our platform, you need to
          start your free trial subscription.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRedirect}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
}

export default FreeTrialModal;
