const notasService = require('../notas.service');

const tools = [
  {
    name: 'listar_notas',
    description: 'Obtiene todas las notas guardadas en la base de datos',
    execute: async () => await notasService.listar(),
  },
  {
    name: 'buscar_nota',
    description: 'Busca una nota específica por su ID numérico',
    execute: async ({ id }) => await notasService.buscar(Number(id)),
  },
];

module.exports = { tools };
