import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

import { activeBotsAtom } from "@/config/chatbots";

const SwitchBotDropdown = ({
  triggerNode,
  selectedBotId,
  onChange = () => {},
}) => {
  const activeBots = useAtomValue(activeBotsAtom);
  const navigate = useNavigate();

  return (
    <Menu as="div" className="relative text-left">
      <Menu.Button
        as="div"
        className="flex text-base transform -translate-y-[1px] cursor-pointer"
      >
        {triggerNode}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-7 -left-8 z-10 mt-1 rounded-xl bg-background focus:outline-none max-h-[300px] overflow-y-auto border border-zinc-200 dark:border-zinc-900 shadow-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {activeBots.map(({ botId, bot }) => {
            if (botId === selectedBotId) return null;

            return (
              <Menu.Item key={botId}>
                <div
                  className="px-4 py-2 ui-active:text-white ui-not-active:text-zinc-600 cursor-pointer flex flex-row items-center gap-3 pr-8 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-black transition-all duration-200"
                  onClick={() => {
                    const bot = activeBots.find((b) => b.botId === botId);
                    if (!bot) return;
                    if (bot.group == "image")
                      return navigate(`/generate-image/${botId}`);

                    onChange(botId);
                  }}
                >
                  <div className="w-4 h-4">
                    <img src={bot.avatar} className="w-4 h-4" />
                  </div>

                  <p className="text-sm whitespace-nowrap">{bot.name}</p>
                </div>
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SwitchBotDropdown;
