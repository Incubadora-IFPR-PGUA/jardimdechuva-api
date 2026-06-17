import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('tipos-dispositivos', 'TipoDispositivoController').apiOnly()
}).prefix('/api/v1')
