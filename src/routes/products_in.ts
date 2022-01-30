import express from 'express'
import {
  createProductIn,
  removeProductIn,
  updateProductIn,
  getProductsIn,
} from '../controllers/products_in'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getProductsIn)
router.post('/', authenticateAdmin, createProductIn)
// router.patch('/:id', authenticateAdmin, updateProductIn)
// router.delete('/:id', authenticateAdmin, removeProductIn)

export default router
