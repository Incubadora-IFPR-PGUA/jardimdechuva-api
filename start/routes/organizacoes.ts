import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.get('/', 'OrganizacaoController.index')
  Route.post('/', 'OrganizacaoController.store')
  Route.get('/:id', 'OrganizacaoController.show')
  Route.put('/:id', 'OrganizacaoController.update')
  Route.delete('/:id', 'OrganizacaoController.destroy')

  Route.post('/:id/usuarios', 'OrganizacaoController.vincularUsuario')
  Route.delete('/:id/usuarios/:idUsuario', 'OrganizacaoController.desvincularUsuario')
}).prefix('/api/v1/organizacoes')
