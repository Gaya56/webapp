import { useMediaQuery } from "react-responsive";
import { useSetAtom } from "jotai";
import { Menu } from "lucide-react";

import { showSidebarAtom } from "@/config/state";

const PagePanel = (props) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const setShowSidebar = useSetAtom(showSidebarAtom);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-6 py-2 border-b">
        <span className="font-semibold text-lg">{props.title}</span>

        {isMobile && (
          <Menu
            className="cursor-pointer"
            size={25}
            onClick={() => setShowSidebar(true)}
          />
        )}
      </div>

      <div className="h-[95vh] overflow-auto">{props.children}</div>
    </div>
  );
};

export default PagePanel;
