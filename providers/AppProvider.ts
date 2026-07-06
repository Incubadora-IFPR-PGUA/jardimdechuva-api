import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready
  }

  public async ready () {
    if (this.app.environment !== 'web') {
      return
    }

    const { default: MqttService } = await import('App/Services/MqttService')
    MqttService.connect()

    const { default: printStartupBanner } = await import('App/Utils/StartupBanner')
    await printStartupBanner()
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}