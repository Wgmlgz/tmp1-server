import express from 'express'
import {
  login,
  register,
  logout,
  token,
} from '../controllers/auth'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.post('/token', token)
router.post('/register', register)

export default router
