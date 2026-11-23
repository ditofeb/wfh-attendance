import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trimToNull } from '../transforms';

export class SubmitAttendanceDto {
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(255)
  notes?: string | null;
}
