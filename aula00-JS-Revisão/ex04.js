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
const numeros = [15, 45, 55, 64, 84];

numeros.forEach(num => {
    console.log(`Numero: ${num}`);
});

// map
const dobrarValor = numeros.map(num => num*2);
                                                                                                       
console.log("Valor dobrado: " + dobrarValor);
console.log("Valor do array: " + numeros);

// filter
const maioresQue30 = numeros.filter(num => num > 30);
console.log("Valores maior que 30: " + maioresQue30);

// find (encontra apenas o primeiro resultado)
const maiorQue40 = numeros.find(num => num > 40);
console.log("Valores maior que 40: " + maiorQue40);

// every (se a condição for verdade para todos retorna um boolean)
const todosMaiores = numeros.every(num => num > 14);
const todosMaiores2 = numeros.every(num => num > 200);

console.log("Todos maiores que 14: " + todosMaiores);
console.log("Todos maiores que 200: " + todosMaiores2);

// some (se a condição for menor para pelo menos um retorna true)
const existeMaior = numeros.some(num => num > 200);
const existeMaior2 = numeros.some(num => num > 50);

console.log("Existe maior que 200: " + existeMaior);
console.log("Existe maior que 50: " + existeMaior);