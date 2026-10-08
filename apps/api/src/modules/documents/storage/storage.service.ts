import { Injectable } from '@nestjs/common'
import { createReadStream } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'

export abstract class StorageService {
  abstract save(key: string, content: Buffer): Promise<void>
  abstract delete(key: string): Promise<void>
  abstract readStream(key: string): ReturnType<typeof createReadStream>
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly root = resolve(process.env.STORAGE_DIR ?? './uploads')

  private path(key: string) {
    const path = resolve(join(this.root, key))
    if (isAbsolute(key) || !path.startsWith(this.root + sep)) throw new Error('Chave de arquivo inválida')
    return path
  }

  async save(key: string, content: Buffer) {
    const path = this.path(key)
    await mkdir(resolve(path, '..'), { recursive: true })
    await writeFile(path, content, { flag: 'wx', mode: 0o600 })
  }

  async delete(key: string) { await rm(this.path(key), { force: true }) }

  readStream(key: string) { return createReadStream(this.path(key)) }
}
