import express from 'express'
import {
  getWildberriesProducts
} from '../controllers/wildberries'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/products', authenticateAdmin, getWildberriesProducts)

export default router
