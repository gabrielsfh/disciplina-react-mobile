// Exemplo 1: Variaáveis (var, let e const)

// Usando var(escopo global/função)

let nome = "Biel";

if(true){
    let nome = "Maria";
    console.log(nome);
}

console.log(nome);

/*
console.log("pi", pi); // Aqui dá erro porque a variável `pi` não foi definida antes.

if (true) {
    const pi = 3.18;
    console.log("pi no if = ", pi); // Aqui a variável pi é declarada e definida dentro do bloco, sem conflitos.
}
*/

/* 
// Dá erro de atribuição de tipo porque a variável `pi` não foi declarada previamente com `let`, `const`, ou `var`.
// pi = "pi"; 
// console.log(pi);
*/

/*
var nome = "Biel";

if(true){
    var nome = "Maria";
    console.log(nome);
}

console.log(nome);
*/