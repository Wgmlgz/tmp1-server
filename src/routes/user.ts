import express from 'express'
import { authenticateUser } from '../controllers/auth'
import { getUser } from '../controllers/user'

const router = express.Router()

router.get('/user', authenticateUser, getUser)

export default router
