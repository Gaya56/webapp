import { Link, useLocation } from "react-router-dom";
import { useSetAtom } from "jotai";

import { cn } from "@/lib/shadcn";
import { showDownloadExtensionModalAtom, showSidebarAtom, themeAtom } from "@/config/state";

function MenuItem(props) {
  const { text, icon, iconOnly, to, disabled, ...linkProps } = props;

  const location = useLocation();
  const setShowDownloadExtensionModal = useSetAtom(showDownloadExtensionModalAtom);
  const setShowSidebar = useSetAtom(showSidebarAtom);

  const onDisabledClick = (e) => {
    e.preventDefault();
    setShowDownloadExtensionModal(true);
  };

  if (disabled) {
    return (
      <span
        className={cn(
          "w-full px-3 flex flex-row items-center shrink-0 py-[8px] rounded-xl text-gray-500 hover:text-gray-600 opacity-65 cursor-pointer",
          iconOnly && "justify-center"
        )}
        onClick={onDisabledClick}
      >
        {!!icon && <img src={icon} className="w-[1rem] h-[1rem]" />}

        {!iconOnly && <p className="font-medium text-[12.5px] ml-3">{text}</p>}
      </span>
    );
  }

  return (
    <Link
      title={text}
      className={cn(
        "w-full px-3 flex flex-row items-center shrink-0 py-[7px] rounded-xl text-gray-500 hover:text-gray-600",
        iconOnly && "justify-center",
        location.pathname == to && "bg-blue-50 dark:bg-blue-800/20 text-blue-700"
      )}
      to={to}
      onClick={() => setShowSidebar(false)}
      {...linkProps}
    >
      {!!icon && <img src={icon} className="w-[0.9rem] h-[0.9rem]" />}

      {!iconOnly && <p className="font-medium text-[11.5px] ml-3 line-clamp-1">{text}</p>}
    </Link>
  );
}

export default MenuItem;
