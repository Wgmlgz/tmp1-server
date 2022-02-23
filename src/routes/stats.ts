import express from 'express'
import { authenticateAdmin } from '../controllers/auth'
import { getStats } from '../controllers/stats'

const router = express.Router()

router.post('/', authenticateAdmin, getStats)

export default router
