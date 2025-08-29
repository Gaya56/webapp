import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMediaQuery } from "react-responsive";
import {
  Settings,
  PlusIcon,
  LifeBuoyIcon,
  DollarSign,
  Sun,
  Moon,
  InfoIcon,
} from "lucide-react";
import moment from "moment";

import aiPlaygroundIcon from "@/assets/icons/all-in-one.png";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/shadcn";
import {
  currentUserAtom,
  showPremiumModalAtom,
  showSidebarAtom,
  showSupportModalAtom,
  sidebarCollapsedAtom,
  themeAtom,
} from "@/config/state";
import MenuItem from "./MenuItem";
import { activeBotsAtom, ALL_BOTS } from "@/config/chatbots";
import useAuth from "@/hooks/useAuth";
import PurchaseBtn from "../PurchaseBtn";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

function Sidebar() {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { hasActiveSubscription } = useAuth();

  const setShowSupportModal = useSetAtom(showSupportModalAtom);
  const showLimitReachedModal = useAtomValue(showPremiumModalAtom);
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);
  const activeBots = useAtomValue(activeBotsAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <AnimatePresence>
      {(!isMobile || showSidebar) && (
        <>
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black z-20"
              onClick={() => setShowSidebar(false)}
            />
          )}

          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "flex flex-col border border-zinc-200 dark:!border-zinc-800 left-0 top-0 bg-background",
              isMobile ? "fixed" : "relative",
              collapsed ? "items-center px-[15px] w-24" : "w-[202px] px-3",
              !showLimitReachedModal && "z-30"
            )}
            style={{ height: "calc(var(--vh, 1vh) * 100)" }}
          >
            <div
              className={cn(
                "flex gap-3 items-center px-2 py-3 border rounded-lg mt-4",
                collapsed ? "flex-col-reverse" : "flex-row justify-between"
              )}
            >
              <div className="flex items-center w-full">
                {collapsed ? (
                  <img
                    src={currentUser?.teamLogo || logo}
                    className="w-[35px] rounded"
                  />
                ) : (
                  <img
                    src={currentUser?.teamLogo || logo}
                    className="w-[30px] mr-2 rounded"
                  />
                )}

                {!collapsed && (
                  <p className="text-[13px] font-bold">
                    {currentUser?.teamName || "Combochat.ai"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-3 overflow-y-auto scrollbar-none">
              <p
                className={cn(
                  "uppercase text-gray-500 mb-2 font-medium",
                  collapsed ? "text-[10px]" : "text-[11px]"
                )}
              >
                Primary
              </p>

              <MenuItem
                to="/"
                text={"ComboChat"}
                icon={aiPlaygroundIcon}
                iconOnly={collapsed}
              />

              <p
                className={cn(
                  "uppercase text-gray-500 mt-3 mb-2 font-medium",
                  collapsed ? "text-[10px]" : "text-[11px]"
                )}
              >
                Individual Ai Models
              </p>

              {activeBots.map(({ botId, bot, group }) => (
                <MenuItem
                  key={botId}
                  to={
                    group == "image"
                      ? `/generate-image/${botId}`
                      : `/chat/${botId}`
                  }
                  text={bot.name}
                  icon={bot.avatar}
                  iconOnly={collapsed}
                />
              ))}

              {activeBots.length < ALL_BOTS.length &&
                (collapsed ? (
                  <div
                    className="flex items-center justify-center"
                    title="Pin More Models"
                  >
                    <Link
                      to="/settings"
                      className="flex items-center justify-center p-2 border rounded-lg mt-2 bg-gray-100 dark:bg-gray-800"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/settings"
                    className="flex items-center justify-center py-2 border rounded-lg mt-2 bg-gray-100 dark:bg-gray-800"
                  >
                    <PlusIcon className="w-4 h-4 mr-2 mb-[0.5px]" />
                    <p className="text-gray-500 text-[12px] font-medium">
                      Pin More Models
                    </p>
                  </Link>
                ))}
            </div>

            <div className="mt-auto pt-2">
              {!collapsed ? (
                <>
                  {!hasActiveSubscription ? (
                    <PurchaseBtn text="Upgrade Account" />
                  ) : (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-2 text-sm">
                      <div className="text-center text-xs mb-3">
                        <span className="dark:text-zinc-400">
                          Monthly Usage
                        </span>
                      </div>

                      {currentUser?.subscription?.name == "free-trial" && (
                        <div className="-mt-1 mb-2 bg-amber-100 rounded-lg py-1 px-2 flex justify-between items-center text-xs">
                          <p className="text-amber-600">Free Trial</p>

                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger className="cursor-pointer">
                              <InfoIcon className="w-3.5 h-3.5 text-amber-600" />
                            </HoverCardTrigger>

                            <HoverCardContent
                              side="top"
                              className="text-center"
                            >
                              <p className="text-xs mb-2">
                                Free trial will end on:
                              </p>

                              <p className="text-xs font-bold">
                                {moment(
                                  currentUser?.subscription?.periodEnd
                                ).format("DD MMMM YYYY - hh:mm A")}
                              </p>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}

                      <div className="flex justify-between text-xs">
                        <span className="dark:text-zinc-400">Advanced:</span>
                        <span className="font-bold dark:text-zinc-400">
                          {currentUser?.proQueriesCount || 0} /{" "}
                          {currentUser?.subscription?.proMaxQueries || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col mt-4">
                    <a
                      href="https://combochat.tolt.io"
                      target="_blank"
                      className="flex items-center h-full"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-gray-500" />

                      <p className="text-[11.5px] ml-2 text-gray-500">
                        Affiliates
                      </p>
                    </a>
                  </div>

                  <div className="flex flex-col my-3">
                    <button
                      className="flex items-center h-full"
                      onClick={() => setShowSupportModal(true)}
                    >
                      <LifeBuoyIcon className="w-3.5 h-3.5 text-gray-500" />

                      <p className="text-[11.5px] ml-2 text-gray-500">
                        Support
                      </p>
                    </button>
                  </div>

                  <div className="flex flex-col mt-3 mb-3">
                    <Link
                      to="/settings"
                      className="flex items-center h-full"
                      onClick={() => setShowSidebar(false)}
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-500" />

                      <p className="text-[11.5px] ml-2 text-gray-500">
                        Settings
                      </p>
                    </Link>
                  </div>

                  <div className="flex flex-col mb-2">
                    <button
                      className="flex items-center h-full mb-2"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-gray-500" />
                      )}

                      <p className="text-[11.5px] ml-2 text-gray-500">
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                      </p>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col">
                    <a
                      href="https://combochat.tolt.io"
                      target="_blank"
                      className="flex items-center h-full"
                    >
                      <DollarSign className="w-[.95rem] h-[.95rem] text-gray-500" />
                    </a>
                  </div>

                  <div className="flex flex-col mt-4">
                    <a
                      href="https://go.crisp.chat/chat/embed/?website_id=f0685988-0197-4ba9-9eb8-868c048a0f4e"
                      target="_blank"
                      className="flex items-center h-full"
                      onClick={() => setShowSidebar(false)}
                    >
                      <LifeBuoyIcon className="w-3.5 h-3.5 text-gray-500" />
                    </a>
                  </div>

                  <div className="flex flex-col my-4">
                    <Link
                      to="/settings"
                      className="flex items-center h-full mb-2"
                      onClick={() => setShowSidebar(false)}
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-500" />
                    </Link>
                  </div>

                  <div className="flex flex-col my-4">
                    <button
                      className="flex items-center h-full mb-2"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <Sun className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {!isMobile && !showLimitReachedModal && (
              <div
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "w-1 h-12 bg-zinc-300 dark:bg-zinc-800 absolute top-1/2 -translate-y-1/2 rounded-full hover:bg-zinc-500 duration-300 cursor-pointer -right-2"
                )}
              />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
