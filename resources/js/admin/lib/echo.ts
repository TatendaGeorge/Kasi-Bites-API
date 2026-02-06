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

const echo = new Echo({
  broadcaster: 'pusher',
  key: key,
  cluster: cluster,
  forceTLS: true,
});

export default echo;
