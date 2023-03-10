# Honeybadger Take-home

My name is Michael Crismali and this is my implementation of the Honeybadger take-home project.

## Stack

This is a [Cloudflare Worker](https://workers.cloudflare.com/), written in TypeScript using Node and NPM. Cloudflare Workers
use [Wrangler](https://github.com/cloudflare/workers-sdk/tree/main/packages/wrangler) to run the app in
development and to deploy it to production (or any other environments). These commands are wrapped
in the `package.json` as `npm run start` and `npm run deploy` respectively.

The tests can be run with `npm run test` which uses [Vitest](https://vitest.dev/) under the hood.

This worker only accepts `POST` requests at `/notify`.

## Installation

(The following assumes you already have Node and NPM installed)

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.dev.vars` file and add values for `SLACK_CHANNEL` and `SLACK_TOKEN`

The `SLACK_CHANNEL` should be the channel ID of whichever Slack channel you want the worker
to send notifications to. _Note:_ The bot must be added to the channel for the messages to
actually appear in the channel.

You can get the channel ID by exploring the Slack API programmatically or by taking the final
segment of the url you receive when you go to share a channel in Slack.

The `SLACK_TOKEN` is the Slack OAuth token for your bot/app. _Note:_ It must have the `chat:write`
permission scope for this worker to work correctly. See the documentation for
[posting messages in Slack](https://api.slack.com/methods/chat.postMessage).

If you don't already have a Slack bot/app setup, [there is documentation here.](https://api.slack.com/authentication/basics)

## Local Development

To run the worker in development mode, run `npm run start`.

In order to send a Spam Notification to your local development server, run the following in your terminal:

```
curl -XPOST -H "Content-type: application/json" -d '{
  "RecordType": "Bounce",
  "Type": "SpamNotification",
  "TypeCode": 512,
  "Name": "Spam notification",
  "Tag": "",
  "MessageStream": "outbound",
  "Description": "The message was delivered, but was either blocked by the user, or classified as spam, bulk mail, or had rejected content.",
  "Email": "zaphod@example.com",
  "From": "notifications@honeybadger.io",
  "BouncedAt": "2023-02-27T21:41:30Z"
}' 'http://0.0.0.0:8787/notify'
```

In order to run a non-Spam Notification, run the following in your terminal:

```
curl -XPOST -H "Content-type: application/json" -d '{
  "RecordType": "Bounce",
  "MessageStream": "outbound",
  "Type": "HardBounce",
  "TypeCode": 1,
  "Name": "Hard bounce",
  "Tag": "Test",
  "Description": "The server was unable to deliver your message (ex: unknown user, mailbox not found).",
  "Email": "arthur@example.com",
  "From": "notifications@honeybadger.io",
  "BouncedAt": "2019-11-05T16:33:54.9070259Z"
}' 'http://0.0.0.0:8787/notify'
```

If you'd like to use something like Postman, be sure you're `POST`ing to `/notify` wherever the app is running
(`http://0.0.0.0:8787` when running locally unless otherwise configured)

## Deployment

To deploy to the worker, run `npm run deploy`. You'll also need to add the `SLACK_TOKEN` and `SLACK_CHANNEL`
secrets. You can do this through the Cloudflare Workers dashboard on their website or you can run
`wrangler secret put SLACK_CHANNEL` and `wrangler secret put SLACK_TOKEN` in your terminal. After each
command you'll be prompted to provide the value.

## Known issues

VSCode and likely other editors highlight uses of the global `vi` variable in tests as being undefined.
This doesn't affect how the tests run, it's just a quirk of how Wrangler generates the worker structure and
Vitest configuration. Given more time, this would be a nice quality of life issue to fix.
