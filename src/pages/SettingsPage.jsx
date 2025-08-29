import React, { useEffect, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { toast } from "react-hot-toast";
import * as SwitchRadix from "@radix-ui/react-switch";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { MenuIcon, GlobeIcon } from "lucide-react";

import {
  shouldSaveChatsAtom,
  twoPanelBotsAtom,
  threePanelBotsAtom,
  fourPanelBotsAtom,
  sixPanelBotsAtom,
  showAuthModalAtom,
  showPremiumModalAtom,
  showOverlayLoadingAtom,
  showSidebarAtom,
} from "@/config/state";
import Button from "@/components/Button";
import { activeBotsAtom, ALL_BOTS } from "@/config/chatbots";
import { Switch } from "@/components/ui/switch";
import { CustomTooltip } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import handleSetNBotPanel from "@/lib/handleSetNBotPanel";
import { cn } from "@/lib/shadcn";
import useAuth from "@/hooks/useAuth";
import Teams from "@/components/Teams";
import apiClient from "@/lib/apiClient";

const groupedBots = ALL_BOTS.reduce((acc, bot) => {
  if (!acc[bot.group]) acc[bot.group] = [];
  acc[bot.group].push(bot);
  return acc;
}, {});

function SettingsPage() {
  const location = useLocation();
  const { currentUser, logOut, hasActiveSubscription } = useAuth();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const setShowSidebar = useSetAtom(showSidebarAtom);
  const setShowOverlayLoading = useSetAtom(showOverlayLoadingAtom);
  const [activeBots, setActiveBots] = useAtom(activeBotsAtom);
  const [twoPanelBots, setTwoPanelBots] = useAtom(twoPanelBotsAtom);
  const [threePanelBots, setThreePanelBots] = useAtom(threePanelBotsAtom);
  const [fourPanelBots, setFourPanelBots] = useAtom(fourPanelBotsAtom);
  const [sixPanelBots, setSixPanelBots] = useAtom(sixPanelBotsAtom);
  const setShowAuthModal = useSetAtom(showAuthModalAtom);
  const [shouldSaveChats, setShouldSaveChats] = useAtom(shouldSaveChatsAtom);
  const setShowPremiumModal = useSetAtom(showPremiumModalAtom);

  const [activeTab, setActiveTab] = useState("ai-models");

  useEffect(() => {
    if (location.hash === "#models") {
      const wrapper = document.getElementById("wrapper");
      const models = document.getElementById("models");

      const topPos = models.offsetTop - wrapper.offsetTop;
      wrapper.scrollTop = topPos;
    }
  }, []);

  const handleToggleActiveBot = (botId, checked) => {
    let newActiveBots = [...activeBots];

    if (checked) {
      const bot = ALL_BOTS.find((b) => b.botId === botId);
      newActiveBots.push(bot);
    } else {
      newActiveBots = newActiveBots.filter((b) => b.botId !== botId);

      // active bots cannot be lower than 1
      if (newActiveBots.length < 1) {
        return toast.error("You must have at least 1 active AI model.");
      }

      handleSetNBotPanel(newActiveBots, botId, twoPanelBots, setTwoPanelBots);
      handleSetNBotPanel(
        newActiveBots,
        botId,
        threePanelBots,
        setThreePanelBots
      );
      handleSetNBotPanel(newActiveBots, botId, fourPanelBots, setFourPanelBots);
      handleSetNBotPanel(newActiveBots, botId, sixPanelBots, setSixPanelBots);
    }

    setActiveBots(newActiveBots);
  };

  const createPortalSession = async () => {
    if (!currentUser.stripePriceId) return setShowPremiumModal(true);

    setShowOverlayLoading(true);

    const { data, ok } = await apiClient.post("/stripe/billing-portal");
    setShowOverlayLoading(false);

    if (!ok) return toast.error("An error occurred while creating session");

    window.open(data.url, "_blank");
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-full xl:max-w-5xl 2xl:max-w-6xl">
        <Tabs flex items-center 
          className="mt-4 mb-8 mx-6 pb-12"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4 bg-background rounded-none border-b border-zinc-200 dark:border-zinc-900 w-full flex justify-start">
            <TabsTrigger
              className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white"
              value="ai-models"
            >
              AI Models
            </TabsTrigger>
            <TabsTrigger
              className="pb-3 !px-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white"
              value="team"
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              className="pb-3 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white"
              value="account"
            >
              Account
            </TabsTrigger>

            {isMobile && (
              <div className="ml-auto">
                <MenuIcon
                  className="cursor-pointer"
                  size={25}
                  onClick={() => setShowSidebar(true)}
                />
              </div>
            )}
          </TabsList>

          <TabsContent value="ai-models">
            <div className="mb-3" id="models">
              {Object.keys(groupedBots)
                .filter((g) => g !== "custom")
                .map((group, index) => (
                  <React.Fragment key={index}>
                    <p className="font-bold text-md mt-4 mb-2">
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* sort the bots by provider */}
                      {groupedBots[group]
                        .sort((a, b) => a.index - b.index)
                        .map(({ bot, provider, botId }, idx) => (
                          <CustomTooltip key={idx} content={bot.name}>
                            <div className="p-4 border border-zinc-200 dark:border-zinc-900 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-[30px] h-[30px] bg-white dark:bg-zinc-100 flex items-center justify-center rounded mr-1">
                                  <img
                                    src={bot.avatar}
                                    className="w-[20px] h-[20px] rounded"
                                  />
                                </div>

                                <div className="flex flex-col items-start">
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-bold line-clamp-1">
                                      {bot.name}
                                    </p>
                                  </div>

                                  <p className="text-[11.5px] text-zinc-500">
                                    {/* turn provide from slug to title camel case */}
                                    {provider
                                      .split("-")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}
                                  </p>
                                </div>
                              </div>

                              <Switch
                                checked={activeBots.some(
                                  (b) => b.botId === botId
                                )}
                                onCheckedChange={(checked) =>
                                  handleToggleActiveBot(botId, checked)
                                }
                              />
                            </div>
                          </CustomTooltip>
                        ))}
                    </div>
                  </React.Fragment>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="team">
            <Teams />
          </TabsContent>

          <TabsContent value="account" className="max-w-xl">
            <p className="font-bold text-md mb-1">Account</p>
            <p className="text-sm text-zinc-600 mb-4">
              Login or log out your account
            </p>

            {!!currentUser && (
              <div className="flex flex-col gap-2 mt-3 mb-5 border border-zinc-200 dark:border-zinc-900 p-3 rounded-lg">
                <p className="text-xs flex">
                  <span className="mr-auto">Logged in as:</span>{" "}
                  <b>{currentUser?.email}</b>
                </p>

                {hasActiveSubscription && (
                  <p className="text-xs flex">
                    <span className="mr-auto">Your current plan:</span>{" "}
                    <b className="capitalize">
                      {currentUser.subscription?.fullName
                        ?.split("-")
                        ?.join(" ") || currentUser.subscription?.name}
                    </b>
                  </p>
                )}
              </div>
            )}

            {!currentUser ? (
              <Button
                text="Login"
                className="bg-whie border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 text-xs py-2"
                onClick={() => setShowAuthModal(true)}
              />
            ) : (
              <>
                <Button
                  text="Logout"
                  className="bg-whie border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 text-xs py-2"
                  onClick={() => logOut()}
                />
              </>
            )}

            {(!!currentUser?.subscription || currentUser?.team) && (
              <>
                <div className="flex flex-col gap-5 mt-3 mb-6">
                  <div className="mt-5">
                    <p className="font-bold text-md mb-1">Usage</p>
                    <p className="text-xs text-zinc-600 mb-4">
                      Based on the plan you have, these are your usage limits
                    </p>

                    <div className="border border-zinc-200 dark:border-zinc-900 rounded-md px-4 py-3 text-xs">
                      <p className="font-bold text-md mb-4 uppercase">
                        Monthly Usage
                      </p>

                      <div className="flex justify-between">
                        <span>Advanced:</span>
                        <span className="font-bold">
                          {currentUser?.proQueriesCount || 0} /{" "}
                          {currentUser?.proQueriesLimit ||
                            currentUser?.subscription?.proMaxQueries ||
                            0}
                        </span>
                      </div>

                      {currentUser?.referralCredits > 0 && (
                        <div className="flex justify-between mt-4">
                          <span>Remaining Referral Credits:</span>
                          <span className="font-bold">
                            {currentUser?.referralCredits}
                          </span>
                        </div>
                      )}

                      {!currentUser?.stripeIsFreeTrial && (
                        <div className="flex justify-between mt-4">
                          <span>Reset Date:</span>
                          <span className="font-bold">
                            {moment(
                              currentUser?.lastResetQueriesDate ||
                                currentUser?.createdAt
                            )
                              .add(1, "month")
                              .format("MMM Do YYYY")}
                          </span>
                        </div>
                      )}

                      <div
                        className={cn("flex justify-between mt-4", {
                          "text-red-600":
                            new Date(
                              currentUser?.subscription?.periodEnd || null
                            ) < new Date(),
                        })}
                      >
                        <span>End Date:</span>
                        <span className="font-bold">
                          {moment(
                            currentUser?.subscription?.periodEnd || null
                          ).format("MMM Do YYYY")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!!currentUser?.team && (
                    <div className="p-3 bg-amber-100 rounded-lg text-center">
                      <p className="text-[13px] text-amber-600 font-medium">
                        The above usage is the total usage of all team members.
                      </p>
                    </div>
                  )}
                </div>

                {!currentUser?.team &&
                  !currentUser?.stripePriceId?.startsWith("appsumo") && (
                    <div className="flex flex-col gap-5 mt-3 mb-6">
                      <div className="mt-5">
                        <p className="font-bold text-md mb-1">Subscription</p>
                        <p className="text-xs text-zinc-600 mb-4">
                          Upgrade or cancel your current subscription
                        </p>

                        <Button
                          text="Manage Subscription"
                          className="bg-whie border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 text-xs py-2"
                          onClick={() => createPortalSession()}
                        />
                      </div>
                    </div>
                  )}
              </>
            )}

            <div className="mb-5 mt-8 flex items-center justify-between">
              <div>
                <p className="font-bold text-md mb-1">Chat History</p>
                <p className="text-xs text-zinc-600 mb-4 line-clamp-1">
                  Determine whether you want to save your chats or not.
                </p>
              </div>

              <SwitchRadix.Root
                checked={shouldSaveChats}
                onCheckedChange={() => setShouldSaveChats(!shouldSaveChats)}
                className="w-[43px] h-[26px] bg-neutral-500 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-default"
              >
                <SwitchRadix.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] -translate-y-[0.5px]" />
              </SwitchRadix.Root>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
