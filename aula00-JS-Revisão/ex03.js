const pessoa = {
    nome: "John F Kennedy",
    idade: 108,
    usuario: "presidente",
    saudar: function (){
        return "Oi, meu nome é" + this.nome + " e eu sou" + this.usuario + ".";
    }
}

console.log(pessoa.nome);
console.log(pessoa.saudar);