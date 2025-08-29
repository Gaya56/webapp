import cache from "./cache";
import getAiModel from "./getAiModel";
import getRemainingQueriesCount from "./getRemainingQueriesCount";

function increaseUsage(
  type,
  setCurrentUser,
  count = 1,
  aiModel
) {
  if(aiModel) {
    aiModel = getAiModel(aiModel);

    const apiKeys = cache.get("ai-models-apiKeys");
    if(apiKeys?.[aiModel]) return;
  }

  let currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  if (getRemainingQueriesCount(type, false) - count >= 0) {
    if (type == "basic")
      currentUser = {
        ...currentUser,
        basicQueriesCount: currentUser.basicQueriesCount + count,
      };
    else
      currentUser = {
        ...currentUser,
        proQueriesCount: currentUser?.proQueriesCount + count,
      };
  } else if (currentUser.referralCredits - count >= 0) {
    currentUser = {
      ...currentUser,
      referralCredits: currentUser.referralCredits - count,
    };
  }

  setCurrentUser(currentUser);
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

export default increaseUsage;
