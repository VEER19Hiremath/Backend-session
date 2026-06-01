import { Router } from 'express'
import { healthCheck } from '../controllers/healthController.js'

// Lightweight health endpoint group. Mounted at `/api`.
const router = Router()

router.get('/health', healthCheck)

export default router
