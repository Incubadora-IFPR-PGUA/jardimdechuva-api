import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('jardins', 'JardimController').apiOnly()
}).prefix('/api/v1')
