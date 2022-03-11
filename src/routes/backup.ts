import express from 'express'
import { getBackup, restoreBackup } from '../controllers/backup'
import { authenticateSuperAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateSuperAdmin, getBackup)
router.patch('/', authenticateSuperAdmin, restoreBackup)

export default router
