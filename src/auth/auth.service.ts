import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AuthDTO } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async register(authDTO: AuthDTO) {
    //generate password to hashedPassword
    const hashedPassword = await argon.hash(authDTO.password);
    // insert data to database
    const user = await this.prismaService.user.create({
      data: {
        email: authDTO.email,
        hashedPassword: hashedPassword,
        firstName: '',
        lastName: '',
      },
    });
    return user;
  }

  login() {
    return {
      message: 'This is login',
    };
  }
}
