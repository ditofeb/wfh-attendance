import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@app/common';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return field ? user?.[field] : user;
  },
);
