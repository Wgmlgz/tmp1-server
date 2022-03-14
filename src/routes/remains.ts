import express from 'express'
import { getRemains } from '../controllers/remains'
import { authenticateAdmin, authenticateContentManager } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateContentManager, getRemains)

export default router
