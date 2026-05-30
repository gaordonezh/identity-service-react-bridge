import type { RequiredActionsProps } from '../types/global';

const PKCE_KEY = 'identity_service_pkce_verifier';
const STATE_KEY = 'identity_service_state';
const ACTIONS_KEY = 'identity_service_required_actions';

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

export function saveRequiredAction(record: RequiredActionsProps) {
  localStorage.setItem(ACTIONS_KEY, JSON.stringify(record));
}

export function getRequiredAction(): undefined | RequiredActionsProps {
  const parsed = localStorage.getItem(ACTIONS_KEY) || 'null';
  if (!parsed) return;
  return JSON.parse(parsed);
}

export function clearRequiredAction() {
  localStorage.removeItem(ACTIONS_KEY);
}
