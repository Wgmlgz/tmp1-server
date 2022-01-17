import express from 'express'
import { authenticateToken } from '../controllers/auth'
import { getUser } from '../controllers/user'


const router = express.Router()

router.get('/user', authenticateToken, getUser)

export default router
