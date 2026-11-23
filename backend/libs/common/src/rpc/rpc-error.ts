import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

export interface RpcErrorPayload {
  statusCode: number;
  message: string | string[];
}

export const rpcError = (statusCode: HttpStatus, message: string | string[]) =>
  new RpcException({ statusCode, message } satisfies RpcErrorPayload);

export const isRpcErrorPayload = (err: unknown): err is RpcErrorPayload =>
  typeof err === 'object' && err !== null && 'statusCode' in err && 'message' in err;
