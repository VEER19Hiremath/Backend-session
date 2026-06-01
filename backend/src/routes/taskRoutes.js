import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { addTask, editTask, listTasks, removeTask } from '../controllers/taskController.js'

// Task routes are protected by the `requireAuth` middleware which verifies
// the JWT and attaches `req.user` for handlers to use.
const router = Router()

// Check the token once before any task handler runs.
router.use(requireAuth)

router.get('/', listTasks)
router.post('/', addTask)
router.put('/:id', editTask)
router.delete('/:id', removeTask)

export default router
