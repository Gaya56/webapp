import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, MousePointer2, PencilLine, Trash2 } from "lucide-react";
import { useSetAtom } from "jotai";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import apiClient from "@/lib/apiClient";
import Loading from "../Loading";
import { Input } from "../ui/input";
import { showOverlayLoadingAtom } from "@/config/state";
import EditPrompt from "./EditPrompt";

let prevQueryLength = 0;

function MyPrompts({ onUse = () => {} }) {
  const setShowOverlayLoading = useSetAtom(showOverlayLoadingAtom);

  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePrompts, setHasMorePrompts] = useState(false);
  const [removedPrompt, setRemovedPrompt] = useState(null);
  const [query, setQuery] = useState("");
  const [editedPrompt, setEditedPrompt] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (query.length <= 2 && prevQueryLength > 2) fetch();
    prevQueryLength = query.length;

    if (query.length > 2 && query.length < 50) {
      setLoading(true);
      setPrompts([]);

      const delayDebounceFn = setTimeout(() => {
        fetch(1, query);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [query]);

  const fetch = async (newPage = 1, search = "", shouldReset = true) => {
    setLoading(true);
    setCurrentPage(newPage);
    if (shouldReset) setPrompts([]);

    const { data, ok } = await apiClient.get(
      `/prompts-library/my-prompts?page=${newPage}&search=${search}`
    );
    setLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to fetch prompts");

    if(!! data) {
      setPrompts((prev) => [...prev, ...data.prompts]);
      setHasMorePrompts(data.hasMore);
    }
  };

  const remove = async () => {
    setShowOverlayLoading(true);

    const { ok } = await apiClient.delete(
      `/prompts-library/remove-prompt?id=${removedPrompt.id}`
    );
    setShowOverlayLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to remove prompt");

    setPrompts((prev) => prev.filter((p) => p.id !== removedPrompt.id));
    toast.success("Prompt removed successfully");
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Input
          type="search"
          placeholder="Search prompts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <InfiniteScroll
        dataLength={prompts.length}
        next={() => {
          fetch(currentPage + 1, query, false);
        }}
        hasMore={hasMorePrompts}
        className="custom-scrollbar"
        height={window.innerHeight - 350}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-3 w-full">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 border border-gray-00 rounded-md"
            >
              <div className="flex justify-between items-center mb-1">
                <p>
                  <span className="font-bold text-primary-blue">
                    {prompt.title}
                  </span>
                  <small className="ml-2 capitalize">
                    ({prompt.category.name})
                  </small>
                </p>

                <Copy
                  className="w-4 h-4 cursor-pointer text-gray-500"
                  onClick={() => {
                    navigator.clipboard.writeText(prompt.body);
                    toast.success("Prompt copied to clipboard");
                  }}
                />
              </div>

              <p className="text-gray-500 text-[14px] line-clamp-2">
                {prompt.description}
              </p>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="flex items-center gap-2 bg-primary-blue text-white text-sm pl-3 pr-3.5 py-2 rounded-md"
                  onClick={() => onUse(prompt)}
                >
                  <MousePointer2 className="w-4 h-4" />
                  Use
                </button>

                <button
                  className="flex items-center gap-2 bg-gray-600 text-white text-sm pl-3 pr-3.5 py-2 rounded-md"
                  onClick={() => {
                    setEditedPrompt({
                      ...prompt,
                      category: prompt.category.name,
                    });
                  }}
                >
                  <PencilLine className="w-4 h-4" />
                  Edit
                </button>

                <button
                  className="flex items-center gap-2 bg-red-500 text-white text-sm pl-3 pr-3.5 py-2 rounded-md"
                  onClick={() => setRemovedPrompt(prompt)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center h-[90%] items-center">
            <Loading className="text-center" />
          </div>
        )}

        {!prompts.length && !loading && (
          <div className="text-gray-500 h-[90%] flex items-center justify-center">
            {query.length ? "No prompts found." : "You have no prompts."}
          </div>
        )}
      </InfiniteScroll>

      <AlertDialog
        open={!!removedPrompt}
        onOpenChange={() => setRemovedPrompt(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              prompt from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPrompt
        editedPrompt={editedPrompt}
        onClose={() => setEditedPrompt(null)}
        onEdited={(newPrompt) => {
          setPrompts((prev) =>
            prev.map((p) => (p.id === newPrompt.id ? newPrompt : p))
          );
          setEditedPrompt(null);
        }}
      />
    </div>
  );
}

export default MyPrompts;
