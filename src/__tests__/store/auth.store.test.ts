import { handleSSOLoginEP } from '../../services/orchestrator/authOrchestrator.service';
import { ssoLoginService } from '../../services/agrofusion/auth.service';
import { registerErrorPEService } from '../../services/agrofusion/audit.service';

jest.mock('../../services/agrofusion/auth.service');
jest.mock('../../services/agrofusion/audit.service');
jest.mock('../../services/sigma/auth.service');
jest.mock('../../services/disriegos/auth.service');

describe('AuthOrchestrator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe ejecutar handleSSOLoginEP correctamente', async () => {
    (ssoLoginService as jest.Mock).mockResolvedValue({ sso_token: 'test-token' });
    const result = await handleSSOLoginEP('SIGMA');
    expect(result).toEqual({ sso_token: 'test-token' });
  });

  it('debe manejar errores en handleSSOLoginEP y auditar', async () => {
    (ssoLoginService as jest.Mock).mockRejectedValue(new Error('Fail'));
    await handleSSOLoginEP('SIGMA');
    expect(registerErrorPEService).toHaveBeenCalled();
  });
});