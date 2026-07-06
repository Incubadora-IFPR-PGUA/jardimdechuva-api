import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('tipos-sensores', 'TipoSensorController').apiOnly()
}).prefix('/api/v1')
