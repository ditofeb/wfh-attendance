import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
