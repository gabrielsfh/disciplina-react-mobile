import { produtoService } from '../services/produtoService.js';

export const produtoController = {
  async criar(req, res, next) {
    try {
      const criado = await produtoService.criarProduto(req.body);
      res.status(201).json(criado);
    } catch (err) { next(err); }
  },
  async listar(req, res, next) {
    try {
      const lista = await produtoService.listarProdutos();
      res.json(lista);
    } catch (err) { next(err); }
  },
  async obter(req, res, next) {
    try {
      const p = await produtoService.obterProduto(req.params.id);
      res.json(p);
    } catch (err) { next(err); }
  },
  async atualizar(req, res, next) {
    try {
      const updated = await produtoService.atualizarProduto(req.params.id, req.body);
      res.json(updated);
    } catch (err) { next(err); }
  },
  async deletar(req, res, next) {
    try {
      await produtoService.removerProduto(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
};
