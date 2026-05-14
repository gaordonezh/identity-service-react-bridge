const PKCE_KEY = 'netapp_auth_pkce_verifier';
const STATE_KEY = 'netapp_auth_state';

export function savePKCE(verifier: string) {
  localStorage.setItem(PKCE_KEY, verifier);
}

export function getPKCE() {
  return localStorage.getItem(PKCE_KEY);
}

export function clearPKCE() {
  localStorage.removeItem(PKCE_KEY);
}

export function saveState(state: string) {
  localStorage.setItem(STATE_KEY, state);
}

export function getState() {
  return localStorage.getItem(STATE_KEY);
}

export function clearState() {
  localStorage.removeItem(STATE_KEY);
}
