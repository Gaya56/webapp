function getRemainingQueriesCount(type, withReferrals = true) {
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );
  if (!currentUser?.subscription) return 0;

  switch (type) {
    case "basic":
      return (
        currentUser.subscription.basicMaxQueries - currentUser.basicQueriesCount
      );
    case "pro":
      return (
        currentUser.subscription.proMaxQueries +
        (withReferrals ? currentUser.referralCredits : 0) -
        currentUser?.proQueriesCount
      );
    default:
      return 0;
  }
}

export default getRemainingQueriesCount;
