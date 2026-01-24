import { jest } from '@jest/globals';

// Mock manual de las instancias de API
// Esto intercepta las importaciones de tus archivos .api.ts
jest.mock('../../api/agrofusion/auth.api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    getExternalProjects: jest.fn(),
    verifyMfa: jest.fn(),
    reqResetPassword: jest.fn(),
    resetPassword: jest.fn(),
    ssoLogin: jest.fn(),
  },
}));

jest.mock('../../api/sigma/auth.api', () => ({
  authApiSigma: {
    reqResetPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock('../../api/disriego/auth.api', () => ({
  authApiDisriego: {
    reqResetPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

// Exportamos una utilidad para limpiar todos los mocks entre cada test
export const clearAllMocks = () => {
  jest.clearAllMocks();
};