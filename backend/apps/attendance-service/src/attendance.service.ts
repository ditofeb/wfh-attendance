import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, SelectQueryBuilder } from 'typeorm';
import {
  Attendance, AttendanceHistoryQueryDto, AttendanceQueryDto, dateInZone, Employee,
  isDuplicateKey, paginate, rpcError,
} from '@app/common';
import type {
  ClockOutPayload, Paginated, SubmitAttendancePayload, TodayAttendanceStatus,
} from '@app/common';

@Injectable()
export class AttendanceService {
  private readonly timeZone: string;

  constructor(
    @InjectRepository(Attendance) private readonly attendances: Repository<Attendance>,
    @InjectRepository(Employee) private readonly employees: Repository<Employee>,
    config: ConfigService,
  ) {
    this.timeZone = config.get<string>('APP_TIMEZONE', 'Asia/Jakarta');
  }

  async submit({ employeeId, photoPath, notes }: SubmitAttendancePayload): Promise<Attendance> {
    await this.ensureActive(employeeId);

    const now = new Date();
    const attendanceDate = dateInZone(this.timeZone, now);

    try {
      return await this.attendances.save(
        this.attendances.create({
          employeeId,
          attendanceDate,
          attendanceTime: now,
          photoPath,
          notes: notes ?? null,
        }),
      );
    } catch (err) {
      if (isDuplicateKey(err, 'uq_attendance_employee_date')) {
        throw rpcError(HttpStatus.CONFLICT, 'You have already submitted attendance today');
      }
      throw err;
    }
  }

  async clockOut({ employeeId }: ClockOutPayload): Promise<Attendance> {
    await this.ensureActive(employeeId);

    const attendanceDate = dateInZone(this.timeZone);
    const attendance = await this.attendances.findOne({ where: { employeeId, attendanceDate } });
    if (!attendance) throw rpcError(HttpStatus.NOT_FOUND, 'You have not clocked in today');

    const result = await this.attendances.update(
      { id: attendance.id, clockOutTime: IsNull() },
      { clockOutTime: new Date() },
    );
    if (!result.affected) throw rpcError(HttpStatus.CONFLICT, 'You have already clocked out today');

    return this.attendances.findOneByOrFail({ id: attendance.id });
  }

  async findToday(employeeId: string): Promise<TodayAttendanceStatus> {
    const date = dateInZone(this.timeZone);
    const attendance = await this.attendances.findOne({ where: { employeeId, attendanceDate: date } });
    return { date, submitted: attendance !== null, attendance };
  }

  async findMine(employeeId: string, query: AttendanceHistoryQueryDto): Promise<Paginated<Attendance>> {
    const qb = this.attendances
      .createQueryBuilder('a')
      .where('a.employeeId = :employeeId', { employeeId });

    this.applyDateRange(qb, query);
    return this.paginateQuery(qb, query);
  }

  async findAll(query: AttendanceQueryDto): Promise<Paginated<Attendance>> {
    const qb = this.attendances
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.employee', 'e')
      .leftJoinAndSelect('e.department', 'd');

    if (query.employeeId) qb.andWhere('a.employeeId = :employeeId', { employeeId: query.employeeId });
    if (query.departmentId) qb.andWhere('e.departmentId = :departmentId', { departmentId: query.departmentId });
    if (query.search) {
      qb.andWhere('(e.name LIKE :s OR e.employeeCode LIKE :s)', { s: `%${query.search}%` });
    }
    this.applyDateRange(qb, query);
    return this.paginateQuery(qb, query);
  }

  private async ensureActive(employeeId: string): Promise<void> {
    const employee = await this.employees.findOne({
      where: { id: employeeId },
      select: { id: true, isActive: true },
    });
    if (!employee) throw rpcError(HttpStatus.NOT_FOUND, 'Employee not found');
    if (!employee.isActive) {
      throw rpcError(HttpStatus.FORBIDDEN, 'Account is inactive. Please contact HR.');
    }
  }

  private applyDateRange(qb: SelectQueryBuilder<Attendance>, { dateFrom, dateTo }: AttendanceHistoryQueryDto) {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw rpcError(HttpStatus.BAD_REQUEST, 'dateFrom must be before or equal to dateTo');
    }
    if (dateFrom) qb.andWhere('a.attendanceDate >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('a.attendanceDate <= :dateTo', { dateTo });
  }

  private async paginateQuery(
    qb: SelectQueryBuilder<Attendance>,
    { page = 1, limit = 10 }: AttendanceHistoryQueryDto,
  ): Promise<Paginated<Attendance>> {
    qb.orderBy('a.attendanceDate', 'DESC')
      .addOrderBy('a.attendanceTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, page, limit);
  }
}
