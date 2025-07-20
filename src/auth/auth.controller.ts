import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() authDTO: AuthDTO) {
    return this.authService.register(authDTO);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() authDTO: AuthDTO) {
    return this.authService.login(authDTO);
  }
}
