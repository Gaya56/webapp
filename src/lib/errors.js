export const ErrorCode = {
  CONVERSATION_LIMIT: "CONVERSATION_LIMIT",
  UNKOWN_ERROR: "UNKOWN_ERROR",
  MISSING_HOST_PERMISSION: "MISSING_HOST_PERMISSION",
  NETWORK_ERROR: "NETWORK_ERROR",
}

export class ChatError extends Error {
  code;

  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
