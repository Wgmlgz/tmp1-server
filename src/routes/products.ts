import express from 'express'
import {
  createCategory,
  removeCategory,
  getCategories,
} from '../controllers/categories'
import { authenticateAdmin } from '../controllers/auth'
import {
  createProduct,
  getImg,
  getProducts,
  updateProduct,
  upload,
} from '../controllers/products'

const router = express.Router()

router.post('/', [authenticateAdmin, upload.array('imgs', 12)], createProduct)
router.patch(
  '/:id',
  [authenticateAdmin, upload.array('imgs', 12)],
  updateProduct
)
router.get('/', authenticateAdmin, getProducts)
router.get('/img/:id', getImg)

export default router
