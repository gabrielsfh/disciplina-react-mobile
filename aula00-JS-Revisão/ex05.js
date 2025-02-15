const cores = ['vermelho', 'verde', 'azul'];

for (const cor of cores){
    console.log(cor);
};

const pessoa = {
    nome: "Ciclano",
    idade: 66,
    usuario: "professor"
};

for(const chave in pessoa){
    console.log(`${chave}: ${pessoa[chave]}`);
};

// Map
const mapa = new Map();
mapa.set('nome', 'mapinha');
mapa.set('idade', 34);

console.log();
console.log(mapa.get('nome'));
console.log(mapa.get('idade'));

// WeakMap (objetos no lugar das chaves)
const obj = {id: 1};
const mapaFraco = new WeakMap();

console.log();
mapaFraco.set(obj, 'aluno 1');
console.log(mapaFraco.get(obj));
