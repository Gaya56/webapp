export default function getAiModel(aiModel) {
  switch (aiModel) {
    case "chatgpt":
    case "chatgptPro":
    case "gpt-4o":
      return "openai";
    case "gemini":
    case "geminiPro":
    case "gemini-1.5-pro":
      return "gemini";
    case "mistralPro":
    case "mistral-large":
      return "mistral";
    case "claude":
    case "claudePro":
    case "claude-3.5-sonnet":
      return "claude";
    case "perplexity":
    case "perplexity-sonar-reasoning":
      return "perplexity";
    case "llama":
    case "llama-3.1":
      return "aimlapi";
    default:
      return aiModel;
  }
}