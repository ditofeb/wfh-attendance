import {
  GatewayTimeoutException, HttpException, InternalServerErrorException,
  Logger, ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { isRpcErrorPayload } from '@app/common';

const logger = new Logger('RPC');

export async function callService<TResult>(
  client: ClientProxy,
  pattern: string,
  data: unknown = {},
  timeoutMs = 5000,
): Promise<TResult> {
  try {
    return await firstValueFrom(client.send<TResult>(pattern, data).pipe(timeout(timeoutMs)));
  } catch (err) {
    if (isRpcErrorPayload(err)) {
      throw new HttpException(err, err.statusCode);
    }
    if (err instanceof TimeoutError) {
      throw new GatewayTimeoutException(`Service did not respond in time (${pattern})`);
    }
    if ((err as { code?: string })?.code === 'ECONNREFUSED') {
      throw new ServiceUnavailableException(`Service unavailable (${pattern})`);
    }
    logger.error(`Unexpected error calling ${pattern}`, err instanceof Error ? err.stack : err);
    throw new InternalServerErrorException();
  }
}
