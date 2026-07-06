import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('jardins', 'JardimController').apiOnly()
}).prefix('/api/v1').middleware('jwtAuth') // 👈 era 'auth:api'