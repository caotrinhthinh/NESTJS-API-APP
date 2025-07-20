// auth/decorator/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  <T = keyof User>(key: T, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (key) {
      return user[key as keyof User];
    }

    return user;
  },
);
