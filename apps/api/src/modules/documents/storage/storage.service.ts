import { Injectable } from '@nestjs/common'
import { createReadStream } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import type { Readable } from 'node:stream'

/**
 * Abstração de storage de arquivos. A chave (key) é um caminho relativo
 * ao root do storage (ex: "tenantId/arquivo.pdf"). Trocar por S3 depois
 * exige apenas outra implementação deste contrato.
 */
export abstract class StorageService {
  abstract save(key: string, content: Buffer): Promise<void>
  abstract delete(key: string): Promise<void>
  abstract readStream(key: string): Readable
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly root = process.env.STORAGE_DIR ?? join(process.cwd(), 'uploads')

  private absolute(key: string): string {
    const abs = resolve(this.root, key)
    // impede path traversal via key
    if (!abs.startsWith(resolve(this.root))) throw new Error('Chave de storage inválida')
    return abs
  }

  async save(key: string, content: Buffer): Promise<void> {
    const abs = this.absolute(key)
    await mkdir(dirname(abs), { recursive: true })
    await writeFile(abs, content)
  }

  async delete(key: string): Promise<void> {
    await rm(this.absolute(key), { force: true })
  }

  readStream(key: string): Readable {
    return createReadStream(this.absolute(key))
  }
}
