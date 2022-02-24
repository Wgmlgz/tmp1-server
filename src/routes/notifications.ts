import express from 'express'
import { authenticateAdmin } from '../controllers/auth'
import {
  getNotifications,
  removeNotification,
} from '../controllers/notifications'

const router = express.Router()

router.get('/', authenticateAdmin, getNotifications)
router.delete('/:id', authenticateAdmin, removeNotification)

export default router
