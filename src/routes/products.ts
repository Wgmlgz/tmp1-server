import express from 'express'
import { authenticateAdmin } from '../controllers/auth'
import {
  createProduct,
  getImg,
  getProducts,
  getCount,
  searchProducts,
  updateProduct,
  updateManyProducts,
  upload,
  createExcelProducts,
  getProduct,
  removeProducts,
  getExcelImports,
  createWbUrlProduct,
} from '../controllers/products'

const router = express.Router()

router.post('/', [authenticateAdmin, upload.array('imgs', 12)], createProduct)
router.post('/wb_url', authenticateAdmin, createWbUrlProduct)
router.post('/excel', authenticateAdmin, createExcelProducts)
router.get('/excel', authenticateAdmin, getExcelImports)
router.post('/search/:pageNumber/:nPerPage', authenticateAdmin, searchProducts)
router.patch('/many', [authenticateAdmin], updateManyProducts)
router.patch(
  '/:id',
  [authenticateAdmin, upload.array('imgs', 12)],
  updateProduct
)
router.get('/product/:id', authenticateAdmin, getProduct)
router.post('/remove', authenticateAdmin, removeProducts)
router.get('/page/:pageNumber/:nPerPage', authenticateAdmin, getProducts)
router.get('/img/:id', getImg)
router.get('/count', authenticateAdmin, getCount)

export default router
