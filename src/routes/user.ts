import express from 'express'
import { authenticateUser } from '../controllers/auth'
import { getSetting, getUser, setSetting } from '../controllers/user'

const router = express.Router()

router.get('/user', authenticateUser, getUser)
router.get('/columns_settings', authenticateUser, getSetting)
router.post('/columns_settings', authenticateUser, setSetting)

export default router
