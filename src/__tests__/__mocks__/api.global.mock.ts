import { jest } from '@jest/globals';

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

jest.mock('../../api/agrofusion/audit.api', () => ({
  auditApi: {
    registerErrorPE: jest.fn(),
  },
}));
