import express from 'express'
import {
  createProductMove,
  removeProductMove,
  updateProductMove,
  getProductsMove,
} from '../controllers/products_move'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getProductsMove)
router.post('/', authenticateAdmin, createProductMove)
// router.patch('/:id', authenticateAdmin, updateProductMove)
// router.delete('/:id', authenticateAdmin, removeProductMove)

export default router
