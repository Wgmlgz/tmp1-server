import express from 'express'
import {
  createCategory,
  removeCategory,
  getCategories,
  getImg,
  upload
} from '../controllers/categories'
import { authenticateToken } from '../controllers/auth'

const router = express.Router()

router.get('/', authenticateToken, getCategories)
router.post('/', [upload.single('file'), authenticateToken], createCategory)
router.delete('/:id', authenticateToken, removeCategory)
router.get('/img/:id', getImg)

export default router
