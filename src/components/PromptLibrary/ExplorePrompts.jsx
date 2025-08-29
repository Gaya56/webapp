import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bookmark, Copy, MousePointer2, Eye, ArrowLeft } from "lucide-react";

import apiClient from "@/lib/apiClient";
import Loading from "../Loading";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function ExplorePrompts({ onUse = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [groups, setGroups] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (selectedCategory) fetchPrompts();
  }, [selectedCategory]);

  const fetch = async () => {
    setLoading(true);

    const { data, ok } = await apiClient.get(`/prompts-library/explore-new`);
    setLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to fetch prompts");

    let newCategories = [];

    for (const group in data.groups) {
      for (let item of Object.values(data.groups[group])) {
        newCategories.push(...item);
      }
    }

    setGroups(data.groups);
    setCategories(newCategories);
  };

  const fetchPrompts = async () => {
    setLoading(true);

    const { data, ok } = await apiClient.get(
      `/prompts-library/explore-new/${selectedCategory.id}`
    );
    setLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to fetch prompts");

    setPrompts(data.prompts);
  };

  const toggleSaved = async (prompt) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.id === prompt.id) {
          return { ...p, isSaved: !p.isSaved };
        }

        return p;
      })
    );

    const { data, ok } = await apiClient.put(
      `/prompts-library/toggle-saved/${prompt.id}`
    );

    if (!ok) return toast.error(data?.error || "Failed to edit prompt");
  };

  const filterCategories = () => {
    if (selectedTags.length === 0 && !searchCategory) return categories;

    return categories.filter(
      (c) =>
        selectedTags.includes(c.tag.toLowerCase()) ||
        (searchCategory &&
          (c.name.toLowerCase().includes(searchCategory.toLowerCase()) ||
            c.tag.toLowerCase().includes(searchCategory.toLowerCase())))
    );
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-full py-44">
          <Loading className="text-black" />
        </div>
      ) : (
        <div className="overflow-y-auto custom-scrollbar h-[calc(100vh-10rem)]">
          {!selectedCategory ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.keys(groups).map((group) => (
                  <div key={group}>
                    <h2 className="text-xl font-semibold capitalize mb-3">
                      {group}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {Object.keys(groups[group]).map((tag) => (
                        <div key={tag}>
                          <Badge
                            variant={
                              selectedTags.includes(tag)
                                ? "outline-primary-blue"
                                : "outline"
                            }
                            className="capitalize cursor-pointer"
                            onClick={() =>
                              setSelectedTags((prev) =>
                                prev.includes(tag)
                                  ? prev.filter((t) => t !== tag)
                                  : [...prev, tag]
                              )
                            }
                          >
                            {tag}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 mb-4">
                <p className="mb-1 font-semibold">Search:</p>
                <Input
                  type="search"
                  placeholder="Search prompts..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {filterCategories().map((category) => (
                  <div
                    key={category.id}
                    className="p-4 border border-gray-00 rounded-lg"
                  >
                    <h2 className="text-lg font-medium capitalize mb-3">
                      {category.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {category.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="cursor-pointer">
                        {category.tag}
                      </Badge>

                      <Button
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Prompts
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="overflow-y-auto custom-scrollbar">
              <div className="flex items-center mb-6">
                <ArrowLeft
                  className="w-6 h-6 mr-4 cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                />

                <h2 className="text-xl font-semibold capitalize">
                  {selectedCategory.name}
                </h2>
              </div>

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
                      </p>

                      <div className="flex gap-3">
                        <Eye
                          className="cursor-pointer text-gray-500"
                          onClick={() =>
                            setSelectedPrompt({ shouldShow: true, prompt })
                          }
                          size={19}
                        />

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
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!selectedPrompt?.shouldShow}
        onOpenChange={() =>
          setSelectedPrompt({ ...selectedPrompt, shouldShow: false })
        }
      >
        <DialogContent className="!max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.prompt?.title}</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-gray-500 text-[14px]">
              {selectedPrompt?.prompt?.body}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExplorePrompts;
