import express from 'express'
import { getRemains } from '../controllers/remains'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getRemains)

export default router
