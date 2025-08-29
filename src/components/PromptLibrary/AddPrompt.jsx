import { useState } from "react";
import toast from "react-hot-toast";
import { useSetAtom } from "jotai";
import { useMediaQuery } from "react-responsive";

import apiClient from "@/lib/apiClient";
import CategoriesCombobox from "./CategoriesCombobox";
import { showOverlayLoadingAtom } from "@/config/state";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

let defaultFormData = {
  title: "",
  description: "",
  category: "",
  body: "",
};

function AddPrompt({ onNewPromptAdded = () => {} }) {
  const setShowOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [formData, setFormData] = useState(defaultFormData);

  const send = async () => {
    setShowOverlayLoading(true);

    const { data, ok } = await apiClient.post(
      "/prompts-library/save-prompt",
      formData
    );
    setShowOverlayLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to save prompt");

    setFormData(defaultFormData);
    onNewPromptAdded(data.newPrompt);
    toast.success("Prompt saved successfully");
  };

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 lg:col-span-4 text-left">
        <Label className="mb-2">Title</Label>
        <Input 
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="col-span-12 lg:col-span-8 text-left">
        <Label className="mb-2">Description</Label>
        <Input 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="col-span-12 lg:col-span-3 text-left">
        <CategoriesCombobox
          value={formData.category}
          onChange={(category) => setFormData({ ...formData, category })}
        />
      </div>

      <div className="col-span-12 text-left">
        <Label className="mb-2">Body</Label>
        <Textarea 
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          maxLength={5000}
          rows={isMobile ? 5 : 15}
        />
      </div>

      <div className="col-span-12 flex items-end justify-end pt-4">
        <Button className="px-6" onClick={send}>
          Save Prompt
        </Button>
      </div>
    </div>
  );
}

export default AddPrompt;
