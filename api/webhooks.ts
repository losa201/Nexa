// api/src/webhooks.ts
import fetch from 'node-fetch';

type Webhook = {
  url: string;
  event: string;
};

const webhooks: Webhook[] = [];

/**
 * Register a new webhook for a specific event.
 * @param url   The callback URL to invoke.
 * @param event The event name to listen for.
 */
export function registerWebhook(url: string, event: string): void {
  webhooks.push({ url, event });
}

/**
 * Emit an event, invoking all registered webhooks for that event.
 * @param event   The event name.
 * @param payload The payload to POST to each webhook.
 */
export async function emitEvent(event: string, payload: any): Promise<void> {
  const targets = webhooks.filter(w => w.event === event);
  await Promise.all(
    targets.map(w =>
      fetch(w.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload }),
      }).catch(err => {
        console.error(`Error sending webhook to ${w.url}:`, err);
      })
    )
  );
}
