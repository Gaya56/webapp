import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { AbstractBot } from "../abstract-bot";
import { checkHasWebAccess } from "@/lib/webAccess";

export class ClaudProApiBot extends AbstractBot {
  conversationContext = { messages: [] };
  chatId = "";

  constructor(model) {
    super();
    this.conversationContext = { messages: [] };
    this.model = model;
    this.chatId = "";
  }

  async doSendMessage(messageDetails) {
    if(! this.chatId && this.conversationContext.messages.length > 1) 
      this.conversationContext.messages = [];
    
    this.conversationContext.messages.push({
      role: "user",
      content: messageDetails.prompt,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/claude`,
      {
        method: "POST",
        signal: messageDetails.signal,
        body: JSON.stringify({
          messages: this.conversationContext.messages,
          modelName: this.model,
          apiKey: getAiModelApiKey("claude"),
          chatId: this.chatId,
          isRegenerate: messageDetails.isRegenerate,
          promptTemplate: JSON.parse(localStorage.getItem("activePrompt")),
          fileUrl: messageDetails.fileUrl,
          shouldWebSearch: checkHasWebAccess(messageDetails.botId),
          botId: messageDetails.botId
        }),
        headers: {
          "x-auth-token": window.xAuthToken
        }
      }
    );

    const textDecoder = new TextDecoder();
    let accumulatedResponse = "";

    if (!response.body) return;

    for await (const chunk of this.readStream(response.body)) {
      const decodedText = textDecoder.decode(chunk, { stream: true });
      accumulatedResponse += decodedText;

      messageDetails?.onEvent({
        type: "UPDATE_ANSWER",
        data: { text: accumulatedResponse, chunk: decodedText },
      });
    }

    if(this.hasChatId(accumulatedResponse)) {
      this.chatId = this.extractChatId(accumulatedResponse);
      accumulatedResponse = this.removeChatId(accumulatedResponse);
    }

    this.conversationContext.messages.push({
      role: "assistant",
      content: accumulatedResponse,
    });

    messageDetails?.onEvent({ type: "DONE" });
  }

  resetConversation(onlyMessage) {
    this.conversationContext.messages = [];

    if (!onlyMessage) this.chatId = "";
  }

  removeConversationMessage(msgIndex) {
    this.conversationContext.messages =
      this.conversationContext.messages.splice(0, msgIndex);
  }

  removeConversationMessages(fromIndex) {
    this.conversationContext.messages.splice(fromIndex);
  }

  setConversationMessages(chatId = "", messages = []) {
    this.chatId = chatId;
    this.conversationContext.messages = messages.map((msg) => {
      return {
        role: msg.author == "user" ? "user" : "assistant",
        content: msg.text,
      };
    });
  }

  get name() {
    return this.model.includes("haiku") ? "Claude Haiku" : "Claude 3.5 Sonnet";
  }

  get messages() {
    return this.conversationContext.messages;
  }

  get currentChatId() {
    return this.chatId;
  }

  // Stream reading function for handling data chunks
  async *readStream(stream = { getReader: () => {} }) {
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
}
