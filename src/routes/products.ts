import express from 'express'
import { authenticateAdmin } from '../controllers/auth'
import {
  createProduct,
  getImg,
  getProducts,
  searchProducts,
  updateProduct,
  upload,
} from '../controllers/products'

const router = express.Router()

router.post('/', [authenticateAdmin, upload.array('imgs', 12)], createProduct)
router.post('/search', authenticateAdmin, searchProducts)
router.patch(
  '/:id',
  [authenticateAdmin, upload.array('imgs', 12)],
  updateProduct
)
router.get('/', authenticateAdmin, getProducts)
router.get('/img/:id', getImg)

export default router
