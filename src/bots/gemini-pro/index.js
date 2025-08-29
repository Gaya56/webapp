import { AsyncAbstractBot } from "../abstract-bot";
import { GeminiProApiBot } from "./bot";

export class GeminiProBot extends AsyncAbstractBot {
  async initializeBot(model) {
    return new GeminiProApiBot(model);
  }

  async sendMessage(params) {
    return this.doSendMessageGenerator(params);
  }
}
