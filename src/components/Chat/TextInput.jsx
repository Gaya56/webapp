import React, { useCallback, useImperativeHandle, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/shadcn";

const TextInput = React.forwardRef((props, ref) => {
  const {
    className,
    value = "",
    onValueChange,
    minRows = 1,
    formref,
    disabled,
    ...textareaProps
  } = props;

  const inputRef = useRef(null);

  useImperativeHandle(ref, () => inputRef.current);

  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        if (e.shiftKey) {
          const pos = inputRef.current?.selectionStart || 0;
          onValueChange(`${value.slice(0, pos)}\n${value.slice(pos)}`);
          setTimeout(() => {
            inputRef.current.setSelectionRange(pos + 1, pos + 1);
          }, 0);
        } else if (!disabled) {
          formref?.current?.requestSubmit();
        }
      }
    },
    [disabled, formref, onValueChange, value]
  );

  return (
    <TextareaAutosize
      ref={inputRef}
      className={cn(
        "resize-none overflow-x-hidden overflow-y-auto w-full outline-none text-sm text-primary-text scrollbar-thin bg-background",
        disabled && "cursor-wait",
        className
      )}
      onKeyDown={onKeyDown}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      autoComplete="off"
      minRows={minRows}
      maxRows={5}
      {...textareaProps}
    />
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
