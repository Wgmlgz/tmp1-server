import express from 'express'
import {
  createWarehouse,
  removeWarehouse,
  updateWarehouse,
  getWarehouses,
} from '../controllers/warehouse'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getWarehouses)
router.post('/', authenticateAdmin, createWarehouse)
router.patch('/:id', authenticateAdmin, updateWarehouse)
router.delete('/:id', authenticateAdmin, removeWarehouse)

export default router
