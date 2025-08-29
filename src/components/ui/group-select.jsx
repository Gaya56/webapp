import { Fragment, useId, useState, useRef, useEffect } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";

export default function GroupSelect({ groups, label, value, onChange }) {
  const id = useId();
  const buttonRef = useRef(null);
  const commandRef = useRef(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        (!commandRef.current || !commandRef.current.contains(e.target))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Button
          ref={buttonRef}
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="bg-background hover:bg-background focus-visible:border-ring/40 outline-ring/8 dark:outline-ring/12 w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]"
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <img
                src={
                  groups
                    .map((group) =>
                      group.items.find((item) => item.value === value)
                    )
                    .filter(Boolean)[0]?.img
                }
                alt={value}
                className="w-4 h-4"
              />

              <span className="truncate">{value}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select option</span>
          )}

          <ChevronDownIcon
            size={16}
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={commandRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                marginTop: "8px",
                zIndex: 50,
              }}
              className="border-input bg-popover text-popover-foreground shadow-md rounded-md border capitalize"
            >
              <Command>
                <CommandInput placeholder="Search option..." />

                <CommandList>
                  <CommandEmpty>No option found.</CommandEmpty>
                  {groups.map((group) => (
                    <Fragment key={group.title}>
                      <CommandGroup heading={group.title}>
                        {group.items.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              onChange(option.id);
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <span className="text-lg leading-none">
                              <img
                                src={option.img}
                                alt={option.value}
                                className="w-4 h-4 mr-2"
                              />
                            </span>{" "}
                            {option.value}
                            {value === option.value && (
                              <CheckIcon size={16} className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Fragment>
                  ))}
                </CommandList>
              </Command>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
