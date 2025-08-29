import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { AbstractBot } from "../abstract-bot";
import uploadFile from "@/lib/uploadFile";
import { checkHasWebAccess } from "@/lib/webAccess";

export class GeminiProApiBot extends AbstractBot {
  conversationContext = { messages: [] };
  chatId = "";

  constructor(model) {
    super();
    this.conversationContext = { messages: [] };
    this.model = model;
    this.chatId = "";
  }

  async doSendMessage(messageDetails) {
    let imageUrl;

    if (messageDetails.image) imageUrl = await uploadFile(messageDetails.image, import.meta.env.VITE_TEMP_FILE_HOST_URL);

    if (!this.chatId && this.conversationContext.messages.length > 1)
      this.conversationContext.messages = [];

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/gemini-pro`,
      {
        method: "POST",
        signal: messageDetails.signal,
        body: JSON.stringify({
          messages: this.conversationContext.messages,
          modelName: this.model,
          imageUrl,
          prompt: messageDetails.prompt,
          apiKey: getAiModelApiKey("gemini"),
          chatId: this.chatId,
          isRegenerate: messageDetails.isRegenerate,
          promptTemplate: JSON.parse(localStorage.getItem("activePrompt")),
          fileUrl: messageDetails.fileUrl,
          shouldWebSearch: checkHasWebAccess(messageDetails.botId),
          botId: messageDetails.botId,
        }),
        headers: {
          "x-auth-token": window.xAuthToken
        },
      }
    );

    let promptParts = [{ text: messageDetails.prompt }];

    if (imageUrl) {
      promptParts[0]["fileData"] = {
        fileUri: imageUrl,
        mimeType: "image/png",
      };
    }

    this.conversationContext.messages.push({
      role: "user",
      parts: promptParts,
    });

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

    if (this.hasChatId(accumulatedResponse)) {
      this.chatId = this.extractChatId(accumulatedResponse);
      accumulatedResponse = this.removeChatId(accumulatedResponse);
    }

    this.conversationContext.messages.push({
      role: "model",
      parts: [{ text: accumulatedResponse }],
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
      let promptParts = [{ text: msg.text }];

      if (msg.image) {
        promptParts[0]["fileData"] = {
          fileUri: msg.image,
          mimeType: "image/png",
        };
      }

      return {
        role: msg.author == "user" ? "user" : "model",
        parts: promptParts,
      };
    });
  }

  get name() {
    return this.model.includes("1.0") ? "Gemini 1.0" : "Gemini 1.5 pro";
  }

  get supportsImageInput() {
    return true;
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
