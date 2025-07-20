import { Controller, Get, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from './../auth/decorator/user.decorator';
import { JwtAuthGuard } from './../auth/guard';

@Controller('users')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser() req: Request) {
    return req.user;
  }
}
