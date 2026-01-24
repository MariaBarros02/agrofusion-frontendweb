/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
/**
 * Mock global para import.meta.env
 */
if (typeof (globalThis as any)['import'] === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: {
          VITE_API_AUTH_AF_URL: 'http://localhost:8000',
          VITE_API_AUDIT_AF_URL: 'http://localhost:9000',
        },
      },
    },
    writable: true,
    configurable: true
  });
}

process.env.VITE_API_AUTH_AF_URL = 'http://localhost:8000';
process.env.VITE_API_AUDIT_AF_URL = 'http://localhost:9000';
