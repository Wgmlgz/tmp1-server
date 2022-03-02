import express from 'express'
import {
  removeCategory,
  createCategory,
  editCategory,
  getCategories,
  getImg,
  upload,
} from '../controllers/categories'
import { authenticateAdmin } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateAdmin, getCategories)
router.delete('/:id', authenticateAdmin, removeCategory)
router.post('/', [authenticateAdmin, upload.single('file')], createCategory)
router.post('/edit', [authenticateAdmin, upload.single('file')], editCategory)
router.get('/img/:id', getImg)

export default router
