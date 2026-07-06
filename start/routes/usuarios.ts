import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('usuarios', 'UsuarioController').apiOnly()
}).prefix('/api/v1')
