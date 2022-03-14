import express from 'express'
import {
  authenticateContentManager,
} from '../controllers/auth'
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

router.post(
  '/',
  [authenticateContentManager, upload.array('imgs', 12)],
  createProduct
)
router.post('/wb_url', authenticateContentManager, createWbUrlProduct)
router.post('/excel', authenticateContentManager, createExcelProducts)
router.get('/excel', authenticateContentManager, getExcelImports)
router.post(
  '/search/:pageNumber/:nPerPage',
  authenticateContentManager,
  searchProducts
)
router.patch('/many', [authenticateContentManager], updateManyProducts)
router.patch(
  '/:id',
  [authenticateContentManager, upload.array('imgs', 12)],
  updateProduct
)
router.get('/product/:id', authenticateContentManager, getProduct)
router.post('/remove', authenticateContentManager, removeProducts)
router.get(
  '/page/:pageNumber/:nPerPage',
  authenticateContentManager,
  getProducts
)
router.get('/img/:id', getImg)
router.get('/count', authenticateContentManager, getCount)

export default router
