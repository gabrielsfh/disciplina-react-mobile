// Função normal 
function saudacao(nome){
    return "Olá " + nome + "!";
}

console.log(saudacao("Gabriel Henrique"));

// Função anonima 
const soma = function (a, b){
    return a + b;
}

console.log(soma(3, 2));

// Função arrow
let multiplicacao = (a, b) => a * b;

console.log(multiplicacao(2,2));
