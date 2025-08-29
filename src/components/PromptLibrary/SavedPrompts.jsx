import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bookmark, Copy, MousePointer2 } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

import apiClient from "@/lib/apiClient";
import Loading from "../Loading";
import { Input } from "../ui/input";

let prevQueryLength = 0;

function SavedPrompts({ onUse = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePrompts, setHasMorePrompts] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);

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

  const fetch = async (
    newPage = 1,
    search = "",
    shouldReset = true,
  ) => {
    setLoading(true);
    setCurrentPage(newPage);
    if (shouldReset) setPrompts([]);

    const { data, ok } = await apiClient.get(
      `/prompts-library/saved-prompts?page=${newPage}&search=${search}`
    );
    setLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to fetch prompts");

    if(!! data) {
      setPrompts((prev) => [...prev, ...data.prompts]);
      setHasMorePrompts(data.hasMore);
    }
  };

  const toggleSaved = async (prompt) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === prompt.id) {
          return { ...p, isSaved: !p.isSaved };
        }

        return p;
      }
    ));

    const { data, ok } = await apiClient.put(
      `/prompts-library/toggle-saved/${prompt.id}`
    );

    if (!ok) return toast.error(data?.error || "Failed to edit prompt");
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
        height={window.innerHeight - 300}
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

                <div className="flex gap-3">
                  <Copy
                    className="cursor-pointer text-gray-500"
                    onClick={() => {
                      navigator.clipboard.writeText(prompt.body);
                      toast.success("Prompt copied to clipboard");
                    }}
                    size={17}
                  />

                  {prompt.isSaved ? (
                    <Bookmark
                      className="cursor-pointer text-primary-blue fill-primary-blue"
                      size={18}
                      onClick={() => toggleSaved(prompt)}
                    />
                  ) : (
                    <Bookmark
                      className="cursor-pointer text-gray-500"
                      size={18}
                      onClick={() => toggleSaved(prompt)}
                    />
                  )}
                </div>
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
            {query.length ? "No prompts found." : "You have no saved prompts."}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}

export default SavedPrompts;
