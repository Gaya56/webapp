import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { AbstractBot } from "../abstract-bot";
import uploadFile from "@/lib/uploadFile";
import { checkHasWebAccess } from "@/lib/webAccess";

export class DeepSeekApiBot extends AbstractBot {
  conversationContext = { messages: [] };
  chatId;

  constructor(model) {
    super();
    this.conversationContext = { messages: [] };
    this.model = model;
    this.chatId = "";
  }

  async doSendMessage(messageDetails) {
    let imageUrl;
    if (messageDetails.image) imageUrl = await uploadFile(messageDetails.image, import.meta.env.VITE_TEMP_FILE_HOST_URL);

    const promptObj = { role: "user", content: messageDetails.prompt };

    if (imageUrl) {
      promptObj.content = [
        {
          type: "text",
          text: messageDetails.prompt,
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "auto",
          },
        },
      ];
    }

    if(! this.chatId && this.conversationContext.messages.length > 1) 
      this.conversationContext.messages = [];

    this.conversationContext.messages.push(promptObj);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/deepseek`,
      {
        method: "POST",
        signal: messageDetails.signal,
        body: JSON.stringify({
          messages: this.conversationContext.messages,
          modelName: this.model,
          apiKey: getAiModelApiKey("deepseek"),
          chatId: this.chatId,
          isRegenerate: messageDetails.isRegenerate,
          promptTemplate: JSON.parse(localStorage.getItem("activePrompt")),
          fileUrl: messageDetails.fileUrl,
          botId: messageDetails.botId,
          shouldWebSearch: checkHasWebAccess(messageDetails.botId),
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
    this.conversationContext.messages.splice(0, msgIndex);
  }

  removeConversationMessages(fromIndex) {
    this.conversationContext.messages.splice(fromIndex);
  }

  setConversationMessages(chatId = "", messages = []) {
    this.conversationContext.messages = [];
    this.chatId = chatId;

    for (let msg of messages) {
      let role = msg.author == "user" ? "user" : "assistant";
      const promptObj = { role, content: msg.text };

      if (msg.image) {
        promptObj.content = [
          {
            type: "text",
            text: msg.text,
          },
          {
            type: "image_url",
            image_url: {
              url: msg.image,
              detail: "auto",
            },
          },
        ];
      }

      this.conversationContext.messages.push(promptObj);
    }
  }

  get name() {
    return this.model;
  }

  get supportsImageInput() {
    return ['meta-llama/llama-4-scout-17b-16e-instruct'].includes(this.model);
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
