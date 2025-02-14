/* class Produto{
    constructor(nome, preco, estoque){
        this.nome = nome;
        this.preco = preco;
        this.estoque = estoque;
    }
}

const produto = new Produto("Pepita", 20.33, 20); */

const produto = {
    nome: "Pepita",
    preco: 20.33,
    estoque: 20
}

function exibirInfoProduto(produto){
    return `Produto: ${produto.nome}, Preço: R${produto.preco.toFixed(2)}, Estoque: ${produto.estoque} unidades.`;
}

const infosProduto = exibirInfoProduto(produto);

console.log(infosProduto);

// ForEach
const numeros = [1, 2, 3, 4, 5];

numeros.forEach(num => {
    console.log(`Numero: ${num}`);
});