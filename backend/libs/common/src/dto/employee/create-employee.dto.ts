import { Transform } from 'class-transformer';
import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength,
} from 'class-validator';
import { Role } from '../../enums/role.enum';
import { trim, trimLower, trimToNull } from '../transforms';

export class CreateEmployeeDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Transform(trimLower)
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'role must be EMPLOYEE or HR' })
  role?: Role;

  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(100)
  position?: string | null;

  @IsOptional()
  @Transform(trimToNull)
  @IsUUID()
  departmentId?: string | null;

  @IsOptional()
  @Transform(trimToNull)
  @Matches(/^[0-9+\-\s()]{6,20}$/, { message: 'phone must be a valid phone number' })
  phone?: string | null;
}
