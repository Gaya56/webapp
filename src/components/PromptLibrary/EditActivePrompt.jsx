import { useEffect } from "react";
import { useAtom } from "jotai";
import toast from "react-hot-toast";

import { activePromptAtom } from "@/config/state";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function EditActivePrompt({ visible = false, onClose = () => {} }) {
  const [activePrompt, setActivePrompt] = useAtom(activePromptAtom);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    setFormData({
      body: activePrompt?.body,
    });
  }, [visible, activePrompt]);

  const edit = () => {
    if (formData.body.length < 10)
      return toast.error("Prompt body must be at least 10 characters");

    setActivePrompt({
      ...activePrompt,
      body: formData?.body,
    });
    onClose();
  };

  if (!activePrompt) return null;

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="!max-w-7xl">
        <DialogHeader>
          <DialogTitle className="mb-3">Edit Prompt</DialogTitle>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <Label className="mb-2">Prompt Body</Label>
              <Textarea
                value={formData?.body || ""}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                maxLength={5000}
                rows={15}
              />
            </div>

            <div className="col-span-12 flex items-end justify-end pt-4">
              <Button className="px-6" onClick={edit}>
                Edit Prompt
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default EditActivePrompt;
