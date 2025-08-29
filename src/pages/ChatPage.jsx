import React from "react";
import { useParams } from "react-router-dom";

import SingleBotChatPanel from "./SingleBotChatPanel";

function ChatPage() {
  const { botId } = useParams();

  return <SingleBotChatPanel botId={botId} />;
}

export default ChatPage;
