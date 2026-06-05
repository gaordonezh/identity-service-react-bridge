import { UserRequiredActionsEnum, type AuthClientOptions, type JwtDecodedPayload, type RequiredActionsProps } from '../types/global';
import { generatePKCE } from '../utils/pkce';
import {
  savePKCE,
  getPKCE,
  clearPKCE,
  saveState,
  getState,
  clearState,
  saveRequiredAction,
  getRequiredAction,
  clearRequiredAction,
} from '../utils/storage';
import { getTokenDecoded } from '../utils/jwt';
import { AuthBroadcast } from './auth-broadcast';

const defaultRequiredOptions: RequiredActionsProps = { email: false, password: false };

class IdentityServiceClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly broadcast = new AuthBroadcast();
  public tokenDecoded: JwtDecodedPayload | undefined;
  public requiredActions: RequiredActionsProps = defaultRequiredOptions;

  constructor(private readonly options: AuthClientOptions) {
    this.broadcast.subscribe((event) => {
      if (event === 'LOGOUT') {
        this.setAccessToken(null);
        this.redirect();
      }
    });
  }

  private setAccessToken(token: string | null) {
    this.accessToken = token;

    if (!token) {
      this.clearRefreshTimer();
      return;
    }

    this.tokenDecoded = getTokenDecoded(token);
    this.scheduleRefresh(this.tokenDecoded.exp * 1000);
  }

  private scheduleRefresh(expiresAt: number) {
    this.clearRefreshTimer();

    const now = Date.now();
    const refreshIn = expiresAt - now - 1000;

    if (refreshIn <= 0) {
      this.refresh();
      return;
    }
    this.refreshTimeout = setTimeout(() => {
      this.refresh();
    }, refreshIn);
  }

  private clearRefreshTimer() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private async executeRefresh() {
    const response = await fetch(`${this.options.identityUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.options.clientId,
        redirect_uri: this.options.redirectUri,
        logout_uri: this.options.logoutRedirectUri,
      }),
    });

    if (!response.ok) {
      this.setAccessToken(null);
      this.broadcast.publish('SESSION_EXPIRED');
      return false;
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    this.requiredActions = getRequiredAction() || defaultRequiredOptions;

    return true;
  }

  private redirect() {
    globalThis.location.href = this.options.logoutRedirectUri;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken && !!this.tokenDecoded;
  }

  async login() {
    const { verifier, challenge } = await generatePKCE();

    const state = crypto.randomUUID();

    savePKCE(verifier);
    saveState(state);

    const url = new URL(`${this.options.identityUrl}/auth/authorize`);

    url.searchParams.set('client_id', this.options.clientId);
    url.searchParams.set('redirect_uri', this.options.redirectUri);
    url.searchParams.set('logout_uri', this.options.logoutRedirectUri);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('state', state);

    this.broadcast.publish('LOGIN');

    globalThis.location.href = url.toString();
  }

  async loginRequest(username: string, password: string) {
    const { verifier, challenge } = await generatePKCE();
    const state = crypto.randomUUID();

    const response = await fetch(`${this.options.identityUrl}/auth/sign-in`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        state: state,
        code_challenge: challenge,
        code_verifier: verifier,
        client_id: this.options.clientId,
        redirect_uri: this.options.redirectUri,
        logout_uri: this.options.logoutRedirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected error');
    }

    const data: { accessToken: string; requiredActions: Array<string> } = await response.json();

    if (data.requiredActions.length) {
      const pwd = data.requiredActions.includes(UserRequiredActionsEnum.UPDATE_PASSWORD);
      const mail = data.requiredActions.includes(UserRequiredActionsEnum.UPDATE_EMAIL);

      const obj: RequiredActionsProps = { email: mail, password: pwd };
      saveRequiredAction(obj);
      this.requiredActions = obj;
    }

    this.setAccessToken(data.accessToken);
  }

  async handleCallback(): Promise<'error' | 'success' | 'check'> {
    const params = new URLSearchParams(globalThis.location.search);

    const error = params.get('error');
    const code = params.get('code');
    const state = params.get('state');

    if (error) {
      const url = new URL(globalThis.location.href);
      url.search = '';
      globalThis.history.replaceState({}, document.title, url.toString());
      return 'error';
    }

    if (!code || !state) {
      return 'check';
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
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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

    this.setAccessToken(data.accessToken);

    clearPKCE();
    clearState();

    globalThis.history.replaceState({}, document.title, globalThis.location.pathname);

    const res = data.accessToken ? 'success' : 'error';
    if (res === 'success') {
      const pwd = params.get('updatepassword') === 'true';
      const mail = params.get('updateemail') === 'true';
      if (pwd || mail) {
        const obj: RequiredActionsProps = { email: mail, password: pwd };
        saveRequiredAction(obj);
        this.requiredActions = obj;
      }
    }

    return res;
  }

  async refresh() {
    if (this.refreshPromise !== null) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.executeRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
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
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    this.setAccessToken(null);

    this.broadcast.publish('LOGOUT');

    this.redirect();
  }

  async updateSpecificFields(emailStr: string, password: string, photoFile?: File): Promise<string> {
    const actions = [];

    let photoURL = '';
    if (photoFile) {
      const form = new FormData();
      form.append('file', photoFile);

      const response = await fetch(`${this.options.identityUrl}/utils/upload-file`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: form,
      });

      const data = await response.json();

      if (!data.url || !response.ok) {
        throw new Error('UPLOAD FILED | NOT FOUND URL');
      }

      photoURL = data.url;
    }

    if (emailStr || photoURL) {
      const response = await fetch(`${this.options.identityUrl}/users/${this.tokenDecoded?.sub}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStr || undefined, photo: photoURL || undefined }),
      });
      const obj = await response.json();
      if (!response.ok || !obj.success) throw new Error('NO SE PUDO ACTUALIZAR EL CORREO');

      if (emailStr) {
        actions.push(UserRequiredActionsEnum.UPDATE_EMAIL);
      }
    }

    if (password) {
      const response = await fetch(`${this.options.identityUrl}/users/${this.tokenDecoded?.sub}/password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const obj = await response.json();
      if (!response.ok || !obj.success) throw new Error('NO SE PUDO ACTUALIZAR LA CONTRASEÑA');

      actions.push(UserRequiredActionsEnum.UPDATE_PASSWORD);
    }

    if (actions.length) {
      const response = await fetch(`${this.options.identityUrl}/users/${this.tokenDecoded?.sub}/remove-actions`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions }),
      });
      const obj = await response.json();
      if (!response.ok || !obj.success) throw new Error('NO SE PUDO ACTUALIZAR LAS ACCIONES');
    }

    clearRequiredAction();
    this.requiredActions = defaultRequiredOptions;

    return photoURL;
  }
}

export default IdentityServiceClient;
