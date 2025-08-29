import { ChatGPTBot } from "./chatgpt";
import { GeminiProBot } from "./gemini-pro";
import { ClaudBot } from "./claude";
import { LMSYSBot } from "./lmsys";
import { ALL_BOTS } from "@/config/chatbots";
import { DeepSeekBot } from "./deepseek";

export async function createBotInstance(botId, selectedTools = []) {
  const bot = ALL_BOTS.find((b) => b.botId === botId);
  if (!bot) return;

  const modelName = bot.modelName;

  switch (botId) {
    case "chatgptPro":
    case "o1":
    case "o3":
    case "o1-mini":
    case "o3-mini":
    case "o4-mini":
    case "gpt-4.5-preview":
    case "gpt-4.1":
    case "gpt-4.1-mini":
    case "gpt-4.1-nano":
    case "gpt-5":
      return new ChatGPTBot(modelName, selectedTools);

    case "claudePro":
    case "claude-3.5-haiku":
    case "claude-3-opus":
    case "claude-3-7-sonnet":
    case "claude-3-7-sonnet-reasoning":
    case "claude-sonnet-4":
    case "claude-opus-4":
      return new ClaudBot(modelName);
      
    case "geminiPro":
    case "gemini-2.0-flash":
    case "gemini-2.0-flash-exp":
    case "gemini-2.0-flash-thinking-exp-01-21":
    case "gemini-2.0-flash-lite":
    case "gemini-2.5-pro":
    case "gemini-2.5-flash":
    case "gemini-2.5-flash-lite-preview":
      return new GeminiProBot(modelName);
      
    // case "llama-4-maverick":
    case "llama-4-scout":
    case "deepseek-r1":
    case "qwen-qwq-32b":
      return new DeepSeekBot(modelName);

  }

  return new LMSYSBot(modelName, bot.bot.name);
}
