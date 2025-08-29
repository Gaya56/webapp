import { ChatError, ErrorCode } from "@/lib/errors";
import { streamAsyncIterable } from "@/lib/stream-async-iterable";

export class AbstractBot {
  async sendMessage(params) {
    return this.doSendMessageGenerator(params);
  }

  async *doSendMessageGenerator(params) {
    const wrapError = (err) => {
      if (err instanceof ChatError) {
        return err;
      }
      if (!params.signal?.aborted) {
        // ignore user abort exception
        return new ChatError(err.message, ErrorCode.UNKOWN_ERROR);
      }
    };

    const stream = new ReadableStream({
      start: (controller) => {
        this.doSendMessage({
          prompt: params.prompt,
          rawUserInput: params.rawUserInput,
          image: params.image,
          signal: params.signal,
          onEvent(event) {
            if (event.type === "UPDATE_ANSWER") {
              controller.enqueue(event.data);
            } else if (event.type === "DONE") {
              controller.close();
            } else if (event.type === "ERROR") {
              const error = wrapError(event.error);
              if (error) {
                controller.error(error);
              }
            }
          },
          isRegenerate: params.isRegenerate,
          fileUrl: params.fileUrl,
          botId: params.botId
        }).catch((err) => {
          console.log(err);
          const error = wrapError(err);
          if (error) {
            controller.error(error);
          }
        });
      },
    });
    yield* streamAsyncIterable(stream);
  }

  get name() {
    return undefined;
  }

  get supportsImageInput() {
    return false;
  }

  get currentChatId() {
    return "";
  }

  get messages() {
    return [];
  }

  /**
   * Extracts a chat ID from a string containing the pattern "CHAT_ID:xxx"
   * @param {string} text - The input string to search for a chat ID
   * @returns {string|null} The extracted chat ID or null if no chat ID is found
  */
  extractChatId(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const chatIdPattern = /CHAT_ID:([a-zA-Z0-9_-]+)/;
    const match = chatIdPattern.exec(text);

    return match ? match[1] : null;
  }

  // Check if a string contains a chat ID
  hasChatId(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const chatIdPattern = /CHAT_ID:[a-zA-Z0-9_-]+/;
    return chatIdPattern.test(text);
  }

  // Removes the chat ID from a string
  removeChatId(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    const chatIdPattern = /CHAT_ID:[a-zA-Z0-9_-]+/;
    return text.replace(chatIdPattern, '');
  }

  doSendMessage(params) { }
  resetConversation(onlyMessage) { }
  removeConversationMessage(msgIndex) { }
  removeConversationMessages(fromIndex) { }
  setConversationMessages(chatId, messages) { }
}

class DummyBot extends AbstractBot {
  async doSendMessage(_params) { }

  resetConversation(onlyMessage) { }
  removeConversationMessage(msgIndex) { }
  removeConversationMessages(fromIndex) { }
  setConversationMessages(chatId = "", messages = []) { }

  get name() {
    return "";
  }
}

export class AsyncAbstractBot extends AbstractBot {
  #bot;
  #initializeError;

  constructor(model) {
    super();
    this.#bot = new DummyBot();
    this.initializeBot(model)
      .then((bot) => {
        this.#bot = bot;
      })
      .catch((err) => {
        this.#initializeError = err;
      });
  }

  initializeBot(model) { }

  doSendMessage(params) {
    if (this.#bot instanceof DummyBot && this.#initializeError) {
      throw this.#initializeError;
    }

    return this.#bot.doSendMessage(params);
  }

  resetConversation(onlyMessage) {
    return this.#bot.resetConversation(onlyMessage);
  }

  removeConversationMessage(msgIndex) {
    return this.#bot.removeConversationMessage(msgIndex);
  }

  removeConversationMessages(fromIndex) {
    return this.#bot.removeConversationMessages(fromIndex);
  }

  setConversationMessages(chatId = "", messages = []) {
    return this.#bot.setConversationMessages(chatId, messages);
  }

  get name() {
    return this.#bot.name;
  }

  get supportsImageInput() {
    return this.#bot.supportsImageInput;
  }

  get currentChatId() {
    return this.#bot.currentChatId;
  }

  get messages() {
    return this.#bot.messages;
  }
}
