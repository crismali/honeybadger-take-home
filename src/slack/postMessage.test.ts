import { describe, expect, it, beforeEach } from "vitest";
import { Env } from "../types";
import { postMessage } from "./postMessage";

describe("Slack: postMessage", () => {
  let mockedFetch: Function;
  let slackToken: string;
  let slackChannel: string;
  let message: string;
  let env: Env;

  beforeEach(() => {
    mockedFetch = vi
      .fn()
      .mockName("fetch")
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ data: {} }), { status: 200 })
        )
      );
    slackToken = "slack-token";
    slackChannel = "slack-channel";
    message = "A fun slack message";

    vi.stubGlobal("fetch", mockedFetch);

    env = {
      SLACK_TOKEN: slackToken,
      SLACK_CHANNEL: slackChannel,
    };
  });

  it("sends the given message to slack", async () => {
    await postMessage(message, env);

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://slack.com/api/chat.postMessage",
      {
        body: JSON.stringify({ channel: slackChannel, text: message }),
        headers: {
          Authorization: `Bearer ${slackToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
  });
});
