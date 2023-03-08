import { Env } from "../types";

export const postMessage = async (message: string, env: Env): Promise<void> => {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    body: JSON.stringify({
      channel: env.SLACK_CHANNEL,
      text: message,
    }),
    headers: {
      Authorization: `Bearer ${env.SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
};
