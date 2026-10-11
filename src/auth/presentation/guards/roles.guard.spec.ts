import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../common/enums/role.enum';
import { RolesGuard } from './roles.guard';

function contextWith(user?: { role: Role }) {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('allows any authenticated user when the route declares no roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextWith({ role: Role.REGULAR }))).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.REGULAR, Role.ADMIN]);
    expect(guard.canActivate(contextWith({ role: Role.ADMIN }))).toBe(true);
  });

  it('forbids a regular user on an admin-only route', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(contextWith({ role: Role.REGULAR }))).toThrow(
      ForbiddenException,
    );
  });

  it('forbids a request that has no user attached', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(contextWith(undefined))).toThrow(ForbiddenException);
  });
});