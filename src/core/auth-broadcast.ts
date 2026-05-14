import type { AuthBroadcastEvent } from '../types/global';

const CHANNEL_NAME = 'netapp_identity_channel';

export class AuthBroadcast {
  private readonly channel = new BroadcastChannel(CHANNEL_NAME);

  publish(event: AuthBroadcastEvent) {
    this.channel.postMessage(event);
  }

  subscribe(callback: (event: AuthBroadcastEvent) => void) {
    this.channel.onmessage = (message) => {
      callback(message.data);
    };
  }

  destroy() {
    this.channel.close();
  }
}
