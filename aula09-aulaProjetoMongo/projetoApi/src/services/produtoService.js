import { produtoRepository } from '../repositories/produtoRepository.js';

export const produtoService = {
  async criarProduto(dto) {
    if (dto.preco < 0) throw new Error('Preço negativo não permitido');
    return produtoRepository.criar(dto);
  },
  async listarProdutos() {
    return produtoRepository.listarTodos();
  },
  async obterProduto(id) {
    const p = await produtoRepository.buscarPorId(id);
    if (!p) throw new Error('Produto não encontrado');
    return p;
  },
  async atualizarProduto(id, dto) {
    return produtoRepository.atualizar(id, dto);
  },
  async removerProduto(id) {
    return produtoRepository.deletar(id);
  }
};
