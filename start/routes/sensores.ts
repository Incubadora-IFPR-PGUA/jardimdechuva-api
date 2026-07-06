import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('sensores', 'SensorController').apiOnly()
}).prefix('/api/v1')
