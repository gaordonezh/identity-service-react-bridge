import { jwtDecode } from 'jwt-decode';
import type { JwtDecodedPayload } from '../types/global';

export function getTokenDecoded(token: string) {
  return jwtDecode<JwtDecodedPayload>(token);
}
