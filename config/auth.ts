import type { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'api',
  guards: {
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'api_tokens',
        foreignKey: 'id_usuario', // era 'user_id'
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'idUsuario', // era 'id'
        uids: ['email'],
        model: () => import('App/Models/Usuario'),
        passwordColumnName: 'senha', // faltava essa linha
      },
    },
  },
}

export default authConfig