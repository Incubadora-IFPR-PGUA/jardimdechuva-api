import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  HOST: Env.schema.string({ format: 'host' }),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string.optional(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
  DB_CONNECTION: Env.schema.string(),
  MYSQL_HOST: Env.schema.string({ format: 'host' }),
  MYSQL_PORT: Env.schema.number(),
  MYSQL_USER: Env.schema.string(),
  MYSQL_PASSWORD: Env.schema.string.optional(),
  MYSQL_DB_NAME: Env.schema.string(),
  MQTT_ENABLED: Env.schema.boolean.optional(),
  MQTT_BROKER_URL: Env.schema.string.optional(),
  MQTT_USER: Env.schema.string.optional(),
  MQTT_PASSWORD: Env.schema.string.optional(),
  MQTT_TOPICS: Env.schema.string.optional(),
  WEBHOOK_SECRET: Env.schema.string.optional(),
})
