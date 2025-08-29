import React from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import { X, Share } from "lucide-react";
import { useSetAtom } from "jotai";

import { showInstallAppSheetAtom } from "@/config/state";

const IOS = ({ visible }) => {
  const setShowInstallAppSheet = useSetAtom(showInstallAppSheetAtom);

  return (
    <BottomSheet
      open={visible}
      onDismiss={() => setShowInstallAppSheet(false)}
      snapPoints={({ minHeight }) => minHeight}
      header={
        <div className="flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-semibold">Install the app</h2>
          <button
            onClick={() => setShowInstallAppSheet(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
      }
    >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/img/logo-bg.png" alt="logo" className="rounded-xl" />
          </div>
          <div>
            <h3 className="font-semibold">Combochat</h3>
            <p className="text-sm text-gray-500">www.combochat.ai</p>
          </div>
        </div>
        
        <ol className="space-y-4">
          <li className="flex items-center space-x-2">
            <span className="font-semibold">1.</span>
            <span>Tap on</span>
            <Share className="text-blue-500" size={20} />
            <span>in the browser menu</span>
          </li>
          <li className="flex items-center space-x-2 line-clamp-1">
            <span className="font-semibold">2.</span>
            <span>Scroll down and select</span>
            <span className="font-semibold">Add to Home Screen</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-semibold">3.</span>
            <span>Look for the</span>
            <img src="/img/logo-bg.png" alt="logo" className="w-6 h-6 rounded" />
            <span>icon on your home screen</span>
          </li>
        </ol>
      </div>
    </BottomSheet>
  );
};

export default IOS;
