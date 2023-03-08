import { describe, expect, it, beforeEach } from "vitest";
import { forwardSpamNotification } from "./forwardSpamNotification";
import { postMessage } from "./slack/postMessage";
import { Env, SpamNotification } from "./types";

vi.mock("./slack/postMessage", () => {
  return {
    postMessage: vi.fn(),
  };
});

describe("forwardSpamNotification", () => {
  let spamNotification: SpamNotification;
  let message: string;
  let env: Env;

  beforeEach(() => {
    env = {
      SLACK_CHANNEL: "slack-channel",
      SLACK_TOKEN: "slack-token",
    };

    spamNotification = {
      BouncedAt: "2023-02-27T21:41:30Z",
      Description:
        "The message was delivered, but was either blocked by the user, or classified as spam, bulk mail, or had rejected content.",
      Email: "zaphod@example.com",
      From: "notifications@honeybadger.io",
      MessageStream: "outbound",
      Name: "Spam notification",
      RecordType: "Bounce",
      Tag: "",
      Type: "SpamNotification",
      TypeCode: 512,
    };

    message = `
Spam notification received:
\`\`\`json
{
  "BouncedAt": "2023-02-27T21:41:30Z",
  "Description": "The message was delivered, but was either blocked by the user, or classified as spam, bulk mail, or had rejected content.",
  "Email": "zaphod@example.com",
  "From": "notifications@honeybadger.io",
  "MessageStream": "outbound",
  "Name": "Spam notification",
  "RecordType": "Bounce",
  "Tag": "",
  "Type": "SpamNotification",
  "TypeCode": 512
}
\`\`\``;
  });

  it("sends the given JSON to Slack", async () => {
    forwardSpamNotification(spamNotification, env);
    expect(postMessage).toHaveBeenCalledWith(message, env);
  });
});
