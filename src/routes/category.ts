import express from 'express'
import {
  removeCategory,
  createCategory,
  editCategory,
  getCategories,
  getImg,
  upload,
} from '../controllers/categories'
import {
  authenticateContentManager,
} from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateContentManager, getCategories)
router.delete('/:id', authenticateContentManager, removeCategory)
router.post(
  '/',
  [authenticateContentManager, upload.single('file')],
  createCategory
)
router.post(
  '/edit',
  [authenticateContentManager, upload.single('file')],
  editCategory
)
router.get('/img/:id', getImg)

export default router
