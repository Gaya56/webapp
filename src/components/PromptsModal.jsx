import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyPrompts from "@/components/PromptLibrary/MyPrompts";
import ExplorePrompts from "@/components/PromptLibrary/ExplorePrompts";
import SavedPrompts from "@/components/PromptLibrary/SavedPrompts";
import AddPrompt from "@/components/PromptLibrary/AddPrompt";
import {
  activePromptAtom,
  currentUserAtom,
  showAuthModalAtom,
} from "@/config/state";

function PromptsModal({ open, onClose = () => {} }) {
  const setActivePrompt = useSetAtom(activePromptAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const setShowAuthModal = useSetAtom(showAuthModalAtom);

  const [activeTab, setActiveTab] = useState("explore");

  useEffect(() => {
    if (open && !currentUser) {
      onClose();
      setShowAuthModal(true);
    }
  }, [open]);

  const handleUsePrompt = (prompt) => {
    setActivePrompt({
      ...prompt,
      tone: "formal",
      style: "conversational",
      language: "English",
    });
    onClose();
  };

  if (!currentUser) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setTimeout(() => {
          setActiveTab("explore");
        }, 500);

        onClose();
      }}
    >
      <DialogContent
        className="!max-w-[95%] md:!max-w-[90%]"
        showCloseButton={false}
      >
        <DialogHeader>
          {/* <DialogTitle className="mb-3">Prompts Library</DialogTitle> */}

          <Tabs
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full mb-4 bg-background rounded-none border-b border-zinc-200 dark:border-zinc-900">
              <TabsTrigger
                className="w-full pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black"
                value="explore"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger
                className="w-full pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black"
                value="my-prompts"
              >
                My Prompts
              </TabsTrigger>
              <TabsTrigger
                className="w-full pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black"
                value="saved-prompts"
              >
                Saved Prompts
              </TabsTrigger>
              <TabsTrigger
                className="w-full pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black"
                value="add-prompt"
              >
                Add
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore">
              <ExplorePrompts onUse={handleUsePrompt} />
            </TabsContent>
            <TabsContent value="my-prompts">
              <MyPrompts onUse={handleUsePrompt} />
            </TabsContent>
            <TabsContent value="saved-prompts">
              <SavedPrompts onUse={handleUsePrompt} />
            </TabsContent>
            <TabsContent value="add-prompt">
              <AddPrompt />
            </TabsContent>
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default PromptsModal;
