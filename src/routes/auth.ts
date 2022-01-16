import express from 'express'
import { getUser, login, register, logout, token, authenticateToken, getUsers } from '../controllers/auth'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.post('/token', token)
router.post('/register', register)
router.get('/user', authenticateToken, getUser)
router.get('/users', authenticateToken, getUsers)

export default router
