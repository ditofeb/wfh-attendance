import {
  BadRequestException, CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { MulterModuleOptions } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { catchError, Observable, throwError } from 'rxjs';

const ALLOWED_TYPES = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

export function attendancePhotoMulterOptions(config: ConfigService): MulterModuleOptions {
  const uploadRoot = config.get<string>('UPLOAD_DIR', 'uploads');
  const maxMb = Number(config.get('UPLOAD_MAX_MB', 2));

  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const now = new Date();
        const dir = join(
          uploadRoot,
          'attendance',
          String(now.getFullYear()),
          String(now.getMonth() + 1).padStart(2, '0'),
        );
        mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${ALLOWED_TYPES.get(file.mimetype)}`),
    }),
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
      cb(new BadRequestException('Photo must be a JPG, PNG or WEBP image'), false);
    },
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  };
}

@Injectable()
export class DeleteUploadOnErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Upload');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        const file = context.switchToHttp().getRequest<Request>().file;
        if (file?.path) {
          unlink(file.path).catch((e: unknown) =>
            this.logger.warn(`Could not delete orphan upload ${file.path}: ${String(e)}`),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
