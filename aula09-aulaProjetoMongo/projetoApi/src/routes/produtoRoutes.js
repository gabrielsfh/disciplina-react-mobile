import { Router } from 'express';
import { produtoController } from '../controllers/produtoController.js';

const router = Router();
router.post('/',   produtoController.criar);
router.get('/',    produtoController.listar);
router.get('/:id', produtoController.obter);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.deletar);

export default router;
