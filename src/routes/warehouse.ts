import express from 'express'
import {
  createWarehouse,
  removeWarehouse,
  updateWarehouse,
  getWarehouses,
} from '../controllers/warehouse'
import { authenticateAdmin, authenticateContentManager, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateContentManager, getWarehouses)
router.post('/', authenticateAdmin, createWarehouse)
router.patch('/:id', authenticateSuperAdmin, updateWarehouse)
router.delete('/:id', authenticateSuperAdmin, removeWarehouse)

export default router
