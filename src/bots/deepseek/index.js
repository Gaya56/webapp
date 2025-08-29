import { AsyncAbstractBot } from "../abstract-bot";
import { DeepSeekApiBot } from "./bot";

export class DeepSeekBot extends AsyncAbstractBot {
  async initializeBot(model) {
    return new DeepSeekApiBot(model);
  }

  async sendMessage(params) {
    return this.doSendMessageGenerator(params);
  }
}
