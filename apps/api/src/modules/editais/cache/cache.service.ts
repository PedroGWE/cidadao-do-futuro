import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'

/**
 * Cache chave-valor com TTL. Usa Redis quando REDIS_URL está definido;
 * caso contrário cai em memória (dev/test) mantendo o mesmo contrato.
 */
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
}

@Injectable()
export class InMemoryCacheService extends CacheService {
  private store = new Map<string, { value: unknown; expiresAt: number }>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }
}

@Injectable()
export class RedisCacheService extends CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name)
  private client: Redis

  constructor(url: string) {
    super()
    this.client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true })
    this.client.on('error', (err) => this.logger.warn(`Redis indisponível: ${err.message}`))
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null // cache nunca derruba a rota
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch {
      // cache nunca derruba a rota
    }
  }

  onModuleDestroy() {
    this.client.disconnect()
  }
}
