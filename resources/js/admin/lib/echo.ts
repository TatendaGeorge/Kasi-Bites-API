import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

window.Pusher = Pusher;

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

const key = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

console.log('Pusher config:', { key, cluster });

// Pusher throws synchronously if no key is configured, which would crash the
// whole app before it can render. Real-time notifications are optional, so
// fall back to a no-op stub until VITE_PUSHER_APP_KEY is actually set.
const noopChannel = {
  subscribed: () => noopChannel,
  error: () => noopChannel,
  listen: () => noopChannel,
};

const echo = key
  ? new Echo({
      broadcaster: 'pusher',
      key: key,
      cluster: cluster,
      forceTLS: true,
    })
  : ({
      channel: () => noopChannel,
      leave: () => {},
    } as unknown as Echo);

export default echo;
