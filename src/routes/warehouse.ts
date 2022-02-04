import express from 'express'
import {
  createWarehouse,
  removeWarehouse,
  updateWarehouse,
  getWarehouses,
} from '../controllers/warehouse'
import { authenticateAdmin, authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getWarehouses)
router.post('/', authenticateAdmin, createWarehouse)
router.patch('/:id', authenticateSuperAdmin, updateWarehouse)
router.delete('/:id', authenticateSuperAdmin, removeWarehouse)

export default router
