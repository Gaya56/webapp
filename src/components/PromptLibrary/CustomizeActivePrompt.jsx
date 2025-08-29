import { useAtom } from "jotai";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

import { activePromptAtom } from "@/config/state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { languages, tones, styles } from "@/config/prompt";
import EditActivePrompt from "./EditActivePrompt";

function CustomizeActivePrompt() {
  const [activePrompt, setActivePrompt] = useAtom(activePromptAtom);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handlePromptChange = (key, value) => {
    setActivePrompt((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex items-center text-sm gap-4 border rounded-lg p-2 border-gray-200 mt-2">
      <div className="flex flex-col w-full">
        <div className="flex w-full justify-between mb-0.5">
          <p className="font-bold line-clamp-1">{activePrompt.title}</p>

          <div className="flex items-center gap-2">
            <Edit
              size={16}
              className="cursor-pointer text-primary-blue"
              onClick={() => setIsEditDialogOpen(true)}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Trash2
                  size={16}
                  className="cursor-pointer text-red-500"
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will remove the active prompt. You can't undo
                    this action.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setActivePrompt(null)}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-1">
          {activePrompt.description}
        </p>
      </div>

      {/* display prompt inputs which are tone and style and language */}
      <div className="flex gap-2">
        <div>
          <p className="text-[12px]">Tone</p>
          <Select
            value={activePrompt.tone || "formal"}
            onValueChange={(value) => handlePromptChange("tone", value)}
          >
            <SelectTrigger className="!w-32 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem className="capitalize" key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p>Style</p>
          <Select
            value={activePrompt.style || "conversational"}
            onValueChange={(value) => handlePromptChange("style", value)}
          >
            <SelectTrigger className="!w-40 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => (
                <SelectItem
                  className="capitalize"
                  key={style}
                  value={style}
                >
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p>Language</p>
          <Select
            value={activePrompt.language || "English"}
            onValueChange={(value) => handlePromptChange("language", value)}
          >
            <SelectTrigger className="!w-40 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem
                  className="capitalize"
                  key={language}
                  value={language}
                >
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <EditActivePrompt
        visible={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
}

export default CustomizeActivePrompt;
