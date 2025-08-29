import { AsyncAbstractBot } from "../abstract-bot";
import { ClaudProApiBot } from "./bot";

export class ClaudBot extends AsyncAbstractBot {
  async initializeBot(model) {
    return new ClaudProApiBot(model);
  }

  async sendMessage(params) {
    return this.doSendMessageGenerator(params);
  }
}
