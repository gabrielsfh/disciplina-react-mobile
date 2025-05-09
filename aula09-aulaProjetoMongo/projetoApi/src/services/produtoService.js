import { produtoRepository } from "../repositories/produtoRepository";

export const produtoService = {
    async criarProduto(dto) {
        if(dto.preco < 0) throw new Error('Preço negativo não permitido');
        return produtoRepository.cria(dto);
    },
    async listarProdutos(){
        return produtoRepository.listarTodos();
    },
    async obterProduto(id){
        const p = await produtoRepository.buscarPorID(id);
        if(!p) throw new Error('Produto não encontrado');
        return p;
    },
    async atualizarProduto(id, dto){
        return produtoRepository.atualizar(id, dto);
    },
    async removeProduto(id){
        return produtoRepository.delete(id);
    }
}