import { atomWithStorage } from "jotai/utils";

import claudeLogo from "@/assets/icons/claude.png";
import anthropicLogo from "@/assets/icons/anthropic.png";
import chatgptLogo from "@/assets/icons/chatgpt.png";
import geminiLogo from "@/assets/icons/gemini.png";
import llamaLogo from "@/assets/icons/llama.png";
import mistralLogo from "@/assets/icons/mistral.png";
import pplxLogo from "@/assets/icons/pplx.png";
import alibabaLogo from "@/assets/icons/alibaba.png";
import gemmaLogo from "@/assets/icons/gemma.webp";
import zeroOneAiLogo from "@/assets/icons/01-ai.png";
import wizardLMLogo from "@/assets/icons/wizardLM.webp";
import deepSeekLogo from "@/assets/icons/deepseek.webp";
import dbrxLogo from "@/assets/icons/dbrx.png";
import huggingFaceLogo from "@/assets/icons/hugging-face.webp";
import blackForestLabsLogo from "@/assets/icons/black-forest-labs.png";
import cohereLogo from "@/assets/icons/cohere.png";
import mythomaxLogo from "@/assets/icons/mythomax.webp";
import microsoftLogo from "@/assets/icons/microsoft.png";
import googleLogo from "@/assets/icons/google.png";
import nousresearchLogo from "@/assets/icons/nousresearch.png";
import grokLogo from "@/assets/icons/grok.svg";
import googleAiStudioLogo from "@/assets/icons/google-ai-studio.png";
import jondurbinLogo from "@/assets/icons/jondurbin.jpeg";
import sophosympatheiaLogo from "@/assets/icons/sophosympatheia.webp";
import openchatLogo from "@/assets/icons/openchat.webp";
import neversleepLogo from "@/assets/icons/neversleep.webp";
import undiLogo from "@/assets/icons/undi.webp";
import alpinLogo from "@/assets/icons/alpindale.webp";
import theDrummerLogo from "@/assets/icons/thedrummer.webp";
import ai21Logo from "@/assets/icons/ai21.webp";
import raifleLogo from "@/assets/icons/raifle.svg";
import anthraciteOrgLogo from "@/assets/icons/anthracite-org.webp";
import inflectionLogo from "@/assets/icons/inflection.svg";
import amazonLogo from "@/assets/icons/amazon.svg";
import liquidLogo from "@/assets/icons/liquid.webp";
import minimaxLogo from "@/assets/icons/minimax.webp";

export const ALL_BOTS = [
  // openai
  { botId: "gpt-5", modelName: "gpt-5", bot: { name: "ChatGPT-5", avatar: chatgptLogo }, active: true, provider: "OpenAI", group: "chat", index: 1 },
  { botId: "chatgptPro", modelName: "gpt-4o", bot: { name: "ChatGPT-4o", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "chat", index: 1 },
  { botId: "o4-mini", modelName: "o4-mini", bot: { name: "ChatGPT O4-mini", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "chat", index: 2 },
  { botId: "o3-mini", modelName: "o3-mini", bot: { name: "ChatGPT O3-mini", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "chat", index: 2 },
  { botId: "gpt-4.1", modelName: "gpt-4.1-2025-04-14", bot: { name: "ChatGPT 4.1", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "chat", index: 3 },

  // google
  { botId: "gemini-2.5-pro", modelName: "gemini-2.5-pro", bot: { name: "Gemini 2.5 Pro", avatar: googleLogo }, active: false, provider: "google", group: "chat", index: 5 },
  { botId: "gemini-2.5-flash", modelName: "gemini-2.5-flash", bot: { name: "Gemini 2.5 Flash", avatar: googleLogo }, active: true, provider: "google", group: "chat", index: 6 },
  { botId: "gemini-2.5-flash-lite-preview", modelName: "gemini-2.5-flash-lite-preview-06-17", bot: { name: "Gemini 2.5 Flash Lite (preview)", avatar: geminiLogo }, active: false, provider: "google", group: "chat", index: 7 },
  { botId: "gemma-3-27b-it", modelName: "google/gemma-3-27b-it", bot: { name: "Gemma 3 (27B)", avatar: gemmaLogo }, active: false, provider: "google", group: "chat", index: 9 },
  // anthropic
  { botId: "claude-sonnet-4", modelName: "claude-sonnet-4-20250514", bot: { name: "Claude Sonnet 4", avatar: claudeLogo }, active: true, provider: "anthropic", group: "chat", index: 12 },
  // { botId: "claude-opus-4", modelName: "claude-opus-4-20250514", bot: { name: "Claude Opus 4", avatar: claudeLogo }, active: true, provider: "anthropic", group: "chat", index: 12 },
  { botId: "claude-3-7-sonnet-reasoning", modelName: "claude-3-7-sonnet-20250219-reasoning", bot: { name: "Claude 3.7 Reasoning", avatar: claudeLogo }, active: false, provider: "anthropic", group: "chat", index: 12 },
  // deepseek
  { botId: "deepseek-r1-0528-qwen3-8b", modelName: "deepseek/deepseek-r1-0528-qwen3-8b", bot: { name: "DeepSeek R1 0528", avatar: deepSeekLogo }, provider: "deepseek", group: "chat", index: 16, active: false },
  { botId: "deepseek-chat", modelName: "deepseek/deepseek-chat-v3-0324", bot: { name: "DeepSeek V3 0324", avatar: deepSeekLogo }, active: true, provider: "deepseek", group: "chat", index: 16 },
  { botId: "deepseek-r1", modelName: "deepseek-r1-distill-llama-70b", bot: { name: "DeepSeek R1", avatar: deepSeekLogo }, provider: "deepseek", group: "chat", index: 17, active: false },
  // meta
  { botId: "llama-4-scout", modelName: "meta-llama/llama-4-scout-17b-16e-instruct", bot: { name: "Llama 4 Scout", avatar: llamaLogo }, active: true, provider: "meta", group: "chat", index: 18 },
  { botId: "llama-4-maverick", modelName: "meta-llama/llama-4-maverick", bot: { name: "Llama 4 Maverick", avatar: llamaLogo }, active: false, provider: "meta", group: "chat", index: 19 },
  // grok
  { botId: "grok-4", modelName: "x-ai/grok-4", bot: { name: "Grok 4", avatar: grokLogo }, active: false, provider: "xAI", group: "chat", index: 20 },
  { botId: "grok-2-vision-1212", modelName: "x-ai/grok-2-vision-1212", bot: { name: "Grok 2 Vision 1212", avatar: grokLogo }, active: false, provider: "xAI", group: "chat", index: 22 },
  // perplexity
  { botId: "perplexity-sonar-reasoning-pro", modelName: "perplexity/sonar-reasoning-pro", bot: { name: "Perplexity Sonar Pro Reasoning", avatar: pplxLogo }, active: false, provider: "perplexity", group: "chat", index: 21 },
  { botId: "perplexity-sonar-pro", modelName: "perplexity/sonar-pro", bot: { name: "Perplexity Sonar Pro", avatar: pplxLogo }, active: true, provider: "perplexity", group: "chat", index: 21 },
  // mistral
  { botId: "mistralPro", modelName: "mistralai/mistral-small-3.1-24b-instruct", bot: { name: "Mistral Small 3.1 24B", avatar: mistralLogo }, active: false, provider: "mistral", group: "chat", index: 22 },
  { botId: "ministral-8b", modelName: "mistral/ministral-8b", bot: { name: "Ministral 8B", avatar: mistralLogo }, active: false, provider: "mistral", group: "chat", index: 23 },
  // cohere
  { botId: "command-r-plus", modelName: "cohere/command-r-plus-08-2024", bot: { name: "Command R+", avatar: cohereLogo }, provider: "cohere", group: "chat", index: 24 },
  // yi
  { botId: "yi-34B-chat", modelName: "01-ai/yi-large", bot: { name: "Yi-34B-Chat", avatar: zeroOneAiLogo }, provider: "01-aI", group: "chat", index: 25 },
  // dbrx
  { botId: "dbrx-instruct", modelName: "databricks/dbrx-instruct", bot: { name: "DBRX 132B Instruct", avatar: dbrxLogo }, provider: "DBRX", group: "chat", index: 26 },
  // wizard lm
  { botId: "wizardlm-2-8x22b", modelName: "microsoft/wizardlm-2-8x22b", bot: { name: "WizardLM-2 8x22B", avatar: wizardLMLogo }, provider: "wizard-LM", group: "chat", index: 27 },
  // qwen
  { botId: "qwen-qwq-32b", modelName: "qwen-qwq-32b", bot: { name: "Qwen QWQ 32B", avatar: alibabaLogo }, provider: "alibaba-cloud", group: "chat", index: 28 },
  { botId: "qwen-2.5-7b-instruct", modelName: "qwen/qwen-2.5-7b-instruct", bot: { name: "Qwen 2.5 Max", avatar: alibabaLogo }, provider: "alibaba-cloud", group: "chat", index: 29 },
  // mythomax
  { botId: "mythomax-l2-13b", modelName: "gryphe/mythomax-l2-13b", bot: { name: "MythoMax 13B", avatar: mythomaxLogo }, provider: "gryphe", group: "chat", index: 30 },
  // microsoft
  { botId: "phi-4", modelName: "microsoft/phi-4", bot: { name: "Phi 4", avatar: microsoftLogo }, provider: "microsoft", group: "chat", index: 31 },
  // hugging face
  { botId: "zephyr-7b-beta", modelName: "huggingfaceh4/zephyr-7b-beta:free", bot: { name: "Zephyr 7B", avatar: huggingFaceLogo }, provider: "hugging-face", group: "chat", index: 32 },
  
  { botId: "codestral-2501", modelName: "mistralai/codestral-2501", bot: { name: "Codestral 2501", avatar: mistralLogo }, provider: "mistral", group: "code", index: 1 },
  { botId: "hermes-3-llama-3.1-405b", modelName: "nousresearch/hermes-3-llama-3.1-405b", bot: { name: "Hermes 3 405B Instruct", avatar: nousresearchLogo }, provider: "nous-research", group: "code", index: 1 },
  
  // image models
  { botId: "flux-kontext", modelName: "fal-ai/flux-pro/kontext", bot: { name: "FLUX Kontext", avatar: blackForestLabsLogo }, provider: "black-forest-labs", group: "image", index: 1 },
  { botId: "gpt-image-1", modelName: "gpt-image-1", bot: { name: "GPT Image", avatar: chatgptLogo }, active: false, provider: "open-AI", group: "image", index: 1 },
  { botId: "dall-e-3", modelName: "dall-e-3", bot: { name: "DALL·E 3", avatar: chatgptLogo }, active: false, provider: "open-AI", group: "image", index: 1 },
  { botId: "flux-realism", modelName: "flux-realism", bot: { name: "FLUX.1 [dev]", avatar: blackForestLabsLogo }, provider: "black-forest-labs", group: "image", index: 1 },
  
  // secondary models
  { botId: "o3", modelName: "o3", bot: { name: "ChatGPT O3", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 2 },
  { botId: "gpt-4.1-mini", modelName: "gpt-4.1-mini", bot: { name: "ChatGPT 4.1 Mini", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 4 },
  { botId: "gpt-4.1-nano", modelName: "gpt-4.1-nano", bot: { name: "ChatGPT 4.1 Nano", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 5 },
  { botId: "o1-mini", modelName: "o1-mini", bot: { name: "ChatGPT O1-mini", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 12 },
  { botId: "gpt-4.5-preview", modelName: "gpt-4.5-preview", bot: { name: "ChatGPT 4.5 Preview", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 12 },
  { botId: "o1", modelName: "o1", bot: { name: "ChatGPT-O1", avatar: chatgptLogo }, active: false, provider: "OpenAI", group: "secondary", index: 12 },
  { botId: "gemini-2.0-flash", modelName: "gemini-2.0-flash", bot: { name: "Gemini 2.0 Flash", avatar: googleLogo }, active: false, provider: "google", group: "secondary", index: 12 },
  { botId: "gemini-2.0-flash-thinking-exp-01-21", modelName: "gemini-2.0-flash-thinking-exp", bot: { name: "Gemini 2.0 Flash Thinking Experimental", avatar: googleAiStudioLogo }, active: false, provider: "google", group: "secondary", index: 12 },
  { botId: "geminiPro", modelName: "gemini-1.5-pro-latest", bot: { name: "Gemini 1.5 Pro", avatar: geminiLogo }, active: false, provider: "google", group: "secondary", index: 12 }, 
  { botId: "claude-3-7-sonnet", modelName: "claude-3-7-sonnet-20250219", bot: { name: "Claude 3.7 Sonnet", avatar: anthropicLogo }, active: false, provider: "anthropic", group: "secondary", index: 12 },
  { botId: "claudePro", modelName: "claude-3-5-sonnet-20241022", bot: { name: "Claude 3.5 Sonnet", avatar: anthropicLogo }, active: false, provider: "anthropic", group: "secondary", index: 12 },
  { botId: "claude-3.5-haiku", modelName: "claude-3-5-haiku-20241022", bot: { name: "Claude 3.5 Haiku", avatar: anthropicLogo }, active: false, provider: "anthropic", group: "secondary", index: 12 },
  { botId: "claude-3-opus", modelName: "claude-3-opus-20240229", bot: { name: "Claude 3 Opus", avatar: anthropicLogo }, active: false, provider: "anthropic", group: "secondary", index: 12 },
  { botId: "grok-3", modelName: "x-ai/grok-3", bot: { name: "Grok 3", avatar: grokLogo }, active: false, provider: "xAI", group: "secondary", index: 20 },
  { botId: "grok-3-mini", modelName: "x-ai/grok-3-mini", bot: { name: "Grok 3 Mini", avatar: grokLogo }, active: false, provider: "xAI", group: "secondary", index: 21 },
  { botId: "grok", modelName: "x-ai/grok-2-1212", bot: { name: "Grok 2 1212", avatar: grokLogo }, active: false, provider: "xAI", group: "secondary", index: 22 },
  { botId: "perplexity", modelName: "perplexity/sonar", bot: { name: "Perplexity Sonar", avatar: pplxLogo }, active: false, provider: "perplexity", group: "secondary", index: 12 },
  { botId: "mistral-large", modelName: "open-mixtral-8x22b", bot: { name: "Mistral Large", avatar: mistralLogo }, active: false, provider: "mistral", group: "secondary", index: 13 },
  { botId: "pixtral-12b", modelName: "mistralai/pixtral-12b", bot: { name: "Pixtral 12B", avatar: mistralLogo }, active: false, provider: "mistral", group: "secondary", index: 13 },
  { botId: "llama-3.3-70b-instruct", modelName: "meta-llama/llama-3.3-70b-instruct", bot: { name: "Llama 3.3 70B", avatar: llamaLogo }, active: false, provider: "meta", group: "secondary", index: 14 },
  { botId: "llama-3.2-90b-vision", modelName: "meta-llama/llama-3.2-90b-vision-instruct", bot: { name: "Llama 3.2 90B", avatar: llamaLogo }, active: false, provider: "meta", group: "secondary", index: 14 },
  { botId: "gemma-2-27b-it", modelName: "google/gemma-2-27b-it", bot: { name: "Gemma 2 (27B)", avatar: gemmaLogo }, active: false, provider: "google", group: "secondary", index: 15 },
  { botId: "command-r", modelName: "cohere/command-r", bot: { name: "Command R", avatar: cohereLogo }, provider: "cohere", group: "secondary", index: 15 },
  { botId: "qwen2-72b-instruct", modelName: "qwen/qwen-2.5-72b-instruct", bot: { name: "Qwen 2 Instruct 72B", avatar: alibabaLogo }, provider: "alibaba-cloud", group: "secondary", index: 15 },
  { botId: "wizardlm-2-7b", modelName: "microsoft/wizardlm-2-7b", bot: { name: "WizardLM-2 7B", avatar: wizardLMLogo }, provider: "wizard-LM", group: "secondary", index: 15 },
  { botId: "phi-3-medium-128k-instruct", modelName: "microsoft/phi-3-medium-128k-instruct:free", bot: { name: "Phi-3 Medium 128K Instruct", avatar: microsoftLogo }, provider: "microsoft", group: "secondary", index: 15 },
  { botId: "airoboros-l2-70b", modelName: "jondurbin/airoboros-l2-70b", bot: { name: "Airoboros 70B", avatar: jondurbinLogo }, provider: "jondurbin", group: "secondary", index: 15 },
  { botId: "mn-starcannon-12b", modelName: "aetherwiing/mn-starcannon-12b", bot: { name: "Starcannon 12B", avatar: huggingFaceLogo }, provider: "aetherwiing", group: "secondary", index: 15 },
  { botId: "midnight-rose-70b", modelName: "sophosympatheia/midnight-rose-70b", bot: { name: "Midnight Rose 70B", avatar: sophosympatheiaLogo }, provider: "sophosympatheia", group: "secondary", index: 15 },
  { botId: "openchat-7b", modelName: "openchat/openchat-7b:free", bot: { name: "OpenChat 3.5 7B", avatar: openchatLogo }, provider: "openchat", group: "secondary", index: 15 },
  { botId: "noromaid-20b", modelName: "neversleep/noromaid-20b", bot: { name: "Noromaid 20B", avatar: neversleepLogo }, provider: "neversleep", group: "secondary", index: 15 },
  { botId: "toppy-m-7b", modelName: "undi95/toppy-m-7b:nitro", bot: { name: "Toppy M 7B (nitro)", avatar: undiLogo }, provider: "undi", group: "secondary", index: 15 },
  { botId: "goliath-120b", modelName: "alpindale/goliath-120b", bot: { name: "Goliath 120B", avatar: alpinLogo }, provider: "alpindale", group: "secondary", index: 15 },
  { botId: "rocinante-12b", modelName: "thedrummer/rocinante-12b", bot: { name: "Rocinante 12B", avatar: theDrummerLogo }, provider: "the-drummer", group: "secondary", index: 15 },
  { botId: "unslopnemo-12b", modelName: "thedrummer/unslopnemo-12b", bot: { name: "Unslopnemo 12b", avatar: theDrummerLogo }, provider: "the-drummer", group: "secondary", index: 15 },
  { botId: "jamba-1-5-large", modelName: "ai21/jamba-1-5-large", bot: { name: "Jamba 1.5 Large", avatar: ai21Logo }, provider: "ai21", group: "secondary", index: 15 },
  { botId: "sorcererlm-8x22b", modelName: "raifle/sorcererlm-8x22b", bot: { name: "SorcererLM 8x22B", avatar: raifleLogo }, provider: "raifle", group: "secondary", index: 15 },
  { botId: "llama-3.1-lumimaid-70b", modelName: "neversleep/llama-3.1-lumimaid-70b", bot: { name: "Lumimaid v0.2 70B", avatar: neversleepLogo }, provider: "neversleep", group: "secondary", index: 15 },
  { botId: "magnum-v4-72b", modelName: "anthracite-org/magnum-v4-72b", bot: { name: "Magnum v4 72B", avatar: anthraciteOrgLogo }, provider: "anthracite-org", group: "secondary", index: 15 },
  { botId: "inflection-3-pi", modelName: "inflection/inflection-3-pi", bot: { name: "Inflection 3 Pi", avatar: inflectionLogo }, provider: "inflection", group: "secondary", index: 15 },
  { botId: "nova-lite-v1", modelName: "amazon/nova-lite-v1", bot: { name: "Nova Lite 1.0", avatar: amazonLogo }, provider: "amazon", group: "secondary", index: 15 },
  { botId: "lfm-7b", modelName: "liquid/lfm-7b", bot: { name: "LFM 7B", avatar: liquidLogo }, provider: "liquid", group: "secondary", index: 15 },
  { botId: "rogue-rose-103b-v0.2", modelName: "sophosympatheia/rogue-rose-103b-v0.2:free", bot: { name: "Rogue Rose 103B v0.2", avatar: sophosympatheiaLogo }, provider: "sophosympatheia", group: "secondary", index: 15 },
  { botId: "minimax-01", modelName: "minimax/minimax-01", bot: { name: "MiniMax-01", avatar: minimaxLogo }, provider: "minimax", group: "secondary", index: 15 },
  { botId: "codestral-2501", modelName: "mistralai/codestral-2501", bot: { name: "Codestral 2501", avatar: mistralLogo }, provider: "mistral", group: "secondary", index: 15 },
];

export const allBotsAtom = atomWithStorage("allBots", ALL_BOTS);
export const activeBotsAtom = atomWithStorage("activeBots", ALL_BOTS.filter((bot) => bot.active));