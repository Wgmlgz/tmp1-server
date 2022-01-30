import express from 'express'
import {
  createProductOut,
  removeProductOut,
  updateProductOut,
  getProductsOut,
} from '../controllers/products_out'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getProductsOut)
router.post('/', authenticateAdmin, createProductOut)
// router.patch('/:id', authenticateAdmin, updateProductOut)
// router.delete('/:id', authenticateAdmin, removeProductOut)

export default router
