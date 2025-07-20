import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;
}
