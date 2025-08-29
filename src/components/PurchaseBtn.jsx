import { useSetAtom } from "jotai";

import starIcon from "@/assets/svg/star.svg";
import { showAuthModalAtom, showPremiumModalAtom } from "@/config/state";
import useAuth from "@/hooks/useAuth";

const PurchaseBtn = ({ text }) => {
  const setShowAuthModal = useSetAtom(showAuthModalAtom);
  const setShowPremiumModal = useSetAtom(showPremiumModalAtom);
  const { currentUser } = useAuth();

  return (
    <button
      className="w-full"
      onClick={() => {
        if (!currentUser) return setShowAuthModal(true);

        return setShowPremiumModal(true);
      }}
    >
      <div className="flex justify-center items-center gap-[10px] rounded-[10px] px-4 py-2.5 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500">
        <img src={starIcon} className="w-[16px] h-[16px]" />

        {!!text && (
          <span className="text-white text-xs mb-0.5 mr-1">{text}</span>
        )}
      </div>
    </button>
  );
};

export default PurchaseBtn;
