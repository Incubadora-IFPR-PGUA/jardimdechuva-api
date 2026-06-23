import Env from '@ioc:Adonis/Core/Env'
import { hashConfig } from '@adonisjs/core/build/config'

export default hashConfig({
  default: Env.get('HASH_DRIVER', 'bcrypt'),

  list: {
    bcrypt: {
      driver: 'bcrypt',
      rounds: 10,
    },

    scrypt: {
      driver: 'scrypt',
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
      saltSize: 16,
      keyLength: 64,
      maxMemory: 32 * 1024 * 1024,
    },

    argon: {
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    },
  },
})