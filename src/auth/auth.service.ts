import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDTO } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(authDTO: AuthDTO) {
    try {
      //generate password to hashedPassword
      const hashed = await argon.hash(authDTO.password);
      // insert data to database
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashed,
          firstName: authDTO.firstName || '',
          lastName: authDTO.lastName || '',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, updatedAt, ...result } = user;

      return result;
    } catch (error) {
      console.log(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code == 'P2002') {
        throw new ForbiddenException('Error in credentials');
      }
    }
  }

  async login(authDTO: AuthDTO) {
    // find user with input email
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Email is not registered');
    }

    const pwMatches = await argon.verify(user.hashedPassword, authDTO.password);
    if (!pwMatches) {
      throw new ForbiddenException('Incorrect Email or Password');
    }

    const accessToken = await this.signToken(user.id, user.email);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
