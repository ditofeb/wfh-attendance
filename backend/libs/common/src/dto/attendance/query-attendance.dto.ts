import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../pagination-query.dto';
import { trim } from '../transforms';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class AttendanceHistoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Matches(DATE_ONLY, { message: 'dateFrom must be in YYYY-MM-DD format' })
  dateFrom?: string;

  @IsOptional()
  @Matches(DATE_ONLY, { message: 'dateTo must be in YYYY-MM-DD format' })
  dateTo?: string;
}

export class AttendanceQueryDto extends AttendanceHistoryQueryDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  search?: string;
}
