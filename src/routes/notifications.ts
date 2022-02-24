import express from 'express'
import { authenticateAdmin } from '../controllers/auth'
import { getNotifications } from '../controllers/notifications'

const router = express.Router()

router.get('/', authenticateAdmin, getNotifications)

export default router
