import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  /**
   * Expiración
   */
  exp: number;
  /**
   * userId
   */
  sub: string;
  /**
   * sessionId
   */
  sid: string;
}

export function getTokenExpiration(token: string) {
  const decoded = jwtDecode<JwtPayload>(token);
  return decoded.exp * 1000;
}
