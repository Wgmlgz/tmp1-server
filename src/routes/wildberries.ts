import express from 'express'
import {
  getWildberriesProducts,
  updateWildberriesSettings,
  getWildberriesOrders,
  runUpdateWildberriesStocks,
  getWildberriesSettings,
  checkWildberriesConnection
} from '../controllers/wildberries'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/products', authenticateAdmin, getWildberriesProducts)
router.get('/orders', authenticateAdmin, getWildberriesOrders)
router.post('/settings', authenticateAdmin, updateWildberriesSettings)
router.get('/settings', authenticateAdmin, getWildberriesSettings)
router.post('/update', authenticateAdmin, runUpdateWildberriesStocks)
router.get('/check', authenticateAdmin, checkWildberriesConnection)

export default router
