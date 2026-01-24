/* eslint-disable @typescript-eslint/no-explicit-any */
import '../__mocks__/apiMocks';

import { 
  handleSSOLoginEP, 
  handleReqResPasswordEP, 
  handleResPasswordEP 
} from '../../services/auth/authOrchestrator.service';

// Importamos los mocks que configuramos previamente
import { ssoLoginService } from '../../services/agrofusion/auth.service';
import { registerErrorPEService } from '../../services/agrofusion/audit.service';
import { reqResetPasswordService as reqResPassSigmaSer } from '../../services/sigma/auth.service';
import { reqResetPasswordService as reqResPassDisSer } from '../../services/disriegos/auth.service';

// Mockeamos los servicios individuales
jest.mock('../../services/agrofusion/auth.service');
jest.mock('../../services/agrofusion/audit.service');
jest.mock('../../services/sigma/auth.service');
jest.mock('../../services/disriegos/auth.service');

describe('AuthOrchestrator Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSSOLoginEP', () => {
    it('debe retornar el token sso cuando la respuesta es exitosa', async () => {
      (ssoLoginService as jest.Mock).mockResolvedValue({ sso_token: 'valid-token' });

      const result = await handleSSOLoginEP('SIGMA');

      expect(result).toEqual({ sso_token: 'valid-token' });
      expect(ssoLoginService).toHaveBeenCalledWith('SIGMA');
    });

    it('debe registrar el error en auditoría cuando el servicio falla', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { detail: { message: 'Server Error' } }
        }
      };
      (ssoLoginService as jest.Mock).mockRejectedValue(mockError);

      const result = await handleSSOLoginEP('DISRIEGO');

      expect(result).toHaveProperty('errors');
      expect(registerErrorPEService).toHaveBeenCalled();
      // Verificamos que el error sea de severidad HIGH como indica tu código
      expect((registerErrorPEService as jest.Mock).mock.calls[0][0][0].severity).toBe('HIGH');
    });
  });

  describe('handleReqResPasswordEP', () => {
    const mockEmail = 'test@agrofusion.com';
    const mockProjects: any[] = [
      { instance_code: 'DISRIEGO' },
      { instance_code: 'SIGMA' }
    ];

    it('debe recolectar tokens de ambos servicios en paralelo', async () => {
      (reqResPassDisSer as jest.Mock).mockResolvedValue({ token: 'token-dis' });
      (reqResPassSigmaSer as jest.Mock).mockResolvedValue({ token: 'token-sig' });

      const result = await handleReqResPasswordEP(mockEmail, mockProjects);

      expect(result.tokens).toEqual({
        tDisriego: 'token-dis',
        tSigma: 'token-sig'
      });
      expect(result.errors).toHaveLength(0);
    });

    it('debe manejar errores parciales (uno falla, el otro funciona)', async () => {
      (reqResPassDisSer as jest.Mock).mockResolvedValue({ token: 'token-dis' });
      (reqResPassSigmaSer as jest.Mock).mockRejectedValue(new Error('Sigma Down'));

      const result = await handleReqResPasswordEP(mockEmail, mockProjects);

      // El token de Disriego debería estar presente
      expect(result.tokens).toEqual({ tDisriego: 'token-dis' });
      // Debería haber un error registrado para Sigma
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].project).toBe('SIGMA');
      // Debe auditar el fallo
      expect(registerErrorPEService).toHaveBeenCalled();
    });

    it('debe retornar objetos vacíos si no hay proyectos', async () => {
      const result = await handleReqResPasswordEP(mockEmail, []);
      expect(result.tokens).toEqual({});
      expect(result.errors).toEqual([]);
    });
  });

  describe('handleResPasswordEP', () => {
    it('debe retornar errores si los servicios fallan al resetear', async () => {
      const mockProjects: any[] = [{ instance_code: 'SIGMA' }];
      (reqResPassSigmaSer as jest.Mock).mockRejectedValue({ 
          response: { data: { detail: { message: 'Error' } } } 
      });

      const result = await handleResPasswordEP('t1', 't2', 'pass', 'pass', mockProjects);
      
      expect(result).toEqual(expect.objectContaining({
        errors: expect.any(Array),
      }));
    });
  });
});