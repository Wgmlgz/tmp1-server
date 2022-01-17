import express from 'express'
import {
  createCategory,
  removeCategory,
  getCategories,
} from '../controllers/category'
import { authenticateToken } from '../controllers/auth'
import { upload } from '../config/imgs'

const router = express.Router()

router.get('/', authenticateToken, getCategories)
router.post('/', [upload.single('file'), authenticateToken], createCategory)
router.delete('/:id', authenticateToken, removeCategory)
router.get('/img/:id', (req, res) => {
  const { id } = req.params
  res.sendFile(`./upload/${id}`, { root: process.cwd() })
})

export default router
