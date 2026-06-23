import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'PlanosController.index')
  Route.post('/', 'PlanosController.store')
  Route.put('/:id', 'PlanosController.update')
}).prefix('/api/v1/planos')
