import { AuthEventEnum, type AuthClientOptions, type Listener } from '../types/global';
import { generatePKCE } from './pkce';
import { savePKCE, getPKCE, clearPKCE, saveState, getState, clearState } from './storage';

export class AuthClient {
  private accessToken: string | null = null;

  private readonly listeners = new Map<AuthEventEnum, Set<Listener>>();

  constructor(private readonly options: AuthClientOptions) {}

  private emit(event: AuthEventEnum) {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener();
    }
  }

  on(event: AuthEventEnum, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  getAccessToken() {
    return this.accessToken;
  }

  async login() {
    const { verifier, challenge } = await generatePKCE();

    const state = crypto.randomUUID();

    savePKCE(verifier);
    saveState(state);

    const url = new URL(`${this.options.identityUrl}/auth/authorize`);

    url.searchParams.set('client_id', this.options.clientId);
    url.searchParams.set('redirect_uri', this.options.redirectUri);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('state', state);

    globalThis.location.href = url.toString();
  }

  async handleCallback() {
    const params = new URLSearchParams(globalThis.location.search);

    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      return false;
    }

    const storedState = getState();

    if (state !== storedState) {
      throw new Error('Invalid state');
    }

    const verifier = getPKCE();
    if (!verifier) {
      throw new Error('Missing PKCE verifier');
    }

    const response = await fetch(`${this.options.identityUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        code,
        client_id: this.options.clientId,
        redirect_uri: this.options.redirectUri,
        code_verifier: verifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    const data = await response.json();

    this.accessToken = data.accessToken;

    this.emit(AuthEventEnum.LOGIN);
    this.emit(AuthEventEnum.TOKEN);

    clearPKCE();
    clearState();

    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);

    return true;
  }

  async refresh() {
    const response = await fetch(`${this.options.identityUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    this.accessToken = data.accessToken;

    this.emit(AuthEventEnum.TOKEN);
    this.emit(AuthEventEnum.RESTORED);

    return true;
  }

  async restoreSession() {
    const restored = await this.refresh();

    if (!restored) {
      // Descomentar esto después de probar
      // await this.login();
      // return false;
      return restored;
    }

    return true;
  }

  async logout() {
    await fetch(`${this.options.identityUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    this.accessToken = null;

    this.emit(AuthEventEnum.LOGOUT);

    globalThis.location.href = this.options.logoutRedirectUri;
  }
}
