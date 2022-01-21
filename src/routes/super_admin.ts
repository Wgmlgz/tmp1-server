import express from 'express'
import {
  superAdminGetUsers,
  superAdminUpdateUser,
} from '../controllers/super_admin'
import { authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/users', authenticateSuperAdmin, superAdminGetUsers)
router.patch('/update_user', authenticateSuperAdmin, superAdminUpdateUser)

export default router
