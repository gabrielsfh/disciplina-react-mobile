import { Schema, model } from 'mongoose';

const ProdutoSchema = new Schema({
  nome:      { type: String, required: true },
  preco:     { type: Number, required: true, min: 0 },
  quantidade:{ type: Number, required: true, min: 0 }
}, { timestamps: true });

export const Produto = model('Produto', ProdutoSchema);
