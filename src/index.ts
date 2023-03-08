/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { forwardSpamNotification } from "./forwardSpamNotification";
import { Env, SpamNotification, SPAM_NOTIFICATION_TYPE_CODE } from "./types";

const POST = "POST";
const PATH = "/notify";
const TYPE_CODE: keyof SpamNotification = "TypeCode";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== POST || url.pathname !== PATH) {
      return errorResponse(404, "No route matches the request");
    }
    let json: object | undefined | SpamNotification;

    try {
      json = await request.json();
    } catch (error: any) {
      return errorResponse(400, "Invalid request body");
    }

    if (isSpamNotification(json)) {
      await forwardSpamNotification(json, env);
      return successfulResponse(true);
    } else {
      return successfulResponse(false);
    }
  },
};

const successfulResponse = (isSpam: boolean): Response => {
  return new Response(JSON.stringify({ isSpam, success: true }), {
    status: 200,
  });
};

const errorResponse = (status: number, message: string) => {
  return new Response(JSON.stringify({ message }), { status });
};

const isSpamNotification = (suspect: unknown): suspect is SpamNotification => {
  return (
    suspect !== null &&
    typeof suspect === "object" &&
    TYPE_CODE in suspect &&
    suspect.TypeCode === SPAM_NOTIFICATION_TYPE_CODE
  );
};
