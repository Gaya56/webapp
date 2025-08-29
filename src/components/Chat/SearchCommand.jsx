import React, { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import apiClient from "@/lib/apiClient";

export default function SearchCommand({ open, setOpen, className, aiModel, onSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSearch("");
        setChats([]);
      }, 500);
    }
  }, [open]);

  useEffect(() => {
    setLoading(!!search.trim());
    setChats([]);

    const debounceTimer = setTimeout(() => {
      if (open && search.trim()) {
        searchChats();
      }
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [search, open]);

  const searchChats = async () => {
    if (!search.trim()) {
      setChats([]);
      return;
    }

    setLoading(true);
    const { data, ok } = await apiClient.get(
      `/chat-history/chats/search?q=${search}&aiModel=${aiModel}`
    );
    setLoading(false);

    if (!ok) {
      toast.error("Failed to search chats");
      return;
    }

    setChats(data.chats || []);
  };

  const handleSelectChat = (chat) => {
    onSelect(chat)
    setOpen(false);
  };

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        <SearchIcon className="text-gray-500 " size={18} aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] p-0">
          <div className="flex items-center border-b p-4">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              className="flex h-6 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/90 focus-visible:ring-0 shadow-none"
              placeholder="Type a command or search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[300px] overflow-auto p-0">
            {chats.length > 0 && (
              <div className="px-3 py-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Chats
                </h4>
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat._id}
                      className="flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => handleSelectChat(chat)}
                    >
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2" />
                      <span className="line-clamp-1">{chat.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!chats.length && !loading && !!search && (
              <div className="flex items-center justify-center pt-10 pb-12 mr-2 text-muted-foreground/70 text-xs">
                No chats found
              </div>
            )}

            {(!search || loading) && !chats.length && (
              <div className="flex items-center justify-center pt-10 pb-12 mr-2 text-muted-foreground/70 text-xs">
                {!search ? (
                  "Start typing to search..."
                ) : (
                  <Loading className="text-black" />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
