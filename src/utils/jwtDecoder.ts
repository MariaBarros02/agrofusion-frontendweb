import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): JwtPayload => {
  return jwtDecode<JwtPayload>(token);
};