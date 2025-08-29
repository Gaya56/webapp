const handleSetNBotPanel = (
  newActiveBots,
  removedBotId,
  nPanelBots,
  setFn
) => {
  // first we check if the removedBotId is in the nPanelBots
  const isInNPanelBots = nPanelBots.includes(removedBotId);
  if (isInNPanelBots) {
    // we replace the removedBotId with the first botId that is not in the nPanelBots but in the newActiveBots
    const newNPanelBots = nPanelBots.map((botId) => {
      if (botId === removedBotId) {
        const replaceBotId = newActiveBots.find(
          (b) => !nPanelBots.includes(b.botId)
        )?.botId;
        if (replaceBotId) return replaceBotId;

        return newActiveBots[0].botId;
      }

      return botId;
    });

    setFn(newNPanelBots);
  }
};

export default handleSetNBotPanel;
