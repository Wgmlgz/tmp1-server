import express from 'express'
import {
  getWildberriesProducts,
  updateWildberriesSettings,
  getWildberriesOrders,
  runUpdateWildberriesStocks,
  getWildberriesSettings,
} from '../controllers/wildberries'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/products', authenticateAdmin, getWildberriesProducts)
router.get('/orders', authenticateAdmin, getWildberriesOrders)
router.post('/settings', authenticateAdmin, updateWildberriesSettings)
router.get('/settings', authenticateAdmin, getWildberriesSettings)
router.post('/update', authenticateAdmin, runUpdateWildberriesStocks)

export default router
