import { serviceTokenService } from "../auth.service";

let token: string | null = null;
let expiresAt: number | null = null;

export const getSigmaServiceToken = async (email: string) => {
  const now = Date.now();

  if (token && expiresAt && now < expiresAt) {
    return token;
  }

  const response = await serviceTokenService(
    import.meta.env.VITE_CLIENT_ID,
    import.meta.env.VITE_CLIENT_SECRET,
    email
  );
  console.log("Nuevo token de servicio obtenido para Sigma:", response); 

  token = response.access_token;
  expiresAt = now + response.expires_in * 1000;

  return token;
};
