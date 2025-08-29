import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { AbstractBot } from "../abstract-bot";
import uploadFile from "@/lib/uploadFile";
import { checkHasWebAccess } from "@/lib/webAccess";

export class LMSYSBot extends AbstractBot {
  conversationContext = { messages: [] };
  chatId;

  constructor(model, name) {
    super();
    this.conversationContext = { messages: [] };
    this.model = model;
    this.modelName = name;
    this.chatId = "";
  }

  async doSendMessage(messageDetails) {
    let imageUrl;
    if (messageDetails.image) imageUrl = await uploadFile(messageDetails.image, import.meta.env.VITE_TEMP_FILE_HOST_URL);

    if(! this.chatId && this.conversationContext.messages.length > 1) 
      this.conversationContext.messages = [];

    let promptObj = { role: "user", content: messageDetails.prompt };

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
    
    this.conversationContext.messages.push(promptObj);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/lmsys`, {
      method: "POST",
      signal: messageDetails.signal,
      body: JSON.stringify({
        messages: this.conversationContext.messages,
        model: this.model,
        apiKey: getAiModelApiKey("aimlapi"),
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
    });

    const textDecoder = new TextDecoder();
    let accumulatedResponse = "", citations = [];

    if (!response.body) return;

    for await (const chunk of this.readStream(response.body)) {
      const decodedText = textDecoder.decode(chunk, { stream: true });
      
      const citationsMatch = decodedText.match(/CITATIONS:(.*)/);
      if (citationsMatch) {
        try {
          citations = JSON.parse(citationsMatch[1]);
          continue;
        } catch (err) {}
      }

      accumulatedResponse += decodedText;

      messageDetails?.onEvent({
        type: "UPDATE_ANSWER",
        data: { text: accumulatedResponse, chunk: decodedText },
      });
    }

    if (citations.length > 0) {
      accumulatedResponse = this.formatTextWithCitations(accumulatedResponse, citations);
      accumulatedResponse += this.createCitationsList(citations);

      messageDetails?.onEvent({
        type: "UPDATE_ANSWER",
        data: { text: accumulatedResponse, chunk: "" },
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

  setConversationMessages(chatId, messages) {
    this.chatId = chatId;
    this.conversationContext.messages = messages.map((msg) => {
      return {
        role: msg.author == "user" ? "user" : "assistant",
        content: msg.text,
      };
    });
  }

  get name() {
    return this.modelName;
  }

  get supportsImageInput() {
    return ['meta-llama/llama-4-maverick', 'mistralai/mistral-small-3.1-24b-instruct', 'x-ai/grok-2-vision-1212'].includes(this.model);
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

  formatTextWithCitations(text, citations) {
    return text.replace(/\[(\d+)\]/g, (match, num) => {
      const url = citations[parseInt(num) - 1];
      return ` [[${num}]](${url})`;
    });
  }

  createCitationsList(citations) {
    return "\n\n---\n" + "**Sources**\n" + citations.map((url, index) =>
      `${index + 1}. [${url}](${url})`
    ).join('\n');
  }
}
