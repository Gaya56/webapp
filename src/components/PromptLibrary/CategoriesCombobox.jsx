import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/shadcn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "../ui/label";
import apiClient from "@/lib/apiClient";
import Loading from "../Loading";

export default function CategoriesCombobox({ value, onChange = () => {} }) {
  const buttonCtnRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [popoverWidth, setPopoverWidth] = useState(200);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPopoverWidth(entry.contentRect.width);
      }
    });

    if (buttonCtnRef.current) resizeObserver.observe(buttonCtnRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (query.length > 2 && query.length < 50) {
      setLoading(true);

      const delayDebounceFn = setTimeout(() => {
        search(query);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setCategories([]);
      setLoading(false);
    }
  }, [query]);

  const search = async () => {
    setLoading(true);
    setCategories([]);

    const { data, ok } = await apiClient.post(
      "/prompts-library/search-categories",
      {
        name: query,
      }
    );
    setLoading(false);

    if (!ok) return toast.error(data?.error || "Failed to fetch categories");

    setCategories(data.categories);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full mt-1">
        <div
          ref={buttonCtnRef}
          className="flex flex-col items-start"
        >
          <Label className="mb-1.5">Category</Label>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || "Select Category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="!p-0"
        style={{
          width: popoverWidth,
        }}
      >
        <Command>
          <CommandInput
            placeholder="Search category..."
            value={query}
            onValueChange={(val) => setQuery(val)}
          />
          <CommandList>
            <CommandEmpty>
              {loading && (
                <div className="h-24 flex justify-center items-center">
                  <Loading />
                </div>
              )}
              {!loading && !categories.length && (
                <p className="py-10">No categories found.</p>
              )}
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    onChange(currentValue);

                    setTimeout(() => {
                      setQuery("");
                    }, 500);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === category.name.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
