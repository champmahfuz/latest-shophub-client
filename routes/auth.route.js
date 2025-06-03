import express from 'express'
import { getMe, login, logout, register } from '../controllers/auth.controller.js'
const AuthRoutes = express.Router()

AuthRoutes.post('/register', register)
AuthRoutes.post('/login', login)
AuthRoutes.post('/logout', logout)
AuthRoutes.get('/me', getMe);

export default AuthRoutes