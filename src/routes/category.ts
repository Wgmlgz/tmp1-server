import express from 'express'
import {
  createCategory,
  removeCategory,
  getCategories,
  getImg,
  upload,
} from '../controllers/categories'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getCategories)
router.post('/', [authenticateAdmin, upload.single('file')], createCategory)
router.delete('/:id', authenticateAdmin, removeCategory)
router.get('/img/:id', getImg)

export default router
