import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  cleanDatabase() {
    // Xoá dữ liệu Note trước (1-N), sau đó mới xoá User
    return this.$transaction([
      this.note.deleteMany(), // nếu Note tồn tại trong Prisma schema
      this.user.deleteMany(), // nếu User tồn tại trong Prisma schema
    ]);
  }
}
