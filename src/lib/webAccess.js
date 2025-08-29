import cache from './cache'

export const checkHasWebAccess = (botId) => {
  const data = cache.get(`${botId}WebAccess`);

  return !! data;
}

export const updateWebAccess = (botId, value) => {
  cache.store(`${botId}WebAccess`, value);
}