import React from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import { X } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";

import { installPromptAtom, showInstallAppSheetAtom } from "@/config/state";

const VoilaInstallSheetLight = ({ visible }) => {
  const setShowInstallAppSheet = useSetAtom(showInstallAppSheetAtom);
  const [installPrompt, setInstallPrompt] = useAtom(installPromptAtom);

  const handleInstallClick = () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setInstallPrompt(null);
      }
    });
  };

  return (
    <BottomSheet
      open={visible}
      onDismiss={() => setShowInstallAppSheet(false)}
      snapPoints={({ minHeight }) => minHeight}
      expandOnContentDrag={true}
      className="z-50"
    >
      <div className="bg-white rounded-t-3xl shadow-lg px-6 pt-4 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Install the app
          </h2>
          <button
            onClick={() => setShowInstallAppSheet(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-100 rounded-xl p-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <img src="/img/logo-bg.png" alt="logo" className="rounded-lg" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">Combochat</h3>
              <p className="text-sm text-gray-500">www.combochat.ai</p>
            </div>
          </div>
        </div>

        <div
          className="bg-blue-50 rounded-xl py-20 flex items-center justify-center space-x-3 border-2 border-dashed border-blue-300"
          onClick={handleInstallClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="text-blue-700 font-semibold">Tap to install</span>
        </div>
      </div>
    </BottomSheet>
  );
};

export default VoilaInstallSheetLight;
