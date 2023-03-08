export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  SLACK_CHANNEL: string;
  SLACK_TOKEN: string;
}

export interface AlertPayload {
  BouncedAt: string;
  Description: string;
  Email: string;
  From: string;
  MessageStream: string;
  Name: string;
  RecordType: string;
  Tag: string;
}

export const SPAM_NOTIFICATION_TYPE_CODE = 512;

export interface SpamNotification extends AlertPayload {
  Type: "SpamNotification";
  TypeCode: typeof SPAM_NOTIFICATION_TYPE_CODE;
}

export const HARD_BOUNCE_TYPE_CODE = 1;

export interface HardBounce extends AlertPayload {
  Type: "HardBounce";
  TypeCode: typeof HARD_BOUNCE_TYPE_CODE;
}
