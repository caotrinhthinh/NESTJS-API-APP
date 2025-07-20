/* eslint-disable @typescript-eslint/no-unused-vars */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDTO } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(authDTO: AuthDTO) {
    try {
      const hashed = await argon.hash(authDTO.password);
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashed,
          firstName: authDTO.firstName || '',
          lastName: authDTO.lastName || '',
        },
      });

      const { hashedPassword, updatedAt, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      throw error;
    }
  }

  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { email: authDTO.email },
    });

    if (!user) {
      throw new ForbiddenException('Email is not registered');
    }

    const pwMatches = await argon.verify(user.hashedPassword, authDTO.password);
    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Email or Password');
    }

    const accessToken = await this.signToken(user.id, user.email);
    const { hashedPassword, updatedAt, ...userInfo } = user;

    return {
      user: userInfo,
      access_token: accessToken,
    };
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload, {
      expiresIn: '10m',
      secret: process.env.JWT_SECRET,
    });
  }
}
