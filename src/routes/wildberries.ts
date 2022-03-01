import express from 'express'
import {
  getWildberriesProducts,
  updateWildberriesSettings,
  getWildberriesOrders,
  runUpdateWildberriesStocks,
  getWildberriesSettings,
  checkWildberriesConnection,
  runRefreshOrdeers,
  updateDiscount,
  updatePrice,
} from '../controllers/wildberries'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/products', authenticateAdmin, getWildberriesProducts)
router.get('/orders', authenticateAdmin, getWildberriesOrders)
router.post('/settings', authenticateAdmin, updateWildberriesSettings)
router.get('/settings', authenticateAdmin, getWildberriesSettings)
router.get('/update', authenticateAdmin, runUpdateWildberriesStocks)
router.get('/update_orders', authenticateAdmin, runRefreshOrdeers)
router.post('/update_discount', authenticateAdmin, updateDiscount)
router.post('/update_price', authenticateAdmin, updatePrice)
router.get('/check', authenticateAdmin, checkWildberriesConnection)

export default router
