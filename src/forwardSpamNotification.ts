import type { Env, SpamNotification } from "./types";
import { postMessage } from "./slack/postMessage";

export const forwardSpamNotification = async (
  spamNofication: SpamNotification,
  env: Env
): Promise<void> => {
  const message = formatMessage(spamNofication);
  await postMessage(message, env);
};

const formatMessage = (spamNotification: SpamNotification): string => {
  return `
Spam notification received:
\`\`\`json
${JSON.stringify(spamNotification, null, 2)}
\`\`\``;
};
