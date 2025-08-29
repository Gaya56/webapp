import cache from "./cache";

function getAiModelApiKey(modelName) {
  let apiKey;
  let currentUser = JSON.parse(localStorage.getItem("currentUser") || "");
  const apiKeys = cache.get("ai-models-apiKeys");
  if (!apiKeys) return null;

  // check if we should use users api key or not
  if (
    currentUser?.stripePriceId?.startsWith("appsumo") &&
    currentUser?.appsumoLicenseTier > 1 &&
    apiKeys[modelName]
  ) {
    apiKey = apiKeys[modelName];
  }

  return apiKey;
}

export default getAiModelApiKey;
