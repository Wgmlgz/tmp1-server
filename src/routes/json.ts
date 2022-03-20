import express from 'express'
import {
  getJsonCategories,
  getJsonProducts,
  getJsonStocks,
} from '../controllers/json'

const router = express.Router()

router.post('/categories', getJsonCategories)
router.post('/products', getJsonProducts)
router.post('/stocks', getJsonStocks)

export default router
