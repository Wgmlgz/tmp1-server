import express from 'express'
import {
  superAdminGetUsers,
  superAdminUpdateUser,
} from '../controllers/super_admin'
import { authenticateToken } from '../controllers/auth'

const router = express.Router()

router.get('/users', authenticateToken, superAdminGetUsers)
router.patch('/update_user', authenticateToken, superAdminUpdateUser)

export default router
