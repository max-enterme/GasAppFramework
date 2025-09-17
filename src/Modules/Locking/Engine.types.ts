import type { Locking } from './Core.Types';

export interface LockEngine {
  acquire(resourceId: string, mode: Locking.Mode, ttlMs?: number, owner?: string | null): Locking.AcquireResult;
  extend(resourceId: string, token: string, ttlMs?: number): Locking.ExtendResult;
  release(resourceId: string, token: string): Locking.ReleaseResult;
  inspect(resourceId: string): any;
}