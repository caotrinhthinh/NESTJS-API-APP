import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDTO } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new ForbiddenException('Error in credentials');
      }
    }
  }

  login() {
    return {
      message: 'This is login',
    };
  }
}
