import { jest } from '@jest/globals';

jest.mock('../../api/agrofusion/auth.api', () => ({
  authApi: {
    ssoLogin: jest.fn(),
    reqResetPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock('../../api/agrofusion/audit.api', () => ({
  auditApi: {
    registerErrorPE: jest.fn(),
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
