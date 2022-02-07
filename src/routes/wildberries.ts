import express from 'express'
import {
  getWildberriesProducts,
  updateWildberriesSettings,
  getWildberriesOrders,
} from '../controllers/wildberries'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/products', authenticateAdmin, getWildberriesProducts)
router.get('/orders', authenticateAdmin, getWildberriesOrders)
router.post('/settings', authenticateAdmin, updateWildberriesSettings)

export default router
