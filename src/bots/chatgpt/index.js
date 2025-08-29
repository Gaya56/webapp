import { AsyncAbstractBot } from "../abstract-bot";
import { ChatGPTApiBot } from "./bot";

export class ChatGPTBot extends AsyncAbstractBot {
  async initializeBot(model) {
    return new ChatGPTApiBot(model);
  }

  async sendMessage(params) {
    return this.doSendMessageGenerator(params);
  }
}
