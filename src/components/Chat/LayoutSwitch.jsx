import { useMediaQuery } from "react-responsive";
import { useAtomValue, useSetAtom } from "jotai";

import { cn } from "@/lib/shadcn";
import { showDownloadExtensionModalAtom, themeAtom } from "@/config/state";

const Item = (props) => {
  const setShowDownloadExtensionModal = useSetAtom(
    showDownloadExtensionModalAtom
  );

  const theme = useAtomValue(themeAtom);

  if (props.disabled) return null;

  return (
    <a
      className={cn(
        !!props.active && "rounded-[6px]",
        props.disabled && "opacity-30 cursor-not-allowed"
      )}
      onClick={() => {
        if (props.disabled) return setShowDownloadExtensionModal(true);

        props.onClick();
      }}
    >
      <div className="w-7 h-7 cursor-pointer mb-1">
        <div className="scale-90">{Icon(props.icon, props.active, theme)}</div>
      </div>
    </a>
  );
};

const Icon = (icon, active, theme) => {
  let color = active ? "#000000" : "#9d9d9d";

  if (theme === "dark") {
    color = active ? "#ffffff" : "#9d9d9d";
  }

  const isMobile = useMediaQuery({ maxWidth: 767 });

  if (icon == "layout-one") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="7"
          width="22"
          height="18"
          rx="3"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (icon == "layout-two") {
    if (isMobile) {
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="7"
            width="22"
            height="18"
            rx="3"
            stroke={color}
            strokeWidth="2"
          />
          <line x1="27" y1="16" x2="5" y2="16" stroke={color} strokeWidth="2" />
        </svg>
      );
    }

    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="7"
          width="22"
          height="18"
          rx="3"
          stroke={color}
          strokeWidth="2"
        />
        <line x1="16" y1="7" x2="16" y2="25" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  if (icon == "layout-three") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="7"
          width="22"
          height="18"
          rx="3"
          stroke={color}
          strokeWidth="2"
        />
        <line x1="12" y1="7" x2="12" y2="25" stroke={color} strokeWidth="2" />
        <line x1="20" y1="6" x2="20" y2="24" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  if (icon == "layout-four") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="7"
          width="22"
          height="18"
          rx="3"
          stroke={color}
          strokeWidth="2"
        />
        <line x1="16" y1="7" x2="16" y2="25" stroke={color} strokeWidth="2" />
        <line x1="27" y1="16" x2="5" y2="16" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  if (icon == "layout-six") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="7"
          width="22"
          height="18"
          rx="3"
          stroke={color}
          strokeWidth="2"
        />
        <line x1="27" y1="16" x2="5" y2="16" stroke={color} strokeWidth="2" />
        <line x1="12" y1="7" x2="12" y2="25" stroke={color} strokeWidth="2" />
        <line x1="20" y1="6" x2="20" y2="24" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  if (icon == "layout-image-input") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Frame 28">
          <g id="Group 29">
            <rect
              id="Rectangle 34"
              x="5"
              y="9"
              width="20"
              height="16"
              rx="3"
              stroke={color}
              strokeWidth="2"
            />
            <path
              id="Rectangle 35"
              d="M7 9.5V9.5C7 7.567 8.567 6 10.5 6H24C26.2091 6 28 7.79086 28 10V20C28 21.6569 26.6569 23 25 23V23"
              stroke={color}
              strokeWidth="2"
            />
            <circle
              id="Ellipse 6"
              cx="10.5"
              cy="14.5"
              r="2"
              stroke={color}
              strokeWidth="2"
            />
            <path
              id="Vector 1"
              d="M11 25L15.5488 17.6714C16.3209 16.4274 18.1242 16.4075 18.9236 17.6341L23 23.8889"
              stroke={color}
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    );
  }

  return null;
};

const LayoutSwitch = (props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="flex flex-row items-center gap-2 rounded-lg md:mr-2 pl-2 pr-3 border border-zinc-200 dark:border-zinc-800 h-fit py-0.5">
      <Item
        icon="layout-one"
        active={props.layout === 1}
        onClick={() => props.onChange(1)}
        disabled={!isMobile}
      />

      <Item
        icon="layout-two"
        active={props.layout === 2}
        onClick={() => props.onChange(2)}
      />

      <Item
        icon="layout-three"
        active={props.layout === 3}
        onClick={() => props.onChange(3)}
        disabled={isMobile}
      />

      <Item
        icon="layout-four"
        active={props.layout === 4}
        onClick={() => props.onChange(4)}
        disabled={isMobile}
      />

      <Item
        icon="layout-six"
        active={props.layout === 6}
        onClick={() => props.onChange(6)}
        disabled={isMobile}
      />

      <Item
        icon="layout-image-input"
        active={props.layout === "imageInput"}
        onClick={() => props.onChange("imageInput")}
        disabled={isMobile}
      />
    </div>
  );
};

export default LayoutSwitch;
