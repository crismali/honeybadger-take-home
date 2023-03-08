import type { Env, SpamNotification, HardBounce } from "./types";
import { describe, expect, it, beforeAll, beforeEach } from "vitest";
import { forwardSpamNotification } from "./forwardSpamNotification";
import UnwrappedWorker from ".";

vi.mock("./forwardSpamNotification", () => {
  return {
    forwardSpamNotification: vi.fn(),
  };
});

describe("Worker", () => {
  let env: Env;
  interface FetchOptions extends RequestInit {
    path?: string;
  }
  let worker: {
    // fetch: (requestInit?: RequestInit) => Promise<Response>;
    fetch: (options: FetchOptions) => Promise<Response>;
  };

  beforeAll(async () => {
    env = {
      SLACK_CHANNEL: "slack-channel",
      SLACK_TOKEN: "slack-token",
    };
    worker = {
      fetch: ({ path, ...requestInit }) => {
        const request = new Request(
          `http://localhost:3000${path ?? "/notify"}`,
          { method: "POST", ...requestInit }
        );

        return UnwrappedWorker.fetch(request, env, {
          passThroughOnException: vi.fn(),
          waitUntil: vi.fn(),
        });
      },
    };
  });

  describe("when not sending a POST to /notify", () => {
    it("is a 404 JSON error when using any non-POST method on /notify", async () => {
      const response = await worker.fetch({ method: "GET", path: "/notify" });

      expect(response.status).toEqual(404);

      const json = await response.json();

      expect(json).toEqual({ message: "No route matches the request" });
    });

    it("is a 404 JSON error when using POSTing to any non-/notify path", async () => {
      const response = await worker.fetch({ method: "POST", path: "/sign-in" });

      expect(response.status).toEqual(404);

      const json = await response.json();

      expect(json).toEqual({ message: "No route matches the request" });
    });
  });

  describe("when given an invalid request body", () => {
    it("returns a 400 (bad request) JSON error", async () => {
      const response = await worker.fetch({
        body: "unacceptable",
      });

      expect(response.status).toEqual(400);

      const responseJson = await response.json();
      expect(responseJson).toEqual({
        message: "Invalid request body",
      });
    });
  });

  describe("when given a spam notification", () => {
    let payload: SpamNotification;

    beforeEach(() => {
      payload = {
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
    });

    it("forwards the spam notification to slack", async () => {
      await worker.fetch({ body: JSON.stringify(payload) });

      expect(forwardSpamNotification).toHaveBeenCalledWith(payload, env);
    });

    it("responds with a 200", async () => {
      const response = await worker.fetch({ body: JSON.stringify(payload) });
      expect(response.status).toEqual(200);
    });

    it("returns a successful JSON", async () => {
      const response = await worker.fetch({ body: JSON.stringify(payload) });
      const responseJson = await response.json();
      expect(responseJson).toEqual({
        success: true,
        isSpam: true,
      });
    });
  });

  describe("when given any other notification", () => {
    let payload: HardBounce;

    beforeEach(() => {
      payload = {
        BouncedAt: "2019-11-05T16:33:54.9070259Z",
        Description:
          "The server was unable to deliver your message (ex: unknown user, mailbox not found).",
        Email: "arthur@example.com",
        From: "notifications@honeybadger.io",
        MessageStream: "outbound",
        Name: "Hard bounce",
        RecordType: "Bounce",
        Tag: "Test",
        Type: "HardBounce",
        TypeCode: 1,
      };
    });

    it("does not forward the notificaiton to slack", async () => {
      await worker.fetch({
        body: JSON.stringify(payload),
        method: "POST",
      });

      expect(forwardSpamNotification).not.toHaveBeenCalled();
    });

    it("responds with a 200", async () => {
      const response = await worker.fetch({
        body: JSON.stringify(payload),
        method: "POST",
      });
      expect(response.status).toEqual(200);
    });

    it("returns a successful JSON", async () => {
      const response = await worker.fetch({
        body: JSON.stringify(payload),
        method: "POST",
      });
      const responseJson = await response.json();
      expect(responseJson).toEqual({
        success: true,
        isSpam: false,
      });
    });
  });
});
