import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../../common/enums/role.enum';
import { JwtPayload } from '../../application/jwt-payload';
import { JwtAuthGuard } from './jwt-auth.guard';

function contextWith(headers: Record<string, string>) {
  const request: Record<string, unknown> = { headers };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  let jwt: jest.Mocked<JwtService>;
  let guard: JwtAuthGuard;

  const payload: JwtPayload = { sub: 'id-1', email: 'pablo@test.com', role: Role.REGULAR };

  beforeEach(() => {
    jwt = { verifyAsync: jest.fn() } as unknown as jest.Mocked<JwtService>;
    guard = new JwtAuthGuard(jwt);
  });

  it('rejects a request without an Authorization header', async () => {
    const { context } = contextWith({});
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a header that is not a Bearer token', async () => {
    const { context } = contextWith({ authorization: 'Basic abc123' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an invalid or expired token', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const { context } = contextWith({ authorization: 'Bearer bad-token' });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid token and attaches the payload to request.user', async () => {
    jwt.verifyAsync.mockResolvedValue(payload);
    const { context, request } = contextWith({ authorization: 'Bearer good-token' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('good-token');
    expect(request.user).toEqual(payload);
  });
});