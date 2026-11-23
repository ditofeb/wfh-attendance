import { QueryFailedError } from 'typeorm';

export function isDuplicateKey(err: unknown, keyName: string): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string; sqlMessage?: string } | undefined;
  return driverError?.code === 'ER_DUP_ENTRY' && (driverError.sqlMessage ?? '').includes(keyName);
}
