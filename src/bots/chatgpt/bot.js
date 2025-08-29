import getAiModelApiKey from "@/lib/getAiModelApiKey";
import { AbstractBot } from "../abstract-bot";
import { checkHasWebAccess } from "@/lib/webAccess";
import uploadFile from '@/lib/uploadFile'
import { toolManager } from "@/lib/tool-manager";

export class ChatGPTApiBot extends AbstractBot {
  conversationContext = { messages: [] };
  chatId;
  selectedTools = []; // Store selected tools for this bot instance

  constructor(model, selectedTools = []) {
    super();
    this.conversationContext = { messages: [] };
    this.model = model;
    this.chatId = "";
    this.selectedTools = selectedTools;
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

    // Prepare tools for API call if any are selected
    const tools = this.getToolsForAPI();
    const requestBody = {
      messages: this.conversationContext.messages,
      modelName: this.model,
      apiKey: getAiModelApiKey("openai"),
      chatId: this.chatId,
      isRegenerate: messageDetails.isRegenerate,
      promptTemplate: JSON.parse(localStorage.getItem("activePrompt")),
      fileUrl: messageDetails.fileUrl,
      botId: messageDetails.botId,
      shouldWebSearch: checkHasWebAccess(messageDetails.botId)
    };

    // Add tools to request if available
    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat/chatgpt`,
      {
        method: "POST",
        signal: messageDetails.signal,
        body: JSON.stringify(requestBody),
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

    // Check if response contains tool calls (for future backend integration)
    await this.handlePotentialToolCalls(accumulatedResponse, messageDetails);

    this.conversationContext.messages.push({
      role: "assistant",
      content: accumulatedResponse,
    });

    messageDetails?.onEvent({ type: "DONE" });
  }

  /**
   * Handle tool calls in the response (for future implementation)
   */
  async handlePotentialToolCalls(response, messageDetails) {
    // Future implementation: parse tool calls from backend response
    // and execute them using toolManager
    try {
      // Check if response contains tool call indicators
      // This will be implemented when backend supports tool calling
      
      // Example pattern:
      // if (response.includes("TOOL_CALL:")) {
      //   const toolCalls = this.parseToolCalls(response);
      //   const results = await toolManager.processToolCalls(toolCalls);
      //   // Send tool results back to model
      // }
    } catch (error) {
      console.warn("Error handling tool calls:", error);
    }
  }

  /**
   * Get tools formatted for OpenAI API
   */
  getToolsForAPI() {
    if (!this.selectedTools || this.selectedTools.length === 0) {
      return [];
    }

    // Import here to avoid circular dependency
    const { getToolsAsOpenAIFunctions } = require("@/config/tools");
    return getToolsAsOpenAIFunctions(this.selectedTools);
  }

  /**
   * Update selected tools for this bot instance
   */
  setSelectedTools(tools) {
    this.selectedTools = tools || [];
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