import express from 'express'
import {
  getJsonCategories,
  getJsonProducts,
  getJsonStocks,
} from '../controllers/json'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.post('/categories', authenticateAdmin, getJsonCategories)
router.post('/products', authenticateAdmin, getJsonProducts)
router.post('/stocks', authenticateAdmin, getJsonStocks)

export default router
