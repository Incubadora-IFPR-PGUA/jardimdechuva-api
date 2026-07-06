
import Usuario from 'App/Models/Usuario'

declare module '@ioc:Adonis/Addons/Auth' {
  interface ProvidersList {
    user: {
      implementation: LucidProviderContract<typeof Usuario>
      config: LucidProviderConfig<typeof Usuario>
    }
  }
  interface GuardsList {
    api: {
      implementation: OATGuardContract<'user', 'api'>
      config: OATGuardConfig<'user'>
      client: OATClientContract<'user'>
    }
  }
}
